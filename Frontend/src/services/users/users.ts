import { apiRequest } from "../api";

//Endpoint para buscar informação na Api
export function getUsers() {
  return apiRequest("/users");
}

export function getUserById(id: number) {
  return apiRequest(`/users/${id}`);
}