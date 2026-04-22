import React, { useState, useEffect, useCallback } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Image,
  ActivityIndicator,
} from "react-native";
import { styles, getFreqColor } from "./Servo.style";
import { getServos } from "../../services/servos/servos";
import {
  getFrequenciaServos,
  FrequenciaServoResumo,
} from "../../services/frequencia/frequencia";

// ─── Tipos ────────────────────────────────────────────────────────────────────

interface Servo {
  id_servo: number;
  nome: string;
  telefone: string | null;
  status: string | null;
  ano_ingresso: number;
  pastas: string[];
}

// ─── Sub-componente: detalhes expandidos de um servo ─────────────────────────

function ServoDetalhes({
  servo,
  resumo,
}: {
  servo: Servo;
  resumo: FrequenciaServoResumo | null;
}) {
  const percentual = resumo?.percentual_presenca ?? null;
  const cor = getFreqColor(percentual);
  const total = resumo
    ? resumo.presente + resumo.justificada + resumo.falta
    : 0;

  return (
    <View>
      {/* Barra de frequência */}
      <View style={styles.barraWrap}>
        <View style={styles.barraRow}>
          <Text style={styles.barraLabel}>Frequência geral</Text>
          <Text style={[styles.barraValor, { color: cor.text }]}>
            {percentual !== null ? `${percentual}%` : "Sem dados"}
          </Text>
        </View>
        <View style={styles.barraFundo}>
          <View
            style={[
              styles.barraPreenchimento,
              {
                width: `${percentual ?? 0}%` as any,
                backgroundColor: cor.bar,
              },
            ]}
          />
        </View>
      </View>

      {/* Mini contadores P / J / F */}
      {resumo && total > 0 && (
        <View style={styles.contadores}>
          {[
            { label: "Presentes", val: resumo.presente, bg: "#EAF3DE", col: "#3B6D11" },
            { label: "Justificadas", val: resumo.justificada, bg: "#FAEEDA", col: "#854F0B" },
            { label: "Faltas", val: resumo.falta, bg: "#FCEBEB", col: "#A32D2D" },
          ].map((item) => (
            <View
              key={item.label}
              style={[styles.contadorCard, { backgroundColor: item.bg }]}
            >
              <Text style={[styles.contadorNum, { color: item.col }]}>{item.val}</Text>
              <Text style={[styles.contadorLabel, { color: item.col }]}>{item.label}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Dados do servo */}
      <View style={styles.dadosBox}>
        {servo.telefone ? (
          <View style={styles.dadosRow}>
            <Text style={styles.dadosKey}>Telefone</Text>
            <Text style={styles.dadosValue}>{servo.telefone}</Text>
          </View>
        ) : null}

        <View style={styles.dadosRow}>
          <Text style={styles.dadosKey}>Ano de ingresso</Text>
          <Text style={styles.dadosValue}>
           {servo.ano_ingresso && servo.ano_ingresso > 0 ? servo.ano_ingresso : "—"}
          </Text>
        </View>

        {total > 0 && (
          <View style={styles.dadosRow}>
            <Text style={styles.dadosKey}>Missões registradas</Text>
            <Text style={styles.dadosValue}>{total}</Text>
          </View>
        )}

        <View style={[styles.dadosRow, styles.dadosRowLast]}>
          <Text style={styles.dadosKey}>Pastas</Text>
          <Text style={styles.dadosValue}>
            {servo.pastas && servo.pastas.length > 0
              ? servo.pastas.join(", ")
              : "Sem pasta"}
          </Text>
        </View>
      </View>
    </View>
  );
}

// ─── Componente principal ─────────────────────────────────────────────────────

export default function ServosScreen() {
  const [servos, setServos] = useState<Servo[]>([]);
  const [frequencias, setFrequencias] = useState<Record<number, FrequenciaServoResumo>>({});
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function carregar() {
      try {
        // Busca servos e resumo de frequências em paralelo
        const [servosData, freqData] = await Promise.all([
          getServos(),
          getFrequenciaServos(),
        ]);

        // @ts-ignore
        setServos(Array.isArray(servosData) ? servosData : servosData?.data ?? []);

        // Indexa frequências por id_servo para acesso O(1)
        const freqMap: Record<number, FrequenciaServoResumo> = {};
        freqData.data.forEach((f) => { freqMap[Number(f.id_servo)] = f; });
        setFrequencias(freqMap);
      } catch (error) {
        console.error("Erro ao carregar servos:", error);
      } finally {
        setLoading(false);
      }
    }
    carregar();
  }, []);

  const toggleExpand = useCallback((id: number) => {
    setExpandedId((prev) => (prev === id ? null : id));
  }, []);

  function getInitials(nome: string) {
    return nome
      .split(" ")
      .slice(0, 2)
      .map((n) => n[0].toUpperCase())
      .join("");
  }

  // ─── Render de cada card ──────────────────────────────────────────────────

  const renderItem = useCallback(
    ({ item }: { item: Servo }) => {
      const isExpanded = expandedId === item.id_servo;
      const resumo = frequencias[item.id_servo] ?? null;

      return (
        <View style={styles.card}>
          <TouchableOpacity
            style={styles.cardHeader}
            onPress={() => toggleExpand(item.id_servo)}
            activeOpacity={0.7}
          >
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{getInitials(item.nome)}</Text>
            </View>

            <View style={styles.cardInfo}>
              <Text style={styles.cardNome} numberOfLines={1}>
                {item.nome}
              </Text>
              <Text style={styles.cardPastas} numberOfLines={1}>
                {item.pastas && item.pastas.length > 0
                  ? item.pastas.join(" · ")
                  : "Sem pasta"}
              </Text>
            </View>

            <Text style={styles.chevron}>{isExpanded ? "˄" : "˅"}</Text>
          </TouchableOpacity>

          {isExpanded && (
            <View style={styles.details}>
              <ServoDetalhes servo={item} resumo={resumo} />
            </View>
          )}
        </View>
      );
    },
    [expandedId, toggleExpand, frequencias]
  );

  // ─── Loading inicial ──────────────────────────────────────────────────────

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#1E3A8A" />
        <Text style={styles.loadingText}>Carregando servos...</Text>
      </View>
    );
  }

  // ─── Render principal ─────────────────────────────────────────────────────

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <View style={styles.header}>
        <View style={styles.headerTexts}>
          <Text style={styles.headerSub}>AgapeSys</Text>
          <Text style={styles.title}>Servos</Text>
        </View>
        <Image
          source={require("../../assets/images/logoAgapeJovensDiscipuladoPSMA.png")}
          style={styles.logo}
        />
      </View>

      <FlatList
        data={servos}
        keyExtractor={(item, index) =>
          item.id_servo ? item.id_servo.toString() : index.toString()
        }
        renderItem={renderItem}
        extraData={{ expandedId, frequencias }}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}