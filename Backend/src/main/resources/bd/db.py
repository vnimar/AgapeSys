import psycopg2
from dotenv import load_dotenv
import os

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

print("DATABASE_URL carregada:", DATABASE_URL)

try:
    conn = psycopg2.connect(DATABASE_URL)
    cursor = conn.cursor()
    cursor.execute("SELECT 1;")
    resultado = cursor.fetchone()
    print("Conexão bem-sucedida! Resultado do teste:", resultado)

    cursor.close()
    conn.close()

except Exception as e:
    print("Erro ao conectar no banco:")
    print(e)
