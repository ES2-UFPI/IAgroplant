import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { io, Socket } from 'socket.io-client';
import { useAuth } from '../auth/AuthContext';

const CHAT_SOCKET_URL = 'http://localhost:3001';
const MESSAGE_LIMIT = 500;

const CHAT_ROOMS = [
  'Todas',
  'Geral',
  'Dúvidas Agrícolas',
  'Pragas e Doenças',
  'Solo e Adubação',
  'Irrigação',
  'Plantio e Cultivo',
  'Máquinas Agrícolas',
  'Empregos e Oportunidades',
  'Estudos e Cursos',
  'Bate-papo',
];

type ChatMessage = {
  id: string;
  texto: string;
  tag: string;
  horario: string;
  criado_em: string;
  autor_id: string;
  autor_nome?: string;
};

type OnlineUser = {
  id: string;
  nome?: string;
};

export function ChatScreen() {
  const { user } = useAuth();
  const socketRef = useRef<Socket | null>(null);
  const listRef = useRef<FlatList<ChatMessage>>(null);
  const typingTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const roomRef = useRef('Todas');

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [room, setRoom] = useState('Todas');
  const [selectedTag, setSelectedTag] = useState('Geral');
  const [text, setText] = useState('');
  const [mySocketId, setMySocketId] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([]);
  const [typingUsers, setTypingUsers] = useState<Record<string, boolean>>({});

  const socketPayload = useMemo(() => ({
    userId: user?.id ?? 'visitante',
    name: user?.name ?? 'Usuário',
    role: user?.role ?? 'Comunidade',
  }), [user]);

  useEffect(() => {
    const socket = io(CHAT_SOCKET_URL, {
      transports: ['websocket'],
      auth: socketPayload,
    });

    socketRef.current = socket;

    socket.on('connect', () => setIsConnected(true));
    socket.on('disconnect', () => {
      setIsConnected(false);
      setOnlineUsers([]);
    });
    socket.on('conectado', (data: { id: string }) => setMySocketId(data.id));
    socket.on('historico', (history: ChatMessage[]) => {
      setMessages(history);
      scrollToEnd();
    });
    socket.on('mensagem', (message: ChatMessage) => {
      setMessages((current) => [...current, message]);
      scrollToEnd();
    });
    socket.on('usuariosOnline', (data: { sala: string; usuarios: OnlineUser[] }) => {
      if (data.sala === roomRef.current) setOnlineUsers(data.usuarios);
    });
    socket.on('digitando', (data: { id: string; sala: string }) => {
      if (data.id === socket.id) return;
      if (roomRef.current !== 'Todas' && data.sala !== roomRef.current) return;
      setTypingUsers((current) => ({ ...current, [data.id]: true }));
    });
    socket.on('pararDigitando', (data: { id: string }) => {
      setTypingUsers((current) => {
        const next = { ...current };
        delete next[data.id];
        return next;
      });
    });

    return () => {
      if (typingTimeout.current) clearTimeout(typingTimeout.current);
      socket.disconnect();
      socketRef.current = null;
    };
  }, [socketPayload]);

  function scrollToEnd() {
    requestAnimationFrame(() => listRef.current?.scrollToEnd({ animated: true }));
  }

  function handleRoomChange(nextRoom: string) {
    roomRef.current = nextRoom;
    setRoom(nextRoom);
    setMessages([]);
    setTypingUsers({});
    if (nextRoom !== 'Todas') setSelectedTag(nextRoom);
    socketRef.current?.emit('trocarSala', nextRoom);
  }

  function handleTextChange(value: string) {
    const nextValue = value.slice(0, MESSAGE_LIMIT);
    setText(nextValue);

    if (!nextValue.trim()) {
      socketRef.current?.emit('pararDigitando', { tag: selectedTag });
      return;
    }

    socketRef.current?.emit('digitando', { tag: selectedTag });
    if (typingTimeout.current) clearTimeout(typingTimeout.current);
    typingTimeout.current = setTimeout(() => {
      socketRef.current?.emit('pararDigitando', { tag: selectedTag });
    }, 2500);
  }

  function sendMessage() {
    const trimmedText = text.trim();
    if (!trimmedText || !isConnected) return;

    socketRef.current?.emit('mensagem', {
      texto: trimmedText,
      tag: selectedTag,
      autor_nome: user?.name ?? 'Usuário',
    });
    socketRef.current?.emit('pararDigitando', { tag: selectedTag });
    setText('');
  }

  function renderMessage({ item }: { item: ChatMessage }) {
    const isMine = item.autor_id === mySocketId;

    return (
      <View style={[styles.messageRow, isMine ? styles.myRow : styles.otherRow]}>
        <View style={[styles.bubble, isMine ? styles.myBubble : styles.otherBubble]}>
          {!isMine ? <Text style={styles.author}>{item.autor_nome ?? 'Usuário'}</Text> : null}
          <Text style={[styles.messageText, isMine ? styles.myText : styles.otherText]}>
            {item.texto}
          </Text>
          <View style={styles.messageMeta}>
            <Text style={[styles.tag, isMine && styles.myTag]}>{item.tag}</Text>
            <Text style={[styles.time, isMine && styles.myTime]}>{item.horario}</Text>
          </View>
        </View>
      </View>
    );
  }

  const typingCount = Object.keys(typingUsers).length;
  const writableTags = CHAT_ROOMS.filter((item) => item !== 'Todas');

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Chat IAgroplant</Text>
            <Text style={styles.subtitle}>
              {isConnected ? `${onlineUsers.length} online` : 'Conectando ao servidor...'}
            </Text>
          </View>
          <View style={[styles.statusDot, isConnected ? styles.statusOnline : styles.statusOffline]} />
        </View>

        <View style={styles.rooms}>
          <FlatList
            horizontal
            data={CHAT_ROOMS}
            keyExtractor={(item) => item}
            showsHorizontalScrollIndicator={false}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[styles.roomChip, room === item && styles.roomChipActive]}
                onPress={() => handleRoomChange(item)}
              >
                <Text style={[styles.roomText, room === item && styles.roomTextActive]}>{item}</Text>
              </TouchableOpacity>
            )}
          />
        </View>

        {typingCount > 0 ? (
          <Text style={styles.typingText}>
            {typingCount === 1 ? 'Alguém está digitando...' : 'Algumas pessoas estão digitando...'}
          </Text>
        ) : null}

        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={renderMessage}
          contentContainerStyle={styles.messagesContent}
          ListEmptyComponent={
            <View style={styles.empty}>
              {isConnected ? (
                <Text style={styles.emptyText}>Nenhuma mensagem nesta sala ainda.</Text>
              ) : (
                <>
                  <ActivityIndicator color="#16A34A" />
                  <Text style={styles.emptyText}>Aguardando conexão com o chat.</Text>
                </>
              )}
            </View>
          }
          onContentSizeChange={scrollToEnd}
        />

        <View style={styles.composer}>
          <FlatList
            horizontal
            data={writableTags}
            keyExtractor={(item) => item}
            showsHorizontalScrollIndicator={false}
            style={styles.tagList}
            renderItem={({ item }) => (
              <TouchableOpacity
                disabled={room !== 'Todas'}
                style={[styles.tagChip, selectedTag === item && styles.tagChipActive]}
                onPress={() => setSelectedTag(item)}
              >
                <Text style={[styles.tagChipText, selectedTag === item && styles.tagChipTextActive]}>
                  {item}
                </Text>
              </TouchableOpacity>
            )}
          />
          <View style={styles.inputRow}>
            <TextInput
              value={text}
              onChangeText={handleTextChange}
              placeholder="Escreva sua mensagem..."
              placeholderTextColor="#9CA3AF"
              style={styles.input}
              maxLength={MESSAGE_LIMIT}
              multiline
            />
            <TouchableOpacity
              style={[styles.sendButton, (!text.trim() || !isConnected) && styles.sendButtonDisabled]}
              onPress={sendMessage}
              disabled={!text.trim() || !isConnected}
            >
              <Text style={styles.sendText}>Enviar</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.counter}>{text.length}/{MESSAGE_LIMIT}</Text>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F3F8F2' },
  container: { flex: 1 },
  header: {
    backgroundColor: '#FFFFFF',
    borderBottomColor: '#DDE8D8',
    borderBottomWidth: 1,
    paddingHorizontal: 18,
    paddingVertical: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: { color: '#102A12', fontSize: 20, fontWeight: '800' },
  subtitle: { color: '#6B7280', marginTop: 2 },
  statusDot: { width: 12, height: 12, borderRadius: 6 },
  statusOnline: { backgroundColor: '#16A34A' },
  statusOffline: { backgroundColor: '#D97706' },
  rooms: { backgroundColor: '#FFFFFF', paddingVertical: 10, paddingLeft: 14 },
  roomChip: {
    borderColor: '#D1D5DB',
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 7,
    marginRight: 8,
    backgroundColor: '#FFFFFF',
  },
  roomChipActive: { backgroundColor: '#DCFCE7', borderColor: '#16A34A' },
  roomText: { color: '#4B5563', fontWeight: '600', fontSize: 13 },
  roomTextActive: { color: '#166534' },
  typingText: {
    color: '#6B7280',
    fontSize: 12,
    fontStyle: 'italic',
    paddingHorizontal: 18,
    paddingTop: 8,
  },
  messagesContent: { padding: 14, flexGrow: 1, justifyContent: 'flex-end' },
  empty: { flex: 1, minHeight: 220, alignItems: 'center', justifyContent: 'center', gap: 10 },
  emptyText: { color: '#6B7280', textAlign: 'center' },
  messageRow: { marginBottom: 10, flexDirection: 'row' },
  myRow: { justifyContent: 'flex-end' },
  otherRow: { justifyContent: 'flex-start' },
  bubble: { maxWidth: '82%', borderRadius: 14, paddingHorizontal: 12, paddingVertical: 9 },
  myBubble: { backgroundColor: '#16A34A', borderBottomRightRadius: 4 },
  otherBubble: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderBottomLeftRadius: 4,
  },
  author: { color: '#166534', fontWeight: '800', fontSize: 12, marginBottom: 4 },
  messageText: { fontSize: 15, lineHeight: 21 },
  myText: { color: '#FFFFFF' },
  otherText: { color: '#1F2937' },
  messageMeta: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 7 },
  tag: { color: '#166534', fontSize: 11, fontWeight: '800' },
  myTag: { color: '#DCFCE7' },
  time: { color: '#9CA3AF', fontSize: 11 },
  myTime: { color: '#BBF7D0' },
  composer: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#DDE8D8',
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: 12,
  },
  tagList: { marginBottom: 8 },
  tagChip: {
    borderRadius: 999,
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginRight: 6,
  },
  tagChipActive: { backgroundColor: '#ECFDF5', borderColor: '#16A34A' },
  tagChipText: { color: '#6B7280', fontSize: 12, fontWeight: '600' },
  tagChipTextActive: { color: '#166534' },
  inputRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 8 },
  input: {
    flex: 1,
    minHeight: 44,
    maxHeight: 96,
    borderColor: '#D1D5DB',
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: '#111827',
    backgroundColor: '#FAFAF9',
  },
  sendButton: {
    backgroundColor: '#166534',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 13,
  },
  sendButtonDisabled: { opacity: 0.45 },
  sendText: { color: '#FFFFFF', fontWeight: '800' },
  counter: { color: '#9CA3AF', fontSize: 11, alignSelf: 'flex-end', marginTop: 4 },
});
