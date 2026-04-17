import logging
from fastapi import APIRouter, HTTPException
from ..bd.db import getConnection
import psycopg2.extras
from datetime import date
from ..schemas.frequencia_schema import (
    FrequenciaCreate,
    FrequenciaUpdate,
    FrequenciaResponse,
    FrequenciaEmptyResponse,
    MessageResponse,
)

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/frequencia", tags=["Frequência"])


@router.post("/register", response_model=MessageResponse, status_code=201)
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
                SELECT id_frequencia FROM frequencia
                WHERE id_servo = %s AND id_missao = %s
            """, (body.id_servo, body.id_missao))

            if cursor.fetchone():
                raise HTTPException(status_code=409, detail="Registro já existe. Use edição.")

            # 4. Inserir com status
            cursor.execute(
                """
                INSERT INTO frequencia (id_servo, id_missao, status, data)
                VALUES (%s, %s, %s, %s)
                """,
                (body.id_servo, body.id_missao, body.status, date.today())
            )
            conn.commit()

        return MessageResponse(message="Frequência registrada com sucesso!")

    except HTTPException:
        raise

    except Exception as e:
        logger.error(f"Erro ao registrar frequência: {e}")
        conn.rollback()
        raise HTTPException(status_code=500, detail="Erro interno.")

    finally:
        conn.close()


@router.get("/{id_missao}", response_model=FrequenciaResponse | FrequenciaEmptyResponse)
def get_frequencia(id_missao: int):
    conn = getConnection()

    try:
        with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cursor:

            cursor.execute(
                "SELECT data, descricao FROM missao WHERE id_missao = %s",
                (id_missao,)
            )
            missao = cursor.fetchone()

            if not missao:
                raise HTTPException(status_code=404, detail="Missão não encontrada.")

            cursor.execute("""
                SELECT id_frequencia FROM frequencia
                WHERE id_missao = %s LIMIT 1
            """, (id_missao,))

            existe = cursor.fetchone()

            if existe is None:
                return FrequenciaEmptyResponse(
                    message="Missão existe, mas ainda não há registros de frequência.",
                    data_missao=missao["data"].isoformat(),
                    descricao=missao["descricao"],
                )

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

            return FrequenciaResponse(
                message="Frequência encontrada.",
                data_missao=missao["data"].isoformat(),
                descricao=missao["descricao"],
                data=[dict(d) for d in dados],
            )

    except HTTPException:
        raise

    except Exception as e:
        logger.error(f"Erro ao buscar frequência da missão {id_missao}: {e}")
        raise HTTPException(status_code=500, detail="Erro interno.")

    finally:
        conn.close()


@router.put("/update", response_model=MessageResponse)
def update_frequencia(body: FrequenciaUpdate):
    conn = getConnection()

    try:
        with conn.cursor() as cursor:

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

        return MessageResponse(message="Frequência atualizada com sucesso!")

    except HTTPException:
        raise

    except Exception as e:
        logger.error(f"Erro ao atualizar frequência: {e}")
        conn.rollback()
        raise HTTPException(status_code=500, detail="Erro interno.")

    finally:
        conn.close()