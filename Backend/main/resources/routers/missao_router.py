import logging
from fastapi import APIRouter, HTTPException
from ..bd.db import getConnection
import psycopg2.extras
from datetime import date
from ..config.missao_config import MISSAO_INFO
from ..schemas.missao_schema import MissaoResponse

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/missao", tags=["Missão"])


def _enriquecer_missao(missao: dict) -> None:
    """Adiciona local e horário ao dict da missão a partir da config."""
    info = MISSAO_INFO.get(missao["descricao"], {})
    missao["local"] = info.get("local", "Local não definido")
    missao["horario"] = info.get("horario", "Horário não definido")
    if isinstance(missao.get("data"), date):
        missao["data"] = missao["data"].isoformat()


@router.get("/", response_model=list[MissaoResponse])
def get_missao():
    conn = getConnection()

    try:
        with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cursor:
            cursor.execute("SELECT * FROM missao ORDER BY data ASC")
            missoes = cursor.fetchall()

        if not missoes:
            raise HTTPException(status_code=404, detail="Nenhuma missão encontrada.")

        missoes = [dict(m) for m in missoes]
        for missao in missoes:
            _enriquecer_missao(missao)

        return missoes

    except HTTPException:
        raise

    except Exception as e:
        logger.error(f"Erro ao buscar missões: {e}")
        raise HTTPException(status_code=500, detail="Erro interno no servidor.")

    finally:
        conn.close()


@router.get("/proxima", response_model=MissaoResponse)
def get_proxima_missao():
    conn = getConnection()

    try:
        with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cursor:
            cursor.execute("""
                SELECT id_missao, data, descricao
                FROM missao
                WHERE data >= CURRENT_DATE
                ORDER BY data ASC
                LIMIT 1
            """)
            missao = cursor.fetchone()

        if not missao:
            raise HTTPException(status_code=404, detail="Nenhuma missão futura encontrada.")

        missao = dict(missao)
        _enriquecer_missao(missao)

        return missao

    except HTTPException:
        raise

    except Exception as e:
        logger.error(f"Erro ao buscar próxima missão: {e}")
        raise HTTPException(status_code=500, detail="Erro interno no servidor.")

    finally:
        conn.close()