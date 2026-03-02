from fastapi import APIRouter, HTTPException
from ..bd.db import getConnection
import psycopg2.extras
from datetime import date

router = APIRouter(prefix="/missao", tags=["missao"])

@router.get("/proxima")
def get_proxima_missao():
    conn = None
    try:
        conn = getConnection()
        # O 'with' garante que o cursor feche sozinho ao sair do bloco
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