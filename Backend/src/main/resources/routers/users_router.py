from fastapi import APIRouter, HTTPException
from ..bd.db import getConnection
import psycopg2.extras

router = APIRouter(prefix="/users", tags=["Users"])

@router.get("/")
def list_users():
    conn = getConnection()
    cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)

    try:
        cursor.execute("""
            SELECT id_servo, nome, telefone, status, ano_ingresso
            FROM servo
        """)

        users = cursor.fetchall()

        conn.close()

        return users  # já retorna lista de dicionários

    except Exception as e:
        if conn:
            conn.close()
        print(f"Erro no GET Users: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{user_id}")
def home(user_id: int):
    conn = getConnection()
    cursor = conn.cursor()

    try:
        cursor.execute(
            "SELECT id_servo, nome, telefone, status, ano_ingresso FROM servo WHERE id_servo = %s",
            (user_id,)
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