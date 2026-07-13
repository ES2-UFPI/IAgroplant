import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  FlatList,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
} from 'react-native';
import { Post } from '../types/post.types';
import { Comment } from '../../../domain/entities/comment.entity';
import { useComments } from '../hooks/useComments';

// ─── COMMENT ITEM ─────────────────────────────────────────────────────────────

function CommentItem({ comment }: { comment: Comment }) {
  return (
    <View style={styles.commentRow}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{comment.author.initials}</Text>
      </View>
      <View style={styles.commentBody}>
        <View style={styles.commentHeader}>
          <Text style={styles.authorName}>{comment.author.name}</Text>
          <Text style={styles.metaDot}> · </Text>
          <Text style={styles.metaText}>{comment.author.role}</Text>
        </View>
        <Text style={styles.commentContent}>{comment.content}</Text>
        <Text style={styles.commentTime}>{comment.time}</Text>
      </View>
    </View>
  );
}

// ─── COMMENTS MODAL ───────────────────────────────────────────────────────────

interface CommentsModalProps {
  post: Post | null;
  visible: boolean;
  onClose: () => void;
  onCommentAdded?: (postId: number | string) => void;
}

export function CommentsModal({ post, visible, onClose, onCommentAdded }: CommentsModalProps) {
  const { comments, isLoading, isSubmitting, addComment } = useComments(post?.id ?? null);
  const [content, setContent] = useState('');

  async function handleSend() {
    if (!content.trim() || !post) return;

    const newComment = await addComment(content);
    if (newComment) {
      setContent('');
      onCommentAdded?.(post.id);
    }
  }

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.sheet}
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Comentários</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* List */}
          {isLoading ? (
            <View style={styles.centered}>
              <ActivityIndicator size="small" color="#16A34A" />
            </View>
          ) : (
            <FlatList<Comment>
              data={comments}
              keyExtractor={(item) => String(item.id)}
              renderItem={({ item }) => <CommentItem comment={item} />}
              contentContainerStyle={styles.listContent}
              ListEmptyComponent={
                <View style={styles.empty}>
                  <Text style={styles.emptyEmoji}>💬</Text>
                  <Text style={styles.emptyText}>Seja o primeiro a comentar</Text>
                </View>
              }
            />
          )}

          {/* Input */}
          <View style={styles.inputRow}>
            <TextInput
              value={content}
              onChangeText={setContent}
              placeholder="Escreva um comentário..."
              placeholderTextColor="#9CA3AF"
              style={styles.input}
              multiline
            />
            <TouchableOpacity
              onPress={handleSend}
              style={[styles.sendBtn, (!content.trim() || isSubmitting) && styles.sendBtnDisabled]}
              disabled={!content.trim() || isSubmitting}
            >
              <Text style={styles.sendBtnText}>{isSubmitting ? '...' : 'Enviar'}</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

// ─── STYLES ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(17, 24, 39, 0.5)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
    minHeight: '50%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  title: { fontSize: 16, fontWeight: '700', color: '#111827' },
  closeBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeText: { fontSize: 13, color: '#6B7280', fontWeight: '700' },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 40 },
  listContent: { paddingHorizontal: 16, paddingVertical: 12, flexGrow: 1 },
  empty: { alignItems: 'center', paddingVertical: 40 },
  emptyEmoji: { fontSize: 32 },
  emptyText: { fontSize: 13, color: '#9CA3AF', marginTop: 8 },
  commentRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#16A34A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { color: '#fff', fontWeight: '700', fontSize: 12 },
  commentBody: { flex: 1 },
  commentHeader: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap' },
  authorName: { fontWeight: '700', fontSize: 13, color: '#111827' },
  metaDot: { fontSize: 12, color: '#D1D5DB' },
  metaText: { fontSize: 12, color: '#9CA3AF' },
  commentContent: { fontSize: 13, color: '#374151', lineHeight: 19, marginTop: 2 },
  commentTime: { fontSize: 11, color: '#9CA3AF', marginTop: 4 },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 13,
    color: '#374151',
    maxHeight: 100,
  },
  sendBtn: {
    backgroundColor: '#16A34A',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 999,
  },
  sendBtnDisabled: { backgroundColor: '#D1FAE5' },
  sendBtnText: { color: '#fff', fontSize: 13, fontWeight: '700' },
});
