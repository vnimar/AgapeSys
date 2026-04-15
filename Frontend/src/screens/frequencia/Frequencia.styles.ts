import { StyleSheet, Platform } from "react-native";

export const VERDE = "#1D9E75";
export const VERDE_LIGHT = "#E6F7F2";
export const VERDE_DARK = "#0F6B4F";

export const AMARELO_LIGHT = "#FFF6E5";
export const AMARELO_DARK = "#C98A00";

export const VERMELHO_LIGHT = "#FFEAEA";
export const VERMELHO_DARK = "#C0392B";

export const styles = StyleSheet.create({

  // ── Container principal ──
  safeArea: {
    flex: 1,
    backgroundColor: "#fff",
  },

  // ── Header ──
  header: {
    backgroundColor: "#fff",
    paddingHorizontal: 20,
    paddingTop: Platform.OS === "android" ? 16 : 12,
    paddingBottom: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: "#E0E0E0",
  },

  headerTitle: {
    fontSize: 22,
    fontWeight: "600",
    color: "#1A1A1A",
    marginBottom: 12,
  },

  missaoSelector: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 0.5,
    borderColor: "#E0E0E0",
  },

  missaoSelectorLabel: {
    fontSize: 12,
    color: "#888",
    marginRight: 8,
    minWidth: 42,
  },

  missaoSelectorValue: {
    flex: 1,
    fontSize: 14,
    color: "#1A1A1A",
    fontWeight: "500",
  },

  missaoSelectorChevron: {
    fontSize: 20,
    color: "#888",
    marginLeft: 8,
  },

  badgeLancada: {
    marginTop: 8,
    backgroundColor: VERDE_LIGHT,
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
    alignSelf: "flex-start",
  },

  badgeLancadaText: {
    fontSize: 12,
    color: VERDE_DARK,
    fontWeight: "500",
  },

  badgeEdicao: {
    marginTop: 8,
    backgroundColor: AMARELO_LIGHT,
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
    alignSelf: "flex-start",
  },

  badgeEdicaoText: {
    fontSize: 12,
    color: AMARELO_DARK,
    fontWeight: "500",
  },

  // ── Estado vazio ──
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
  },

  emptyStateIcon: {
    fontSize: 40,
    marginBottom: 12,
  },

  emptyStateText: {
    fontSize: 16,
    color: "#888",
    fontWeight: "500",
  },

  emptyStateSubtext: {
    fontSize: 14,
    color: "#AAA",
    marginTop: 4,
  },

  // ── Lista ──
  listContent: {
    paddingBottom: 8,
    backgroundColor: "#fff",
  },

  separator: {
    height: 0.5,
    backgroundColor: "#F0F0F0",
    marginLeft: 72,
  },

  // ── Linha de servo ──
  servoRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: "#fff",
  },

  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: VERDE_LIGHT,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
    flexShrink: 0,
  },

  avatarText: {
    fontSize: 13,
    fontWeight: "600",
    color: VERDE_DARK,
  },

  servoNome: {
    flex: 1,
    fontSize: 15,
    color: "#1A1A1A",
  },

  statusButtons: {
    flexDirection: "row",
    gap: 6,
  },

  statusBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: "#D0D0D0",
    backgroundColor: "#F5F5F5",
  },

  // Estilos dinâmicos de status — acessados via styles[`statusBtn_${s}`]
  statusBtn_Presente: {
    backgroundColor: VERDE_LIGHT,
    borderColor: VERDE,
  },

  statusBtn_Justificada: {
    backgroundColor: AMARELO_LIGHT,
    borderColor: "#BA7517",
  },

  statusBtn_Falta: {
    backgroundColor: VERMELHO_LIGHT,
    borderColor: "#E24B4A",
  },

  statusBtnText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#999",
  },

  statusBtnText_Presente: { color: VERDE_DARK },
  statusBtnText_Justificada: { color: AMARELO_DARK },
  statusBtnText_Falta: { color: VERMELHO_DARK },

  // ── Footer ──
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