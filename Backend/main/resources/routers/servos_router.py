import logging
from typing import Optional
from fastapi import APIRouter, HTTPException, Depends
from ..bd.db import get_connection
import psycopg2
import psycopg2.extras
from ..schemas.servo_schema import ServoListItem, ServoDetail
from ..schemas.auth_schema import UsuarioLogado
from ..config.security import PERFIS_COORD_SERVOS, exigir_login, exigir_coord_servos

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/servos", tags=["Servos"])

@router.get("/", response_model=list[ServoListItem], dependencies=[Depends(exigir_coord_servos)])
def listar_servos():

    try:
        with get_connection() as conn, conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cursor:
            cursor.execute("""
               SELECT s.id_servo AS id,
                      s.nome,
                      s.telefone,
                      s.status,
                      s.ano_ingresso,
                      COALESCE(
                              json_agg(p.nome) FILTER(WHERE p.nome IS NOT NULL),
                              '[]'
                      ) AS pastas
               FROM servo s
                        -- Só as pastas do ano atual (servo_pasta guarda o histórico de todos os anos)
                        LEFT JOIN servo_pasta sp ON sp.id_servo = s.id_servo
                                                AND sp.ano = EXTRACT(YEAR FROM CURRENT_DATE)
                        LEFT JOIN pasta p ON p.id_pasta = sp.id_pasta
               GROUP BY s.id_servo
               ORDER BY s.nome
           """)
            servos = cursor.fetchall()

        return [ServoListItem(**dict(s)) for s in servos]

    except psycopg2.Error as e:
        logger.error(f"Erro ao listar servos: {e}")
        raise HTTPException(status_code=500, detail="Erro ao buscar servos.")


@router.get("/{servo_id}", response_model=ServoDetail)
def get_servo_by_id(
    servo_id: int,
    usuario: Optional[UsuarioLogado] = Depends(exigir_login),
):
    # Quem não cuida dos servos só vê o próprio cadastro
    if usuario and usuario.perfil not in PERFIS_COORD_SERVOS and usuario.id_servo != servo_id:
        raise HTTPException(status_code=403, detail="Seu perfil não tem acesso a esta função.")

    try:
        with get_connection() as conn, conn.cursor() as cursor:
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