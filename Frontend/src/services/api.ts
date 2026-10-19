const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? "";
const API_KEY = process.env.EXPO_PUBLIC_API_KEY ?? "";

export async function apiRequest<T = unknown>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    // headers depois do spread: senão um options.headers apagaria a API key
    headers: {
      "Content-Type": "application/json",
      "X-API-Key": API_KEY,
      ...(options?.headers || {}),
    },
  });

  if (!response.ok) {
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
