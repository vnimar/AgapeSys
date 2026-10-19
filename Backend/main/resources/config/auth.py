import os
import secrets
import time
from fastapi import Request, Security, HTTPException, status
from fastapi.security.api_key import APIKeyHeader
from dotenv import load_dotenv

load_dotenv()

API_KEY = os.getenv("API_KEY")

api_key_header = APIKeyHeader(name="X-API-Key", auto_error=False)

def verify_api_key(key: str = Security(api_key_header)):
    if not API_KEY:
        raise RuntimeError("API_KEY não definida no servidor.")
    if key != API_KEY:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Acesso não autorizado."
        )

# PIN de administração — protege a edição/importação de missões enquanto não há login.
# Fica só no servidor (variável ADMIN_PIN no Render); sem ela, a edição fica desativada.
ADMIN_PIN = os.getenv("ADMIN_PIN")

admin_pin_header = APIKeyHeader(name="X-Admin-Pin", auto_error=False)

# Bloqueio contra tentativa e erro: 5 PINs errados em 15 min bloqueiam o IP.
MAX_TENTATIVAS = 5
JANELA_SEGUNDOS = 15 * 60
_falhas_por_ip: dict[str, list[float]] = {}

def verify_admin_pin(request: Request, pin: str = Security(admin_pin_header)):
    if not ADMIN_PIN:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Edição desativada: ADMIN_PIN não configurado no servidor."
        )

    # No Render o IP real do cliente vem no X-Forwarded-For
    ip = (request.headers.get("x-forwarded-for") or request.client.host).split(",")[0].strip()
    agora = time.time()
    falhas = [t for t in _falhas_por_ip.get(ip, []) if agora - t < JANELA_SEGUNDOS]

    if len(falhas) >= MAX_TENTATIVAS:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Muitas tentativas com PIN errado. Tente novamente em 15 minutos."
        )

    if not pin or not secrets.compare_digest(pin, ADMIN_PIN):
        falhas.append(agora)
        _falhas_por_ip[ip] = falhas
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="PIN de administração inválido."
        )

    _falhas_por_ip.pop(ip, None)
