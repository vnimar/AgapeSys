from pydantic import BaseModel, EmailStr, Field, field_validator
from typing import Literal, Optional

# ── Perfis disponíveis ────────────────────────────────────────────────────────
#
# Mesma lista do CHECK usuario_perfil_check no banco (migrations 001 e 004).

PerfilType = Literal[
    "servo",
    "coordenador_formacao_vivencia",
    "coordenador_comunidade_cursista",
    "tutor_comunidade_cursista",
    "coordenador_geral",
    "administrador",
]


def _validar_senha(senha: str) -> str:
    if len(senha) < 8:
        raise ValueError("A senha precisa ter pelo menos 8 caracteres.")
    # bcrypt só considera os primeiros 72 bytes
    if len(senha.encode("utf-8")) > 72:
        raise ValueError("A senha é longa demais.")
    return senha

# ── Requests ──────────────────────────────────────────────────────────────────
class LoginRequest(BaseModel):
    email: EmailStr   # Pydantic já valida se é um email válido
    senha: str = Field(max_length=200)

class RegisterRequest(BaseModel):
    nome: str = Field(min_length=1, max_length=200)
    email: EmailStr
    senha: str
    perfil: PerfilType = "servo"
    id_servo: Optional[int] = None  # liga o login ao cadastro do servo

    _senha = field_validator("senha")(_validar_senha)

class TrocarSenhaRequest(BaseModel):
    senha_atual: str = Field(max_length=200)
    senha_nova: str

    _senha = field_validator("senha_nova")(_validar_senha)

# ── Responses ─────────────────────────────────────────────────────────────────
class UsuarioLogado(BaseModel):
    """Usuário autenticado — sem senha."""
    id: int
    nome: str
    email: str
    perfil: PerfilType
    id_servo: Optional[int] = None

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"  # padrão OAuth2
    expira_em_dias: int
    usuario: UsuarioLogado
