import React, {useEffect, useState} from 'react';
import {ActivityIndicator, ScrollView, Text, TouchableOpacity, View} from 'react-native';
import {useRouter} from 'expo-router';

import ScreenWrapper from '../../../components/ScreenWrapper';
import {formatarDataBR, styles} from './Home.styles';
import {getProximaMissao, getUltimasMissoes} from '../../services/missao/missao';
import Header, { headerStyles } from '../../../components/Header';

interface Missao {
  id_missao: number;
  data: string;
  descricao: string;
}

const Home: React.FC = () => {
  const router = useRouter();

  const [missao, setMissao] = useState<Missao | null>(null);
  const [loading, setLoading] = useState(true);
  const [ultimasMissoes, setUltimasMissoes] = useState<Missao[]>([]);

  useEffect(() => {
  async function carregar() {
    try {
      const [proxima, ultimas] = await Promise.all([
        getProximaMissao(),
        getUltimasMissoes(),
      ]);

      // @ts-ignore
      setMissao(proxima);
      setUltimasMissoes(ultimas);

    } catch (error) {
      console.error("Erro na requisição:", error);
    } finally {
      setLoading(false);
    }
  }carregar();
  }, []);

  // @ts-ignore
  // @ts-ignore
  // @ts-ignore
  return (
  <ScreenWrapper scrollable={true}>
    <Header>
      <Text style={headerStyles.title}>
        Olá, <Text style={styles.username}>Servo!</Text>
      </Text>
    </Header>

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
        <Text style={styles.activityTitle}>Últimas Missões</Text>

        {ultimasMissoes.map((missao) => (
          <View
            key={missao.id_missao}
            style={styles.activityItem}>
            <View>
              <Text>📅 {missao.descricao}</Text>
              <Text style={styles.time}>
                {formatarDataBR(missao.data)}
              </Text>
            </View>
          </View>
        ))}
      </View>
    </ScreenWrapper>
);
};

export default Home;