import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { Post, DiagnosticPost, OpportunityPost } from '../types/post.types';

// ─── AVATAR ───────────────────────────────────────────────────────────────────

function Avatar({ initials, verified }: { initials: string; verified: boolean }) {
  return (
    <View style={styles.avatarWrapper}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{initials}</Text>
      </View>
      {verified && (
        <View style={styles.verifiedBadge}>
          <Text style={styles.verifiedTick}>✓</Text>
        </View>
      )}
    </View>
  );
}

// ─── BADGE ────────────────────────────────────────────────────────────────────

function TypeBadge({ badge }: { badge: Post['badge'] }) {
  if (!badge) return null;
  return (
    <View style={[styles.typeBadge, { backgroundColor: badge.bg, borderColor: badge.color + '40' }]}>
      <Text style={[styles.typeBadgeText, { color: badge.color }]}>
        {badge.icon} {badge.label}
      </Text>
    </View>
  );
}

// ─── TAG LIST ─────────────────────────────────────────────────────────────────

function TagList({ tags }: { tags?: string[] }) {
  if (!tags || !Array.isArray(tags)) return null;
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tagScroll}>
      {tags.map((tag) => (
        <View key={tag} style={styles.tag}>
          <Text style={styles.tagText}>#{tag}</Text>
        </View>
      ))}
    </ScrollView>
  );
}

// ─── DIAGNOSTIC INFO ──────────────────────────────────────────────────────────

function DiagnosticInfo({ post }: { post: DiagnosticPost }) {
  const severityColor =
    post.severity === 'Alta' ? '#DC2626' : post.severity === 'Moderada' ? '#D97706' : '#16A34A';
  const severityBg =
    post.severity === 'Alta' ? '#FEF2F2' : post.severity === 'Moderada' ? '#FFFBEB' : '#F0FDF4';

  return (
    <View style={styles.infoBox}>
      <View style={styles.infoRow}>
        <View>
          <Text style={styles.infoLabel}>Patógeno identificado</Text>
          <Text style={styles.infoValue}>{post.pathogen}</Text>
        </View>
        <View style={[styles.severityBadge, { backgroundColor: severityBg, borderColor: severityColor + '40' }]}>
          <Text style={[styles.severityText, { color: severityColor }]}>{post.severity}</Text>
        </View>
      </View>
      <View style={styles.disclaimer}>
        <Text style={styles.disclaimerText}>⚠️ {post.disclaimer}</Text>
      </View>
    </View>
  );
}

// ─── OPPORTUNITY INFO ─────────────────────────────────────────────────────────

function OpportunityInfo({ post }: { post: OpportunityPost }) {
  return (
    <View style={styles.opportunityBox}>
      <View style={styles.opportunityItem}>
        <Text style={styles.infoLabel}>Remuneração</Text>
        <Text style={styles.opportunityValue}>{post.salary}</Text>
      </View>
      <View style={styles.opportunityItem}>
        <Text style={styles.infoLabel}>Contrato</Text>
        <Text style={styles.opportunityValue}>{post.duration}</Text>
      </View>
    </View>
  );
}

// ─── POST CARD ────────────────────────────────────────────────────────────────

interface PostCardProps {
  post: Post;
  onLike: (id: number | string) => void;
  canModerate?: boolean;
  currentUserId?: string;
  onVerify?: (id: number | string) => void;
  onRemove?: (id: number | string) => void;
}

