// O IP 10.0.2.2 é um atalho que o Android usa para acessar o seu computador
const BASE_URL = "http://10.0.2.2:8000/";
//const BASE_URL = "http://127.0.0.1:8000/";

export async function getProximaMissao() {
    const response = await fetch(`${BASE_URL}missao/proxima`);

    if (!response.ok) {
        throw new Error("Erro ao buscar próxima missão");
    }

    const data = await response.json();
    return data;
}