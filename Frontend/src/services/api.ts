const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? "http://192.168.0.7:8000";
const API_KEY = process.env.EXPO_PUBLIC_API_KEY ?? "cf2a986dfba1f3fe3961fc9e484b6b837e8151c1ed1039f7144d261d7dd880b7";

export async function apiRequest<T = unknown>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const response = await fetch(`${BASE_URL}${endpoint}`, {
    headers: {
      "Content-Type": "application/json",
      "X-API-Key": API_KEY,
      ...(options?.headers || {}),
    },
    ...options,
  });

  if (!response.ok) {
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
