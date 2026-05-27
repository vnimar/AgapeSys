import React from 'react';
import {View, Text, StyleSheet, Image} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface HeaderProps {
  children?: React.ReactNode;
  showLogo?: boolean;
  //coloca os props aqui
}

export default function Header({children, showLogo = true }: HeaderProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top + 12 }]}>
        {children}
        {showLogo && (
            <Image
                source={require('../assets/images/logoAgapeJovensDiscipuladoPSMA.png')}
                style={styles.logo}
            />
        )}
      {/* Inclua aqui botões, ícones, etc. */}
    </View>
  );
}

export const styles = StyleSheet.create({
  container: {
      flexDirection:  'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      backgroundColor: '#F4F6F8',
      paddingVertical: 20,
      paddingHorizontal: 20,
      marginBottom: 20,
      marginTop: -20,
  },
    logo:  {
        width: 46,
        height: 46,
        resizeMode: 'contain',
  },
    title: {
      fontSize: 22,
        color: '#1E3A8A',
        fontWeight: 'bold',
    }
});