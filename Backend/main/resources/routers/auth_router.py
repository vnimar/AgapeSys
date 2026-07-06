import logging
from fastapi import APIRouter, HTTPException, Depends, status

from ..bd.db import get_connection
from ..schemas.auth_schema import (
    LoginRequest,
    RegisterRequest,
    TokenResponse,
    UsuarioLogado,
)
from ..config.security import (
    hash_senha,
    verificar_senha,
    gerar_token,
    get_current_user,
    require_admin,
)

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/auth", tags=["Auth"])


# ── POST /auth/login ──────────────────────────────────────────────────────────
#
# Fluxo:
# 1. Busca o usuário pelo email
# 2. Verifica a senha com bcrypt
# 3. Gera e retorna o token JWT
#
# IMPORTANTE: nunca diga se foi o email ou a senha que errou —
# "Credenciais inválidas" para ambos os casos evita que alguém
# descubra quais emails estão cadastrados.

@router.post("/login", response_model=TokenResponse)
def login(body: LoginRequest):

    try:
        with get_connection() as conn:
            with conn.cursor() as cursor:
                cursor.execute(
                    "SELECT id_usuario, nome, email, senha, perfil FROM usuario WHERE email = %s",
                    (body.email,)
                )
                usuario = cursor.fetchone()

    except Exception as e:
        logger.error(f"Erro ao buscar usuário no login: {e}")
        raise HTTPException(status_code=500, detail="Erro interno.")

    # Valida email e senha — mesma mensagem para os dois casos (segurança)
    if not usuario or not verificar_senha(body.senha, usuario[3]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Credenciais inválidas."
        )

    usuario_logado = UsuarioLogado(
        id=usuario[0],
        nome=usuario[1],
        email=usuario[2],
        perfil=usuario[4],
    )

    token = gerar_token(usuario_logado)

    return TokenResponse(access_token=token)


# ── GET /auth/me ──────────────────────────────────────────────────────────────
#
# Retorna os dados do usuário logado extraídos do token.
# Não precisa ir ao banco — as informações já estão no token.
# Útil para o app saber quem está logado sem fazer outra requisição.

@router.get("/me", response_model=UsuarioLogado)
def me(usuario: UsuarioLogado = Depends(get_current_user)):
    return usuario


# ── POST /auth/register ───────────────────────────────────────────────────────
#
# Cria um novo usuário — restrito a admins.
# A senha é transformada em hash ANTES de salvar no banco.
# Nunca salve senha em texto puro.

@router.post("/register", response_model=UsuarioLogado, status_code=201)
def register(
    body: RegisterRequest,
    _: UsuarioLogado = Depends(require_admin),  # só admin pode criar usuários
):

    try:
        with get_connection() as conn:
            with conn.cursor() as cursor:

                # Verifica se email já existe
                cursor.execute(
                    "SELECT id_usuario FROM usuario WHERE email = %s",
                    (body.email,)
                )
                if cursor.fetchone():
                    raise HTTPException(
                        status_code=status.HTTP_409_CONFLICT,
                        detail="Email já cadastrado."
                    )

                # Salva com senha em hash — nunca em texto puro
                cursor.execute(
                    """
                    INSERT INTO usuario (nome, email, senha, perfil)
                    VALUES (%s, %s, %s, %s)
                    RETURNING id_usuario, nome, email, perfil
                    """,
                    (body.nome, body.email, hash_senha(body.senha), body.perfil)
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
    )