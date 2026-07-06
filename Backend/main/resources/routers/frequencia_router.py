import logging
from fastapi import APIRouter, HTTPException
from ..bd.db import get_connection
import psycopg2.extras
from datetime import date
from ..schemas.frequencia_schema import (
    FrequenciaCreate,
    FrequenciaUpdate,
    FrequenciaResponse,
    FrequenciaEmptyResponse,
    MessageResponse,
    FrequenciaServosResponse,
)

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/frequencia", tags=["Frequência"])


# ── POST /register ────────────────────────────────────────────────────────────
#
# Antes: getConnection() + try/except/finally com commit, rollback e close
# Depois: with get_connection() — o context manager faz tudo automaticamente

@router.post("/register", response_model=MessageResponse, status_code=201)
def register_frequencia(body: FrequenciaCreate):

    try:
        with get_connection() as conn:
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

                # 4. Inserir
                # Não precisa de conn.commit() — o context manager commita automaticamente
                cursor.execute("""
                    INSERT INTO frequencia (id_servo, id_missao, status, data)
                    VALUES (%s, %s, %s, %s)
                """, (body.id_servo, body.id_missao, body.status, date.today()))

    except HTTPException:
        raise  # repassa HTTPException sem virar 500

    except Exception as e:
        # Não precisa de conn.rollback() — o context manager reverte automaticamente
        logger.error(f"Erro ao registrar frequência: {e}")
        raise HTTPException(status_code=500, detail="Erro interno.")

    return MessageResponse(message="Frequência registrada com sucesso!")


# ── GET /servos ───────────────────────────────────────────────────────────────
#
# IMPORTANTE: rota estática ANTES da dinâmica /{id_missao}
# O FastAPI lê as rotas de cima para baixo — se /{id_missao} viesse primeiro,
# ele tentaria converter "servos" para int e daria erro.

@router.get("/servos", response_model=FrequenciaServosResponse)
def get_frequencia_by_servo():

    try:
        with get_connection() as conn:
            with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cursor:
                cursor.execute("""
                    SELECT
                        s.id_servo,
                        s.nome,
                        COUNT(CASE WHEN f.status = 'Presente'    THEN 1 END) AS presente,
                        COUNT(CASE WHEN f.status = 'Justificada' THEN 1 END) AS justificada,
                        COUNT(CASE WHEN f.status = 'Falta'       THEN 1 END) AS falta,
                        ROUND(
                            COUNT(*) FILTER (WHERE f.status IN ('Presente', 'Justificada')) * 100.0
                            / NULLIF(COUNT(f.id_frequencia), 0),
                        2) AS percentual_presenca
                    FROM servo s
                    LEFT JOIN frequencia f ON f.id_servo = s.id_servo
                    GROUP BY s.id_servo, s.nome
                    ORDER BY s.nome
                """)
                dados = cursor.fetchall()

    except Exception as e:
        logger.error(f"Erro ao buscar resumo de frequência: {e}")
        raise HTTPException(status_code=500, detail="Erro interno.")

    return FrequenciaServosResponse(message="Resumo de frequência", data=dados)


# ── GET /missao/{id_missao} ───────────────────────────────────────────────────
#
# Rota dinâmica DEPOIS da estática /servos — ordem importa!

@router.get("/missao/{id_missao}", response_model=FrequenciaResponse | FrequenciaEmptyResponse)
def get_frequencia(id_missao: int):

    try:
        with get_connection() as conn:
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
                    SELECT s.id_servo, s.nome, f.status
                    FROM frequencia f
                    JOIN servo s ON s.id_servo = f.id_servo
                    WHERE f.id_missao = %s
                    ORDER BY s.nome
                """, (id_missao,))

                dados = cursor.fetchall()

    except HTTPException:
        raise

    except Exception as e:
        logger.error(f"Erro ao buscar frequência da missão {id_missao}: {e}")
        raise HTTPException(status_code=500, detail="Erro interno.")

    return FrequenciaResponse(
        message="Frequência encontrada.",
        data_missao=missao["data"].isoformat(),
        descricao=missao["descricao"],
        data=[dict(d) for d in dados],
    )


# ── PUT /update ───────────────────────────────────────────────────────────────

@router.put("/update", response_model=MessageResponse)
def update_frequencia(body: FrequenciaUpdate):

    try:
        with get_connection() as conn:
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

                cursor.execute("""
                    UPDATE frequencia
                    SET status = %s
                    WHERE id_servo = %s AND id_missao = %s
                """, (body.status, body.id_servo, body.id_missao))

                if cursor.rowcount == 0:
                    raise HTTPException(status_code=404, detail="Registro não encontrado.")

    except HTTPException:
        raise

    except Exception as e:
        logger.error(f"Erro ao atualizar frequência: {e}")
        raise HTTPException(status_code=500, detail="Erro interno.")

    return MessageResponse(message="Frequência atualizada com sucesso!")