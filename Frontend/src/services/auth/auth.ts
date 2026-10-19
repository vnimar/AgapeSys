import * as SecureStore from "expo-secure-store";
import { apiRequest } from "../api";

export type Perfil =
  | "servo"
  | "coordenador_formacao_vivencia"
  | "coordenador_comunidade_cursista"
  | "tutor_comunidade_cursista"
  | "coordenador_geral"
  | "administrador";

export interface Usuario {
  id: number;
  nome: string;
  email: string;
  perfil: Perfil;
  id_servo: number | null;
}

export const PERFIL_LABEL: Record<Perfil, string> = {
  servo: "Servo",
  coordenador_formacao_vivencia: "Coord. de Formação e Vivência",
  coordenador_comunidade_cursista: "Coord. de Comunidade de Cursistas",
  tutor_comunidade_cursista: "Tutor de Comunidade de Cursistas",
  coordenador_geral: "Coordenador Geral",
  administrador: "Administrador",
};

/** Perfis que administram o calendário (mesma lista do backend). */
export const PERFIS_ADMIN: Perfil[] = ["administrador", "coordenador_geral"];

const CHAVE_TOKEN = "agapello_auth_token";

export async function lerTokenSalvo(): Promise<string | null> {
  try {
    return await SecureStore.getItemAsync(CHAVE_TOKEN);
  } catch {
    return null;
  }
}

export async function salvarToken(token: string) {
  await SecureStore.setItemAsync(CHAVE_TOKEN, token);
}

export async function apagarToken() {
  try {
    await SecureStore.deleteItemAsync(CHAVE_TOKEN);
  } catch {}
}

export function login(email: string, senha: string) {
  return apiRequest<{ access_token: string; expira_em_dias: number; usuario: Usuario }>(
    "/auth/login",
    { method: "POST", body: JSON.stringify({ email, senha }) }
  );
}

export function buscarUsuarioLogado() {
  return apiRequest<Usuario>("/auth/me");
}

export function trocarSenha(senha_atual: string, senha_nova: string) {
  return apiRequest<void>("/auth/senha", {
    method: "PUT",
    body: JSON.stringify({ senha_atual, senha_nova }),
  });
}
