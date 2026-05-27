import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';

interface HeaderProps {
  children?: React.ReactNode;
  title?: string;
  showLogo?: boolean;
}

export default function Header({ children, title, showLogo = true }: HeaderProps) {
  return (
    <View style={headerStyles.container}>
      <View style={headerStyles.leftSection}>
        {children || <Text style={headerStyles.title}>{title || 'AgapeSys'}</Text>}
      </View>
      {showLogo && (
        <Image
          source={require('../assets/images/logoAgapeJovensDiscipuladoPSMA.png')}
          style={headerStyles.logo}
          resizeMode="contain"
        />
      )}
    </View>
  );
}

export const headerStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 6,
    paddingTop: 6,
    paddingBottom: 15,
    backgroundColor: '#F4F6F8',
  },
  leftSection: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    color: '#1E3A8A',
    fontWeight: '600',
  },
  logo: {
    width: 36,
    height: 36,
    marginLeft: 12,
  },
});