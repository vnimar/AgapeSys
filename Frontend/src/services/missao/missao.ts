// eslint-disable-next-line import/namespace
import {apiRequest} from "../api"
import { adminHeaders } from "../admin/admin";

export type PublicoMissao = "servos" | "cursistas" | "ambos";

export interface Missao {
  id_missao: number;
  data: string;            // YYYY-MM-DD
  descricao: string;
  local: string;
  horario: string;         // "HH:MM" ou "Horário não definido"
  publico: PublicoMissao;
  conta_frequencia: boolean;
  observacao: string | null;
}

export interface MissaoInput {
  data: string;            // YYYY-MM-DD
  descricao: string;
  horario: string | null;  // HH:MM
  local: string | null;
  publico: PublicoMissao;
  conta_frequencia: boolean;
  observacao: string | null;
}

export interface MissaoImportItem {
  data: string;
  descricao: string;
  horario: string | null;
  local: string | null;
  publico: PublicoMissao;
  situacao: "nova" | "duplicada";
}

//Endpoint para buscar informação na Api
export function getProximaMissao(){
    return apiRequest<Missao>("/missao/proxima")
    }

export function getMissoes() {
    return apiRequest<Missao[]>("/missao/");
    }

export async function getUltimasMissoes() {
    return apiRequest<Missao[]>("/missao/ultimas");
    }

// ── Edição (exige PIN) ────────────────────────────────────────────────────────

export async function criarMissao(missao: MissaoInput) {
    return apiRequest<Missao>("/missao/", {
        method: "POST",
        headers: await adminHeaders(),
        body: JSON.stringify(missao),
    });
    }

export async function atualizarMissao(id_missao: number, missao: MissaoInput) {
    return apiRequest<Missao>(`/missao/${id_missao}`, {
        method: "PUT",
        headers: await adminHeaders(),
        body: JSON.stringify(missao),
    });
    }

export async function excluirMissao(id_missao: number) {
    return apiRequest<void>(`/missao/${id_missao}`, {
        method: "DELETE",
        headers: await adminHeaders(),
    });
    }

export async function importarMissoes(missoes: MissaoInput[], confirmar: boolean) {
    return apiRequest<{ message: string; gravadas: number; itens: MissaoImportItem[] }>(
        "/missao/importar",
        {
            method: "POST",
            headers: await adminHeaders(),
            body: JSON.stringify({ missoes, confirmar }),
        }
    );
    }
