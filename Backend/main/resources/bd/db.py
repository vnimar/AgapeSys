# ✅ Falhar rápido na inicialização, não no primeiro request
from dotenv import load_dotenv
import os, psycopg2

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    raise RuntimeError("DATABASE_URL não configurada. Verifique o .env")

def getConnection():
    return psycopg2.connect(DATABASE_URL, sslmode='require', connect_timeout=5)