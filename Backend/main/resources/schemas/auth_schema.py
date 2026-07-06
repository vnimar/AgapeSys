from pydantic import BaseModel, EmailStr
from typing import Literal

# ── Perfis disponíveis ────────────────────────────────────────────────────────
#
# Literal garante que só "admin" ou "usuario" são aceitos pelo Pydantic.
# Se tentar salvar outro valor, a validação já rejeita antes de chegar no banco.

PerfilType = Literal["admin", "usuario"]

# ── Requests ──────────────────────────────────────────────────────────────────
class LoginRequest(BaseModel):
    email: EmailStr   # Pydantic já valida se é um email válido
    senha: str

class RegisterRequest(BaseModel):
    nome: str
    email: EmailStr
    senha: str
    perfil: PerfilType = "usuario"  # padrão é usuário comum

# ── Responses ─────────────────────────────────────────────────────────────────
class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"  # padrão OAuth2

class UsuarioLogado(BaseModel):
    """Dados do usuário extraídos do token JWT — sem senha."""
    id: int
    nome: str
    email: str
    perfil: PerfilType