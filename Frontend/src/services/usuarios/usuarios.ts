import { apiRequest } from "../api";
import { Perfil } from "../auth/auth";

// Contas de acesso — só o administrador usa (o backend confere).

export interface UsuarioAdmin {
  id: number;
  nome: string;
  email: string;
  perfil: Perfil;          // manual (ex.: administrador)
  perfis_pasta: Perfil[];  // vêm das pastas do ano
  ativo: boolean;
  id_servo: number | null;
  servo_nome: string | null;
  servo_ativo: boolean | null;
  trocar_senha: boolean;
  ultimo_login: string | null;
}

export interface UsuarioForm {
  nome: string;
  email: string;
  perfil: Perfil;
  id_servo: number | null;
  ativo?: boolean;
}

export interface SenhaTemporaria {
  usuario: UsuarioAdmin;
  senha_temporaria: string;
}

export function listarUsuarios() {
  return apiRequest<UsuarioAdmin[]>("/usuarios/");
}

export function criarUsuario(dados: UsuarioForm) {
  return apiRequest<SenhaTemporaria>("/usuarios/", {
    method: "POST",
    body: JSON.stringify(dados),
  });
}

export function editarUsuario(id: number, dados: UsuarioForm) {
  return apiRequest<UsuarioAdmin>(`/usuarios/${id}`, {
    method: "PUT",
    body: JSON.stringify(dados),
  });
}

export function resetarSenha(id: number) {
  return apiRequest<SenhaTemporaria>(`/usuarios/${id}/resetar-senha`, { method: "POST" });
}
