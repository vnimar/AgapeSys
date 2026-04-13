import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({

  footer: {
    backgroundColor: "#fff",
    borderTopWidth: 0.5,
    borderTopColor: "#E0E0E0",
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: Platform.OS === "ios" ? 28 : 16,
  },

  counters: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 12,
  },

  counterCard: {
    flex: 1,
    borderRadius: 8,
    paddingVertical: 8,
    alignItems: "center",
  },

  counterPresente: { backgroundColor: VERDE_LIGHT },
  counterJustificada: { backgroundColor: AMARELO_LIGHT },
  counterFalta: { backgroundColor: VERMELHO_LIGHT },
  counterNum: {
    fontSize: 20,
    fontWeight: "600",
  },

  counterNumPresente: { color: VERDE_DARK },
  counterNumJustificada: { color: AMARELO_DARK },
  counterNumFalta: { color: VERMELHO_DARK },
  counterLabel: {
    fontSize: 11,
    marginTop: 2,
  },

  counterLabelPresente: { color: VERDE_DARK },
  counterLabelJustificada: { color: AMARELO_DARK },
  counterLabelFalta: { color: VERMELHO_DARK },
  actionButtons: {
    flexDirection: "row",
    gap: 10,
  },

  btnConfirmar: {
    flex: 1,
    backgroundColor: VERDE,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
  },

  btnConfirmarText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "600",
  },

  btnAtualizar: {
    flex: 1,
    backgroundColor: "#F5F5F5",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    borderWidth: 0.5,
    borderColor: "#E0E0E0",
  },

  btnAtualizarText: {
    color: "#1A1A1A",
    fontSize: 15,
    fontWeight: "500",
  },

  btnCancelar: {
    flex: 1,
    backgroundColor: "#F5F5F5",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    borderWidth: 0.5,
    borderColor: "#E0E0E0",
  },

  btnCancelarText: {
    color: "#666",
    fontSize: 15,
    fontWeight: "500",
  },

  btnDisabled: {
    opacity: 0.6,
  },

  // ── Modal ──
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "flex-end",
  },

  modalSheet: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: Platform.OS === "ios" ? 40 : 24,
    maxHeight: "70%",
  },

  modalHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#E0E0E0",
    alignSelf: "center",
    marginBottom: 16,
  },

  modalTitle: {
    fontSize: 17,
    fontWeight: "600",
    color: "#1A1A1A",
    marginBottom: 16,
  },

  missaoItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    borderBottomWidth: 0.5,
    borderBottomColor: "#F0F0F0",
  },

  missaoItemSelected: {
    backgroundColor: "#F0FBF7",
    marginHorizontal: -20,
    paddingHorizontal: 20,
  },

  missaoItemData: {
    fontSize: 15,
    fontWeight: "500",
    color: "#1A1A1A",
  },

  missaoItemDesc: {
    fontSize: 13,
    color: "#888",
    marginTop: 2,
  },

  missaoItemCheck: {
    fontSize: 18,
    color: VERDE,
    fontWeight: "600",
  },
});
