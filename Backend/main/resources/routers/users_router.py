import logging
from fastapi import APIRouter, HTTPException
from ..bd.db import getConnection
import psycopg2
import psycopg2.extras
from ..schemas.servo_schema import ServoListItem, ServoDetail

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/servos", tags=["Servos"])


@router.get("/", response_model=list[ServoListItem])
def listar_servos():
    conn = None

    try:
        conn = getConnection()

        with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cursor:
            cursor.execute("""
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
            """)
            servos = cursor.fetchall()

        return [ServoListItem(**dict(s)) for s in servos]

    except psycopg2.Error as e:
        logger.error(f"Erro ao listar servos: {e}")
        raise HTTPException(status_code=500, detail="Erro ao buscar servos.")

    finally:
        if conn:
            conn.close()


@router.get("/{servo_id}", response_model=ServoDetail)
def get_servo_by_id(servo_id: int):
    conn = None

    try:
        conn = getConnection()

        with conn.cursor() as cursor:
            cursor.execute(
                "SELECT id_servo, nome, telefone, status, ano_ingresso FROM servo WHERE id_servo = %s",
                (servo_id,)
            )
            servo = cursor.fetchone()

        if not servo:
            raise HTTPException(status_code=404, detail="Servo não encontrado.")

        return ServoDetail(
            id=servo[0],
            nome=servo[1],
            telefone=servo[2],
            status=servo[3],
            ano_ingresso=servo[4],
        )

    except HTTPException:
        raise

    except Exception as e:
        logger.error(f"Erro ao buscar servo {servo_id}: {e}")
        raise HTTPException(status_code=500, detail="Erro interno.")

    finally:
        if conn:
            conn.close()