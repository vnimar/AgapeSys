import { StyleSheet, Platform } from "react-native";

// ─── Cores por frequência ──────────────────────────────────────────────────

export const FREQ_VERDE = {
  bg: "#EAF3DE",
  text: "#3B6D11",
  bar: "#639922",
  label: "Boa",
};

export const FREQ_AMARELO = {
  bg: "#FAEEDA",
  text: "#854F0B",
  bar: "#BA7517",
  label: "Regular",
};

export const FREQ_VERMELHO = {
  bg: "#FCEBEB",
  text: "#A32D2D",
  bar: "#E24B4A",
  label: "Crítica",
};

// Função unificada (aceita null e limites 75/50)
export const getFreqColor = (value: number | null) => {
  if (value === null)
    return { background: "#F3F4F6", text: "#9CA3AF", bar: "#D1D5DB" };
  if (value >= 75)
    return { background: "#EAF3DE", text: "#3B6D11", bar: "#5A9E1E" };
  if (value >= 50)
    return { background: "#FFF6E5", text: "#854F0B", bar: "#F59E0B" };
  return { background: "#FCEBEB", text: "#A32D2D", bar: "#E24B4A" };
};

// ─── Estilos globais ──────────────────────────────────────────────────────

export const styles = StyleSheet.create({
  // Layout base
  safeArea: {
    flex: 1,
    backgroundColor: "#F8F9FB",
  },

  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F8F9FB",
  },

  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: "#888",
  },

  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 32,
    paddingTop: 8,
  },

  // Header
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: Platform.OS === "android" ? 16 : 12,
    paddingBottom: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 0.5,
    borderBottomColor: "#E5E7EB",
  },

  headerTexts: {
    flexDirection: "column",
  },

  headerSub: {
    fontSize: 12,
    color: "#9CA3AF",
    fontWeight: "500",
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },

  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1E3A8A",
    marginTop: 2,
  },

  logo: {
    width: 44,
    height: 44,
    resizeMode: "contain",
    borderRadius: 10,
  },

  // Card
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },

  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 12,
  },

  cardInfo: {
    flex: 1,
    marginLeft: 12,
  },

  cardNome: {
    fontSize: 15,
    fontWeight: "600",
    color: "#0C447C",
  },

  cardPastas: {
    fontSize: 12,
    color: "#9CA3AF",
    marginTop: 2,
  },

  chevron: {
    fontSize: 18,
    color: "#9CA3AF",
    marginLeft: 8,
  },

  // Avatar
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },

  avatarText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1E3A8A",
  },

  // Detalhes expandidos
  details: {
    paddingHorizontal: 14,
    paddingBottom: 14,
    borderTopWidth: 0.5,
    borderTopColor: "#F3F4F6",
  },

  // Barra de frequência
  barraWrap: {
    marginTop: 12,
    marginBottom: 10,
  },

  barraRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },

  barraLabel: {
    fontSize: 12,
    color: "#6B7280",
    fontWeight: "500",
  },

  barraValor: {
    fontSize: 13,
    fontWeight: "700",
  },

  barraFundo: {
    height: 6,
    backgroundColor: "#F3F4F6",
    borderRadius: 3,
    overflow: "hidden",
  },

  barraPreenchimento: {
    height: 6,
    borderRadius: 3,
  },

  // Contadores P/J/F
  contadores: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 12,
  },

  contadorCard: {
    flex: 1,
    borderRadius: 8,
    paddingVertical: 8,
    alignItems: "center",
  },

  contadorNum: {
    fontSize: 18,
    fontWeight: "700",
  },

  contadorLabel: {
    fontSize: 10,
    marginTop: 2,
    fontWeight: "500",
  },

  // Dados do servo
  dadosBox: {
    backgroundColor: "#F9FAFB",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },

  dadosRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 0.5,
    borderBottomColor: "#E5E7EB",
  },

  dadosRowLast: {
    borderBottomWidth: 0,
  },

  dadosKey: {
    fontSize: 13,
    color: "#6B7280",
  },

  dadosValue: {
    fontSize: 13,
    color: "#1F2937",
    fontWeight: "500",
    maxWidth: "60%",
    textAlign: "right",
  },

  // Loading inline
  inlineLoading: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    gap: 8,
  },

  inlineLoadingText: {
    fontSize: 13,
    color: "#9CA3AF",
  },
});