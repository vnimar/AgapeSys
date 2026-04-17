<<<<<<< HEAD
// TODO: trocar pelo IP correto ou URL de produção
const BASE_URL = "http://192.168.0.7:8000";
=======
//Url alterar para ip maquina ate subir vercel
const BASE_URL = "http://192.168.68.100:8000";
>>>>>>> 54f50db6235a44a84ca8364e4fc777d860afdecb

export async function apiRequest<T = unknown>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const response = await fetch(`${BASE_URL}${endpoint}`, {
    headers: {
      "Content-Type": "application/json",
      ...(options?.headers || {}),
    },
    ...options,
  });

  if (!response.ok) {
    // Tenta extrair o detalhe de erro do backend (FastAPI retorna { detail: "..." })
    let detail = `Erro ${response.status}`;
    try {
      const errorBody = await response.json();
      if (errorBody?.detail) detail = errorBody.detail;
    } catch {
      // ignora se o corpo não for JSON
    }
    throw new Error(detail);
  }

  return response.json() as Promise<T>;
}