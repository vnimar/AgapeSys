import os
import logging
from contextlib import contextmanager

import psycopg2
from psycopg2 import pool
from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger(__name__)

DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    raise ValueError("DATABASE_URL não configurada. Verifique o .env")

# ── Connection Pool ───────────────────────────────────────────────────────────
#
# ThreadedConnectionPool é thread-safe — necessário porque o FastAPI processa múltiplos requests em threads simultâneas.
#
# minconn=2 → mantém 2 conexões abertas sempre (evita latência no primeiro uso)
# maxconn=10 → no máximo 10 conexões simultâneas
#
# Para um app interno pequeno, 2-10 é mais que suficiente.
# Se o sistema crescer, aumente o maxconn.

_pool = pool.ThreadedConnectionPool(
    minconn=2,
    maxconn=10,
    dsn=DATABASE_URL,
    sslmode="require",
    connect_timeout=5,
)

logger.info("Connection pool iniciado com sucesso.")

# ── Context Manager ───────────────────────────────────────────────────────────
#
# O @contextmanager permite usar "with get_connection() as conn:"
# Isso garante que a conexão SEMPRE volta ao pool, mesmo se der erro.
#
# Sem isso, se ocorrer uma exception antes do conn.close(),
# a conexão fica "presa" e o pool esgota com o tempo.

@contextmanager
def get_connection():
    conn = _pool.getconn()  # paga uma conexão pool
    try:
        yield conn          # entraga para a chamada conn
        conn.commit()       # comita se deu tudo certo
    except Exception:
        conn.rollback()     # reverte se deu erro
        raise
    finally:
        _pool.putconn(conn)

# ── Compatibilidade ───────────────────────────────────────────────────────────
#
# Mantemos getConnection() para não precisar alterar todos os routers agora.
# Mas o ideal é migrar para "with get_connection() as conn:" aos poucos.

def getConnection():
    return _pool.getconn()

def releaseConnection(conn):
    """Devolve a conexão ao pool. Chame no finally de cada router."""
    if conn:
        _pool.putconn(conn)