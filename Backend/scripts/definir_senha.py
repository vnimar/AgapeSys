"""
Define (ou redefine) a senha de um usuário direto no banco.

Uso, dentro da pasta Backend:
    .venv\\Scripts\\python.exe scripts\\definir_senha.py

Pede o email e a senha (a senha não aparece enquanto digita). Serve para criar a
primeira senha do administrador e para resetar a senha de quem esqueceu.
"""
import getpass
import os
import sys
from pathlib import Path

import bcrypt
import psycopg2
from dotenv import load_dotenv

load_dotenv(Path(__file__).resolve().parent.parent / ".env")


def main() -> int:
    database_url = os.getenv("DATABASE_URL")
    if not database_url:
        print("DATABASE_URL não encontrada no Backend/.env")
        return 1

    email = input("Email do usuário: ").strip().lower()

    with psycopg2.connect(database_url, sslmode="require") as conn:
        with conn.cursor() as cursor:
            cursor.execute(
                "SELECT id_usuario, nome, perfil, ativo FROM usuario WHERE lower(email) = %s",
                (email,)
            )
            usuario = cursor.fetchone()

            if not usuario:
                print("Nenhum usuário com esse email.")
                return 1

            id_usuario, nome, perfil, ativo = usuario
            print(f"Usuário: {nome} ({perfil}){'' if ativo else ' — INATIVO'}")

            senha = getpass.getpass("Nova senha (mín. 8 caracteres): ")
            if len(senha) < 8:
                print("A senha precisa ter pelo menos 8 caracteres.")
                return 1
            if len(senha.encode("utf-8")) > 72:
                print("A senha é longa demais.")
                return 1
            if getpass.getpass("Repita a senha: ") != senha:
                print("As senhas não conferem.")
                return 1

            senha_hash = bcrypt.hashpw(senha.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")
            cursor.execute(
                "UPDATE usuario SET senha_hash = %s WHERE id_usuario = %s",
                (senha_hash, id_usuario)
            )

    print("Senha definida com sucesso.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
