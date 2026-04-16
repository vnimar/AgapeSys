import React, { useState, useEffect, useCallback } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator,
  Alert, Modal, ScrollView, Platform, StatusBar,
} from "react-native";
import { styles } from "./Frequencia.styles";
import { getMissoes } from '../../services/missao/missao'
import { getServos } from '../../services/servos/servos'
import { getFrequencia, getFrequenciaById } from '../../services/frequencia/frequencia'

type StatusFrequencia = "Presente" | "Falta" | "Justificada";

interface Missao {
  id_missao: number;
  data: string; // "YYYY-MM-DD"
  descricao: string | null;
}

interface Servo {
  id_servo: number;
  nome: string;
  status: string | null;
}

interface FrequenciaRecord {
  id_servo: number;
  status: StatusFrequencia;
}

interface FrequenciaExistente {
  id_frequencia: number;
  id_servo: number;
  status: StatusFrequencia;
}

export default function FrequenciaScreen() {
  const [missoes, setMissoes] = useState<Missao[]>([]);
  const [missaoSelecionada, setMissaoSelecionada] = useState<Missao | null>(null);
  const [servos, setServos] = useState<Servo[]>([]);
  const [attendance, setAttendance] = useState<Record<number, StatusFrequencia | null>>({});
  const [frequenciaExistente, setFrequenciaExistente] = useState<FrequenciaExistente[]>([]);
  const [modoEdicao, setModoEdicao] = useState(false);
  const [loadingMissoes, setLoadingMissoes] = useState(false);
  const [loadingServos, setLoadingServos] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [modalMissoesVisible, setModalMissoesVisible] = useState(false);
  const [loading, setLoading] = useState(true);

  // Buscar a missão
  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    setLoadingMissoes(true);
    setLoadingServos(true);

    try {
      const missoesData = await getMissoes();
      const servosData = await getServos();

      missoesData.sort((a: Missao, b: Missao) =>
        new Date(a.data).getTime() - new Date(b.data).getTime()
      );

      setMissoes(missoesData);
      setServos(servosData);
    } catch {
      Alert.alert("Erro", "Falha ao carregar dados");
    } finally {
      setLoadingMissoes(false);
      setLoadingServos(false);
    }
  };

  const selecionarMissao = useCallback(async (missao: Missao) => {
    setMissaoSelecionada(missao);
    setModalMissoesVisible(false);
    setModoEdicao(false); // Sempre começa bloqueado para missões existentes

    // Resetar o estado de presença antes da busca
    const initialAttendance: Record<number, StatusFrequencia | null> = {};
    servos.forEach((s) => (initialAttendance[s.id_servo] = null));
    setAttendance(initialAttendance);

    try {
      // Busca a frequência no backend
      const response = await getFrequenciaById(missao.id_missao);

      // O backend retorna um objeto com "data" contendo a lista
      if (response && response.data && response.data.length > 0) {
        const existente = response.data;
        setFrequenciaExistente(existente);

        const preenchido: Record<number, StatusFrequencia | null> = { ...initialAttendance };

        // Mapeia os status vindos do banco para o estado do componente
        existente.forEach((f: any) => {
          preenchido[f.id_servo] = f.status;
        });

        setAttendance(preenchido);
      } else {
        setFrequenciaExistente([]);
      }
    } catch (error) {
      console.error("Erro ao buscar frequência:", error);
      setFrequenciaExistente([]);
    }
  }, [servos]);

  // Marcar status do servo

  // Altere a lógica de marcar status para respeitar o modo de edição
  const marcarStatus = (id_servo: number, status: StatusFrequencia) => {
    if (!podeEditar) {
      Alert.alert("Acesso Negado", "Habilite o modo de edição para alterar a frequência.");
      return;
    }
    setAttendance((prev) => ({ ...prev, [id_servo]: status }));
  };

  // Confirmar frequencia

  const confirmarFrequencia = async () => {
    if (!missaoSelecionada) return;

    const pendentes = servos.filter((s) => !attendance[s.id_servo]);
    if (pendentes.length > 0) {
      Alert.alert(
        "Atenção",
        `${pendentes.length} servo(s) ainda sem marcação. Marque todos antes de confirmar.`
      );
      return;
    }

    setSalvando(true);
    try {
      const payload: (FrequenciaRecord & { id_missao: number; data: string })[] = servos.map((s) => ({
        id_servo: s.id_servo,
        id_missao: missaoSelecionada.id_missao,
        status: attendance[s.id_servo] as StatusFrequencia,
        data: missaoSelecionada.data,
      }));

      const res = await fetch(`${API_BASE_URL}/frequencia`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error();

      Alert.alert("Sucesso", "Frequência registrada com sucesso!");
      setFrequenciaExistente(
        servos.map((s) => ({
          id_frequencia: 0,
          id_servo: s.id_servo,
          status: attendance[s.id_servo] as StatusFrequencia,
        }))
      );
    } catch {
      Alert.alert("Erro", "Não foi possível salvar a frequência. Tente novamente.");
    } finally {
      setSalvando(false);
    }
  };

  // Atualizar frequencia
  const atualizarFrequencia = async () => {
    if (!missaoSelecionada) return;

    if (!modoEdicao) {
      setModoEdicao(true);
      return;
    }

    const pendentes = servos.filter((s) => !attendance[s.id_servo]);
    if (pendentes.length > 0) {
      Alert.alert("Atenção", `${pendentes.length} servo(s) ainda sem marcação.`);
      return;
    }

    setSalvando(true);
    try {
      const payload: (FrequenciaRecord)[] = servos.map((s) => ({
        id_servo: s.id_servo,
        status: attendance[s.id_servo] as StatusFrequencia,
      }));

      const res = await fetch(`${API_BASE_URL}/frequencia/${missaoSelecionada.id_missao}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error();

      Alert.alert("Sucesso", "Frequência atualizada com sucesso!");
      setModoEdicao(false);
    } catch {
      Alert.alert("Erro", "Não foi possível atualizar a frequência.");
    } finally {
      setSalvando(false);
    }
  };

  // Helpers
  const formatarData = (dateStr: string) => {
    const [year, month, day] = dateStr.split("-");
    return `${day}/${month}/${year}`;
  };

  const getInitials = (nome: string) => {
    return nome
      .split(" ")
      .slice(0, 2)
      .map((n) => n[0].toUpperCase())
      .join("");
  };

  const contagem = {
    presente: Object.values(attendance).filter((v) => v === "Presente").length,
    falta: Object.values(attendance).filter((v) => v === "Falta").length,
    justificada: Object.values(attendance).filter((v) => v === "Justificada").length,
  };

  const jaLancada = frequenciaExistente.length > 0;
  const podeEditar = !jaLancada || modoEdicao;

  // Render de servo
  const renderServos = ({ item }: { item: Servo }) => {
    const statusAtual = attendance[item.id_servo];

    return (
      <View style={styles.servoRow}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{getInitials(item.nome)}</Text>
        </View>

        <Text style={styles.servoNome} numberOfLines={1}>
          {item.nome}
        </Text>

        <View style={styles.statusButtons}>
          {(["Presente", "Justificada", "Falta"] as StatusFrequencia[]).map((s) => (
            <TouchableOpacity
              key={s}
              style={[
                styles.statusBtn,
                statusAtual === s && styles[`statusBtn_${s}`],
              ]}
              onPress={() => podeEditar && marcarStatus(item.id_servo, s)}
              activeOpacity={podeEditar ? 0.7 : 1}
            >
              <Text
                style={[
                  styles.statusBtnText,
                  statusAtual === s && styles[`statusBtnText_${s}`],
                ]}
              >
                {s === "Presente" ? "P" : s === "Justificada" ? "J" : "F"}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  };

  // Render
  return (
      <SafeAreaView style={styles.safeArea} edges={["top"]}>
        <StatusBar barStyle="dark-content" backgroundColor="#fff" />

        {/* ── Header fixo ── */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Frequência</Text>

          <TouchableOpacity
            style={styles.missaoSelector}
            onPress={() => setModalMissoesVisible(true)}
            activeOpacity={0.7}
          >
            <Text style={styles.missaoSelectorLabel}>Missão</Text>
            <Text style={styles.missaoSelectorValue} numberOfLines={1}>
              {missaoSelecionada
                ? `${formatarData(missaoSelecionada.data)}${missaoSelecionada.descricao ? ` — ${missaoSelecionada.descricao}` : ""}`
                : "Selecione uma missão"}
            </Text>
            <Text style={styles.missaoSelectorChevron}>›</Text>
          </TouchableOpacity>

          {jaLancada && !modoEdicao && (
            <View style={styles.badgeLancada}>
              <Text style={styles.badgeLancadaText}>Frequência já registrada</Text>
            </View>
          )}
          {modoEdicao && (
            <View style={styles.badgeEdicao}>
              <Text style={styles.badgeEdicaoText}>Modo edição — altere e confirme</Text>
            </View>
          )}
        </View>

        {/* ── Lista scrollável de servos ── */}
        {!missaoSelecionada ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateIcon}>📋</Text>
            <Text style={styles.emptyStateText}>Selecione uma missão</Text>
            <Text style={styles.emptyStateSubtext}>para carregar a lista de servos</Text>
          </View>
        ) : loadingServos ? (
          <View style={styles.emptyState}>
            <ActivityIndicator size="large" color="#1D9E75" />
          </View>
        ) : (
          <FlatList
            data={servos}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderServos}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
          />
        )}

        {/* ── Footer fixo ── */}
        {missaoSelecionada && (
          <View style={styles.footer}>
            {/* Contadores */}
            <View style={styles.counters}>
              <View style={[styles.counterCard, styles.counterPresente]}>
                <Text style={[styles.counterNum, styles.counterNumPresente]}>
                  {contagem.presente}
                </Text>
                <Text style={[styles.counterLabel, styles.counterLabelPresente]}>
                  presentes
                </Text>
              </View>
              <View style={[styles.counterCard, styles.counterJustificada]}>
                <Text style={[styles.counterNum, styles.counterNumJustificada]}>
                  {contagem.justificada}
                </Text>
                <Text style={[styles.counterLabel, styles.counterLabelJustificada]}>
                  justificados
                </Text>
              </View>
              <View style={[styles.counterCard, styles.counterFalta]}>
                <Text style={[styles.counterNum, styles.counterNumFalta]}>
                  {contagem.falta}
                </Text>
                <Text style={[styles.counterLabel, styles.counterLabelFalta]}>
                  faltas
                </Text>
              </View>
            </View>

            {/* Botões de ação */}
            <View style={styles.actionButtons}>
              {!jaLancada && (
                <TouchableOpacity
                  style={[styles.btnConfirmar, salvando && styles.btnDisabled]}
                  onPress={confirmarFrequencia}
                  disabled={salvando}
                  activeOpacity={0.8}
                >
                  {salvando ? (
                    <ActivityIndicator color="#fff" size="small" />
                  ) : (
                    <Text style={styles.btnConfirmarText}>Confirmar frequência</Text>
                  )}
                </TouchableOpacity>
              )}

              {jaLancada && !modoEdicao && (
                <TouchableOpacity
                  style={styles.btnAtualizar}
                  onPress={atualizarFrequencia}
                  activeOpacity={0.8}
                >
                  <Text style={styles.btnAtualizarText}>Editar frequência</Text>
                </TouchableOpacity>
              )}

              {jaLancada && modoEdicao && (
                <View style={styles.actionButtons}>
                  <TouchableOpacity
                    style={styles.btnCancelar}
                    onPress={() => {
                      setModoEdicao(false);
                      // Restaura os valores originais
                      const restaurado: Record<number, StatusFrequencia | null> = {};
                      servos.forEach((s) => (restaurado[s.id_servo] = null));
                      frequenciaExistente.forEach((f) => {
                        restaurado[f.id_servo] = f.status;
                      });
                      setAttendance(restaurado);
                    }}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.btnCancelarText}>Cancelar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.btnConfirmar, { flex: 2 }, salvando && styles.btnDisabled]}
                    onPress={atualizarFrequencia}
                    disabled={salvando}
                    activeOpacity={0.8}
                  >
                    {salvando ? (
                      <ActivityIndicator color="#fff" size="small" />
                    ) : (
                      <Text style={styles.btnConfirmarText}>Salvar alterações</Text>
                    )}
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </View>
        )}

        {/* ── Modal de seleção de missão ── */}
        <Modal
          visible={modalMissoesVisible}
          transparent
          animationType="slide"
          onRequestClose={() => setModalMissoesVisible(false)}
        >
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setModalMissoesVisible(false)}
          >
            <View style={styles.modalSheet}>
              <View style={styles.modalHandle} />
              <Text style={styles.modalTitle}>Selecione a missão</Text>

              {loadingMissoes ? (
                <ActivityIndicator color="#1D9E75" style={{ marginTop: 24 }} />
              ) : (
                <ScrollView showsVerticalScrollIndicator={false}>
                  {missoes.map((m) => (
                    <TouchableOpacity
                      key={m.id_missao}
                      style={[
                        styles.missaoItem,
                        missaoSelecionada?.id_missao === m.id_missao &&
                          styles.missaoItemSelected,
                      ]}
                      onPress={() => selecionarMissao(m)}
                      activeOpacity={0.7}
                    >
                      <View>
                        <Text style={styles.missaoItemData}>
                          {formatarData(m.data)}
                        </Text>
                        {m.descricao && (
                          <Text style={styles.missaoItemDesc}>{m.descricao}</Text>
                        )}
                      </View>
                      {missaoSelecionada?.id_missao === m.id_missao && (
                        <Text style={styles.missaoItemCheck}>✓</Text>
                      )}
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              )}
            </View>
          </TouchableOpacity>
        </Modal>
      </SafeAreaView>
    );
  }