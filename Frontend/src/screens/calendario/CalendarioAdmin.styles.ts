import { Platform, StyleSheet } from "react-native";

const AZUL = "#649AFA";
const TEXTO = "#1A2C3E";

export const adminStyles = StyleSheet.create({
  // ── Overlays ──
  centerOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  sheetOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "flex-end",
  },

  // ── Cartões ──
  pinCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 20,
  },
  sheet: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: Platform.OS === "ios" ? 36 : 20,
    maxHeight: "90%",
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#E0E0E0",
    alignSelf: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    color: TEXTO,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: "#6C757D",
    marginBottom: 12,
  },

  // ── Campos ──
  label: {
    fontSize: 13,
    fontWeight: "500",
    color: "#6C757D",
    marginTop: 14,
    marginBottom: 6,
  },
  input: {
    backgroundColor: "#F5F5F5",
    borderRadius: 10,
    borderWidth: 0.5,
    borderColor: "#E0E0E0",
    paddingHorizontal: 12,
    paddingVertical: Platform.OS === "ios" ? 12 : 8,
    fontSize: 15,
    color: TEXTO,
  },
  inputMultiline: {
    minHeight: 70,
    textAlignVertical: "top",
  },
  row: {
    flexDirection: "row",
    gap: 12,
  },
  rowItem: {
    flex: 1,
  },
  chips: {
    flexDirection: "row",
    gap: 8,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#F5F5F5",
    borderWidth: 0.5,
    borderColor: "#E0E0E0",
  },
  chipActive: {
    backgroundColor: AZUL,
    borderColor: AZUL,
  },
  chipText: {
    fontSize: 14,
    color: TEXTO,
  },
  chipTextActive: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
  switchRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 14,
  },
  switchLabel: {
    fontSize: 15,
    color: TEXTO,
  },

  // ── Botões ──
  actions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 20,
  },
  btnPrimary: {
    flex: 1,
    backgroundColor: AZUL,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
  },
  btnPrimaryText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "600",
  },
  btnSecondary: {
    flex: 1,
    backgroundColor: "#F1F3F5",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
  },
  btnSecondaryText: {
    color: TEXTO,
    fontSize: 15,
    fontWeight: "500",
  },
  btnDanger: {
    flex: 1,
    backgroundColor: "#FCEBEB",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
  },
  btnDangerText: {
    color: "#A32D2D",
    fontSize: 15,
    fontWeight: "600",
  },
  btnDisabled: {
    opacity: 0.6,
  },
  linkFechar: {
    alignSelf: "center",
    paddingTop: 12,
  },
  linkFecharText: {
    fontSize: 14,
    color: "#6C757D",
  },
});
