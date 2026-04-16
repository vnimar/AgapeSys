import logging
from fastapi import APIRouter, HTTPException
from ..bd.db import getConnection
import psycopg2.extras
from datetime import date
from ..config.missao_config import MISSAO_INFO

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/missao", tags=["missao"])

@router.get("/")
def get_missao():
    conn = getConnection()
    try:
        with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cursor:
            cursor.execute("SELECT * FROM missao ORDER BY data ASC")
            missoes = cursor.fetchall()

            if not missoes:
                raise HTTPException(status_code=404, detail="Nenhuma missão encontrada.")

            for missao in missoes:
                if isinstance(missao["data"], date):
                    missao["data"] = missao["data"].isoformat()
                adicionar_info_missao(missao)

            return missoes

    except HTTPException:
        raise

    except Exception as e:
        logger.error(f"Erro ao buscar missões: {e}")
        raise HTTPException(status_code=500, detail="Erro interno no servidor")

    finally:
        conn.close()


@router.get("/proxima")
def get_proxima_missao():
    conn = getConnection()
    try:
        with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cursor:
            cursor.execute(
                "SELECT id_missao, data, descricao FROM missao WHERE data >= CURRENT_DATE ORDER BY data ASC LIMIT 1"
            )
            missao = cursor.fetchone()

        if not missao:
            raise HTTPException(status_code=404, detail="Nenhuma missão futura encontrada.")

        if isinstance(missao["data"], date):
            missao["data"] = missao["data"].isoformat()

        return missao

    except HTTPException:
        raise

    except Exception as e:
        logger.error(f"Erro ao buscar próxima missão: {e}")
        raise HTTPException(status_code=500, detail="Erro interno no servidor")

    finally:
        conn.close()


def adicionar_info_missao(missao: dict) -> None:
    """Adiciona local e horário à missão com base no MISSAO_INFO. Modifica o dict in-place."""
    info = MISSAO_INFO.get(missao["descricao"], {})
    missao["local"] = info.get("local", "Local não definido")
    missao["horario"] = info.get("horario", "Horário não definido")