export function PostCard({ post, onLike, canModerate, currentUserId, onVerify, onRemove }: PostCardProps) {
  const showModeration = canModerate && post.author.id !== currentUserId;
  return (
    <View style={styles.card}>
      {/* Header */}
      <View style={styles.header}>
        <Avatar initials={post.author.initials} verified={post.author.verified} />
        <View style={styles.headerInfo}>
          <View style={styles.headerTop}>
            <Text style={styles.authorName}>{post.author.name}</Text>
            {post.author.verified && (
              <View style={styles.verifiedChip}>
                <Text style={styles.verifiedChipText}>Verificado</Text>
              </View>
            )}
            <TypeBadge badge={post.badge} />
          </View>
          <View style={styles.headerMeta}>
            <Text style={styles.metaText}>{post.author.role}</Text>
            <Text style={styles.metaDot}> · </Text>
            <Text style={styles.metaText}>📍 {post.region}</Text>
            <Text style={styles.metaDot}> · </Text>
            <Text style={styles.metaText}>{post.time}</Text>
          </View>
        </View>
      </View>

      {/* Content */}
      <View style={styles.body}>
        <Text style={styles.content}>{post.content}</Text>

        {post.type === 'diagnostic' && <DiagnosticInfo post={post as DiagnosticPost} />}
        {post.type === 'opportunity' && <OpportunityInfo post={post as OpportunityPost} />}

        {post.image && (
          <Image source={{ uri: post.image }} style={styles.image} resizeMode="cover" />
        )}

        <TagList tags={post.tags} />
      </View>

      {/* Actions */}
      <View style={styles.actions}>
        <TouchableOpacity
          onPress={() => onLike(post.id)}
          style={[styles.actionBtn, post.liked && styles.actionBtnLiked]}
        >
          <Text style={[styles.actionText, post.liked && styles.actionTextLiked]}>
            {post.liked ? '❤️' : '🤍'} {post.likes}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionBtn}>
          <Text style={styles.actionText}>💬 {post.comments}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionBtn}>
          <Text style={styles.actionText}>↗ Compartilhar</Text>
        </TouchableOpacity>

        {post.type === 'opportunity' && (
          <TouchableOpacity style={styles.applyBtn}>
            <Text style={styles.applyBtnText}>Candidatar-se</Text>
          </TouchableOpacity>
        )}
      </View>

      {showModeration && (
        <View style={styles.moderationRow}>
          {!post.author.verified && (
            <TouchableOpacity style={styles.verifyBtn} onPress={() => onVerify?.(post.id)}>
              <Text style={styles.verifyBtnText}>✓ Marcar como verificado</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity style={styles.removeBtn} onPress={() => onRemove?.(post.id)}>
            <Text style={styles.removeBtnText}>🚫 Remover por violação</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

// ─── STYLES ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 12,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 14,
    paddingBottom: 0,
    gap: 10,
  },
  avatarWrapper: { position: 'relative' },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#16A34A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  verifiedBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#16A34A',
    borderWidth: 2,
    borderColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  verifiedTick: { color: '#fff', fontSize: 8, fontWeight: '700' },
  headerInfo: { flex: 1 },
  headerTop: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 6 },
  authorName: { fontWeight: '700', fontSize: 14, color: '#111827' },
  verifiedChip: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 7,
    paddingVertical: 1,
    borderRadius: 999,
  },
  verifiedChipText: { fontSize: 11, color: '#166534', fontWeight: '700' },
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
    borderWidth: 1,
  },
  typeBadgeText: { fontSize: 11, fontWeight: '700' },
  headerMeta: { flexDirection: 'row', alignItems: 'center', marginTop: 2, flexWrap: 'wrap' },
  metaText: { fontSize: 12, color: '#9CA3AF' },
  metaDot: { fontSize: 12, color: '#D1D5DB' },
  body: { paddingHorizontal: 14, paddingTop: 10 },
  content: { fontSize: 14, color: '#374151', lineHeight: 22 },
  infoBox: {
    marginTop: 10,
    padding: 12,
    backgroundColor: '#FAFAFA',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  infoLabel: { fontSize: 11, color: '#9CA3AF' },
  infoValue: { fontSize: 13, fontWeight: '700', color: '#1F2937', fontStyle: 'italic' },
  severityBadge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 999,
    borderWidth: 1,
  },
  severityText: { fontSize: 12, fontWeight: '700' },
  disclaimer: {
    marginTop: 8,
    padding: 8,
    backgroundColor: '#FFFBEB',
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#F59E0B',
  },
  disclaimerText: { fontSize: 11, color: '#92400E', lineHeight: 16 },
  opportunityBox: {
    marginTop: 10,
    padding: 12,
    backgroundColor: '#F0FDF4',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#BBF7D0',
    flexDirection: 'row',
    gap: 20,
  },
  opportunityItem: {},
  opportunityValue: { fontSize: 13, fontWeight: '700', color: '#166534' },
  image: { width: '100%', height: 180, borderRadius: 10, marginTop: 10 },
  tagScroll: { marginTop: 10, marginBottom: 2 },
  tag: {
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#BBF7D0',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 3,
    marginRight: 6,
  },
  tagText: { fontSize: 12, color: '#166534', fontWeight: '500' },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    marginTop: 12,
    gap: 2,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 4,
  },
  actionBtnLiked: { backgroundColor: '#FEF2F2' },
  actionText: { fontSize: 13, color: '#6B7280', fontWeight: '500' },
  actionTextLiked: { color: '#DC2626' },
  applyBtn: {
    marginLeft: 'auto',
    backgroundColor: '#16A34A',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 999,
  },
  applyBtnText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  moderationRow: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 14,
    paddingBottom: 12,
    paddingTop: 4,
    flexWrap: 'wrap',
  },
  verifyBtn: {
    backgroundColor: '#DCFCE7',
    borderWidth: 1,
    borderColor: '#16A34A',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
  },
  verifyBtnText: { fontSize: 11, color: '#166534', fontWeight: '700' },
  removeBtn: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#DC2626',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
  },
  removeBtnText: { fontSize: 11, color: '#DC2626', fontWeight: '700' },
});
