import React, { useState } from "react";
import { View, Text, TouchableOpacity, FlatList, StyleSheet } from "react-native";
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
            <Text>Telefone: {item.telefone}</Text>
            <Text>Pastas: {item.pastas.join(", ")}</Text>
          </View>
        )}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Servos</Text>

      <FlatList
        data={servos}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
      />
    </View>
  );
}