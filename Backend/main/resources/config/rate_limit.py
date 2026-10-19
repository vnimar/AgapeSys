import time

from fastapi import HTTPException, Request, status

# ── Bloqueio contra tentativa e erro ──────────────────────────────────────────
#
# Guarda em memória as falhas recentes por chave (ex.: IP, IP + email).
# Depois de MAX_TENTATIVAS falhas dentro da janela, a chave fica bloqueada até
# as falhas antigas expirarem. Em memória basta: o Render roda uma instância só.

MAX_TENTATIVAS = 5
JANELA_SEGUNDOS = 15 * 60


class LimitadorTentativas:
    def __init__(self, mensagem: str):
        self.mensagem = mensagem
        self._falhas: dict[str, list[float]] = {}

    def _recentes(self, chave: str) -> list[float]:
        agora = time.time()
        falhas = [t for t in self._falhas.get(chave, []) if agora - t < JANELA_SEGUNDOS]
        if falhas:
            self._falhas[chave] = falhas
        else:
            self._falhas.pop(chave, None)
        return falhas

    def verificar(self, chave: str) -> None:
        if len(self._recentes(chave)) >= MAX_TENTATIVAS:
            raise HTTPException(status_code=status.HTTP_429_TOO_MANY_REQUESTS, detail=self.mensagem)

    def registrar_falha(self, chave: str) -> None:
        self._falhas.setdefault(chave, []).append(time.time())

    def limpar(self, chave: str) -> None:
        self._falhas.pop(chave, None)


def ip_do_cliente(request: Request) -> str:
    # No Render o IP real do cliente vem no X-Forwarded-For
    encaminhado = request.headers.get("x-forwarded-for")
    if encaminhado:
        return encaminhado.split(",")[0].strip()
    return request.client.host if request.client else "desconhecido"
