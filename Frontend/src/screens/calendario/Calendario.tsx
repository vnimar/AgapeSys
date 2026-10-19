import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  ScrollView,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context"; // ✅ import correto
import { styles } from "./Calendario.styles";
import { getMissoes, Missao } from "../../services/missao/missao";
import { getAdminPin, sairModoEdicao } from "../../services/admin/admin";
import { PinModal, MissaoEditModal } from "./CalendarioAdmin";
import Header, { headerStyles } from '../../../components/Header';

// Helper: formata data para YYYY-MM-DD no fuso do aparelho
// (toISOString usa UTC: depois das 21h no Brasil cairia no dia seguinte)
const formatDateKey = (date: Date): string => {
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${m}-${d}`;
};

// Retorna os dias do mês (array de objetos com info do dia)
const getDaysInMonth = (year: number, month: number) => {
  const firstDayOfMonth = new Date(year, month, 1);
  const startWeekday = firstDayOfMonth.getDay(); // 0 = domingo
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const daysArray = [];
  // Dias do mês anterior para completar a primeira semana
  const prevMonthDays = new Date(year, month, 0).getDate();
  for (let i = startWeekday - 1; i >= 0; i--) {
    daysArray.push({
      date: new Date(year, month - 1, prevMonthDays - i),
      isCurrentMonth: false,
    });
  }
  // Dias do mês atual
  for (let i = 1; i <= daysInMonth; i++) {
    daysArray.push({
      date: new Date(year, month, i),
      isCurrentMonth: true,
    });
  }
  // Dias do próximo mês para completar 42 (6 linhas)
  const remaining = 42 - daysArray.length;
  for (let i = 1; i <= remaining; i++) {
    daysArray.push({
      date: new Date(year, month + 1, i),
      isCurrentMonth: false,
    });
  }
  return daysArray;
};

export default function CalendarioScreen() {
  const [missoes, setMissoes] = useState<Missao[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [missionsByDate, setMissionsByDate] = useState<Map<string, Missao[]>>(
    new Map()
  );

  // Modo de edição (PIN)
  const [modoEdicao, setModoEdicao] = useState(false);
  const [pinVisible, setPinVisible] = useState(false);
  const [editVisible, setEditVisible] = useState(false);
  const [missaoEditando, setMissaoEditando] = useState<Missao | null>(null);

  const carregar = useCallback(async () => {
    try {
      const data = await getMissoes();
      setMissoes(data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    carregar();
    getAdminPin().then((pin) => setModoEdicao(!!pin));
  }, [carregar]);

  const alternarModoEdicao = () => {
    if (!modoEdicao) return setPinVisible(true);
    Alert.alert("Sair do modo de edição?", "Para editar de novo será preciso informar o PIN.", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Sair",
        onPress: async () => {
          await sairModoEdicao();
          setModoEdicao(false);
        },
      },
    ]);
  };

  const abrirEdicao = (missao: Missao | null) => {
    setMissaoEditando(missao);
    setEditVisible(true);
  };

  const aoSalvar = () => {
    setEditVisible(false);
    carregar();
  };

  // Agrupar missões por data
  useEffect(() => {
    const map = new Map<string, Missao[]>();
    missoes.forEach((missao) => {
      const dateKey = missao.data;
      if (!map.has(dateKey)) {
        map.set(dateKey, []);
      }
      map.get(dateKey)!.push(missao);
    });
    setMissionsByDate(map);
  }, [missoes]);

  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();
  const days = getDaysInMonth(currentYear, currentMonth);

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth + 1, 1));
  };

  const goToToday = () => {
    const today = new Date();
    setCurrentDate(today);
    setSelectedDate(today);
  };

  const handleDayPress = (date: Date) => {
    setSelectedDate(date);
  };

  const getMissionsForDate = (date: Date): Missao[] => {
    const key = formatDateKey(date);
    return missionsByDate.get(key) || [];
  };

  const isToday = (date: Date): boolean => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  const isSelected = (date: Date): boolean => {
    if (!selectedDate) return false;
    return (
      date.getDate() === selectedDate.getDate() &&
      date.getMonth() === selectedDate.getMonth() &&
      date.getFullYear() === selectedDate.getFullYear()
    );
  };

  const renderMissionItem = ({ item }: { item: Missao }) => (
    <TouchableOpacity
      style={styles.missionCard}
      onPress={() => abrirEdicao(item)}
      disabled={!modoEdicao}
      activeOpacity={0.7}
    >
      <View style={styles.missionTitleRow}>
        <Text style={styles.missionDescription}>{item.descricao}</Text>
        {modoEdicao && <Text style={styles.missionEditHint}>Editar ›</Text>}
      </View>
      <View style={styles.missionDetailsRow}>
        <Text style={styles.missionDetail}>📍 {item.local}</Text>
        <Text style={styles.missionDetail}>🕒 {item.horario}</Text>
      </View>
      {item.observacao ? (
        <Text style={styles.missionObservacao}>ℹ️ {item.observacao}</Text>
      ) : null}
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#649AFA" />
      </View>
    );
  }

  const selectedMissions = selectedDate ? getMissionsForDate(selectedDate) : [];

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Cabeçalho */}
        <Header>
          <View style={styles.headerRow}>
            <Text style={headerStyles.title}>Calendário</Text>
            <TouchableOpacity
              onPress={alternarModoEdicao}
              style={[styles.editModeButton, modoEdicao && styles.editModeButtonActive]}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Text style={[styles.editModeText, modoEdicao && styles.editModeTextActive]}>
                {modoEdicao ? "Editando ✓" : "Editar"}
              </Text>
            </TouchableOpacity>
          </View>
        </Header>

        {/* Navegação do mês */}
        <View style={styles.navigation}>
          <TouchableOpacity onPress={goToPreviousMonth} style={styles.navButton}>
            <Text style={styles.navButtonText}>◀</Text>
          </TouchableOpacity>
          <Text style={styles.monthTitle}>
            {currentDate.toLocaleDateString("pt-BR", {
              month: "long",
              year: "numeric",
            })}
          </Text>
          <TouchableOpacity onPress={goToNextMonth} style={styles.navButton}>
            <Text style={styles.navButtonText}>▶</Text>
          </TouchableOpacity>
        </View>

        {/* Botão Hoje */}
        <TouchableOpacity onPress={goToToday} style={styles.todayButton}>
          <Text style={styles.todayButtonText}>Hoje</Text>
        </TouchableOpacity>

        {/* Cabeçalho dias da semana */}
        <View style={styles.weekHeader}>
          {["D", "S", "T", "Q", "Q", "S", "S"].map((day, idx) => (
            <Text key={idx} style={styles.weekDay}>
              {day}
            </Text>
          ))}
        </View>

        {/* Grid de dias */}
        <View style={styles.calendarGrid}>
          {days.map((day, index) => {
            const date = day.date;
            const hasMission = getMissionsForDate(date).length > 0;
            const isCurrentMonth = day.isCurrentMonth;
            const selected = isSelected(date);
            const today = isToday(date);

            return (
              <TouchableOpacity
                  key={index}
                  style={[
                    styles.dayCell,
                    !isCurrentMonth && styles.otherMonthDay,
                    selected && styles.selectedDay,
                    today && styles.todayCell,
                    hasMission && !selected && styles.missionDay,
                  ]}
                  onPress={() => handleDayPress(date)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.dayText,
                      !isCurrentMonth && styles.otherMonthText,
                      selected && styles.selectedDayText,
                      today && styles.todayText,
                      hasMission && !selected && styles.missionDayText,
                    ]}
                  >
                    {date.getDate()}
                  </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Lista de missões do dia selecionado */}
        <View style={styles.missionsSection}>
          <Text style={styles.missionsSectionTitle}>
            {selectedDate
              ? `Missões para ${selectedDate.toLocaleDateString("pt-BR")}`
              : "Selecione um dia"}
          </Text>
          {selectedMissions.length === 0 && selectedDate && (
            <View style={styles.emptyMissions}>
              <Text style={styles.emptyMissionsText}>
                Nenhuma missão para este dia 🙏
              </Text>
            </View>
          )}
          <FlatList
            data={selectedMissions}
            keyExtractor={(item) => item.id_missao.toString()}
            renderItem={renderMissionItem}
            scrollEnabled={false}
            contentContainerStyle={styles.missionsList}
          />
          {modoEdicao && selectedDate && (
            <TouchableOpacity style={styles.addMissionButton} onPress={() => abrirEdicao(null)}>
              <Text style={styles.addMissionText}>+ Nova missão neste dia</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>

      <PinModal
        visible={pinVisible}
        onClose={() => setPinVisible(false)}
        onSuccess={() => {
          setPinVisible(false);
          setModoEdicao(true);
        }}
      />
      <MissaoEditModal
        visible={editVisible}
        missao={missaoEditando}
        dataInicial={selectedDate ? formatDateKey(selectedDate) : null}
        onClose={() => setEditVisible(false)}
        onSaved={aoSalvar}
      />
    </SafeAreaView>
  );
}