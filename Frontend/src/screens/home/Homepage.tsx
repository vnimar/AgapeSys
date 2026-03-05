import React, { useState, useEffect } from 'react';
import { SafeAreaView } from "react-native-safe-area-context";
import { View, Text, ScrollView, TouchableOpacity,ActivityIndicator } from 'react-native';
import { formatarDataBR, styles } from './Home.styles'; import { Image } from 'react-native';
import { getProximaMissao } from '../../services/api';

interface Missao {
    id_missao: number;
    data: string;
    descricao: string;
}

const Home: React.FC = () => {

    const [missao, setMissao] = useState<Missao | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
      async function carregar() {
        try {
          // Chamando seu serviço que usa fetch
          const resultado = await getProximaMissao();

          // Agora o log funciona porque está DENTRO do try
          console.log("MISSÃO RECEBIDA DO FASTAPI:", resultado);

          setMissao(resultado);
        } catch (error) {
          console.error("Erro na requisição:", error);
        } finally {
          setLoading(false);
        }
      }
      carregar();
    }, []);

  return (
   <SafeAreaView style={{ flex: 1 }}>
    <ScrollView contentContainerStyle={styles.container}>

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>
            Olá, <Text style={styles.username}>Servo !</Text>
          </Text>
        </View>

        <Image
          source={require('../../assets/images/logoAgapeJovensDiscipuladoPSMA.png')}
          style={styles.logoImage}
        />
      </View>

      {/* Card Próxima Missão */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Próxima Missão</Text>

          {loading ? (
            <ActivityIndicator size="small" />
          ) : missao ? (
            <>
              <Text style={styles.cardDate}>
                {formatarDataBR(missao.data)}
              </Text>
              <Text style={styles.description}>{missao.descricao}</Text>
            </>
          ) : (
            <Text>Nenhuma missão encontrada</Text>
          )}

        <View style={styles.cardInfo}>
          <Text>🕒 Início às 19:00</Text>
          <Text>📍 Paroquia São Miguel Arcanjo</Text>
        </View>
      </View>

      {/* Grid de Ações */}
      <View style={styles.grid}>
        <TouchableOpacity style={[styles.button, styles.green]}>
          <Text style={styles.buttonText}>Lista de Servos</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.button, styles.purple]}>
          <Text style={styles.buttonText}>Calendário</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.button, styles.blue]}>
          <Text style={styles.buttonText}>Chamada</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.button, styles.orange]}>
          <Text style={styles.buttonText}>Exportar</Text>
        </TouchableOpacity>
      </View>

      {/* Últimas Atividades */}
      <View style={styles.activityContainer}>
        <Text style={styles.activityTitle}>Últimas Atividades</Text>

        <View style={styles.activityItem}>
          <Text>✔️ Chamada registrada</Text>
          <Text style={styles.time}>20:15</Text>
        </View>

        <View style={styles.activityItem}>
          <Text>✔️ Chamada registrada</Text>
          <Text style={styles.time}>10:25</Text>
        </View>
      </View>
    </ScrollView>
   </SafeAreaView>
  );
};

export default Home;
