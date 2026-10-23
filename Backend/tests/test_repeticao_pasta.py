"""Repetição de pasta, Encontro/Pós-Encontro e coordenador (trigger da 009)."""
import psycopg2
import pytest

from resources.bd.db import getConnection, releaseConnection

ANO = 2031  # longe dos anos do seed; ímpar = começo de ciclo (2031/2032)


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


def dar_pasta(cursor, id_servo, nome, *anos, momento="pos", coordenador=False):
    for ano in anos:
        cursor.execute(
            "INSERT INTO servo_pasta (id_servo, id_pasta, ano, momento, coordenador) VALUES (%s, %s, %s, %s, %s)",
            (id_servo, pasta(cursor, nome), ano, momento, coordenador))


# ── Padrão ────────────────────────────────────────────────────────────────────

def test_padrao_nao_repete_no_ano_seguinte(cursor, servo):
    dar_pasta(cursor, servo, "Ornamentação", ANO)
    with pytest.raises(psycopg2.errors.RaiseException, match="não pode ser repetida"):
        dar_pasta(cursor, servo, "Ornamentação", ANO + 1)


def test_padrao_volta_depois_de_um_ano(cursor, servo):
    dar_pasta(cursor, servo, "Ornamentação", ANO, ANO + 2)


def test_formacao_e_vivencia_alternam(cursor, servo):
    dar_pasta(cursor, servo, "Coordenador de Formação de Servos", ANO)
    dar_pasta(cursor, servo, "Coordenador de Espiritualidade de Vivência de Servos", ANO + 1)


def test_vale_tambem_ao_editar(cursor, servo):
    dar_pasta(cursor, servo, "Ornamentação", ANO)
    dar_pasta(cursor, servo, "Música", ANO + 1)
    with pytest.raises(psycopg2.errors.RaiseException):
        cursor.execute("UPDATE servo_pasta SET id_pasta = %s WHERE id_servo = %s AND ano = %s",
                       (pasta(cursor, "Ornamentação"), servo, ANO + 1))


# ── Livre ─────────────────────────────────────────────────────────────────────

def test_musica_sem_limite(cursor, servo):
    dar_pasta(cursor, servo, "Música", *range(ANO, ANO + 5))


# ── Ciclo ─────────────────────────────────────────────────────────────────────

def test_coordenador_geral_repete_dentro_do_ciclo(cursor, servo):
    dar_pasta(cursor, servo, "Coordenador Geral", ANO, ANO + 1)


def test_coordenador_geral_sai_na_virada_do_ciclo(cursor, servo):
    dar_pasta(cursor, servo, "Coordenador Geral", ANO, ANO + 1)
    with pytest.raises(psycopg2.errors.RaiseException, match="mesmo ciclo"):
        dar_pasta(cursor, servo, "Coordenador Geral", ANO + 2)


def test_quem_entrou_no_meio_do_ciclo_tambem_sai(cursor, servo):
    dar_pasta(cursor, servo, "Coordenador Geral", ANO + 1)
    with pytest.raises(psycopg2.errors.RaiseException, match="mesmo ciclo"):
        dar_pasta(cursor, servo, "Coordenador Geral", ANO + 2)


def test_ciclo_confere_o_ano_anterior_tambem(cursor, servo):
    # Gravar 2032 com 2033 já lançado: anos seguidos, mas de ciclos diferentes
    dar_pasta(cursor, servo, "Coordenador Geral", ANO + 2)
    with pytest.raises(psycopg2.errors.RaiseException, match="mesmo ciclo"):
        dar_pasta(cursor, servo, "Coordenador Geral", ANO + 1)


# ── Mesma pasta com outro nome no Pós-Encontro ────────────────────────────────

def test_irma_de_outro_nome_conta_como_a_mesma(cursor, servo):
    dar_pasta(cursor, servo, "Palestra", ANO, momento="encontro")
    with pytest.raises(psycopg2.errors.RaiseException, match='"Palestra" não pode ser repetida'):
        dar_pasta(cursor, servo, "Ensino", ANO + 1)


def test_encontro_e_pos_no_mesmo_ano(cursor, servo):
    dar_pasta(cursor, servo, "Palestra", ANO, momento="encontro")
    dar_pasta(cursor, servo, "Ensino", ANO)
    dar_pasta(cursor, servo, "Música", ANO, momento="encontro")
    dar_pasta(cursor, servo, "Música", ANO)


# ── Coordenador da pasta (Intercessão) ────────────────────────────────────────

def test_coordenador_da_intercessao_fica_o_ciclo(cursor, servo):
    dar_pasta(cursor, servo, "Intercessão", ANO, momento="encontro", coordenador=True)
    dar_pasta(cursor, servo, "Espiritualidade e Intercessão", ANO, coordenador=True)
    dar_pasta(cursor, servo, "Intercessão", ANO + 1, momento="encontro", coordenador=True)
    dar_pasta(cursor, servo, "Espiritualidade e Intercessão", ANO + 1, coordenador=True)
    with pytest.raises(psycopg2.errors.RaiseException, match="mesmo ciclo"):
        dar_pasta(cursor, servo, "Intercessão", ANO + 2, momento="encontro", coordenador=True)


def test_equipe_da_intercessao_nao_repete(cursor, servo):
    dar_pasta(cursor, servo, "Intercessão", ANO, momento="encontro")
    with pytest.raises(psycopg2.errors.RaiseException, match="não pode ser repetida"):
        dar_pasta(cursor, servo, "Intercessão", ANO + 1, momento="encontro")


def test_de_coordenador_para_equipe_nao_repete(cursor, servo):
    dar_pasta(cursor, servo, "Intercessão", ANO, momento="encontro", coordenador=True)
    with pytest.raises(psycopg2.errors.RaiseException, match="não pode ser repetida"):
        dar_pasta(cursor, servo, "Intercessão", ANO + 1, momento="encontro")


# ── Encontro / Pós-Encontro ───────────────────────────────────────────────────

def test_pasta_so_do_encontro_nao_entra_no_pos(cursor, servo):
    with pytest.raises(psycopg2.errors.RaiseException, match="só existe no Encontro"):
        dar_pasta(cursor, servo, "Cozinha", ANO, momento="pos")


def test_perfil_vem_so_do_pos_encontro(cursor, servo):
    import datetime
    ano = datetime.date.today().year
    dar_pasta(cursor, servo, "Coordenador Geral", ano, momento="encontro")
    cursor.execute("SELECT perfis FROM vw_perfis_pasta WHERE id_servo = %s", (servo,))
    assert cursor.fetchone() is None

    dar_pasta(cursor, servo, "Coordenador Geral", ano, momento="pos")
    cursor.execute("SELECT perfis FROM vw_perfis_pasta WHERE id_servo = %s", (servo,))
    assert cursor.fetchone()[0] == ["coordenador_geral"]
