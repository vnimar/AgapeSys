from pydantic import BaseModel
from typing import Optional, List


class ServoListItem(BaseModel):
    """Schema usado na listagem geral de servos."""
    id: int
    nome: str
    telefone: Optional[str] = None
    pastas: List[str] = []


class ServoDetail(BaseModel):
    """Schema usado na busca de um servo específico."""
    id: int
    nome: str
    telefone: Optional[str] = None
    status: Optional[str] = None
    ano_ingresso: Optional[int] = None