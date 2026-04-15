from fastapi import APIRouter, HTTPException
from ..bd.db import getConnection
import psycopg2.extras
from datetime import date

router = APIRouter(prefix="/frequencia", tags=["frequencia"])

@router.post("/")
def register_frequencia(id_servo: int, id_missao: int):

    conn = getConnection()

    try:
        with conn.cursor() as cursor:

            # 🔍 1. Buscar data da missão
            cursor.execute(
                "SELECT data FROM missao WHERE id_missao = %s",
                (id_missao,)
            )

            missao = cursor.fetchone()

            if not missao:
                raise HTTPException(
                    status_code=404,
                    detail="Missão não encontrada."
                )

            data_missao = missao[0]

            # ⛔ 2. Bloquear se ainda não aconteceu
            if data_missao > date.today():
                raise HTTPException(
                    status_code=400,
                    detail="Não é possível registrar frequência antes da missão acontecer."
                )

            # 🔍 3. Verificar duplicidade
            cursor.execute("""
                SELECT id_frequencia
                FROM frequencia
                WHERE id_servo = %s AND id_missao = %s
            """, (id_servo, id_missao))

            if cursor.fetchone():
                raise HTTPException(
                    status_code=400,
                    detail="Registro já existe. Use edição."
                )

            # ✅ 4. Inserir
            cursor.execute(
                """
                INSERT INTO frequencia (id_servo, id_missao, data)
                VALUES (%s, %s, %s)
                """,
                (id_servo, id_missao, date.today())
            )

            conn.commit()

        return {"message": "Frequência registrada com sucesso!"}


    except HTTPException:
        raise

    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail="Erro interno")

@router.get("/{id_missao}")
def get_frequencia(id_missao: int):

    conn = getConnection()

    try:
        with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cursor:

            # 🔍 Busca missão (uma única query)
            cursor.execute(
                "SELECT data, descricao FROM missao WHERE id_missao = %s",
                (id_missao,)
            )

            missao = cursor.fetchone()

            if not missao:
                raise HTTPException(
                    status_code=404,
                    detail="Essa missão não existe."
                )

            # 🔍 Busca frequência
            cursor.execute("""
                SELECT 
                    s.id_servo,
                    s.nome,
                    f.status
                FROM frequencia f
                JOIN servo s ON s.id_servo = f.id_servo
                WHERE f.id_missao = %s
            """, (id_missao,))

            dados = cursor.fetchall()

            if not dados:
                return {
                    "message": "Missão existe, mas ainda não há registros de frequência.",
                    "data_missao": missao["data"],
                    "descricao": missao["descricao"],
                    "data": []
                }

            return {
                "message": "Frequência encontrada.",
                "data_missao": missao["data"],
                "descricao": missao["descricao"],
                "data": dados
            }

    finally:
        conn.close()

@router.put("/")
def update_frequencia(status: str, id_servo: int , id_missao: int):

    conn = getConnection()

    try:
        with conn.cursor() as cursor:

            # 🔍 validar missão
            cursor.execute(
                "SELECT data FROM missao WHERE id_missao = %s",
                (id_missao,)
            )
            missao = cursor.fetchone()

            if not missao:
                raise HTTPException(status_code=404, detail="Missão não encontrada.")

            if missao[0] > date.today():
                raise HTTPException(
                    status_code=400,
                    detail="Não é possível editar antes da missão acontecer."
                )

            # 🔄 update
            cursor.execute(
                """
                UPDATE frequencia
                SET status = %s
                WHERE id_servo = %s AND id_missao = %s
                """,
                (status, id_servo, id_missao)
            )

            if cursor.rowcount == 0:
                raise HTTPException(
                    status_code=404,
                    detail="Registro não encontrado."
                )

            conn.commit()

        return {"message": "Atualizado com sucesso!"}

    except HTTPException as he:
        raise he
    except Exception:
        conn.rollback()
        raise HTTPException(status_code=500, detail="Erro interno")

    finally:
        conn.close()