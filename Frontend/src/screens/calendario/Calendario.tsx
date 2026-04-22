import React, { useEffect, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { View, Text, TouchableOpacity, FlatList, Image, ActivityIndicator } from "react-native";
import { styles } from "./Calendario.styles";
import { getMissoes } from '../../services/missao/missao'

interface Missao {
  id_missao: number;
  data: string;
  descricao: string;
  local: string;
  horario: string;
}

export default function CalendarioScreen() {

  const [missoes, setMissoes] = useState<Missao[]>([]);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() =>{
    async function carregar(){
      try{
        const data = await getMissoes()
        // @ts-ignore
        setMissoes(data)
      } catch(error){
         console.log(error)
      } finally{
        setLoading(false)
      }
    }
    carregar()
  },[])

  const toggleExpand = (id: number) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const renderItem = ({ item }: { item: Missao }) => {

    const expanded = item.id_missao === expandedId;

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => toggleExpand(item.id_missao)}
      >

        <Text style={styles.data}>{item.data}</Text>

        {expanded && (
          <View style={styles.details}>
            <Text style={styles.text}>Missão: {item.descricao}</Text>
            <Text style={styles.text}>📍 {item.local}</Text>
            <Text style={styles.text}>🕒 {item.horario}</Text>
          </View>
        )}

      </TouchableOpacity>
    );
  };

  if (loading) {
    return <ActivityIndicator size="large" />;
  }

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
        keyExtractor={(item) => item.id_missao.toString()}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
      />

    </SafeAreaView>
  );
}