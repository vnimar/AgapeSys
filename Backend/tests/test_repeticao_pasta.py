"""Repetição de pasta: quantos anos seguidos cada pasta pode ser feita (trigger da 008)."""
import psycopg2
import pytest

from resources.bd.db import getConnection, releaseConnection

ANO = 2030  # longe dos anos do seed


@pytest.fixture
def cursor():
    """Tudo o que o teste grava é desfeito no final."""
    conn = getConnection()
    try:
        with conn.cursor() as cur:
            yield cur
    finally:
        conn.rollback()
        releaseConnection(conn)


@pytest.fixture
def servo(cursor):
    cursor.execute("INSERT INTO servo (nome, status, ano_ingresso) VALUES ('Teste Repetição', 'Ativo', 2020) "
                   "RETURNING id_servo")
    return cursor.fetchone()[0]


def pasta(cursor, nome):
    cursor.execute("SELECT id_pasta FROM pasta WHERE nome = %s", (nome,))
    return cursor.fetchone()[0]


def dar_pasta(cursor, id_servo, nome, *anos):
    for ano in anos:
        cursor.execute("INSERT INTO servo_pasta (id_servo, id_pasta, ano) VALUES (%s, %s, %s)",
                       (id_servo, pasta(cursor, nome), ano))


def test_padrao_nao_repete_no_ano_seguinte(cursor, servo):
    dar_pasta(cursor, servo, "Ornamentação", ANO)
    with pytest.raises(psycopg2.errors.RaiseException, match="não pode ser repetida"):
        dar_pasta(cursor, servo, "Ornamentação", ANO + 1)


def test_padrao_volta_depois_de_um_ano(cursor, servo):
    dar_pasta(cursor, servo, "Ornamentação", ANO, ANO + 2)


def test_coordenador_geral_ate_dois_anos(cursor, servo):
    dar_pasta(cursor, servo, "Coordenador Geral", ANO, ANO + 1)
    with pytest.raises(psycopg2.errors.RaiseException, match="no máximo 2 anos"):
        dar_pasta(cursor, servo, "Coordenador Geral", ANO + 2)


def test_conta_anos_dos_dois_lados(cursor, servo):
    # Preencher o buraco entre 2030 e 2032 daria 3 anos seguidos
    dar_pasta(cursor, servo, "Coordenador Geral", ANO, ANO + 2)
    with pytest.raises(psycopg2.errors.RaiseException):
        dar_pasta(cursor, servo, "Coordenador Geral", ANO + 1)


def test_musica_sem_limite(cursor, servo):
    dar_pasta(cursor, servo, "Música", *range(ANO, ANO + 5))


def test_formacao_e_vivencia_alternam(cursor, servo):
    dar_pasta(cursor, servo, "Coordenador de Formação de Servos", ANO)
    dar_pasta(cursor, servo, "Coordenador de Espiritualidade de Vivência de Servos", ANO + 1)


def test_vale_tambem_ao_editar(cursor, servo):
    dar_pasta(cursor, servo, "Ornamentação", ANO)
    dar_pasta(cursor, servo, "Música", ANO + 1)
    with pytest.raises(psycopg2.errors.RaiseException):
        cursor.execute("UPDATE servo_pasta SET id_pasta = %s WHERE id_servo = %s AND ano = %s",
                       (pasta(cursor, "Ornamentação"), servo, ANO + 1))
