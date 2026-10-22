from datetime import datetime
from typing import Optional

from pydantic import BaseModel, EmailStr, Field, field_validator

from .auth_schema import PerfilType


class UsuarioItem(BaseModel):
    """Usuário na tela de administração (sem senha)."""
    id: int
    nome: str
    email: str
    perfil: PerfilType
    ativo: bool
    id_servo: Optional[int] = None
    servo_nome: Optional[str] = None
    servo_ativo: Optional[bool] = None   # servo Inativo não consegue entrar
    trocar_senha: bool
    ultimo_login: Optional[datetime] = None


class UsuarioCriar(BaseModel):
    nome: str = Field(min_length=1, max_length=100)
    email: EmailStr
    perfil: PerfilType = "servo"
    id_servo: Optional[int] = None  # liga o login ao cadastro do servo

    @field_validator("nome")
    @classmethod
    def limpar_nome(cls, v: str) -> str:
        v = v.strip()
        if not v:
            raise ValueError("O nome é obrigatório.")
        return v


class UsuarioEditar(UsuarioCriar):
    ativo: bool = True


class SenhaTemporariaResponse(BaseModel):
    """A senha temporária só aparece nesta resposta: o admin repassa para a pessoa."""
    usuario: UsuarioItem
    senha_temporaria: str
