import { StyleSheet } from "react-native";
import { AZUL_AGAPELLO } from "../login/Login.styles";

const TEXTO = "#1A2C3E";
const CINZA = "#6C757D";
const VERMELHO = "#C62828";
const AMARELO = "#8A6D00";

export const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  topo: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  voltar: {
    fontSize: 16,
    color: AZUL_AGAPELLO,
    fontWeight: "600",
  },
  titulo: {
    fontSize: 20,
    fontWeight: "700",
    color: TEXTO,
  },
  container: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  texto: {
    fontSize: 14,
    color: CINZA,
    lineHeight: 20,
    marginBottom: 12,
  },
  anos: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 12,
  },
  ano: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    backgroundColor: "#FFFFFF",
    paddingVertical: 10,
    alignItems: "center",
  },
  anoAtivo: {
    borderColor: AZUL_AGAPELLO,
    backgroundColor: "#E8F0FA",
  },
  anoText: {
    fontSize: 15,
    fontWeight: "600",
    color: TEXTO,
  },
  anoSub: {
    fontSize: 11,
    color: CINZA,
    marginTop: 2,
  },
  botao: {
    backgroundColor: AZUL_AGAPELLO,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    marginBottom: 16,
  },
  botaoConfirmar: {
    backgroundColor: "#2E7D32",
    marginTop: 8,
  },
  botaoDesativado: {
    opacity: 0.45,
  },
  botaoText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 15,
  },
  arquivo: {
    fontSize: 13,
    color: CINZA,
    textAlign: "center",
    marginTop: -8,
    marginBottom: 16,
  },
  resumo: {
    fontSize: 15,
    fontWeight: "600",
    color: TEXTO,
    marginBottom: 12,
  },
  caixa: {
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  caixaErro: {
    backgroundColor: "#FDECEA",
  },
  caixaAviso: {
    backgroundColor: "#FFF8E1",
  },
  caixaTitulo: {
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 6,
  },
  erroText: {
    color: VERMELHO,
    fontSize: 13,
    marginBottom: 4,
  },
  avisoText: {
    color: AMARELO,
    fontSize: 13,
    marginBottom: 4,
  },
  pasta: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
  },
  pastaIgnorada: {
    opacity: 0.55,
  },
  pastaNome: {
    fontSize: 15,
    fontWeight: "700",
    color: TEXTO,
  },
  pastaPlanilha: {
    fontSize: 12,
    color: CINZA,
    marginTop: 2,
  },
  momento: {
    fontSize: 12,
    fontWeight: "700",
    color: AZUL_AGAPELLO,
    textTransform: "uppercase",
    marginTop: 10,
    marginBottom: 4,
  },
  pessoa: {
    fontSize: 14,
    color: TEXTO,
    paddingVertical: 2,
  },
  pessoaFora: {
    color: CINZA,
    fontStyle: "italic",
  },
  pessoaErro: {
    color: VERMELHO,
  },
  detalhe: {
    fontSize: 12,
    color: CINZA,
  },
  detalheErro: {
    fontSize: 12,
    color: VERMELHO,
  },
  conferir: {
    color: AMARELO,
    fontWeight: "600",
  },
});
