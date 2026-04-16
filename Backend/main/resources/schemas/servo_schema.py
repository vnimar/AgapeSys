from pydantic import BaseModel
from typing import Optional, List

class ServoResponse(BaseModel):
    id: int
    nome: str
    telefone: Optional[str] = None
    status: Optional[str] = None
    ano_ingresso: Optional[int] = None
    pastas: List[str] = []