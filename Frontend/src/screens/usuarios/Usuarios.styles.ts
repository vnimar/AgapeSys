import { Platform, StyleSheet } from "react-native";
import { AZUL_AGAPELLO } from "../login/Login.styles";

const TEXTO = "#1A2C3E";
const CINZA = "#6C757D";

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
  novo: {
    backgroundColor: AZUL_AGAPELLO,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  novoText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 13,
  },
  busca: {
    marginHorizontal: 16,
    marginBottom: 8,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    paddingHorizontal: 14,
    paddingVertical: Platform.OS === "ios" ? 12 : 8,
    fontSize: 15,
    color: TEXTO,
  },
  lista: {
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  item: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 14,
    marginTop: 10,
  },
  itemInativo: {
    opacity: 0.55,
  },
  itemNome: {
    fontSize: 16,
    fontWeight: "600",
    color: TEXTO,
  },
  itemLinha: {
    fontSize: 13,
    color: CINZA,
    marginTop: 2,
  },
  selos: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 8,
    gap: 6,
  },
  selo: {
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 3,
    backgroundColor: "#EEF2FF",
  },
  seloText: {
    fontSize: 11,
    fontWeight: "600",
    color: AZUL_AGAPELLO,
  },
  seloAlerta: {
    backgroundColor: "#FFF4E5",
  },
  seloAlertaText: {
    color: "#9A5B00",
  },
  seloPerigo: {
    backgroundColor: "#FCEBEB",
  },
  seloPerigoText: {
    color: "#A32D2D",
  },
  vazio: {
    textAlign: "center",
    color: CINZA,
    marginTop: 40,
  },

  // ── Formulário ──
  opcoes: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  opcao: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  opcaoAtiva: {
    backgroundColor: AZUL_AGAPELLO,
    borderColor: AZUL_AGAPELLO,
  },
  opcaoText: {
    fontSize: 13,
    color: TEXTO,
  },
  opcaoAtivaText: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
  linhaSwitch: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 18,
  },
  servoEscolhido: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  servoEscolhidoText: {
    fontSize: 15,
    color: TEXTO,
  },
  servoItem: {
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: "#F0F0F0",
  },

  // ── Senha temporária ──
  senhaCaixa: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    paddingVertical: 20,
    alignItems: "center",
    marginTop: 8,
  },
  senha: {
    fontSize: 26,
    fontWeight: "700",
    letterSpacing: 1,
    color: TEXTO,
    fontFamily: Platform.select({ ios: "Menlo", android: "monospace" }),
  },
});
