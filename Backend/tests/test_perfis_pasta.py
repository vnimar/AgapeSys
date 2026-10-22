"""Perfil pela pasta: o acesso soma o perfil manual com os das pastas do ano vigente."""
import pytest

from resources.bd.db import get_connection


def me(client, headers, login):
    resposta = client.get("/auth/me", headers=headers(login))
    assert resposta.status_code == 200, resposta.text
    return resposta.json()


@pytest.mark.parametrize("login, perfil, perfis", [
    ("servo", "servo", ["servo"]),
    ("formacao", "coordenador_formacao_vivencia", ["coordenador_formacao_vivencia", "servo"]),
    ("coordgeral", "coordenador_geral", ["coordenador_geral", "servo"]),
    ("coord.kairos", "coordenador_comunidade_cursista", ["coordenador_comunidade_cursista", "servo"]),
    ("tutor.kairos", "tutor_comunidade_cursista", ["tutor_comunidade_cursista", "servo"]),
    ("admin", "administrador", ["administrador"]),
    ("geral.manual", "coordenador_geral", ["coordenador_geral"]),
])
def test_perfil_vem_da_pasta(client, headers, login, perfil, perfis):
    dados = me(client, headers, login)
    assert dados["perfil"] == perfil      # principal: o que versões antigas do app usam
    assert dados["perfis"] == perfis


def test_varias_pastas_somam_os_perfis(client, headers):
    # Música + Espiritualidade de Vivência + Tutor Kenosis + Coord. Comunidade de Servos
    dados = me(client, headers, "multi")
    assert dados["perfil"] == "coordenador_formacao_vivencia"
    assert set(dados["perfis"]) == {"coordenador_formacao_vivencia", "tutor_comunidade_cursista", "servo"}


@pytest.mark.usefixtures("login_obrigatorio")
def test_varias_pastas_liberam_as_funcoes_de_todas(client, headers):
    assert client.get("/servos/", headers=headers("multi")).status_code == 200      # pela pasta de vivência
    assert client.post("/missao/", headers=headers("multi"), json={}).status_code == 403  # nenhuma dá calendário


def test_comunidade_de_servos_nao_e_perfil(client, headers):
    # "Coordenador de Comunidade de Servos" não dá perfil: a chamada é da formação/vivência
    assert "coordenador_comunidade_cursista" not in me(client, headers, "multi")["perfis"]


@pytest.mark.usefixtures("login_obrigatorio")
def test_pasta_do_ano_que_vem_ainda_nao_vale(client, headers):
    # Entregue em dezembro (ano seguinte): só vale em janeiro
    assert me(client, headers, "proximo.ano")["perfis"] == ["servo"]
    assert client.post("/missao/", headers=headers("proximo.ano"), json={}).status_code == 403


@pytest.mark.usefixtures("login_obrigatorio")
def test_sem_pasta_no_ano_continua_com_a_ultima(client, headers):
    # Janeiro antes do cadastro das pastas novas: não perde o acesso
    assert me(client, headers, "ano.passado")["perfil"] == "coordenador_formacao_vivencia"
    assert client.get("/servos/", headers=headers("ano.passado")).status_code == 200


@pytest.mark.usefixtures("login_obrigatorio")
def test_perfil_manual_continua_valendo(client, headers):
    assert client.post("/missao/", headers=headers("geral.manual"), json={}).status_code == 422


@pytest.mark.usefixtures("login_obrigatorio")
def test_trocar_de_pasta_muda_o_acesso_na_hora(client, headers, usuarios):
    """Tirar a pasta de coordenação: o mesmo token perde o acesso na próxima chamada."""
    id_servo = usuarios["formacao"][1]
    assert client.get("/servos/", headers=headers("formacao")).status_code == 200

    with get_connection() as conn:
        with conn.cursor() as cursor:
            cursor.execute("""
                UPDATE servo_pasta SET id_pasta = (SELECT id_pasta FROM pasta WHERE nome = 'Música')
                WHERE id_servo = %s RETURNING id_servo_pasta
            """, (id_servo,))
            alterada = cursor.fetchone()[0]
    try:
        assert client.get("/servos/", headers=headers("formacao")).status_code == 403
    finally:
        with get_connection() as conn:
            with conn.cursor() as cursor:
                cursor.execute("""
                    UPDATE servo_pasta
                    SET id_pasta = (SELECT id_pasta FROM pasta WHERE nome = 'Coordenador de Formação de Servos')
                    WHERE id_servo_pasta = %s
                """, (alterada,))


def test_login_devolve_os_perfis(client, headers):
    from conftest import DOMINIO, SENHA_TESTE
    if not SENHA_TESTE:
        pytest.skip("SENHA_TESTE não definida")
    resposta = client.post("/auth/login", headers=headers(None),
                           json={"email": "multi" + DOMINIO, "senha": SENHA_TESTE})
    assert resposta.status_code == 200
    assert "tutor_comunidade_cursista" in resposta.json()["usuario"]["perfis"]


def test_tela_de_usuarios_mostra_perfis_da_pasta(client, headers):
    lista = client.get("/usuarios/", headers=headers("admin")).json()
    multi = next(u for u in lista if u["email"].startswith("multi@"))
    assert multi["perfil"] == "servo"
    assert set(multi["perfis_pasta"]) == {"coordenador_formacao_vivencia", "tutor_comunidade_cursista"}
