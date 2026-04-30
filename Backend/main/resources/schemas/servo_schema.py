from pydantic import BaseModel
from typing import Optional, List

class ServoListItem(BaseModel):
    id: int
    nome: str
    telefone: str | None
    status: str | None        # ← adicionar
    ano_ingresso: int | None  # ← adicionar
    pastas: list[str]

class ServoDetail(BaseModel):
    """Schema usado na busca de um servo específico."""
    id: int
    nome: str
    telefone: Optional[str] = None
    status: Optional[str] = None
    ano_ingresso: Optional[int] = None