import { StyleSheet, Platform } from "react-native";

// ─── Paleta de cores de frequência ───────────────────────────────────────────

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

export function getFreqColor(percentual: number) {
  if (percentual >= 70) return FREQ_VERDE;
  if (percentual >= 50) return FREQ_AMARELO;
  return FREQ_VERMELHO;
}

// ─── Estilos ──────────────────────────────────────────────────────────────────

export const styles = StyleSheet.create({

  safeArea: {
    flex: 1,
    backgroundColor: "#F8F8F6",
  },

  // ── Header ──
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingHorizontal: 20,
    paddingTop: Platform.OS === "android" ? 16 : 12,
    paddingBottom: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: "#E5E5E5",
  },

  headerTexts: {
    flexDirection: "column",
  },

  headerSub: {
    fontSize: 12,
    color: "#9CA3AF",
    marginBottom: 2,
  },

  title: {
    fontSize: 22,
    fontWeight: "600",
    color: "#111827",
  },

  logo: {
    width: 40,
    height: 40,
    resizeMode: "contain",
    borderRadius: 10,
  },

  // ── Lista ──
  listContent: {
    padding: 12,
    paddingBottom: 32,
  },

  // ── Card ──
  card: {
    backgroundColor: "#fff",
    borderRadius: 14,
    marginBottom: 10,
    borderWidth: 0.5,
    borderColor: "#E5E5E5",
    overflow: "hidden",
  },

  // ── Cabeçalho do card (linha clicável) ──
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 12,
  },

  // Avatar de iniciais
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#E6F1FB",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },

  avatarText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#0C447C",
  },

  // Info central
  cardInfo: {
    flex: 1,
    minWidth: 0,
  },

  cardNome: {
    fontSize: 15,
    fontWeight: "500",
    color: "#111827",
  },

  cardPastas: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 3,
  },

  // Badge de percentual (canto direito)
  freqBadge: {
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
    alignItems: "center",
    flexShrink: 0,
  },

  freqBadgeNum: {
    fontSize: 16,
    fontWeight: "500",
    lineHeight: 18,
  },

  freqBadgeLabel: {
    fontSize: 10,
    marginTop: 1,
  },

  // Chevron de expandir
  chevron: {
    fontSize: 16,
    color: "#9CA3AF",
    marginLeft: 4,
  },

  // ── Detalhes expandidos ──
  details: {
    borderTopWidth: 0.5,
    borderTopColor: "#F0F0F0",
    padding: 14,
  },

  // Barra de progresso
  barraWrap: {
    marginBottom: 14,
  },

  barraRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },

  barraLabel: {
    fontSize: 12,
    color: "#6B7280",
  },

  barraValor: {
    fontSize: 12,
    fontWeight: "500",
  },

  barraFundo: {
    height: 6,
    borderRadius: 3,
    backgroundColor: "#F3F4F6",
    overflow: "hidden",
  },

  barraPreenchimento: {
    height: 6,
    borderRadius: 3,
  },

  // Mini contadores P / J / F
  contadores: {
    flexDirection: "row",
    gap: 6,
    marginBottom: 14,
  },

  contadorCard: {
    flex: 1,
    borderRadius: 10,
    paddingVertical: 8,
    alignItems: "center",
  },

  contadorNum: {
    fontSize: 20,
    fontWeight: "500",
  },

  contadorLabel: {
    fontSize: 10,
    marginTop: 2,
  },

  // Dados do servo
  dadosBox: {
    backgroundColor: "#F9FAFB",
    borderRadius: 10,
    paddingHorizontal: 12,
    overflow: "hidden",
  },

  dadosRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 9,
    borderBottomWidth: 0.5,
    borderBottomColor: "#F0F0F0",
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
    fontWeight: "500",
    color: "#111827",
    textAlign: "right",
    maxWidth: "60%",
  },

  // ── Loading / vazio ──
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F8F8F6",
  },

  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: "#9CA3AF",
  },

  // ── Loading inline (dentro do card expandido) ──
  inlineLoading: {
    alignItems: "center",
    paddingVertical: 16,
  },

  inlineLoadingText: {
    marginTop: 8,
    fontSize: 13,
    color: "#9CA3AF",
  },
});