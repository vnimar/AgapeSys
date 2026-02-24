import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { styles } from './Home.styles.ts';

const Home: React.FC = () => {
  return (
    <ScrollView style={styles.container}>
      {/* Card Próxima Missão */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Próxima Missão</Text>
        <Text style={styles.cardDate}>Quarta-feira, 03 de Maio</Text>

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
  );
};

export default Home;
