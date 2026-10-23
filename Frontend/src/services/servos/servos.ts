// eslint-disable-next-line import/namespace
import { apiRequest } from "../api";

//Endpoint para buscar informação na Api
export function getServos() {
  // Com a barra: sem ela o backend redireciona e o token se perde no caminho (401 → logout)
  return apiRequest("/servos/");
}

export function getServosById(id_servo: number) {
  return apiRequest(`/servos/${id_servo}`);
}