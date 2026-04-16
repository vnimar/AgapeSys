from pydantic import BaseModel
from enum import Enum


class StatusFrequencia(str, Enum):
    presente = "presente"
    ausente = "ausente"
    justificado = "justificado"


class FrequenciaCreate(BaseModel):
    id_servo: int
    id_missao: int


class FrequenciaUpdate(BaseModel):
    id_servo: int
    id_missao: int
    status: StatusFrequencia


class ServoFrequenciaResponse(BaseModel):
    id_servo: int
    nome: str
    status: StatusFrequencia


class FrequenciaResponse(BaseModel):
    message: str
    data_missao: str
    descricao: str
    data: list[ServoFrequenciaResponse]