from pydantic import BaseModel
from typing import Optional, List

class ServoListItem(BaseModel):
    id: int
    nome: str
    telefone: Optional[str] = None
    status: Optional[str] = None
    ano_ingresso: Optional[int] = None
    pastas: list[str]

class ServoDetail(BaseModel):
    id: int
    nome: str
    telefone: Optional[str] = None
    status: Optional[str] = None
    ano_ingresso: Optional[int] = None