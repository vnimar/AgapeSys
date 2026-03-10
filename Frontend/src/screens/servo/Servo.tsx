import React, { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { View, Text, TouchableOpacity, FlatList, Image } from "react-native";
import { styles } from './Servo.style'

export default function ServosScreen() {

  const [expandedId, setExpandedId] = useState(null);

  const servos = [
    { id: 1, nome: "João Silva", telefone: "61 99999-1111", pastas: ["Música", "Intercessão"] },
    { id: 2, nome: "Maria Souza", telefone: "61 98888-2222", pastas: ["Evangelização"] },
    { id: 3, nome: "Pedro Santos", telefone: "61 97777-3333", pastas: ["Acolhida", "Liturgia"] },
  ];

  function toggleExpand(id) {
    setExpandedId(expandedId === id ? null : id);
  }

  function renderItem({ item }) {
    const isExpanded = expandedId === item.id;

    return (
      <View style={styles.card}>
        <TouchableOpacity onPress={() => toggleExpand(item.id)}>
          <Text style={styles.nome}>{item.nome}</Text>
        </TouchableOpacity>

        {isExpanded && (
          <View style={styles.details}>
            <Text style={styles.info}>📞 {item.telefone}</Text>
            <Text style={styles.info}>📁 {item.pastas.join(", ")}</Text>
          </View>
        )}
      </View>
    );
  }

  return (
      <SafeAreaView style={{ flex: 1 }}>
        <View style={styles.container}>

          <View style={styles.header}>
            <Text style={styles.title}>Lista de Servos</Text>

            <Image
              source={require('../../assets/images/logoAgapeJovensDiscipuladoPSMA.png')}
              style={styles.logo}
            />
          </View>

          <FlatList
            data={servos}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderItem}
          />

        </View>
      </SafeAreaView>
  );
}