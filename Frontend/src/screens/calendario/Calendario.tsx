import React, { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { View, Text, TouchableOpacity, FlatList, Image } from "react-native";
import { styles } from "./Calendario.styles";

type Missao = {
  id: string;
  data: string;
  missao: string;
  local: string;
  horario: string;
};

export default function CalendarioScreen() {

  const [expandedId, setExpandedId] = useState<string | null>(null);

  const missoes: Missao[] = [
    {
      id: "1",
      data: "12 MAR",
      missao: "Formação de Cursista",
      local: "Paróquia São Miguel",
      horario: "15:30"
    },
    {
      id: "2",
      data: "19 MAR",
      missao: "Ação social",
      local: "Comunidade Santa Rita",
      horario: "14:30"
    },
    {
      id: "3",
      data: "26 MAR",
      missao: "Formação de Servos",
      local: "Capela NSS das Graças",
      horario: "19:30"
    }
  ];

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const renderItem = ({ item }: { item: Missao }) => {

    const expanded = item.id === expandedId;

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => toggleExpand(item.id)}
      >

        <Text style={styles.data}>{item.data}</Text>

        {expanded && (
          <View style={styles.details}>
            <Text style={styles.text}>Missão: {item.missao}</Text>
            <Text style={styles.text}>📍 {item.local}</Text>
            <Text style={styles.text}>🕒 {item.horario}</Text>
          </View>
        )}

      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>

      <View style={styles.header}>
        <Text style={styles.title}>Calendário</Text>

        <Image
          source={require('../../assets/images/logoAgapeJovensDiscipuladoPSMA.png')}
          style={styles.logo}
        />
      </View>

      <FlatList
        data={missoes}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
      />

    </SafeAreaView>
  );
}