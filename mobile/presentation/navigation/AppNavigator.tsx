import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text, StyleSheet } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

import { FeedScreen } from '../feed';

function ChatScreen() {
  return (
    <View style={placeholder.container}>
      <Ionicons name="chatbubble-ellipses-outline" size={48} color="#9CA3AF" />
      <Text style={placeholder.title}>Chat</Text>
      <Text style={placeholder.sub}>Em desenvolvimento — Socket.io</Text>
    </View>
  );
}

function NotificationsScreen() {
  return (
    <View style={placeholder.container}>
      <Ionicons name="notifications-outline" size={48} color="#9CA3AF" />
      <Text style={placeholder.title}>Notificações</Text>
      <Text style={placeholder.sub}>Em desenvolvimento — Firebase Cloud Messaging</Text>
    </View>
  );
}

function ProfileScreen() {
  return (
    <View style={placeholder.container}>
      <Ionicons name="person-circle-outline" size={48} color="#9CA3AF" />
      <Text style={placeholder.title}>Perfil</Text>
      <Text style={placeholder.sub}>Em desenvolvimento — Firebase Auth</Text>
    </View>
  );
}

function AIScreen() {
  return (
    <View style={placeholder.container}>
      <Ionicons name="sparkles-outline" size={48} color="#9CA3AF" />
      <Text style={placeholder.title}>Assistente IA</Text>
      <Text style={placeholder.sub}>Em desenvolvimento — GPT-4o Vision / Gemini</Text>
    </View>
  );
}

const placeholder = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: '#F9FAFB' },
  title: { fontSize: 16, fontWeight: '600', color: '#374151' },
  sub: { fontSize: 13, color: '#9CA3AF' },
});

function TabBadge({ count }: { count: number }) {
  if (!count) return null;
  return (
    <View style={styles.badge}>
      <Text style={styles.badgeText}>{count > 9 ? '9+' : count}</Text>
    </View>
  );
}

const Tab = createBottomTabNavigator();

export function AppNavigator() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarStyle: styles.tabBar,
          tabBarActiveTintColor: '#16A34A',
          tabBarInactiveTintColor: '#9CA3AF',
          tabBarLabelStyle: styles.tabLabel,
        }}
      >
        <Tab.Screen
          name="Feed"
          component={FeedScreen}
          options={{
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="home-outline" size={size} color={color} />
            ),
          }}
        />

        <Tab.Screen
          name="Chat"
          component={ChatScreen}
          options={{
            tabBarIcon: ({ color, size }) => (
              <View>
                <Ionicons name="chatbubble-ellipses-outline" size={size} color={color} />
                <TabBadge count={3} />
              </View>
            ),
          }}
        />

        <Tab.Screen
          name="IA"
          component={AIScreen}
          options={{
            tabBarIcon: ({ focused }) => (
              <View style={[styles.aiBtn, focused && styles.aiBtnActive]}>
                <Ionicons name="sparkles-outline" size={22} color="#fff" />
              </View>
            ),
            tabBarLabel: () => null,
          }}
        />

        <Tab.Screen
          name="Avisos"
          component={NotificationsScreen}
          options={{
            tabBarIcon: ({ color, size }) => (
              <View>
                <Ionicons name="notifications-outline" size={size} color={color} />
                <TabBadge count={2} />
              </View>
            ),
          }}
        />

        <Tab.Screen
          name="Perfil"
          component={ProfileScreen}
          options={{
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="person-circle-outline" size={size} color={color} />
            ),
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: '#fff',
    borderTopWidth: 0.5,
    borderTopColor: '#E5E7EB',
    height: 60,
    paddingBottom: 8,
    paddingTop: 6,
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '500',
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -8,
    backgroundColor: '#DC2626',
    borderRadius: 999,
    minWidth: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
    borderWidth: 1.5,
    borderColor: '#fff',
  },
  badgeText: {
    color: '#fff',
    fontSize: 9,
    fontWeight: '700',
  },
  aiBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#7C3AED',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  aiBtnActive: {
    backgroundColor: '#6D28D9',
  },
});