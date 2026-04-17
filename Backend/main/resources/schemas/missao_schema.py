from pydantic import BaseModel
from typing import Optional


class MissaoResponse(BaseModel):
    id_missao: int
    data: str
    descricao: str
    local: Optional[str] = "Local não definido"
    horario: Optional[str] = "Horário não definido"