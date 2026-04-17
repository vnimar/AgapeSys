from pydantic import BaseModel
from enum import Enum


class StatusFrequencia(str, Enum):
    presente = "Presente"
    falta = "Falta"
    justificada = "Justificada"


# ── Requests ──────────────────────────────────────────────────────────────────

class FrequenciaCreate(BaseModel):
    id_servo: int
    id_missao: int
    status: StatusFrequencia  # obrigatório — banco não aceita NULL


class FrequenciaUpdate(BaseModel):
    id_servo: int
    id_missao: int
    status: StatusFrequencia


# ── Responses ─────────────────────────────────────────────────────────────────

class MessageResponse(BaseModel):
    message: str


class FrequenciaItem(BaseModel):
    id_servo: int
    nome: str
    status: StatusFrequencia


class FrequenciaResponse(BaseModel):
    """Retornado quando existem registros de frequência para a missão."""
    message: str
    data_missao: str
    descricao: str
    data: list[FrequenciaItem]


class FrequenciaEmptyResponse(BaseModel):
    """Retornado quando a missão existe mas ainda não tem frequência registrada."""
    message: str
    data_missao: str
    descricao: str