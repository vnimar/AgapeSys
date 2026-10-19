import os
import secrets
from typing import Optional

from fastapi import Depends, Request, Security, HTTPException, status
from fastapi.security.api_key import APIKeyHeader
from dotenv import load_dotenv

from .rate_limit import LimitadorTentativas, ip_do_cliente
from .security import PERFIS_ADMIN, get_optional_user
from ..schemas.auth_schema import UsuarioLogado

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

# PIN de administração — protege a edição/importação de missões enquanto o login
# não é obrigatório. Fica só no servidor (variável ADMIN_PIN no Render).
ADMIN_PIN = os.getenv("ADMIN_PIN")

admin_pin_header = APIKeyHeader(name="X-Admin-Pin", auto_error=False)

_limitador_pin = LimitadorTentativas(
    "Muitas tentativas com PIN errado. Tente novamente em 15 minutos."
)

def verify_admin_pin(request: Request, pin: str = Security(admin_pin_header)):
    if not ADMIN_PIN:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Edição desativada: ADMIN_PIN não configurado no servidor."
        )

    ip = ip_do_cliente(request)
    _limitador_pin.verificar(ip)

    if not pin or not secrets.compare_digest(pin, ADMIN_PIN):
        _limitador_pin.registrar_falha(ip)
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="PIN de administração inválido."
        )

    _limitador_pin.limpar(ip)


def verify_admin(
    request: Request,
    pin: Optional[str] = Security(admin_pin_header),
    usuario: Optional[UsuarioLogado] = Depends(get_optional_user),
):
    """Libera funções de administração por login (administrador / coord. geral) ou PIN."""
    if usuario is not None:
        if usuario.perfil in PERFIS_ADMIN:
            return
        if not pin:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Seu perfil não tem acesso a esta função."
            )
    verify_admin_pin(request, pin)
