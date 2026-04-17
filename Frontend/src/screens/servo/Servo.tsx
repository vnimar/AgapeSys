import React, { useState, useEffect } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { View, Text, TouchableOpacity, FlatList, Image, ActivityIndicator } from "react-native";
import { styles } from './Servo.style'
import { getServos } from '../../services/servos/servos'

interface Servos {
    id: number;
    nome: string;
    telefone: string;
    pastas: string[];
}

export default function ServosScreen() {

  const [servos, setServos] = useState<Servos[]>([]);
  const [expandedId, setExpandedId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function carregar() {
      try {
        const data = await getServos();
        setServos(data);
      } catch (error) {
        console.log("Erro ao buscar servos:", error);
      } finally {
        setLoading(false);
      }
    }

    carregar();
  }, []);

  function toggleExpand(id: React.SetStateAction<null>) {
    setExpandedId(expandedId === id ? null : id);
  }

  // @ts-ignore
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

  if (loading) {
    return <ActivityIndicator size="large" />;
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