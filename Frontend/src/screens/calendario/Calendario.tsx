import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Image,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context"; // ✅ import correto
import { styles } from "./Calendario.styles";
import { getMissoes } from "../../services/missao/missao";

interface Missao {
  id_missao: number;
  data: string;
  descricao: string;
  local: string;
  horario: string;
}

// Helper: formata data para YYYY-MM-DD
const formatDateKey = (date: Date): string => {
  return date.toISOString().split("T")[0];
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

  useEffect(() => {
    async function carregar() {
      try {
        const data = await getMissoes();
        setMissoes(data as Missao[]);
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    }
    carregar();
  }, []);

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
    <View style={styles.missionCard}>
      <Text style={styles.missionDescription}>{item.descricao}</Text>
      <View style={styles.missionDetailsRow}>
        <Text style={styles.missionDetail}>📍 {item.local}</Text>
        <Text style={styles.missionDetail}>🕒 {item.horario}</Text>
      </View>
    </View>
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
        <View style={styles.header}>
          <Text style={styles.title}>📅 Calendário</Text>
          <Image
            source={require("../../assets/images/logoAgapeJovensDiscipuladoPSMA.png")}
            style={styles.logo}
          />
        </View>

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
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}