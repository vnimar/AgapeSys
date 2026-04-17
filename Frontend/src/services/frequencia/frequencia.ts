import { apiRequest } from "../api";

// ── Tipos ─────────────────────────────────────────────────────────────────────

export type StatusFrequencia = "Presente" | "Falta" | "Justificada";

export interface FrequenciaItem {
  id_servo: number;
  nome: string;
  status: StatusFrequencia;
}

export interface FrequenciaResponse {
  message: string;
  data_missao: string;
  descricao: string;
  data: FrequenciaItem[];
}

export interface FrequenciaEmptyResponse {
  message: string;
  data_missao: string;
  descricao: string;
}

// ── Funções de serviço ────────────────────────────────────────────────────────

export function getFrequenciaById(id_missao: number) {
  return apiRequest<FrequenciaResponse | FrequenciaEmptyResponse>(
    `/frequencia/${id_missao}`
  );
}

export function postFrequencia(
  id_servo: number,
  id_missao: number,
  status: StatusFrequencia  // obrigatório — banco não aceita NULL
) {
  return apiRequest<{ message: string }>("/frequencia/register", {
    method: "POST",
    body: JSON.stringify({ id_servo, id_missao, status }),
  });
}

export function putFrequencia(
  id_servo: number,
  id_missao: number,
  status: StatusFrequencia
) {
  return apiRequest<{ message: string }>("/frequencia/update", {
    method: "PUT",
    body: JSON.stringify({ id_servo, id_missao, status }),
  });
}