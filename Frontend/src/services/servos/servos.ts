import { apiRequest } from "../api";

//Endpoint para buscar informação na Api
export function getServos() {
  return apiRequest("/servos");
}

export function getServosById(id: number) {
  return apiRequest(`/servos/${id}`);
}