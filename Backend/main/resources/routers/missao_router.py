from fastapi import APIRouter, HTTPException
from ..bd.db import getConnection
import psycopg2.extras
from datetime import date
from ..config.missao_config import MISSAO_INFO

router = APIRouter(prefix="/missao", tags=["missao"])

@router.get("/")
def get_missao():
    conn = getConnection()
    try:
        with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cursor:
            query = """SELECT * FROM missao ORDER BY data ASC"""

            cursor.execute(query)
            missoes = cursor.fetchall()

            if not missoes:
                raise HTTPException(status_code=404, detail="Nenhuma missão futura encontrada")

            for missao in missoes:
                if isinstance(missao["data"], date):
                    missao["data"] = missao["data"].isoformat()

                adicionar_info_missao(missao)

            return missoes

    except Exception as e:
        print(f"Erro ao buscar próxima missão: {e}")
        raise HTTPException(status_code=500, detail="Erro interno no servidor")
    finally:
        if conn:
            conn.close()

@router.get("/proxima")
def get_proxima_missao():
    conn = getConnection()
    try:
        # Com o 'with' garante que o cursor feche sozinho ao sair do bloco
        with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cursor:
            query = "SELECT id_missao, data, descricao FROM missao WHERE data >= CURRENT_DATE ORDER BY data ASC LIMIT 1"
            cursor.execute(query)
            missao = cursor.fetchone()

        if not missao:
            raise HTTPException(status_code=404, detail="Nenhuma missão futura encontrada")

        # Se 'data' for um objeto date do Python, converte para string padrão ISO
        if isinstance(missao["data"], date):
            missao["data"] = missao["data"].isoformat()

        return missao

    except Exception as e:
        print(f"Erro ao buscar próxima missão: {e}")
        raise HTTPException(status_code=500, detail="Erro interno no servidor")
    finally:
        if conn:
            conn.close()


def adicionar_info_missao(missao):

    info = MISSAO_INFO.get(missao["descricao"], {})

    missao["local"] = info.get("local", "Local não definido")
    missao["horario"] = info.get("horario", "Horário não definido")

    return missao