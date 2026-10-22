"""
Popula o banco de TESTE com dados fictícios (um usuário por perfil, comunidades,
servos, cursistas, missões e frequências).

Uso, dentro da pasta Backend:
    .venv\\Scripts\\python.exe scripts\\seed_teste.py

Lê o banco do Backend/.env.teste (nunca do .env). APAGA tudo do banco de teste e
recria do zero, então pode rodar quantas vezes quiser.

Travas para não rodar no banco real:
1. Recusa se o .env.teste aponta para o mesmo projeto do .env.
2. Recusa se já existe usuário com email fora do domínio de teste.
"""
import os
import re
import sys
from datetime import date, timedelta
from pathlib import Path

import bcrypt
import psycopg2
from dotenv import dotenv_values

BACKEND = Path(__file__).resolve().parent.parent
DOMINIO = "@teste.agapello"
ANO = date.today().year

COMUNIDADES = ["Agnus Dei", "Kairós", "Kenosis", "Kyrius", "Maranata"]

TABELAS = [
    "frequencia_cursista", "visita_responsavel", "visita_cursista", "cursista",
    "encontro", "frequencia", "missao", "servo_afastamento", "usuario",
    "servo_pasta", "pasta", "servo", "comunidade",
]


def projeto(url: str) -> str:
    """Id do projeto Supabase na string de conexão (postgres.<id>:senha@...)."""
    achado = re.search(r"postgres\.([a-z0-9]+)[:@]", url or "")
    return achado.group(1) if achado else url


def conferir_travas(cursor, url_teste: str) -> None:
    url_real = dotenv_values(BACKEND / ".env").get("DATABASE_URL", "")
    if projeto(url_teste) == projeto(url_real):
        sys.exit("ABORTADO: o .env.teste aponta para o mesmo projeto do banco real.")

    cursor.execute(
        "SELECT count(*) FROM usuario WHERE lower(email) NOT LIKE %s",
        ("%" + DOMINIO,)
    )
    if cursor.fetchone()[0] > 0:
        sys.exit("ABORTADO: há usuários reais neste banco. Isto não parece o banco de teste.")


