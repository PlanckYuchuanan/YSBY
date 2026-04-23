import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRoute, RouteProp } from '@react-navigation/native';
import { wsClient, imApi } from '../services/api';
import { RootStackParamList } from '../navigation/AppNavigator';

type ChatRouteProp = RouteProp<RootStackParamList, 'Chat'>;

interface Message {
  id: string;
  type: string;
  content: string;
  senderId: string;
  createdAt: string;
  status?: string;
}

export default function ChatScreen() {
  const route = useRoute<ChatRouteProp>();
  const { conversationId } = route.params;
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    loadMessages();
    setupWebSocket();

    return () => {
      wsClient.off('new_message');
    };
  }, [conversationId]);

  const loadMessages = async () => {
    try {
      // TODO: 调用真实 API
      // const res = await imApi.getMessages(conversationId);
      // if (res.code === 0) setMessages(res.data.list);
    } catch (err) {
      console.error(err);
    }
  };

  const setupWebSocket = async () => {
    try {
      await wsClient.connect();
      wsClient.on('new_message', (msg: any) => {
        if (msg.conversationId === conversationId) {
          setMessages((prev) => [...prev, msg]);
        }
      });
      wsClient.on('message_sent', (msg: any) => {
        setMessages((prev) =>
          prev.map((m) => (m.id === msg.id ? msg : m))
        );
      });
    } catch (err) {
      console.error('WebSocket connection failed:', err);
    }
  };

  const handleSend = () => {
    if (!inputText.trim()) return;

    wsClient.send('send_message', {
      conversationId,
      content: inputText.trim(),
      msgType: 'text',
    });

    setInputText('');
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const isSelf = item.senderId === 'self'; // TODO: compare with current user ID

    return (
      <View style={[styles.messageContainer, isSelf && styles.messageRight]}>
        <View style={[styles.messageBubble, isSelf ? styles.bubbleRight : styles.bubbleLeft]}>
          <Text style={[styles.messageText, isSelf && styles.messageTextRight]}>
            {item.content}
          </Text>
        </View>
        <Text style={styles.messageTime}>
          {new Date(item.createdAt).toLocaleTimeString()}
        </Text>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={90}
    >
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.messageList}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
      />

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={inputText}
          onChangeText={setInputText}
          placeholder="输入消息..."
          multiline
        />
        <TouchableOpacity style={styles.sendBtn} onPress={handleSend}>
          <Text style={styles.sendBtnText}>发送</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  messageList: {
    padding: 16,
  },
  messageContainer: {
    marginBottom: 16,
    alignItems: 'flex-start',
  },
  messageRight: {
    alignItems: 'flex-end',
  },
  messageBubble: {
    maxWidth: '75%',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
  },
  bubbleLeft: {
    backgroundColor: '#fff',
    borderBottomLeftRadius: 4,
  },
  bubbleRight: {
    backgroundColor: '#1890ff',
    borderBottomRightRadius: 4,
  },
  messageText: {
    fontSize: 16,
    color: '#333',
  },
  messageTextRight: {
    color: '#fff',
  },
  messageTime: {
    fontSize: 10,
    color: '#999',
    marginTop: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 12,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    alignItems: 'flex-end',
  },
  input: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    maxHeight: 100,
    fontSize: 16,
  },
  sendBtn: {
    backgroundColor: '#1890ff',
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginLeft: 8,
  },
  sendBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});