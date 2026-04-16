import logging
from fastapi import APIRouter, HTTPException
from ..bd.db import getConnection
import psycopg2.extras
from datetime import date
from ..schemas.frequencia_schema import FrequenciaCreate, FrequenciaUpdate

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/frequencia", tags=["frequencia"])

@router.post("/")
def register_frequencia(body: FrequenciaCreate):
    conn = getConnection()

    try:
        with conn.cursor() as cursor:

            # 1. Buscar data da missão
            cursor.execute(
                "SELECT data FROM missao WHERE id_missao = %s",
                (body.id_missao,)
            )
            missao = cursor.fetchone()

            if not missao:
                raise HTTPException(status_code=404, detail="Missão não encontrada.")

            # 2. Bloquear se ainda não aconteceu
            if missao[0] > date.today():
                raise HTTPException(
                    status_code=400,
                    detail="Não é possível registrar frequência antes da missão acontecer."
                )

            # 3. Verificar duplicidade
            cursor.execute("""
                SELECT id_frequencia
                FROM frequencia
                WHERE id_servo = %s AND id_missao = %s
            """, (body.id_servo, body.id_missao))

            if cursor.fetchone():
                raise HTTPException(
                    status_code=400,
                    detail="Registro já existe. Use edição."
                )

            # 4. Inserir
            cursor.execute(
                """
                INSERT INTO frequencia (id_servo, id_missao, data)
                VALUES (%s, %s, %s)
                """,
                (body.id_servo, body.id_missao, date.today())
            )

            conn.commit()

        return {"message": "Frequência registrada com sucesso!"}

    except HTTPException:
        raise

    except Exception as e:
        logger.error(f"Erro ao registrar frequência: {e}")
        conn.rollback()
        raise HTTPException(status_code=500, detail="Erro interno")

    finally:
        conn.close()


@router.get("/{id_missao}")
def get_frequencia(id_missao: int):
    conn = getConnection()

    try:
        with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cursor:

            # 1. Verifica se a missão existe
            cursor.execute(
                "SELECT data, descricao FROM missao WHERE id_missao = %s",
                (id_missao,)
            )
            missao = cursor.fetchone()

            if not missao:
                raise HTTPException(status_code=404, detail="Essa missão não existe.")

            # 2. Verifica se existe frequência
            cursor.execute("""
                SELECT id_frequencia
                FROM frequencia
                WHERE id_missao = %s
                LIMIT 1
            """, (id_missao,))

            existe = cursor.fetchone()

            # 3. Se NÃO existe frequência
            if existe is None:
                return {
                    "message": "Missão existe, mas ainda não há registros de frequência.",
                    "data_missao": missao["data"],
                    "descricao": missao["descricao"],
                    "data": []
                }

            # 4. Se EXISTE frequência → busca dados
            cursor.execute("""
                SELECT
                    s.id_servo,
                    s.nome,
                    f.status
                FROM frequencia f
                JOIN servo s ON s.id_servo = f.id_servo
                WHERE f.id_missao = %s
                ORDER BY s.nome
            """, (id_missao,))

            dados = cursor.fetchall()

            return {
                "message": "Frequência encontrada.",
                "data_missao": missao["data"],
                "descricao": missao["descricao"],
                "data": dados
            }

    except HTTPException:
        raise

    except Exception as e:
        logger.error(f"Erro ao buscar frequência: {e}")
        conn.rollback()
        raise HTTPException(status_code=500, detail="Erro interno")

    finally:
        conn.close()


@router.put("/")
def update_frequencia(body: FrequenciaUpdate):
    conn = getConnection()

    try:
        with conn.cursor() as cursor:

            # Validar missão
            cursor.execute(
                "SELECT data FROM missao WHERE id_missao = %s",
                (body.id_missao,)
            )
            missao = cursor.fetchone()

            if not missao:
                raise HTTPException(status_code=404, detail="Missão não encontrada.")

            if missao[0] > date.today():
                raise HTTPException(
                    status_code=400,
                    detail="Não é possível editar antes da missão acontecer."
                )

            # Update
            cursor.execute(
                """
                UPDATE frequencia
                SET status = %s
                WHERE id_servo = %s AND id_missao = %s
                """,
                (body.status, body.id_servo, body.id_missao)
            )

            if cursor.rowcount == 0:
                raise HTTPException(status_code=404, detail="Registro não encontrado.")

            conn.commit()

        return {"message": "Atualizado com sucesso!"}

    except HTTPException:
        raise

    except Exception as e:
        logger.error(f"Erro ao atualizar frequência: {e}")
        conn.rollback()
        raise HTTPException(status_code=500, detail="Erro interno")

    finally:
        conn.close()