def main() -> int:
    env = dotenv_values(BACKEND / ".env.teste")
    url = env.get("DATABASE_URL")
    senha = env.get("SENHA_TESTE")
    if not url or "SENHA_AQUI" in url:
        print("Preencha o DATABASE_URL no Backend/.env.teste")
        return 1
    if not senha or len(senha) < 8:
        print("Defina SENHA_TESTE (mín. 8 caracteres) no Backend/.env.teste")
        return 1

    senha_hash = bcrypt.hashpw(senha.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")

    with psycopg2.connect(url, sslmode="require") as conn:
        with conn.cursor() as cur:
            conferir_travas(cur, url)
            cur.execute(f"TRUNCATE {', '.join(TABELAS)} RESTART IDENTITY CASCADE")

            # ── Comunidades e pastas ──────────────────────────────────────────
            comunidade = {}
            pasta_coord = {}
            pasta_tutor = {}
            for nome in COMUNIDADES:
                cur.execute(
                    "INSERT INTO comunidade (nome, tipo) VALUES (%s, 'cursistas') RETURNING id_comunidade",
                    (nome,)
                )
                comunidade[nome] = cur.fetchone()[0]
                cur.execute(
                    "INSERT INTO pasta (nome, id_comunidade) VALUES (%s, %s) RETURNING id_pasta",
                    (f"Coordenador de Comunidade de Cursistas: {nome}", comunidade[nome])
                )
                pasta_coord[nome] = cur.fetchone()[0]
                cur.execute(
                    "INSERT INTO pasta (nome, id_comunidade) VALUES (%s, %s) RETURNING id_pasta",
                    (f"Tutor da Comunidade de Cursistas: {nome}", comunidade[nome])
                )
                pasta_tutor[nome] = cur.fetchone()[0]

            pasta = {}
            for nome, repete in [("Música", True), ("Ornamentação", False),
                                 ("Coordenação Geral", True), ("Formação e Vivência", True)]:
                cur.execute(
                    "INSERT INTO pasta (nome, pode_repetir) VALUES (%s, %s) RETURNING id_pasta",
                    (nome, repete)
                )
                pasta[nome] = cur.fetchone()[0]

            # ── Servos ────────────────────────────────────────────────────────
            def novo_servo(nome, id_pasta, ingresso=ANO - 1, status="Ativo"):
                cur.execute(
                    "INSERT INTO servo (nome, status, ano_ingresso) VALUES (%s, %s, %s) RETURNING id_servo",
                    (nome, status, ingresso)
                )
                id_servo = cur.fetchone()[0]
                if id_pasta:
                    cur.execute(
                        "INSERT INTO servo_pasta (id_servo, id_pasta, ano) VALUES (%s, %s, %s)",
                        (id_servo, id_pasta, ANO)
                    )
                return id_servo

            s_servo = novo_servo("Teste Servo", pasta["Música"])
            s_formacao = novo_servo("Teste Coord. Formação", pasta["Formação e Vivência"], ANO - 3)
            s_geral = novo_servo("Teste Coord. Geral", pasta["Coordenação Geral"], ANO - 4)
            s_coord_kairos = novo_servo("Teste Coord. Kairós", pasta_coord["Kairós"], ANO - 2)
            s_tutor_kairos = novo_servo("Teste Tutor Kairós", pasta_tutor["Kairós"])
            s_coord_maranata = novo_servo("Teste Coord. Maranata", pasta_coord["Maranata"], ANO - 2)
            s_tutor_maranata = novo_servo("Teste Tutor Maranata", pasta_tutor["Maranata"])
            s_inativo = novo_servo("Teste Servo Inativo", None, ANO - 2, status="Inativo")
            s_bloqueado = novo_servo("Teste Login Desativado", pasta["Ornamentação"])

            # Coordenadores e tutores das outras comunidades (sem login)
            for nome in ["Agnus Dei", "Kenosis", "Kyrius"]:
                novo_servo(f"Teste Coord. {nome}", pasta_coord[nome], ANO - 2)
                novo_servo(f"Teste Tutor {nome}", pasta_tutor[nome])

            # Servos comuns, sem login, para encher as listas
            sem_login = [novo_servo(f"Teste Servo {i}", pasta["Música" if i % 2 else "Ornamentação"])
                         for i in range(1, 6)]

            # ── Usuários (um por perfil + casos de bloqueio) ──────────────────
            usuarios = [
                ("Teste Administrador", "admin", "administrador", None, True),
                ("Teste Coord. Geral", "coordgeral", "coordenador_geral", s_geral, True),
                ("Teste Coord. Formação", "formacao", "coordenador_formacao_vivencia", s_formacao, True),
                ("Teste Coord. Kairós", "coord.kairos", "coordenador_comunidade_cursista", s_coord_kairos, True),
                ("Teste Tutor Kairós", "tutor.kairos", "tutor_comunidade_cursista", s_tutor_kairos, True),
                ("Teste Coord. Maranata", "coord.maranata", "coordenador_comunidade_cursista", s_coord_maranata, True),
                ("Teste Tutor Maranata", "tutor.maranata", "tutor_comunidade_cursista", s_tutor_maranata, True),
                ("Teste Servo", "servo", "servo", s_servo, True),
                ("Teste Servo Inativo", "inativo", "servo", s_inativo, True),
                ("Teste Login Desativado", "desativado", "servo", s_bloqueado, False),
            ]
            id_usuario = {}
            for nome, login, perfil, id_servo, ativo in usuarios:
                cur.execute(
                    """INSERT INTO usuario (nome, email, perfil, senha_hash, ativo, id_servo)
                       VALUES (%s, %s, %s, %s, %s, %s) RETURNING id_usuario""",
                    (nome, login + DOMINIO, perfil, senha_hash, ativo, id_servo)
                )
                id_usuario[login] = cur.fetchone()[0]

            cur.execute(
                """INSERT INTO servo_afastamento (id_servo, data_saida, motivo, registrado_por)
                   VALUES (%s, %s, 'Afastamento de teste', %s)""",
                (s_inativo, date.today() - timedelta(days=60), id_usuario["admin"])
            )

            # ── Missões ───────────────────────────────────────────────────────
            hoje = date.today()
            missoes = {}
            for chave, dias, descricao, publico in [
                ("servos_1", -21, "Teste: reunião de servos", "servos"),
                ("servos_2", -14, "Teste: missão de servos", "servos"),
                ("servos_3", -7, "Teste: vivência de servos", "servos"),
                ("ambos_1", -10, "Teste: missa com cursistas e servos", "ambos"),
                ("curs_1", -12, "Teste: encontro de comunidade", "cursistas"),
                ("curs_2", -5, "Teste: formação de cursistas", "cursistas"),
                ("futura_servos", 7, "Teste: próxima missão de servos", "servos"),
                ("futura_curs", 9, "Teste: próxima reunião de cursistas", "cursistas"),
            ]:
                cur.execute(
                    """INSERT INTO missao (data, descricao, publico, horario, local)
                       VALUES (%s, %s, %s, '19:30', 'Local de teste') RETURNING id_missao""",
                    (hoje + timedelta(days=dias), descricao, publico)
                )
                missoes[chave] = (cur.fetchone()[0], hoje + timedelta(days=dias))

            # Frequência dos servos nas missões passadas
            ativos = [s_servo, s_formacao, s_geral, s_coord_kairos, s_tutor_kairos,
                      s_coord_maranata, s_tutor_maranata, *sem_login]
            for i, chave in enumerate(["servos_1", "ambos_1", "servos_2", "servos_3"]):
                id_missao, data = missoes[chave]
                for j, id_servo in enumerate(ativos):
                    status = ["Presente", "Presente", "Falta", "Justificada"][(i + j) % 4]
                    cur.execute(
                        """INSERT INTO frequencia (id_servo, id_missao, status, data, registrado_por)
                           VALUES (%s, %s, %s, %s, %s)""",
                        (id_servo, id_missao, status, data, id_usuario["formacao"])
                    )

            # ── Encontro e cursistas ──────────────────────────────────────────
            cur.execute(
                """INSERT INTO encontro (ano, data_inicio, data_fim, local)
                   VALUES (%s, %s, %s, 'Encontro de teste') RETURNING id_encontro""",
                (ANO, date(ANO, 3, 7), date(ANO, 3, 8))
            )
            id_encontro = cur.fetchone()[0]

            cursistas_ativos = {}
            for nome_com in ["Kairós", "Maranata", "Kenosis"]:
                cursistas_ativos[nome_com] = []
                for i in range(1, 4):
                    cur.execute(
                        """INSERT INTO cursista (nome, ano, status, id_comunidade, id_encontro, confirmou_em)
                           VALUES (%s, %s, 'ativo', %s, %s, %s) RETURNING id_cursista""",
                        (f"Teste Cursista {nome_com} {i}", ANO, comunidade[nome_com],
                         id_encontro, date(ANO, 2, 20))
                    )
                    cursistas_ativos[nome_com].append(cur.fetchone()[0])

            # Ainda no processo (não aparecem na chamada)
            for nome, status in [("Teste Inscrito", "inscrito"), ("Teste Em Visitas", "em_visitas"),
                                 ("Teste Confirmado", "confirmado")]:
                cur.execute(
                    "INSERT INTO cursista (nome, ano, status) VALUES (%s, %s, %s) RETURNING id_cursista",
                    (nome, ANO + 1, status)
                )
                if status == "em_visitas":
                    id_cursista = cur.fetchone()[0]
                    cur.execute(
                        """INSERT INTO visita_cursista (id_cursista, numero, data, realizada)
                           VALUES (%s, 1, %s, true) RETURNING id_visita""",
                        (id_cursista, hoje - timedelta(days=3))
                    )
                    id_visita = cur.fetchone()[0]
                    cur.executemany(
                        "INSERT INTO visita_responsavel (id_visita, id_servo) VALUES (%s, %s)",
                        [(id_visita, s_coord_kairos), (id_visita, s_tutor_kairos)]
                    )

            # Chamada dos cursistas (cada comunidade lançada pelo próprio tutor)
            quem_lanca = {"Kairós": "tutor.kairos", "Maranata": "tutor.maranata", "Kenosis": "admin"}
            for i, chave in enumerate(["curs_1", "ambos_1", "curs_2"]):
                id_missao, _ = missoes[chave]
                for nome_com, ids in cursistas_ativos.items():
                    for j, id_cursista in enumerate(ids):
                        status = ["Presente", "Falta", "Presente", "Justificada"][(i + j) % 4]
                        cur.execute(
                            """INSERT INTO frequencia_cursista (id_cursista, id_missao, status, registrado_por)
                               VALUES (%s, %s, %s, %s)""",
                            (id_cursista, id_missao, status, id_usuario[quem_lanca[nome_com]])
                        )

    print("Banco de teste populado.\n")
    print("Senha de todos: a SENHA_TESTE do .env.teste")
    for nome, login, perfil, _, ativo in usuarios:
        obs = "" if ativo else "  (login desativado: deve ser recusado)"
        if login == "inativo":
            obs = "  (servo Inativo: deve ser recusado)"
        print(f"  {login + DOMINIO:<32} {perfil}{obs}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
