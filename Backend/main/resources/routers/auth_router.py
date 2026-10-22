import logging
from fastapi import APIRouter, HTTPException, Depends, Request, Response, status

from ..bd.db import get_connection
from ..schemas.auth_schema import (
    LoginRequest,
    RegisterRequest,
    TrocarSenhaRequest,
    TokenResponse,
    UsuarioLogado,
)
from ..config.security import (
    HASH_FALSO,
    JWT_EXPIRES_DAYS,
    hash_senha,
    verificar_senha,
    gerar_token,
    get_current_user,
    require_admin,
    buscar_usuario_ativo,
)
from ..config import security
from ..config.rate_limit import LimitadorTentativas, ip_do_cliente

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/auth", tags=["Auth"])

_limitador_login = LimitadorTentativas(
    "Muitas tentativas de login com senha errada. Tente novamente em 15 minutos."
)

# ── POST /auth/login ──────────────────────────────────────────────────────────
#
# Fluxo:
# 1. Busca o usuário pelo email
# 2. Verifica a senha com bcrypt
# 3. Confere se o acesso está liberado (login ativo e servo Ativo)
# 4. Gera e retorna o token JWT (30 dias)
#
# IMPORTANTE: nunca diga se foi o email ou a senha que errou —
# "Credenciais inválidas" para ambos os casos evita que alguém
# descubra quais emails estão cadastrados.

@router.post("/login", response_model=TokenResponse)
def login(body: LoginRequest, request: Request):

    email = body.email.lower()
    chave = f"{ip_do_cliente(request)}|{email}"
    _limitador_login.verificar(chave)

    try:
        with get_connection() as conn:
            with conn.cursor() as cursor:
                cursor.execute("""
                    SELECT u.id_usuario, u.senha_hash,
                           u.ativo AND (u.id_servo IS NULL OR s.status = 'Ativo') AS liberado
                    FROM usuario u
                    LEFT JOIN servo s ON s.id_servo = u.id_servo
                    WHERE lower(u.email) = %s
                """, (email,))
                usuario = cursor.fetchone()

    except Exception as e:
        logger.error(f"Erro ao buscar usuário no login: {e}")
        raise HTTPException(status_code=500, detail="Erro interno.")

    # Valida email e senha — mesma mensagem para os dois casos (segurança)
    senha_ok = verificar_senha(body.senha, usuario[1] if usuario else HASH_FALSO)
    if not usuario or not senha_ok:
        _limitador_login.registrar_falha(chave)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Credenciais inválidas."
        )

    # Senha certa, mas acesso bloqueado (login desativado ou servo afastado)
    if not usuario[2]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Seu acesso está inativo. Fale com a coordenação."
        )

    _limitador_login.limpar(chave)
    token = gerar_token(usuario[0])

    # Mesmo cálculo de perfis do /auth/me (perfil manual + pastas do ano)
    logado = buscar_usuario_ativo(usuario[0])
    if not logado:
        raise HTTPException(status_code=500, detail="Erro interno.")

    try:
        with get_connection() as conn:
            with conn.cursor() as cursor:
                cursor.execute(
                    "UPDATE usuario SET ultimo_login = now() WHERE id_usuario = %s",
                    (usuario[0],)
                )
    except Exception as e:
        # Não impede o login
        logger.warning(f"Não foi possível registrar o último login: {e}")

    return TokenResponse(
        access_token=token,
        expira_em_dias=JWT_EXPIRES_DAYS,
        usuario=logado,
    )


# ── GET /auth/config ──────────────────────────────────────────────────────────

@router.get("/config")
def config():
    """O app consulta ao abrir para saber se já precisa exigir login."""
    return {"login_obrigatorio": security.LOGIN_OBRIGATORIO}


# ── GET /auth/me ──────────────────────────────────────────────────────────────
#
# Retorna o usuário logado (lido do banco). O app usa ao abrir para saber se a
# sessão salva continua válida.

@router.get("/me", response_model=UsuarioLogado)
def me(usuario: UsuarioLogado = Depends(get_current_user)):
    return usuario


# ── PUT /auth/senha ───────────────────────────────────────────────────────────

@router.put("/senha", status_code=204)
def trocar_senha(body: TrocarSenhaRequest, usuario: UsuarioLogado = Depends(get_current_user)):

    try:
        with get_connection() as conn:
            with conn.cursor() as cursor:
                cursor.execute(
                    "SELECT senha_hash FROM usuario WHERE id_usuario = %s",
                    (usuario.id,)
                )
                atual = cursor.fetchone()

                if not atual or not verificar_senha(body.senha_atual, atual[0]):
                    raise HTTPException(status_code=400, detail="Senha atual incorreta.")
                if body.senha_nova == body.senha_atual:
                    raise HTTPException(status_code=400, detail="A nova senha precisa ser diferente da atual.")

                # Trocou a senha → deixa de ser temporária
                cursor.execute(
                    "UPDATE usuario SET senha_hash = %s, trocar_senha = false WHERE id_usuario = %s",
                    (hash_senha(body.senha_nova), usuario.id)
                )

    except HTTPException:
        raise

    except Exception as e:
        logger.error(f"Erro ao trocar senha do usuário {usuario.id}: {e}")
        raise HTTPException(status_code=500, detail="Erro interno.")

    return Response(status_code=204)


# ── POST /auth/register ───────────────────────────────────────────────────────
#
# Cria um novo usuário — restrito a administradores.
# A senha é transformada em hash ANTES de salvar no banco.

@router.post("/register", response_model=UsuarioLogado, status_code=201)
def register(
    body: RegisterRequest,
    _: UsuarioLogado = Depends(require_admin),  # só administrador pode criar usuários
):

    try:
        with get_connection() as conn:
            with conn.cursor() as cursor:

                # Verifica se email já existe
                cursor.execute(
                    "SELECT id_usuario FROM usuario WHERE lower(email) = %s",
                    (body.email.lower(),)
                )
                if cursor.fetchone():
                    raise HTTPException(
                        status_code=status.HTTP_409_CONFLICT,
                        detail="Email já cadastrado."
                    )

                # Salva com senha em hash — nunca em texto puro
                cursor.execute(
                    """
                    INSERT INTO usuario (nome, email, senha_hash, perfil, id_servo)
                    VALUES (%s, %s, %s, %s, %s)
                    RETURNING id_usuario, nome, email, perfil, id_servo
                    """,
                    (body.nome, body.email.lower(), hash_senha(body.senha), body.perfil, body.id_servo)
                )

                novo = cursor.fetchone()

    except HTTPException:
        raise

    except Exception as e:
        logger.error(f"Erro ao registrar usuário: {e}")
        raise HTTPException(status_code=500, detail="Erro interno.")

    return UsuarioLogado(
        id=novo[0],
        nome=novo[1],
        email=novo[2],
        perfil=novo[3],
        id_servo=novo[4],
    )
