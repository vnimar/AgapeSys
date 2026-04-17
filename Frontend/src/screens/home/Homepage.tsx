import React, { useState, useEffect } from 'react';
import { SafeAreaView } from "react-native-safe-area-context";
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Image } from 'react-native';
import { useRouter } from 'expo-router';

import { formatarDataBR, styles } from './Home.styles';
import { getProximaMissao } from '../../services/missao/missao';

interface Missao {
  id_missao: number;
  data: string;
  descricao: string;
}

const Home: React.FC = () => {
  const router = useRouter();

  const [missao, setMissao] = useState<Missao | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function carregar() {
      try {
        const resultado = await getProximaMissao();
        setMissao(resultado);
      } catch (error) {
        console.error("Erro na requisição:", error);
      } finally {
        setLoading(false);
      }
    }
    carregar();
  }, []);

  // @ts-ignore
  // @ts-ignore
  // @ts-ignore
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

          <TouchableOpacity
            style={[styles.button, styles.green]}
            onPress={() => router.push('/servo')}
          >
            <Text style={styles.buttonText}>Lista de Servos</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.purple]}
            onPress={() => router.push('/calendario')}
          >
            <Text style={styles.buttonText}>Calendário</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.blue]}
            onPress={() => router.push('/frequencia')}
          >
            <Text style={styles.buttonText}>Chamada</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.orange]}
            onPress={() => console.log("Exportar")}
          >
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