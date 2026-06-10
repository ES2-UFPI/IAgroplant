import React from 'react';
import { ScrollView, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { FILTER_CATEGORIES } from '../hooks/useFeed';

interface FilterBarProps {
  activeFilter: string;
  onSelect: (filter: string) => void;
}

export function FilterBar({ activeFilter, onSelect }: FilterBarProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.scroll}
      contentContainerStyle={styles.container}
    >
      {FILTER_CATEGORIES.map((f) => (
        <TouchableOpacity
          key={f}
          onPress={() => onSelect(f)}
          style={[styles.chip, activeFilter === f && styles.chipActive]}
        >
          <Text style={[styles.chipText, activeFilter === f && styles.chipTextActive]}>
            {f}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flexGrow: 0 },
  container: { paddingHorizontal: 14, paddingVertical: 10, gap: 8 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#fff',
  },
  chipActive: {
    borderColor: '#16A34A',
    backgroundColor: '#F0FDF4',
  },
  chipText: { fontSize: 13, color: '#6B7280', fontWeight: '400' },
  chipTextActive: { color: '#166534', fontWeight: '700' },
});