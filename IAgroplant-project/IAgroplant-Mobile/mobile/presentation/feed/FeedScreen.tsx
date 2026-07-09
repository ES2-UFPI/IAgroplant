import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  StyleSheet,
  StatusBar,
  ActivityIndicator,
  RefreshControl,
  Platform,
} from 'react-native';
import { PostCard } from './components/PostCard';
import { FilterBar } from './components/FilterBar';
import { ComposeBox } from './components/ComposeBox';
import { useFeed } from './hooks/useFeed';
import { Post } from './types/post.types';
import { useProfile } from '../profile/ProfileViewModel';
import { useAuth } from '../auth/AuthContext';

type FeedScreenProps = {
  navigation?: any;
  title?: string;
  initialFilter?: string;
};

export function FeedScreen({ navigation, title = 'IAgroplant', initialFilter = 'Todos' }: FeedScreenProps) {
  const { user } = useAuth();
  const {
    posts,
    activeFilter,
    setActiveFilter,
    isLoading,
    isLoadingMore,
    isPublishing,
    hasMore,
    error,
    loadMore,
    toggleLike,
    verifyPost,
    removePost,
    publishPost,
    refresh,
  } = useFeed(initialFilter);
  const { profile } = useProfile();

  const [showCompose, setShowCompose] = useState(false);

  function handlePublish(type: any, input: { content: string; image?: string }) {
    publishPost(type, {
      ...input,
      authorRole: user?.role ?? 'Estudante',
      region: 'Teresina',
      tags: [],
    }).then(() => setShowCompose(false))
      .catch((e) => alert('Erro ao publicar. Tente novamente.'));
  }

  // ─── ESTADOS DE TELA ──────────────────────────────────────────────────────

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.safe, styles.centered]}>
        <ActivityIndicator size="large" color="#16A34A" />
        <Text style={styles.loadingText}>Carregando feed...</Text>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={[styles.safe, styles.centered]}>
        <Text style={styles.errorEmoji}>⚠️</Text>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity onPress={refresh} style={styles.retryBtn}>
          <Text style={styles.retryText}>Tentar novamente</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.logo}>
            <Text style={styles.logoEmoji}>🌱</Text>
          </View>
          <Text style={styles.logoText}>{title}</Text>
        </View>
        
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <TouchableOpacity
            onPress={() => navigation?.navigate('Notifications')}
            style={styles.notificationHeaderBtn}
          >
            <Text style={styles.notificationHeaderEmoji}>🔔</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setShowCompose((v) => !v)}
            style={styles.publishBtn}
            disabled={isPublishing}
          >
            <Text style={styles.publishBtnText}>
              {isPublishing ? 'Publicando...' : showCompose ? '✕ Fechar' : '+ Publicar'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Filter bar */}
      <FilterBar activeFilter={activeFilter} onSelect={setActiveFilter} />

      {/* Feed list */}
      <FlatList<Post>
        data={posts}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => (
          <PostCard
            post={item}
            onLike={toggleLike}
            canModerate={profile?.certificado}
            currentUserId={profile?.id}
            onVerify={verifyPost}
            onRemove={removePost}
          />
        )}
        ListHeaderComponent={
          showCompose ? (
            <ComposeBox onPublish={handlePublish} onClose={() => setShowCompose(false)} />
          ) : null
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyEmoji}>🌿</Text>
            <Text style={styles.emptyText}>Nenhum post nessa categoria.</Text>
          </View>
        }
        ListFooterComponent={
          isLoadingMore ? (
            <View style={styles.footer}>
              <ActivityIndicator size="small" color="#16A34A" />
            </View>
          ) : !hasMore && posts.length > 0 ? (
            <Text style={styles.footerText}>Você chegou ao fim do feed</Text>
          ) : null
        }
        onEndReached={loadMore}
        onEndReachedThreshold={0.3}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={refresh}
            tintColor="#16A34A"
            colors={['#16A34A']}
          />
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F9FAFB', paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 },
  centered: { alignItems: 'center', justifyContent: 'center', gap: 12 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: '#E5E7EB',
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  logo: {
    width: 34, height: 34, borderRadius: 10,
    backgroundColor: '#16A34A',
    alignItems: 'center', justifyContent: 'center',
  },
  logoEmoji: { fontSize: 18 },
  logoText: { fontSize: 20, fontWeight: '700', color: '#111827', letterSpacing: -0.5 },
  publishBtn: {
    backgroundColor: '#16A34A',
    paddingHorizontal: 14, paddingVertical: 7,
    borderRadius: 999,
  },
  publishBtnText: { color: '#fff', fontSize: 13, fontWeight: '700' },
  notificationHeaderBtn: {
    backgroundColor: '#F3F4F6',
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  notificationHeaderEmoji: {
    fontSize: 16,
  },
  listContent: { padding: 12, paddingBottom: 32 },
  empty: { alignItems: 'center', paddingVertical: 40 },
  emptyEmoji: { fontSize: 40 },
  emptyText: { fontSize: 14, color: '#9CA3AF', marginTop: 8 },
  footer: { paddingVertical: 16, alignItems: 'center' },
  footerText: { textAlign: 'center', color: '#9CA3AF', fontSize: 12, paddingVertical: 16 },
  loadingText: { fontSize: 14, color: '#9CA3AF', marginTop: 8 },
  errorEmoji: { fontSize: 36 },
  errorText: { fontSize: 14, color: '#6B7280', textAlign: 'center', paddingHorizontal: 32 },
  retryBtn: {
    marginTop: 8, backgroundColor: '#16A34A',
    paddingHorizontal: 20, paddingVertical: 10, borderRadius: 999,
  },
  retryText: { color: '#fff', fontWeight: '700', fontSize: 14 },
});
