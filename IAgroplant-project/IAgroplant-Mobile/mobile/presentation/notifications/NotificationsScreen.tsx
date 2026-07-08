import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { Notification } from '../../domain/entities/notification.types';
import { notificationService } from '../../application/services/notificationService';

export function NotificationsScreen() {
  const navigation = useNavigation<any>();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchNotifications = useCallback(async () => {
    setIsLoading(true);
    try {
      const list = await notificationService.getNotifications();
      // Sort notifications by created_at desc
      const sorted = [...list].sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
      setNotifications(sorted);
    } catch (error) {
      console.error('Erro ao buscar notificações', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchNotifications();
    }, [fetchNotifications])
  );

  const handleMarkAsRead = async (id: string) => {
    const success = await notificationService.markAsRead(id);
    if (success) {
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      );
    }
  };

  const handleMarkAllAsRead = async () => {
    setIsLoading(true);
    const unread = notifications.filter((n) => !n.is_read);
    await Promise.all(unread.map((n) => notificationService.markAsRead(n.id)));
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    setIsLoading(false);
  };

  const formatTime = (isoString: string) => {
    try {
      const date = new Date(isoString);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMs / 3600000);

      if (diffMins < 1) return 'Agora mesmo';
      if (diffMins < 60) return `Há ${diffMins} min`;
      if (diffHours < 24) return `Há ${diffHours} h`;
      
      return date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });
    } catch (e) {
      return '';
    }
  };

  const renderNotificationIcon = (type: string) => {
    switch (type) {
      case 'OPPORTUNITY':
        return <Text style={styles.icon}>💼</Text>;
      case 'CHAT_MESSAGE':
        return <Text style={styles.icon}>💬</Text>;
      case 'SYSTEM':
      default:
        return <Text style={styles.icon}>🔔</Text>;
    }
  };

  const renderItem = ({ item }: { item: Notification }) => (
    <TouchableOpacity
      style={[styles.notificationCard, !item.is_read && styles.unreadCard]}
      onPress={() => handleMarkAsRead(item.id)}
      activeOpacity={0.8}
    >
      <View style={styles.cardHeader}>
        <View style={styles.iconContainer}>
          {renderNotificationIcon(item.type)}
          {!item.is_read && <View style={styles.unreadDot} />}
        </View>
        <View style={styles.textContainer}>
          <Text style={[styles.title, !item.is_read && styles.unreadText]}>
            {item.title}
          </Text>
          <Text style={styles.body}>{item.body}</Text>
          <Text style={styles.time}>{formatTime(item.created_at)}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Notificações</Text>
          {notifications.some((n) => !n.is_read) && (
            <TouchableOpacity onPress={handleMarkAllAsRead} style={styles.markAllButton}>
              <Text style={styles.markAllText}>Ler todas</Text>
            </TouchableOpacity>
          )}
        </View>

        {isLoading && notifications.length === 0 ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#2e7d32" />
          </View>
        ) : notifications.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>📭</Text>
            <Text style={styles.emptyTitle}>Tudo calmo por aqui</Text>
            <Text style={styles.emptySubtitle}>
              Você não tem nenhuma notificação no momento.
            </Text>
            <TouchableOpacity style={styles.refreshButton} onPress={fetchNotifications}>
              <Text style={styles.refreshButtonText}>Atualizar</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList
            data={notifications}
            renderItem={renderItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            onRefresh={fetchNotifications}
            refreshing={isLoading}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333333',
  },
  markAllButton: {
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 5,
  },
  markAllText: {
    color: '#16a34a',
    fontSize: 14,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    padding: 15,
  },
  notificationCard: {
    backgroundColor: '#ffffff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  unreadCard: {
    backgroundColor: '#f0fdf4',
    borderLeftWidth: 4,
    borderLeftColor: '#16a34a',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  iconContainer: {
    marginRight: 15,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
    width: 40,
    height: 40,
    backgroundColor: '#f3f4f6',
    borderRadius: 20,
  },
  icon: {
    fontSize: 20,
  },
  unreadDot: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#dc2626',
    borderWidth: 1.5,
    borderColor: '#ffffff',
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 15,
    fontWeight: '500',
    color: '#4b5563',
    marginBottom: 4,
  },
  unreadText: {
    fontWeight: 'bold',
    color: '#111827',
  },
  body: {
    fontSize: 14,
    color: '#4b5563',
    lineHeight: 18,
    marginBottom: 6,
  },
  time: {
    fontSize: 12,
    color: '#9ca3af',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyIcon: {
    fontSize: 60,
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  refreshButton: {
    backgroundColor: '#2e7d32',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  refreshButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
  },
});
