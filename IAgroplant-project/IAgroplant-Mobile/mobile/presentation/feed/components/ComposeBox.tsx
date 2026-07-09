import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { PostType } from '../types/post.types';

interface ComposeBoxProps {
  onPublish: (type: PostType, input: { content: string; image?: string }) => void;
  onClose: () => void;
}

const POST_TYPES: { type: PostType; label: string }[] = [
  { type: 'simple', label: '📝 Post' },
  { type: 'diagnostic', label: '🤖 Diagnóstico' },
  { type: 'opportunity', label: '💼 Vaga' },
];

const PLACEHOLDERS: Record<PostType, string> = {
  simple: 'Compartilhe técnica, dúvida ou observação de campo...',
  diagnostic: 'Descreva os sintomas observados na cultura...',
  opportunity: 'Descreva a vaga ou oportunidade...',
};

export function ComposeBox({ onPublish, onClose }: ComposeBoxProps) {
  const [type, setType] = useState<PostType>('simple');
  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState('');

  function handlePublish() {
    if (!content.trim()) return;
    onPublish(type, {
      content,
      image: imageUrl.trim() !== '' ? imageUrl.trim() : undefined,
    });
    setContent('');
    setImageUrl('');
  }

  return (
    <View style={styles.container}>
      {/* Type selector */}
      <View style={styles.typeRow}>
        {POST_TYPES.map(({ type: t, label }) => (
          <TouchableOpacity
            key={t}
            onPress={() => setType(t)}
            style={[styles.typeChip, type === t && styles.typeChipActive]}
          >
            <Text style={[styles.typeChipText, type === t && styles.typeChipTextActive]}>
              {label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Text input */}
      <TextInput
        value={content}
        onChangeText={setContent}
        placeholder={PLACEHOLDERS[type]}
        placeholderTextColor="#9CA3AF"
        multiline
        numberOfLines={4}
        style={styles.input}
        textAlignVertical="top"
      />

      {/* Image input */}
      <TextInput
        value={imageUrl}
        onChangeText={setImageUrl}
        placeholder="Link da imagem (opcional) - ex: https://..."
        placeholderTextColor="#9CA3AF"
        style={[styles.input, { minHeight: 44, marginTop: 8 }]}
      />

      {/* Actions */}
      <View style={styles.footer}>
        <TouchableOpacity onPress={onClose} style={styles.cancelBtn}>
          <Text style={styles.cancelText}>Cancelar</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={handlePublish}
          style={[styles.publishBtn, !content.trim() && styles.publishBtnDisabled]}
          disabled={!content.trim()}
        >
          <Text style={styles.publishText}>Publicar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    margin: 12,
    padding: 14,
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  typeRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  typeChip: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#fff',
  },
  typeChipActive: { borderColor: '#16A34A', backgroundColor: '#F0FDF4' },
  typeChipText: { fontSize: 12, color: '#6B7280', fontWeight: '400' },
  typeChipTextActive: { color: '#166534', fontWeight: '700' },
  input: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    padding: 12,
    fontSize: 14,
    color: '#374151',
    minHeight: 100,
  },
  footer: { flexDirection: 'row', justifyContent: 'flex-end', gap: 8, marginTop: 10 },
  cancelBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  cancelText: { fontSize: 13, color: '#6B7280' },
  publishBtn: {
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: '#16A34A',
  },
  publishBtnDisabled: { backgroundColor: '#D1FAE5' },
  publishText: { fontSize: 13, color: '#fff', fontWeight: '700' },
});
