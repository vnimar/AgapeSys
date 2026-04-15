import {apiRequest} from "../api"

export function getFrequencia() {
  return apiRequest("/frequencia");
}

export function getFrequenciaById(id: number){
    return apiRequest(`/frequencia/${id}`);
    }