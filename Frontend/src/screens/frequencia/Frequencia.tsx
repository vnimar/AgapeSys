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
  Platform,
  StatusBar,
} from "react-native";
import { styles } from "./Frequencia.styles";
import { getMissoes } from "../../services/missao/missao";
import { getServos } from "../../services/servos/servos";
import { getFrequenciaById } from "../../services/frequencia/frequencia";

type StatusFrequencia = "Presente" | "Falta" | "Justificada";

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

export function FrequenciaScreen() {
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

  const carregarDados = async () => {
    setLoadingMissoes(true);
    setLoadingServos(true);
    try {
      const [missoesData, servosData] = await Promise.all([getMissoes(), getServos()]);

      // Ordena missões da mais antiga para a mais recente (crescente)
      // Se quiser a mais recente primeiro, troque a ordem: (b, a)
      missoesData.sort((a: { data: string | number | Date; }, b: {
        data: string | number | Date;
      }) => new Date(a.data).getTime() - new Date(b.data).getTime());
      setMissoes(missoesData);

      // Normaliza servos (aceita resposta array ou com chave 'data')
      let servosRaw = Array.isArray(servosData) ? servosData : servosData?.data || [];
      const servosNormalizados: ServoNormalizado[] = servosRaw
          .filter((s: { id_servo: any; id: any; }) => s && (s.id_servo || s.id))
          .map((s: { id_servo: any; id: any; nome: any; status: any; }) => ({
            id: s.id_servo ?? s.id,
            nome: s.nome || "Sem nome",
            status: s.status ?? null,
          }));

      console.log(`📦 ${servosNormalizados.length} servos carregados`);
      setServos(servosNormalizados);
      servosRef.current = servosNormalizados;
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
      Alert.alert("Erro", "Falha ao carregar dados. Verifique sua conexão.");
    } finally {
      setLoadingMissoes(false);
      setLoadingServos(false);
    }
  };

  // ─── Selecionar missão com depuração e fallbacks ─────────────────────────────
  const selecionarMissao = useCallback(async (missao: Missao) => {
    setMissaoSelecionada(missao);
    setModalMissoesVisible(false);
    setModoEdicao(false);
    setFrequenciaExistente([]);

    const initialAttendance: Record<number, StatusFrequencia | null> = {};
    servosRef.current.forEach(s => {
      initialAttendance[s.id] = null;
    });
    setAttendance(initialAttendance);

    try {
      const result = await getFrequenciaById(missao.id_missao);
      console.log('🔍 Resultado bruto de getFrequenciaById:', result);

      // Tenta normalizar o resultado, seja ele Response ou dados diretos
      let data = null;
      let ok = false;

      if (result && typeof result === 'object') {
        // Caso 1: é um Response do fetch (tem ok, status, json)
        if ('ok' in result && typeof result.ok === 'boolean') {
          ok = result.ok;
          if (ok) {
            data = await result.json();
          } else {
            console.warn(`HTTP ${result.status}`);
            Alert.alert("Erro", `Falha na requisição: ${result.status}`);
            return;
          }
        }
        // Caso 2: já são os dados diretamente (ex: { data: [...] } ou array)
        else {
          ok = true;
          data = result;
        }
      }

      if (!ok || !data) {
        console.warn('Resposta inválida ou vazia');
        setFrequenciaExistente([]);
        return;
      }

      console.log('📦 Dados processados:', data);

      // Extrai array de frequências (mesma lógica robusta)
      let existenteRaw: any[] = [];
      if (Array.isArray(data)) {
        existenteRaw = data;
      } else if (data?.data && Array.isArray(data.data)) {
        existenteRaw = data.data;
      } else if (data?.frequencias && Array.isArray(data.frequencias)) {
        existenteRaw = data.frequencias;
      } else if (data?.registros && Array.isArray(data.registros)) {
        existenteRaw = data.registros;
      } else {
        for (const key in data) {
          if (Array.isArray(data[key])) {
            existenteRaw = data[key];
            console.log(`✅ Array encontrado na chave '${key}'`);
            break;
          }
        }
      }

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
        setFrequenciaExistente([]);
      }
    } catch (err) {
      console.error('❌ Erro:', err);
      Alert.alert("Erro", "Não foi possível carregar frequências.");
      setFrequenciaExistente([]);
    }
  }, []);

  const marcarStatus = useCallback((id: number, status: StatusFrequencia) => {
    setAttendance(prev => ({...prev, [id]: status}));
  }, []);

  const confirmarFrequencia = async () => {
    if (!missaoSelecionada) return;
    const pendentes = servosRef.current.filter(s => !attendance[s.id]);
    if (pendentes.length) {
      Alert.alert("Atenção", `${pendentes.length} servo(s) ainda sem marcação.`);
      return;
    }
    setSalvando(true);
    try {
      const payload = servosRef.current.map(s => ({
        id_servo: s.id,
        id_missao: missaoSelecionada.id_missao,
        status: attendance[s.id],
        data: missaoSelecionada.data,
      }));
      console.log("POST /frequencia", payload);
      // await postFrequencia(payload);
      Alert.alert("Sucesso", "Frequência registrada!");
      const novaExistente = servosRef.current.map(s => ({
        id_servo: s.id,
        status: attendance[s.id] as StatusFrequencia,
      }));
      setFrequenciaExistente(novaExistente);
    } catch {
      Alert.alert("Erro", "Não foi possível salvar.");
    } finally {
      setSalvando(false);
    }
  };

  const salvarEdicao = async () => {
    if (!missaoSelecionada) return;
    const pendentes = servosRef.current.filter(s => !attendance[s.id]);
    if (pendentes.length) {
      Alert.alert("Atenção", `${pendentes.length} servo(s) sem marcação.`);
      return;
    }

    setSalvando(true);
    try {
      const payload = servosRef.current.map(s => ({
        id_servo: s.id,
        status: attendance[s.id],
      }));
      console.log("PUT /frequencia", payload);
      // await putFrequencia(missaoSelecionada.id_missao, payload);
      Alert.alert("Sucesso", "Frequência atualizada!");
      setModoEdicao(false);
    } catch {
      Alert.alert("Erro", "Não foi possível atualizar.");
    } finally {
      setSalvando(false);
    }
  };

  const cancelarEdicao = useCallback(() => {
    setModoEdicao(false);
    const restaurado: Record<number, StatusFrequencia | null> = {};
    servosRef.current.forEach(s => {
      restaurado[s.id] = null;
    });
    frequenciaExistente.forEach(f => {
      restaurado[f.id_servo] = f.status;
    });
    setAttendance(restaurado);
  }, [frequenciaExistente]);

  const formatarData = (dateStr: string) => {
    const [year, month, day] = dateStr.split("-");
    return `${day}/${month}/${year}`;
  };

  const getInitials = (nome: string) =>
      nome.split(" ").slice(0, 2).map(n => n[0].toUpperCase()).join("");

  const contagem = {
    presente: Object.values(attendance).filter(v => v === "Presente").length,
    falta: Object.values(attendance).filter(v => v === "Falta").length,
    justificada: Object.values(attendance).filter(v => v === "Justificada").length,
  };

  const jaLancada = frequenciaExistente.length > 0;
  const podeEditar = !jaLancada || modoEdicao;

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
        </View>
    );
  };

  return (
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
