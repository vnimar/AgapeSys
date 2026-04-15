from pydantic import BaseModel, Field
from datetime import date

class FrequenciaCreate(BaseModel):
    id_servo: int = Field(gt=0)
    id_missao: int = Field(gt=0)

class FrequenciaUpdate(BaseModel):
    id_servo: int = Field(gt=0)
    id_missao: int = Field(gt=0)
    status: str = Field(min_length=1, max_length=50)

class ServoResponse(BaseModel):
    id: int
    username: str
    telefone: str | None
    status: str | None
    anoIngresso: int | None