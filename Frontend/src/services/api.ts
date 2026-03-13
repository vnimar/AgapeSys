//Url alterar para ip maquina ate subir vercel
const BASE_URL = "http://192.168.0.5:8000";

export async function apiRequest(endpoint: string, options?: RequestInit) {

    const response = await fetch(`${BASE_URL}${endpoint}`, {
    headers: {
      "Content-Type": "application/json",
      ...(options?.headers || {})
    },
    ...options
    });

    if (!response.ok) {
    throw new Error("Erro na requisição");
    }

    return response.json();
}