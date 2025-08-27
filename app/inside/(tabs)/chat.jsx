import { Feather } from '@expo/vector-icons';
import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { API_URL } from '../../../constants/api';
import COLORS from '../../../constants/colors';
import { useAuthStore } from "../../../store/authStore";

const ChatScreen = () => {
  const { token, user } = useAuthStore();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const flatListRef = useRef(null);

  const fetchMessages = async () => {
    try {
      const res = await fetch(`${API_URL}/v1/chat/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.messages)) {
        // Add a unique key for each message
        const messagesWithKeys = data.messages.map((msg, index) => ({
          ...msg,
          id: msg.timestamp ? `${msg.timestamp}-${msg.role}` : `msg-${index}`,
        }));
        setMessages(messagesWithKeys);
      }
    } catch (error) {
      console.error('Fetch chat failed:', error);
    }
  };

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = {
      id: `user-${Date.now()}`, // unique ID
      role: 'user',
      message: input,
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/v1/chat/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ message: input }),
      });

      const data = await res.json();
      if (data.reply) {
        const botMessage = {
          id: `bot-${Date.now()}`, // unique ID
          role: 'llm',
          message: data.reply,
          timestamp: new Date().toISOString(),
        };
        setMessages(prev => [...prev, botMessage]);
      }
    } catch (err) {
      console.error('Send message error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  useEffect(() => {
    flatListRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  const renderItem = ({ item }) => {
    const isUser = item.role === 'user';
    const formattedTime = new Date(item.timestamp).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });

    return (
      <View style={[styles.messageRow, isUser ? styles.rowEnd : styles.rowStart]}>
        {!isUser && (
          <Image source={require('../../../assets/images/finvisk-half-logo.png')} style={styles.avatar} />
        )}
        <View style={[styles.messageBubbleContainer, isUser ? styles.userBubbleContainer : styles.botBubbleContainer]}>
          <View style={[styles.messageBubble, isUser ? styles.userBubble : styles.botBubble]}>
            <Text style={[styles.messageText, isUser ? styles.userText : styles.botText]}>
              {item.message}
            </Text>
          </View>
          <Text style={styles.timestamp}>{formattedTime}</Text>
        </View>
        {isUser && (
          <Image source={{uri: user?.profileImage}} style={styles.avatar} />
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Chat Header */}
      <View style={styles.header}>
        {/* <TouchableOpacity onPress={() => {}} style={styles.backButton}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity> */}
        <Image source={require('../../../assets/images/finvisk-half-logo.png')} style={styles.headerAvatar} />
        <View style={styles.headerTextContainer}>
          <Text style={styles.userName}>Finvisk AI</Text>
          <Text style={styles.userStatus}>Online</Text>
        </View>
      </View>

      {/* Messages Area */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id} // now stable!
          renderItem={renderItem}
          contentContainerStyle={styles.chatArea}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyChat}>
              <Text style={styles.emptyChatText}>
                This is the beginning of your conversation.
              </Text>
            </View>
          }
        />

        {/* Input Area */}
        <View style={styles.inputArea}>
          <View style={styles.inputContainer}>
            <TextInput
              value={input}
              onChangeText={setInput}
              placeholder="Type your message..."
              style={styles.textInput}
              multiline
              editable={!loading}
            />
          </View>
          <TouchableOpacity
            onPress={sendMessage}
            disabled={loading || !input.trim()}
            style={[
              styles.sendButton,
              !input.trim() || loading ? styles.sendButtonDisabled : styles.sendButtonActive,
            ]}
          >
            {loading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              // <Text style={styles.sendButtonText}>Send</Text>
              <Feather name='send' size={20} color="white"/>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default ChatScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // backgroundColor: '#F5F8FA',
    backgroundColor: COLORS.background
  },
  flex: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E8F5FE',
    backgroundColor: '#FFFFFF',
  },
  backButton: {
    marginRight: 12,
  },
  backButtonText: {
    fontSize: 24,
    color: '#1DA1F2',
  },
  headerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  headerTextContainer: {
    flex: 1,
  },
  userName: {
    fontWeight: '600',
    fontSize: 16,
    color: '#14171A',
  },
  userStatus: {
    fontSize: 12,
    color: '#657786',
  },
  chatArea: {
    padding: 16,
    flexGrow: 1,
  },
  emptyChat: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyChatText: {
    fontSize: 14,
    color: '#657786',
    textAlign: 'center',
  },
  messageRow: {
    flexDirection: 'row',
    marginBottom: 12,
    alignItems: 'flexEnd',
  },
  rowStart: {
    justifyContent: 'flexStart',
  },
  rowEnd: {
    justifyContent: 'flexEnd',
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginHorizontal: 6,
  },
  messageBubbleContainer: {
    maxWidth: '75%',
    flexDirection: 'column',
  },
  botBubbleContainer: {
    alignItems: 'flexStart',
  },
  userBubbleContainer: {
    alignItems: 'flexEnd',
  },
  messageBubble: {
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginBottom: 4,
  },
  userBubble: {
    backgroundColor: '#1DA1F2',
    borderBottomRightRadius: 4,
  },
  botBubble: {
    backgroundColor: '#E1E8ED',
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 15,
  },
  userText: {
    color: '#FFFFFF',
  },
  botText: {
    color: '#14171A',
  },
  timestamp: {
    fontSize: 11,
    color: '#657786',
    textAlign: 'right',
  },
  inputArea: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#E8F5FE',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
  },
  inputContainer: {
    flex: 1,
    backgroundColor: '#E1E8ED',
    borderRadius: 30,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginRight: 10,
  },
  textInput: {
    fontSize: 15,
    color: '#14171A',
  },
  sendButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonActive: {
    // backgroundColor: '#1DA1F2',
    backgroundColor: COLORS.black
  },
  sendButtonDisabled: {
    backgroundColor: '#CCD6DD',
  },
  sendButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
});