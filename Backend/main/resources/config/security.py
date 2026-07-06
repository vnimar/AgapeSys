import os
import logging
from datetime import datetime, timedelta, timezone

from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from dotenv import load_dotenv

from ..schemas.auth_schema import UsuarioLogado

load_dotenv()

logger = logging.getLogger(__name__)

# ── Configuração ──────────────────────────────────────────────────────────────
#
# JWT_SECRET: chave usada para assinar o token
#
# JWT_EXPIRES_HOURS: tempo de vida do token

JWT_SECRET = os.getenv("JWT_SECRET")
JWT_ALGORITHM = "HS256"
JWT_EXPIRES_HOURS = int(os.getenv("JWT_EXPIRES_HOURS", 24))

if not JWT_SECRET:
    raise RuntimeError("JWT_SECRET não configurada. Verifique o .env")

# ── Hash de senha ─────────────────────────────────────────────────────────────
#
# bcrypt é o padrão da indústria para hash de senha.
# Nunca salve senha em texto puro no banco.
#
# hash_senha("123456")  → "$2b$12$..." (string longa e segura)
# verificar_senha("123456", "$2b$12$...") → True

_pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_senha(senha: str) -> str:
    """Gera o hash bcrypt da senha. Use antes de salvar no banco."""
    return _pwd_context.hash(senha)


def verificar_senha(senha_pura: str, senha_hash: str) -> bool:
    """Compara a senha digitada com o hash do banco."""
    return _pwd_context.verify(senha_pura, senha_hash)


# ── Geração do token JWT ──────────────────────────────────────────────────────
#
# O token contém os dados do usuário (payload) e uma data de expiração.
# É assinado com JWT_SECRET — qualquer alteração invalida o token.

def gerar_token(usuario: UsuarioLogado) -> str:
    """Gera um JWT com os dados do usuário e expiração configurada."""
    expiracao = datetime.now(timezone.utc) + timedelta(hours=JWT_EXPIRES_HOURS)

    payload = {
        "sub": str(usuario.id),  # "sub" é o padrão JWT para identificar o usuário
        "nome": usuario.nome,
        "email": usuario.email,
        "perfil": usuario.perfil,
        "exp": expiracao,
    }

    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)


# ── Validação do token JWT ────────────────────────────────────────────────────
#
# OAuth2PasswordBearer lê o token do header "Authorization: Bearer <token>"
# Isso é o padrão OAuth2 — o frontend envia assim automaticamente se configurado.

_oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")


def get_current_user(token: str = Depends(_oauth2_scheme)) -> UsuarioLogado:
    """
    Dependência do FastAPI — valida o token e retorna o usuário logado.

    Uso nos routers:
        @router.get("/rota", dependencies=[Depends(get_current_user)])

    Ou para acessar os dados do usuário:
        @router.get("/rota")
        def rota(usuario: UsuarioLogado = Depends(get_current_user)):
            print(usuario.nome)
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Token inválido ou expirado.",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])

        user_id = payload.get("sub")
        if not user_id:
            raise credentials_exception

        return UsuarioLogado(
            id=int(user_id),
            nome=payload["nome"],
            email=payload["email"],
            perfil=payload["perfil"],
        )

    except JWTError:
        raise credentials_exception


def require_admin(usuario: UsuarioLogado = Depends(get_current_user)) -> UsuarioLogado:
    """
    Dependência que exige perfil admin.

    Uso:
        @router.post("/rota", dependencies=[Depends(require_admin)])
    """
    if usuario.perfil != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Acesso restrito a administradores."
        )
    return usuario