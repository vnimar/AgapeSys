import { StyleSheet } from 'react-native';

export const formatarDataBR = (dataString: string | undefined) => {
  if (!dataString) return "Sem data";
  const [ano, mes, dia] = dataString.split('-');
  return `${dia}/${mes}/${ano}`;
};

export const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F4F6F8',
  },
  container: {
    padding: 16,
    paddingBottom: 32,
  },

  /* Header */
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },

  greeting: {
    fontSize: 22,
    color: '#1E3A8A',
  },

  username: {
    fontWeight: 'bold',
  },

  logoImage: {
    width: 44,
    height: 44,
    resizeMode: 'contain',
  },

  /* Card */
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    elevation: 4,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  cardDate: {
    color: '#555',
    marginVertical: 6,
  },
  cardInfo: {
    marginTop: 8,
    gap: 4,
  },

  description: {},

  /* Grid */
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  button: {
    width: '48%',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontWeight: '600',
  },

  green:  { backgroundColor: '#4CAF50' },
  purple: { backgroundColor: '#7E57C2' },
  blue:   { backgroundColor: '#1976D2' },
  orange: { backgroundColor: '#F57C00' },

  /* Atividades */
  activityContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 18,
  },
  activityTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  activityItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  time: {
    color: '#888',
  },
  recentesTopo: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: 8,
},
recenteItem: {
  flexDirection: 'row',
  alignItems: 'center',
  paddingVertical: 8,
},
recenteData: {
  width: 44,
  height: 44,
  borderRadius: 12,
  backgroundColor: '#eff6ff',
  alignItems: 'center',
  justifyContent: 'center',
  marginRight: 12,
},
recenteDia: {
  color: '#1e3a8a',
  fontSize: 19,
  fontWeight: 'bold',
},
recenteMes: {
  color: '#1e3a8a',
  fontSize: 11,
},
recenteNome: {
  flex: 1,
  fontSize: 14,
  fontWeight: '600',
},
});