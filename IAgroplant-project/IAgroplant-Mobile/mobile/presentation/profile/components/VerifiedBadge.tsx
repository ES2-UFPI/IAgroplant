import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export function VerifiedBadge() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>✅ Profissional Verificado</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignSelf: 'center',
    backgroundColor: '#DCFCE7',
    borderWidth: 1,
    borderColor: '#BBF7D0',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 5,
    marginTop: 8,
  },
  text: {
    color: '#166534',
    fontSize: 12,
    fontWeight: '700',
  },
});
