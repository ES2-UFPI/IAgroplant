import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  StyleSheet,
  StatusBar,
} from 'react-native';
import { PostCard } from './components/PostCard';
import { FilterBar } from './components/FilterBar';
import { ComposeBox } from './components/ComposeBox';
import { useFeed } from './hooks/useFeed';
import { Post } from './types/post.types';

export function FeedScreen() {
  const { posts, activeFilter, setActiveFilter, toggleLike, publishPost } = useFeed();
  const [showCompose, setShowCompose] = useState(false);

  function handlePublish(type: any, content: string) {
    publishPost(type, content);
    setShowCompose(false);
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
          <Text style={styles.logoText}>IAgroplant</Text>
        </View>
        <TouchableOpacity
          onPress={() => setShowCompose((v) => !v)}
          style={styles.publishBtn}
        >
          <Text style={styles.publishBtnText}>{showCompose ? '✕ Fechar' : '+ Publicar'}</Text>
        </TouchableOpacity>
      </View>

      {/* Filter bar */}
      <FilterBar activeFilter={activeFilter} onSelect={setActiveFilter} />

      {/* Feed list */}
      <FlatList<Post>
        data={posts}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => (
          <PostCard post={item} onLike={toggleLike} />
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
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F9FAFB' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  logo: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: '#16A34A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoEmoji: { fontSize: 18 },
  logoText: { fontSize: 20, fontWeight: '700', color: '#111827', letterSpacing: -0.5 },
  publishBtn: {
    backgroundColor: '#16A34A',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 999,
  },
  publishBtnText: { color: '#fff', fontSize: 13, fontWeight: '700' },
  listContent: { padding: 12, paddingBottom: 32 },
  empty: { alignItems: 'center', paddingVertical: 40 },
  emptyEmoji: { fontSize: 40 },
  emptyText: { fontSize: 14, color: '#9CA3AF', marginTop: 8 },
});