import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';

interface SpecialtiesInputProps {
  value: string[];
  onChange?: (next: string[]) => void;
  editable?: boolean;
}

export function SpecialtiesInput({ value, onChange, editable = true }: SpecialtiesInputProps) {
  const [draft, setDraft] = useState('');

  function addSpecialty() {
    const trimmed = draft.trim();
    if (!trimmed || !onChange) return;
    if (value.some((v) => v.toLowerCase() === trimmed.toLowerCase())) {
      setDraft('');
      return;
    }
    onChange([...value, trimmed]);
    setDraft('');
  }

  function removeSpecialty(item: string) {
    if (!onChange) return;
    onChange(value.filter((v) => v !== item));
  }

  return (
    <View>
      <View style={styles.chipsRow}>
        {value.length === 0 ? (
          <Text style={styles.emptyText}>Nenhuma especialidade adicionada.</Text>
        ) : (
          value.map((item) => (
            <View key={item} style={styles.chip}>
              <Text style={styles.chipText}>{item}</Text>
              {editable && (
                <TouchableOpacity onPress={() => removeSpecialty(item)} style={styles.removeBtn}>
                  <Text style={styles.removeText}>✕</Text>
                </TouchableOpacity>
              )}
            </View>
          ))
        )}
      </View>

      {editable && (
        <View style={styles.addRow}>
          <TextInput
            value={draft}
            onChangeText={setDraft}
            placeholder="Ex: Manejo de Pragas"
            placeholderTextColor="#9CA3AF"
            style={styles.input}
            onSubmitEditing={addSpecialty}
            returnKeyType="done"
          />
          <TouchableOpacity onPress={addSpecialty} style={styles.addBtn}>
            <Text style={styles.addBtnText}>+</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  chipsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#BBF7D0',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  chipText: { fontSize: 12, color: '#166534', fontWeight: '500' },
  removeBtn: { marginLeft: 6 },
  removeText: { fontSize: 11, color: '#166534', fontWeight: '700' },
  emptyText: { fontSize: 13, color: '#9CA3AF', fontStyle: 'italic' },
  addRow: { flexDirection: 'row', gap: 8, marginTop: 10 },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    color: '#111827',
  },
  addBtn: {
    width: 40,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#16A34A',
    borderRadius: 10,
  },
  addBtnText: { color: '#fff', fontSize: 18, fontWeight: '700', marginTop: -2 },
});
