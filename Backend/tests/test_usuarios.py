"""Gerenciar usuários (administrador): criar, editar, resetar senha e a troca obrigatória."""
import pytest

from conftest import DOMINIO
from resources.bd.db import get_connection

PREFIXO = "novo."  # contas criadas aqui; apagadas no fim de cada teste


@pytest.fixture(autouse=True)
def limpar_contas_criadas():
    yield
    with get_connection() as conn:
        with conn.cursor() as cursor:
            cursor.execute("DELETE FROM usuario WHERE email LIKE %s", (PREFIXO + "%" + DOMINIO,))


@pytest.fixture
def admin(headers):
    return headers("admin")


def criar(client, admin, login, **extra):
    corpo = {"nome": f"Teste {login}", "email": PREFIXO + login + DOMINIO, "perfil": "servo", **extra}
    return client.post("/usuarios/", headers=admin, json=corpo)


def entrar(client, headers, email, senha):
    return client.post("/auth/login", headers=headers(None), json={"email": email, "senha": senha})


def test_lista_os_usuarios(client, admin):
    resposta = client.get("/usuarios/", headers=admin)
    assert resposta.status_code == 200
    emails = {u["email"] for u in resposta.json()}
    assert "servo" + DOMINIO in emails
    assert all("senha_hash" not in u for u in resposta.json())


def test_conta_nova_entra_com_senha_temporaria_e_precisa_trocar(client, headers, admin):
    resposta = criar(client, admin, "fulano")
    assert resposta.status_code == 201, resposta.text
    senha_temp = resposta.json()["senha_temporaria"]
    assert len(senha_temp) >= 8
    assert resposta.json()["usuario"]["trocar_senha"] is True

    login = entrar(client, headers, PREFIXO + "fulano" + DOMINIO, senha_temp)
    assert login.status_code == 200
    assert login.json()["usuario"]["trocar_senha"] is True

    auth = {**headers(None), "Authorization": f"Bearer {login.json()['access_token']}"}
    troca = client.put("/auth/senha", headers=auth, json={"senha_atual": senha_temp, "senha_nova": "senha-nova-123"})
    assert troca.status_code == 204, troca.text
    assert client.get("/auth/me", headers=auth).json()["trocar_senha"] is False

    # A temporária não vale mais
    assert entrar(client, headers, PREFIXO + "fulano" + DOMINIO, senha_temp).status_code == 401
    assert entrar(client, headers, PREFIXO + "fulano" + DOMINIO, "senha-nova-123").status_code == 200


def test_nova_senha_precisa_ser_diferente(client, headers, admin):
    senha_temp = criar(client, admin, "repete").json()["senha_temporaria"]
    token = entrar(client, headers, PREFIXO + "repete" + DOMINIO, senha_temp).json()["access_token"]
    auth = {**headers(None), "Authorization": f"Bearer {token}"}
    troca = client.put("/auth/senha", headers=auth, json={"senha_atual": senha_temp, "senha_nova": senha_temp})
    assert troca.status_code == 400


def test_resetar_senha(client, headers, admin):
    criado = criar(client, admin, "esqueceu").json()["usuario"]
    reset = client.post(f"/usuarios/{criado['id']}/resetar-senha", headers=admin)
    assert reset.status_code == 200
    nova = reset.json()["senha_temporaria"]
    login = entrar(client, headers, PREFIXO + "esqueceu" + DOMINIO, nova)
    assert login.status_code == 200
    assert login.json()["usuario"]["trocar_senha"] is True


def test_email_repetido(client, admin):
    assert criar(client, admin, "dup").status_code == 201
    repetido = client.post("/usuarios/", headers=admin,
                           json={"nome": "Outro", "email": (PREFIXO + "DUP" + DOMINIO), "perfil": "servo"})
    assert repetido.status_code == 409
    assert repetido.json()["detail"] == "Email já cadastrado."


def test_servo_so_pode_ter_um_login(client, admin, usuarios):
    id_servo_com_login = usuarios["servo"][1]
    resposta = criar(client, admin, "segundo", id_servo=id_servo_com_login)
    assert resposta.status_code == 409
    assert resposta.json()["detail"] == "Este servo já tem um login."


def test_servo_inexistente(client, admin):
    assert criar(client, admin, "fantasma", id_servo=999999).status_code == 400


def test_desativar_bloqueia_na_hora(client, headers, admin):
    criado = criar(client, admin, "sai").json()
    usuario, senha = criado["usuario"], criado["senha_temporaria"]
    token = entrar(client, headers, usuario["email"], senha).json()["access_token"]
    auth = {**headers(None), "Authorization": f"Bearer {token}"}

    edicao = client.put(f"/usuarios/{usuario['id']}", headers=admin, json={
        "nome": usuario["nome"], "email": usuario["email"], "perfil": "servo", "ativo": False,
    })
    assert edicao.status_code == 200
    assert edicao.json()["ativo"] is False

    assert client.get("/auth/me", headers=auth).status_code == 401
    assert entrar(client, headers, usuario["email"], senha).status_code == 403


def test_mudar_perfil_vale_na_hora(client, headers, admin):
    criado = criar(client, admin, "promovido").json()
    usuario, senha = criado["usuario"], criado["senha_temporaria"]
    token = entrar(client, headers, usuario["email"], senha).json()["access_token"]
    auth = {**headers(None), "Authorization": f"Bearer {token}"}
    assert client.get("/servos/", headers=auth).status_code == 403

    client.put(f"/usuarios/{usuario['id']}", headers=admin, json={
        "nome": usuario["nome"], "email": usuario["email"],
        "perfil": "coordenador_formacao_vivencia", "ativo": True,
    })
    assert client.get("/servos/", headers=auth).status_code == 200


@pytest.mark.parametrize("mudanca", [{"ativo": False}, {"perfil": "coordenador_geral"}])
def test_admin_nao_se_tranca_para_fora(client, admin, usuarios, mudanca):
    id_admin = usuarios["admin"][0]
    corpo = {"nome": "Teste Administrador", "email": "admin" + DOMINIO,
             "perfil": "administrador", "ativo": True, **mudanca}
    assert client.put(f"/usuarios/{id_admin}", headers=admin, json=corpo).status_code == 400
