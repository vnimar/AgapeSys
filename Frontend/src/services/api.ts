<<<<<<< HEAD
const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? "https://agapesys.onrender.com";
const API_KEY = process.env.EXPO_PUBLIC_API_KEY ?? "0cd5ee0b7e8e76aebbb34277e8a1688f";
=======
const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? "";
const API_KEY = process.env.EXPO_PUBLIC_API_KEY ?? "";
>>>>>>> origin/main

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
