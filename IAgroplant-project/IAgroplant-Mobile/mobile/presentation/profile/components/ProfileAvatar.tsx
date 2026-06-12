import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface ProfileAvatarProps {
  name: string;
  size?: number;
}

export function ProfileAvatar({ name, size = 80 }: ProfileAvatarProps) {
  // Pega as iniciais do nome
  const initials = name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  return (
    <View style={[styles.container, { width: size, height: size, borderRadius: size / 2 }]}>
      <Text style={[styles.text, { fontSize: size * 0.4 }]}>{initials}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#4caf50',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2, // Shadow on Android
    shadowColor: '#000', // Shadow on iOS
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  text: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
});
