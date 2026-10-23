const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? "";
const API_KEY = process.env.EXPO_PUBLIC_API_KEY ?? "";

// Token do login (preenchido pelo AuthContext). Sem login, as chamadas seguem
// só com a API key, como antes.
let authToken: string | null = null;
let onSessaoExpirada: (() => void) | null = null;

export function setAuthToken(token: string | null) {
  authToken = token;
}

/** Chamado quando o backend recusa o token (expirado, usuário inativado...). */
export function setOnSessaoExpirada(handler: (() => void) | null) {
  onSessaoExpirada = handler;
}

export async function apiRequest<T = unknown>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const tokenUsado = authToken;
  // Envio de arquivo (FormData): o fetch monta o Content-Type com o boundary
  const ehArquivo = typeof FormData !== "undefined" && options?.body instanceof FormData;
  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    // headers depois do spread: senão um options.headers apagaria a API key
    headers: {
      ...(ehArquivo ? {} : { "Content-Type": "application/json" }),
      "X-API-Key": API_KEY,
      ...(tokenUsado ? { Authorization: `Bearer ${tokenUsado}` } : {}),
      ...(options?.headers || {}),
    },
  });

  if (!response.ok) {
    // Token recusado: encerra a sessão salva no aparelho
    if (response.status === 401 && tokenUsado && onSessaoExpirada) {
      onSessaoExpirada();
    }

    let detail = `Erro ${response.status}`;
    try {
      const errorBody = await response.json();
      if (typeof errorBody?.detail === "string") {
        detail = errorBody.detail;
      } else if (Array.isArray(errorBody?.detail) && errorBody.detail[0]?.msg) {
        detail = "Dados inválidos. Confira os campos e tente novamente.";
      }
    } catch {

    }
    throw new Error(detail);
  }

  // 204 No Content
  if (response.status === 204) return undefined as T;

  return response.json() as Promise<T>;
}
