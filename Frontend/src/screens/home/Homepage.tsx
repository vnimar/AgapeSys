import {Ionicons} from '@expo/vector-icons';
import React, {useEffect, useState} from 'react';
import {ActivityIndicator, ScrollView, Text, TouchableOpacity, View} from 'react-native';
import {useRouter} from 'expo-router';

import ScreenWrapper from '../../../components/ScreenWrapper';
import {formatarDataBR, styles} from './Home.styles';
import {getProximaMissao, getUltimasMissoes} from '../../services/missao/missao';
import Header, { headerStyles } from '../../../components/Header';
import {useAuth} from '../../context/AuthContext';

interface Missao {
  id_missao: number;
  data: string;
  descricao: string;
}
const MESES = ['JAN','FEV','MAR','ABR','MAI','JUN','JUL','AGO','SET','OUT','NOV','DEZ'];
const MESES_COMPLETOS = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];

function separarData(data: string) {
  const [ano, mes, dia] = data.slice(0, 10).split('-').map(Number);
  return {ano, mes, dia};
}

function diasRestantes(data: string) {
  const {ano, mes, dia} = separarData(data);
  const alvo = new Date(ano, mes - 1, dia);
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  return Math.round((alvo.getTime() - hoje.getTime()) / 86400000);
}

function textoDias(n: number) {
  if (n < 0) return '';
  if (n === 0) return 'hoje';
  if (n === 1) return 'amanhã';
  return `em ${n} dias`;
}


type NomeIcone = React.ComponentProps<typeof Ionicons>['name'];

function Acao({icone, texto, cor, onPress}: {
  icone: NomeIcone;
  texto: string;
  cor: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      style={[styles.acaoCard, {backgroundColor: cor}]}
      onPress={onPress}
    >
      <View style={styles.acaoIcone}>
        <Ionicons name={icone} size={22} color="#fff" />
      </View>
      <Text style={styles.acaoTexto}>{texto}</Text>
    </TouchableOpacity>
  );
}

const Home: React.FC = () => {
  const router = useRouter();
  const {usuario, cuidaDosServos} = useAuth();
  const primeiroNome = usuario?.nome.split(' ')[0] || 'Servo';

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
      // @ts-ignore
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
        <Text style={headerStyles.title}>Olá, <Text style={styles.username}>{primeiroNome}!</Text>
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
          <Text>📍 Paróquia São Miguel Arcanjo</Text>
        </View>
      </View>
      {/* Grid de Ações */}
      <View style={styles.grid}>
        {cuidaDosServos && (
          <TouchableOpacity
            style={[styles.button, styles.green]}
            onPress={() => router.push('/servo')}
          >
            <Text style={styles.buttonText}>Lista de Servos</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={[styles.button, styles.purple]}
          onPress={() => router.push('/calendario')}
        >
          <Text style={styles.buttonText}>Calendário</Text>
        </TouchableOpacity>
        {cuidaDosServos && (
          <TouchableOpacity
            style={[styles.button, styles.blue]}
            onPress={() => router.push('/frequencia')}
          >
            <Text style={styles.buttonText}>Chamada</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={[styles.button, styles.orange]}
          onPress={() => console.log("Exportar")}
        >
          <Text style={styles.buttonText}>Exportar</Text>
        </TouchableOpacity>
      </View>

      {/* Últimas missões */}
     <View style={styles.recentesTopo}>
        <Text style={styles.activityTitle}>Últimas Missões</Text>
      </View>

      {ultimasMissoes.map((m) => (
        <View key={m.id_missao} style={styles.recenteItem}>
          <View style={styles.recenteData}>
            <Text style={styles.recenteDia}>{separarData(m.data).dia}</Text>
            <Text style={styles.recenteMes}>{MESES[separarData(m.data).mes - 1]}</Text>
          </View>
          <Text style={styles.recenteNome}>{m.descricao}</Text>
        </View>
      ))}
    </ScreenWrapper>
  );
};

export default Home;