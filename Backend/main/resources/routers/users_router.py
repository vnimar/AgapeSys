from fastapi import APIRouter, HTTPException
from ..bd.db import getConnection
import psycopg2.extras

router = APIRouter(prefix="/servos", tags=["Servos"])

@router.get("/")
def listar_servos():
    conn = None

    try:
        conn = getConnection()

        with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cursor:
            query = """
                    SELECT 
                        s.id_servo AS id,
                        s.nome,
                        s.telefone,
                        COALESCE(
                            json_agg(p.nome) FILTER (WHERE p.nome IS NOT NULL),
                            '[]'
                        ) AS pastas
                    FROM servo s
                    LEFT JOIN servo_pasta sp ON sp.id_servo = s.id_servo
                    LEFT JOIN pasta p ON p.id_pasta = sp.id_pasta
                    GROUP BY s.id_servo
                    ORDER BY s.nome
                """
            cursor.execute(query)
            servos = cursor.fetchall()

        return servos

    except psycopg2.Error as e:
        raise HTTPException(
            status_code=500,
            detail=f"Erro ao buscar servos: {str(e)}"
        )

    finally:
        if conn:
            conn.close()

@router.get("/{servos_id}")
def get_servo_by_id(servos_id: int):
    conn = getConnection()
    cursor = conn.cursor()

    try:
        cursor.execute(
            "SELECT id_servo, nome, telefone, status, ano_ingresso FROM servo WHERE id_servo = %s",
            (servos_id,)
        )

        user = cursor.fetchone()

        conn.close()

        if user:
            return {
                "id": user[0],
                "username": user[1],
                "telefone": user[2],
                "status": user[3],
                "anoIngresso": user[4]
            }
        else:
            raise HTTPException(status_code=404, detail="Usuário não encontrado")

    except Exception as e:
        if conn:
            conn.close()
        print(f"Erro no GET User: {e}")
        raise HTTPException(status_code=500, detail=str(e))
