import React, { useState, useEffect, useCallback, useRef } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Modal,
  ScrollView,
  StatusBar,
} from "react-native";
import { styles } from "./Frequencia.styles";
import { getMissoes } from "../../services/missao/missao";
import { getServos } from "../../services/servos/servos";
import {
  getFrequenciaById,
  postFrequencia,
  putFrequencia,
  StatusFrequencia,
  FrequenciaResponse,
} from "../../services/frequencia/frequencia";

// ── Tipos locais ──────────────────────────────────────────────────────────────

interface Missao {
  id_missao: number;
  data: string;
  descricao: string | null;
}

interface ServoNormalizado {
  id: number;
  nome: string;
  status: string | null;
}

interface FrequenciaRegistro {
  id_servo: number;
  status: StatusFrequencia;
}

<<<<<<< HEAD
// ── Componente ────────────────────────────────────────────────────────────────

export default function FrequenciaScreen() {
=======
export function FrequenciaScreen() {
>>>>>>> 54f50db6235a44a84ca8364e4fc777d860afdecb
  const [missoes, setMissoes] = useState<Missao[]>([]);
  const [missaoSelecionada, setMissaoSelecionada] = useState<Missao | null>(null);
  const [servos, setServos] = useState<ServoNormalizado[]>([]);
  const [attendance, setAttendance] = useState<Record<number, StatusFrequencia | null>>({});
  const [frequenciaExistente, setFrequenciaExistente] = useState<FrequenciaRegistro[]>([]);
  const [modoEdicao, setModoEdicao] = useState(false);
  const [loadingMissoes, setLoadingMissoes] = useState(false);
  const [loadingServos, setLoadingServos] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [modalMissoesVisible, setModalMissoesVisible] = useState(false);

  const servosRef = useRef<ServoNormalizado[]>([]);
  servosRef.current = servos;

  useEffect(() => {
    carregarDados();
  }, []);

  // ── Carregamento inicial ────────────────────────────────────────────────────

  const carregarDados = async () => {
    setLoadingMissoes(true);
    setLoadingServos(true);
    try {
      const [missoesData, servosData] = await Promise.all([getMissoes(), getServos()]);

<<<<<<< HEAD
      missoesData.sort(
        (a: Missao, b: Missao) =>
          new Date(a.data).getTime() - new Date(b.data).getTime()
      );
=======
      // Ordena missões da mais antiga para a mais recente (crescente)
      // Se quiser a mais recente primeiro, troque a ordem: (b, a)
      missoesData.sort((a: { data: string | number | Date; }, b: {
        data: string | number | Date;
      }) => new Date(a.data).getTime() - new Date(b.data).getTime());
>>>>>>> 54f50db6235a44a84ca8364e4fc777d860afdecb
      setMissoes(missoesData);

      const servosRaw = Array.isArray(servosData) ? servosData : servosData?.data || [];
      const servosNormalizados: ServoNormalizado[] = servosRaw
<<<<<<< HEAD
        .filter((s: any) => s && (s.id_servo || s.id))
        .map((s: any) => ({
          id: s.id_servo ?? s.id,
          nome: s.nome || "Sem nome",
          status: s.status ?? null,
        }));
=======
          .filter((s: { id_servo: any; id: any; }) => s && (s.id_servo || s.id))
          .map((s: { id_servo: any; id: any; nome: any; status: any; }) => ({
            id: s.id_servo ?? s.id,
            nome: s.nome || "Sem nome",
            status: s.status ?? null,
          }));
>>>>>>> 54f50db6235a44a84ca8364e4fc777d860afdecb

      setServos(servosNormalizados);
      servosRef.current = servosNormalizados;
    } catch (error: any) {
      Alert.alert("Erro", error?.message || "Falha ao carregar dados.");
    } finally {
      setLoadingMissoes(false);
      setLoadingServos(false);
    }
  };

  // ── Selecionar missão e carregar frequência existente ───────────────────────

  const selecionarMissao = useCallback(async (missao: Missao) => {
    setMissaoSelecionada(missao);
    setModalMissoesVisible(false);
    setModoEdicao(false);
    setFrequenciaExistente([]);

    // Inicializa attendance zerado para todos os servos
    const initialAttendance: Record<number, StatusFrequencia | null> = {};
<<<<<<< HEAD
    servosRef.current.forEach((s) => { initialAttendance[s.id] = null; });
=======
    servosRef.current.forEach(s => {
      initialAttendance[s.id] = null;
    });
>>>>>>> 54f50db6235a44a84ca8364e4fc777d860afdecb
    setAttendance(initialAttendance);

    try {
      const result = await getFrequenciaById(missao.id_missao);

      // Se não tem dados (missão sem frequência), o array 'data' vem vazio ou ausente
      const registrosRaw = (result as FrequenciaResponse).data ?? [];

      if (registrosRaw.length === 0) {
        setFrequenciaExistente([]);
        return;
      }

      // Mapeia status do backend (lowercase) para o formato do frontend
      const registros: FrequenciaRegistro[] = registrosRaw.map((item) => ({
        id_servo: item.id_servo,
        status: item.status,
      }));

      setFrequenciaExistente(registros);

<<<<<<< HEAD
      const preenchido = { ...initialAttendance };
      registros.forEach((r) => { preenchido[r.id_servo] = r.status; });
      setAttendance(preenchido);
    } catch (err: any) {
      // 404 significa que a missão existe mas não tem frequência — não é erro crítico
      if (err?.message?.includes("404") || err?.message?.toLowerCase().includes("não encontrada")) {
=======
      console.log('📊 Array extraído:', existenteRaw);

      if (existenteRaw.length > 0) {
        const registros: FrequenciaRegistro[] = existenteRaw
            .map(item => {
              const idServo = item.id_servo ?? item.servo_id ?? item.id_servo_id ?? item.id;
              if (idServo == null) return null;
              return {
                id_servo: Number(idServo),
                status: item.status as StatusFrequencia,
              };
            })
            .filter(r => r !== null) as FrequenciaRegistro[];

        if (registros.length) {
          setFrequenciaExistente(registros);
          const preenchido = {...initialAttendance};
          registros.forEach(r => {
            preenchido[r.id_servo] = r.status;
          });
          setAttendance(preenchido);
          console.log(`✅ ${registros.length} registros carregados`);
        } else {
          setFrequenciaExistente([]);
        }
      } else {
        console.log('ℹ️ Nenhuma frequência registrada');
>>>>>>> 54f50db6235a44a84ca8364e4fc777d860afdecb
        setFrequenciaExistente([]);
        return;
      }
      Alert.alert("Erro", err?.message || "Não foi possível carregar frequências.");
      setFrequenciaExistente([]);
    }
  }, []);

  // ── Marcar status de um servo ───────────────────────────────────────────────

  const marcarStatus = useCallback((id: number, status: StatusFrequencia) => {
<<<<<<< HEAD
    setAttendance((prev) => ({ ...prev, [id]: status }));
=======
    setAttendance(prev => ({...prev, [id]: status}));
>>>>>>> 54f50db6235a44a84ca8364e4fc777d860afdecb
  }, []);

  // ── Confirmar frequência (POST — primeiro lançamento) ───────────────────────

  const confirmarFrequencia = async () => {
    if (!missaoSelecionada) return;

    const pendentes = servosRef.current.filter((s) => !attendance[s.id]);
    if (pendentes.length) {
      Alert.alert("Atenção", `${pendentes.length} servo(s) ainda sem marcação.`);
      return;
    }

    setSalvando(true);
    try {
      // O backend recebe um registro por vez — enviamos em paralelo
      await Promise.all(
        servosRef.current.map((s) =>
          postFrequencia(s.id, missaoSelecionada.id_missao, attendance[s.id] as StatusFrequencia)
        )
      );

      Alert.alert("Sucesso", "Frequência registrada!");

      const novaExistente: FrequenciaRegistro[] = servosRef.current.map((s) => ({
        id_servo: s.id,
        status: attendance[s.id] as StatusFrequencia,
      }));
      setFrequenciaExistente(novaExistente);
    } catch (err: any) {
      Alert.alert("Erro", err?.message || "Não foi possível salvar.");
    } finally {
      setSalvando(false);
    }
  };

  // ── Salvar edição (PUT) ─────────────────────────────────────────────────────

  const salvarEdicao = async () => {
    if (!missaoSelecionada) return;

    const pendentes = servosRef.current.filter((s) => !attendance[s.id]);
    if (pendentes.length) {
      Alert.alert("Atenção", `${pendentes.length} servo(s) sem marcação.`);
      return;
    }

    setSalvando(true);
    try {
      // Só atualiza os servos cujo status mudou em relação ao que veio do backend
      const alterados = servosRef.current.filter((s) => {
        const original = frequenciaExistente.find((f) => f.id_servo === s.id);
        return original?.status !== attendance[s.id];
      });

      await Promise.all(
        alterados.map((s) =>
          putFrequencia(s.id, missaoSelecionada.id_missao, attendance[s.id] as StatusFrequencia)
        )
      );

      Alert.alert("Sucesso", "Frequência atualizada!");

      // Atualiza frequenciaExistente com os novos valores
      const atualizada: FrequenciaRegistro[] = servosRef.current.map((s) => ({
        id_servo: s.id,
        status: attendance[s.id] as StatusFrequencia,
      }));
      setFrequenciaExistente(atualizada);
      setModoEdicao(false);
    } catch (err: any) {
      Alert.alert("Erro", err?.message || "Não foi possível atualizar.");
    } finally {
      setSalvando(false);
    }
  };

  // ── Cancelar edição ─────────────────────────────────────────────────────────

  const cancelarEdicao = useCallback(() => {
    setModoEdicao(false);
    const restaurado: Record<number, StatusFrequencia | null> = {};
<<<<<<< HEAD
    servosRef.current.forEach((s) => { restaurado[s.id] = null; });
    frequenciaExistente.forEach((f) => { restaurado[f.id_servo] = f.status; });
=======
    servosRef.current.forEach(s => {
      restaurado[s.id] = null;
    });
    frequenciaExistente.forEach(f => {
      restaurado[f.id_servo] = f.status;
    });
>>>>>>> 54f50db6235a44a84ca8364e4fc777d860afdecb
    setAttendance(restaurado);
  }, [frequenciaExistente]);

  // ── Helpers de UI ───────────────────────────────────────────────────────────

  const formatarData = (dateStr: string) => {
    const [year, month, day] = dateStr.split("-");
    return `${day}/${month}/${year}`;
  };

  const getInitials = (nome: string) =>
<<<<<<< HEAD
    nome.split(" ").slice(0, 2).map((n) => n[0].toUpperCase()).join("");
=======
      nome.split(" ").slice(0, 2).map(n => n[0].toUpperCase()).join("");
>>>>>>> 54f50db6235a44a84ca8364e4fc777d860afdecb

  const contagem = {
    presente: Object.values(attendance).filter((v) => v === "Presente").length,
    falta: Object.values(attendance).filter((v) => v === "Falta").length,
    justificada: Object.values(attendance).filter((v) => v === "Justificada").length,
  };

  const jaLancada = frequenciaExistente.length > 0;
  const podeEditar = !jaLancada || modoEdicao;

<<<<<<< HEAD
  // ── Render de cada servo ────────────────────────────────────────────────────

  const renderServos = ({ item }: { item: ServoNormalizado }) => {
    const statusAtual = attendance[item.id];
    return (
      <View style={styles.servoRow}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{getInitials(item.nome)}</Text>
        </View>
        <Text style={styles.servoNome} numberOfLines={1}>{item.nome}</Text>
        <View style={styles.statusButtons}>
          {(["Presente", "Justificada", "Falta"] as StatusFrequencia[]).map((s) => {
            const ativo = statusAtual === s;
            const buttonStyle: any[] = [styles.statusBtn];
            const textStyle: any[] = [styles.statusBtnText];
            if (ativo) {
              if (s === "Presente") {
                buttonStyle.push(styles.statusBtn_Presente);
                textStyle.push(styles.statusBtnText_Presente);
              } else if (s === "Justificada") {
                buttonStyle.push(styles.statusBtn_Justificada);
                textStyle.push(styles.statusBtnText_Justificada);
              } else {
                buttonStyle.push(styles.statusBtn_Falta);
                textStyle.push(styles.statusBtnText_Falta);
              }
            }
            return (
              <TouchableOpacity
                key={s}
                style={buttonStyle}
                onPress={() => podeEditar && marcarStatus(item.id, s)}
                activeOpacity={podeEditar ? 0.7 : 1}
              >
                <Text style={textStyle}>
                  {s === "Presente" ? "P" : s === "Justificada" ? "J" : "F"}
                </Text>
              </TouchableOpacity>
            );
          })}
=======
  const renderServos = ({item}: { item: ServoNormalizado }) => {
    const statusAtual = attendance[item.id];
    return (
        <View style={styles.servoRow}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{getInitials(item.nome)}</Text>
          </View>
          <Text style={styles.servoNome} numberOfLines={1}>{item.nome}</Text>
          <View style={styles.statusButtons}>
            {(["Presente", "Justificada", "Falta"] as StatusFrequencia[]).map(s => {
              const ativo = statusAtual === s;
              const buttonStyle = [styles.statusBtn];
              const textStyle = [styles.statusBtnText];
              if (ativo) {
                if (s === "Presente") {
                  // @ts-ignore
                  buttonStyle.push(styles.statusBtn_Presente);
                  // @ts-ignore
                  textStyle.push(styles.statusBtnText_Presente);
                } else if (s === "Justificada") {
                  // @ts-ignore
                  buttonStyle.push(styles.statusBtn_Justificada);
                  // @ts-ignore
                  textStyle.push(styles.statusBtnText_Justificada);
                } else {
                  // @ts-ignore
                  buttonStyle.push(styles.statusBtn_Falta);
                  // @ts-ignore
                  textStyle.push(styles.statusBtnText_Falta);
                }
              }
              return (
                  <TouchableOpacity
                      key={s}
                      style={buttonStyle}
                      onPress={() => podeEditar && marcarStatus(item.id, s)}
                      activeOpacity={podeEditar ? 0.7 : 1}
                  >
                    <Text style={textStyle}>{s === "Presente" ? "P" : s === "Justificada" ? "J" : "F"}</Text>
                  </TouchableOpacity>
              );
            })}
          </View>
>>>>>>> 54f50db6235a44a84ca8364e4fc777d860afdecb
        </View>
    );
  };

  // ── Render principal ────────────────────────────────────────────────────────

  return (
<<<<<<< HEAD
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Frequência</Text>
        <TouchableOpacity
          style={styles.missaoSelector}
          onPress={() => setModalMissoesVisible(true)}
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

      {/* Conteúdo principal */}
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
          extraData={attendance}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
      )}

      {/* Footer com contadores e botões */}
      {missaoSelecionada && (
        <View style={styles.footer}>
          <View style={styles.counters}>
            <View style={[styles.counterCard, styles.counterPresente]}>
              <Text style={[styles.counterNum, styles.counterNumPresente]}>{contagem.presente}</Text>
              <Text style={[styles.counterLabel, styles.counterLabelPresente]}>presentes</Text>
            </View>
            <View style={[styles.counterCard, styles.counterJustificada]}>
              <Text style={[styles.counterNum, styles.counterNumJustificada]}>{contagem.justificada}</Text>
              <Text style={[styles.counterLabel, styles.counterLabelJustificada]}>justificados</Text>
            </View>
            <View style={[styles.counterCard, styles.counterFalta]}>
              <Text style={[styles.counterNum, styles.counterNumFalta]}>{contagem.falta}</Text>
              <Text style={[styles.counterLabel, styles.counterLabelFalta]}>faltas</Text>
            </View>
          </View>

          {/* Primeiro lançamento */}
          {!jaLancada && (
            <TouchableOpacity
              style={[styles.btnConfirmar, salvando && styles.btnDisabled]}
              onPress={confirmarFrequencia}
              disabled={salvando}
              activeOpacity={0.8}
            >
              {salvando ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <Text style={styles.btnConfirmarText}>Confirmar frequência</Text>
              )}
            </TouchableOpacity>
          )}

          {/* Botão Editar */}
          {jaLancada && !modoEdicao && (
            <TouchableOpacity
              style={styles.btnAtualizar}
              onPress={() => setModoEdicao(true)}
              activeOpacity={0.8}
            >
              <Text style={styles.btnAtualizarText}>Editar frequência</Text>
            </TouchableOpacity>
          )}

          {/* Modo edição: Cancelar + Salvar */}
          {jaLancada && modoEdicao && (
            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={styles.btnCancelar}
                onPress={cancelarEdicao}
                activeOpacity={0.8}
              >
                <Text style={styles.btnCancelarText}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.btnConfirmar, salvando && styles.btnDisabled]}
                onPress={salvarEdicao}
                disabled={salvando}
                activeOpacity={0.8}
              >
                {salvando ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <Text style={styles.btnConfirmarText}>Salvar alterações</Text>
                )}
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}

      {/* Modal de seleção de missão */}
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
                      missaoSelecionada?.id_missao === m.id_missao && styles.missaoItemSelected,
                    ]}
                    onPress={() => selecionarMissao(m)}
                  >
                    <View>
                      <Text style={styles.missaoItemData}>{formatarData(m.data)}</Text>
                      {m.descricao && (
                        <Text style={styles.missaoItemDesc}>{m.descricao}</Text>
                      )}
                    </View>
                    {missaoSelecionada?.id_missao === m.id_missao && (
                      <Text style={styles.missaoItemCheck}>✓</Text>
=======
      <SafeAreaView style={styles.safeArea} edges={["top"]}>
        <StatusBar barStyle="dark-content" backgroundColor="#fff"/>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Frequência</Text>
          <TouchableOpacity style={styles.missaoSelector} onPress={() => setModalMissoesVisible(true)}>
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

        {!missaoSelecionada ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateIcon}>📋</Text>
              <Text style={styles.emptyStateText}>Selecione uma missão</Text>
              <Text style={styles.emptyStateSubtext}>para carregar a lista de servos</Text>
            </View>
        ) : loadingServos ? (
            <View style={styles.emptyState}>
              <ActivityIndicator size="large" color="#1D9E75"/>
            </View>
        ) : (
            <FlatList
                data={servos}
                keyExtractor={item => item.id.toString()}
                renderItem={renderServos}
                extraData={attendance}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
                ItemSeparatorComponent={() => <View style={styles.separator}/>}
            />
        )}

        {missaoSelecionada && (
            <View style={styles.footer}>
              {/* Contadores */}
              <View style={styles.counters}>
                <View style={[styles.counterCard, styles.counterPresente]}>
                  <Text style={[styles.counterNum, styles.counterNumPresente]}>{contagem.presente}</Text>
                  <Text style={[styles.counterLabel, styles.counterLabelPresente]}>presentes</Text>
                </View>
                <View style={[styles.counterCard, styles.counterJustificada]}>
                  <Text style={[styles.counterNum, styles.counterNumJustificada]}>{contagem.justificada}</Text>
                  <Text style={[styles.counterLabel, styles.counterLabelJustificada]}>justificados</Text>
                </View>
                <View style={[styles.counterCard, styles.counterFalta]}>
                  <Text style={[styles.counterNum, styles.counterNumFalta]}>{contagem.falta}</Text>
                  <Text style={[styles.counterLabel, styles.counterLabelFalta]}>faltas</Text>
                </View>
              </View>

              {!jaLancada && (
                  <TouchableOpacity
                      style={[styles.btnConfirmar, salvando && styles.btnDisabled]}
                      onPress={confirmarFrequencia}
                      disabled={salvando}
                      activeOpacity={0.8}
                  >
                    {salvando ? (
                        <ActivityIndicator color="#FFFFFF" size="small"/>
                    ) : (
                        <Text style={[styles.btnConfirmarText, {color: '#FFF'}]}>Confirmar frequência</Text>
>>>>>>> 54f50db6235a44a84ca8364e4fc777d860afdecb
                    )}
                  </TouchableOpacity>
              )}

              {/* Botão: Editar (quando já existe frequência) */}
              {jaLancada && !modoEdicao && (
                  <TouchableOpacity style={styles.btnAtualizar} onPress={() => setModoEdicao(true)} activeOpacity={0.8}>
                    <Text style={[styles.btnAtualizarText, {color: '#1A1A1A'}]}>Editar frequência</Text>
                  </TouchableOpacity>
              )}

              {/* Botões: Cancelar e Salvar (modo edição) */}
              {jaLancada && modoEdicao && (
                  <View style={styles.actionButtons}>
                    <TouchableOpacity style={styles.btnCancelar} onPress={cancelarEdicao} activeOpacity={0.8}>
                      <Text style={[styles.btnCancelarText, {color: '#666'}]}>Cancelar</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.btnConfirmar, salvando && styles.btnDisabled]}
                        onPress={salvarEdicao}
                        disabled={salvando}
                        activeOpacity={0.8}
                    >
                      {salvando ? (
                          <ActivityIndicator color="#FFFFFF" size="small"/>
                      ) : (
                          <Text style={[styles.btnConfirmarText, {color: '#FFF'}]}>Salvar alterações</Text>
                      )}
                    </TouchableOpacity>
                  </View>
              )}
            </View>
        )}

        <Modal visible={modalMissoesVisible} transparent animationType="slide"
               onRequestClose={() => setModalMissoesVisible(false)}>
          <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setModalMissoesVisible(false)}>
            <View style={styles.modalSheet}>
              <View style={styles.modalHandle}/>
              <Text style={styles.modalTitle}>Selecione a missão</Text>
              {loadingMissoes ? (
                  <ActivityIndicator color="#1D9E75" style={{marginTop: 24}}/>
              ) : (
                  <ScrollView showsVerticalScrollIndicator={false}>
                    {missoes.map(m => (
                        <TouchableOpacity
                            key={m.id_missao}
                            style={[styles.missaoItem, missaoSelecionada?.id_missao === m.id_missao && styles.missaoItemSelected]}
                            onPress={() => selecionarMissao(m)}
                        >
                          <View>
                            <Text style={styles.missaoItemData}>{formatarData(m.data)}</Text>
                            {m.descricao && <Text style={styles.missaoItemDesc}>{m.descricao}</Text>}
                          </View>
                          {missaoSelecionada?.id_missao === m.id_missao &&
                              <Text style={styles.missaoItemCheck}>✓</Text>}
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
