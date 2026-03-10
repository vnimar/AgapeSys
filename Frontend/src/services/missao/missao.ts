import {apiRequest} from "../api"

//Endpoint para buscar informação na Api
export function getProximaMissao(){
    return apiRequest("/missao/proxima")
    }

export function getMissoes() {
  return apiRequest("/missao");
}