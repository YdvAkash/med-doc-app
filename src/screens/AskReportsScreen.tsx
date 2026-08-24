import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, StatusBar, TextInput, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { colors, spacing, typography } from '../theme';
import { useAuthStore } from '../store/useAuth';
import { askQuestion, getChatHistory } from '../services/api';
import Markdown from 'react-native-markdown-display';

type Props = {
  navigation: any;
};

type ChatMessage = {
  id: number | string;
  messageType: 'user_question' | 'ai_response';
  content: string;
  createdAt?: string;
};

export const AskReportsScreen: React.FC<Props> = ({ navigation }) => {
  const [inputText, setInputText] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  
  const { user } = useAuthStore();
  const initials = (user?.name || user?.email || 'U').slice(0, 2).toUpperCase();

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      setIsLoading(true);
      const res = await getChatHistory(0, 50);
      if (res.success && res.data && res.data.content) {
        // Backend returns paginated response, sorted by newest first (descending)
        // We need it in ascending order to render from top to bottom.
        const reversed = res.data.content.reverse();
        setMessages(reversed);
      }
    } catch (error) {
      console.error('Error fetching chat history:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSend = async () => {
    if (!inputText.trim()) return;
    
    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      messageType: 'user_question',
      content: inputText.trim(),
    };
    
    setMessages(prev => [...prev, userMsg]);
    const question = inputText.trim();
    setInputText('');
    setIsTyping(true);
    
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);

    try {
      const res = await askQuestion(question);
      if (res.success && res.data) {
        setMessages(prev => [...prev, res.data]);
      }
    } catch (error) {
      console.error('Error asking question:', error);
    } finally {
      setIsTyping(false);
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  };
  
  const handleSuggestion = (text: string) => {
    setInputText(text);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.surface} />
      


      <KeyboardAvoidingView 
        style={styles.keyboardView} 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView 
          ref={scrollViewRef}
          contentContainerStyle={styles.content} 
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
        >
          {/* Header Section */}
          <View style={styles.headerSection}>
            <Text style={styles.title}>Ask Your Reports</Text>
            <Text style={styles.subtitle}>Ask simple questions about your reports.</Text>
          </View>

          {/* Chat History */}
          <View style={styles.chatHistory}>
            {/* AI Welcome Message */}
            <View style={[styles.messageRow, styles.messageRowLeft]}>
              <View style={styles.botAvatar}>
                <MaterialIcons name="smart-toy" size={20} color={colors.primary} />
              </View>
              <View style={[styles.messageBubble, styles.messageBubbleLeft]}>
                <Markdown style={markdownStyles}>
                  Hello! I'm here to help you understand your medical records. What would you like to know?
                </Markdown>
                
                {messages.length === 0 && (
                  <>
                    <Text style={styles.suggestedTitle}>SUGGESTED QUESTIONS:</Text>
                    <View style={styles.suggestedChips}>
                      <TouchableOpacity style={styles.chip} onPress={() => handleSuggestion("What was my blood sugar last year?")}>
                        <Text style={styles.chipText}>"What was my blood sugar last year?"</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.chip} onPress={() => handleSuggestion("Explain my latest blood test.")}>
                        <Text style={styles.chipText}>"Explain my latest blood test."</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.chip} onPress={() => handleSuggestion("What was my latest HbA1c?")}>
                        <Text style={styles.chipText}>"What was my latest HbA1c?"</Text>
                      </TouchableOpacity>
                    </View>
                  </>
                )}
              </View>
            </View>

            {isLoading && messages.length === 0 ? (
              <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 20 }} />
            ) : (
              messages.map((msg) => {
                const isUser = msg.messageType === 'user_question';
                
                return (
                  <View key={msg.id} style={[styles.messageRow, isUser ? styles.messageRowRight : styles.messageRowLeft]}>
                    {!isUser && (
                      <View style={styles.botAvatar}>
                        <MaterialIcons name="smart-toy" size={20} color={colors.primary} />
                      </View>
                    )}
                    
                    <View style={[styles.messageBubble, isUser ? styles.messageBubbleRight : styles.messageBubbleLeft]}>
                      {isUser ? (
                        <Text style={styles.messageTextRight}>
                          {msg.content}
                        </Text>
                      ) : (
                        <Markdown style={markdownStyles}>
                          {msg.content}
                        </Markdown>
                      )}
                    </View>
                    
                    {isUser && (
                      <View style={styles.userAvatar}>
                        <Text style={styles.userAvatarText}>{initials}</Text>
                      </View>
                    )}
                  </View>
                );
              })
            )}
            
            {isTyping && (
              <View style={[styles.messageRow, styles.messageRowLeft]}>
                 <View style={styles.botAvatar}>
                  <MaterialIcons name="smart-toy" size={20} color={colors.primary} />
                </View>
                <View style={[styles.messageBubble, styles.messageBubbleLeft, { padding: 12 }]}>
                  <ActivityIndicator size="small" color={colors.primary} />
                </View>
              </View>
            )}
          </View>
        </ScrollView>

        {/* Input Area */}
        <View style={styles.inputArea}>
          <View style={styles.inputContainer}>
            <TouchableOpacity style={styles.micButton}>
              <MaterialIcons name="mic" size={24} color={colors['on-surface-variant']} />
            </TouchableOpacity>
            
            <TextInput 
              style={styles.textInput}
              placeholder="Ask about your reports..."
              placeholderTextColor={colors['on-surface-variant']}
              value={inputText}
              onChangeText={setInputText}
              multiline
            />
            
            <TouchableOpacity style={styles.sendButton} onPress={handleSend} disabled={isTyping || !inputText.trim()}>
              <View style={[styles.sendButtonContainer, (!inputText.trim() || isTyping) && { backgroundColor: colors['surface-container-highest'] }]}>
                <MaterialIcons name="send" size={18} color={(!inputText.trim() || isTyping) ? colors['on-surface-variant'] : colors['on-primary']} />
              </View>
            </TouchableOpacity>
          </View>
          
          <View style={styles.disclaimerContainer}>
            <MaterialIcons name="info" size={14} color={colors['on-surface-variant']} />
            <Text style={styles.disclaimerText}>MedDoc helps you understand your records. It does not replace a doctor.</Text>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  keyboardView: {
    flex: 1,
  },
  appBar: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors['outline-variant'],
  },
  iconButton: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 24,
  },
  appBarTitle: {
    ...typography.headlineSm,
    color: colors.primary,
    flex: 1,
    textAlign: 'center',
  },
  content: {
    padding: spacing.marginMobile,
    paddingBottom: 24,
  },
  headerSection: {
    alignItems: 'center',
    marginBottom: spacing.stackLg,
  },
  title: {
    ...typography.headlineLgMobile,
    color: colors['on-surface'],
    marginBottom: spacing.stackSm,
    textAlign: 'center',
  },
  subtitle: {
    ...typography.bodyLg,
    color: colors['on-surface-variant'],
    textAlign: 'center',
  },
  chatHistory: {
    gap: 20,
  },
  messageRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    maxWidth: '85%',
  },
  messageRowLeft: {
    alignSelf: 'flex-start',
  },
  messageRowRight: {
    alignSelf: 'flex-end',
  },
  botAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors['primary-container'],
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  userAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  userAvatarText: {
    ...typography.labelMd,
    color: colors['on-primary'],
  },
  messageBubble: {
    padding: 16,
    borderRadius: 16,
  },
  messageBubbleLeft: {
    backgroundColor: colors['surface-container-lowest'],
    borderWidth: 1,
    borderColor: colors['outline-variant'],
    borderTopLeftRadius: 4,
    flex: 1,
  },
  messageBubbleRight: {
    backgroundColor: colors.primary,
    borderTopRightRadius: 4,
  },
  messageText: {
    ...typography.bodyMd,
    color: colors['on-surface'],
    marginBottom: 12,
  },
  messageTextRight: {
    ...typography.bodyMd,
    color: colors['on-primary'],
  },
  suggestedTitle: {
    ...typography.labelMd,
    color: colors['on-surface-variant'],
    marginBottom: 8,
  },
  suggestedChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    backgroundColor: colors['surface-container'],
    borderWidth: 1,
    borderColor: colors['outline-variant'],
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
  },
  chipText: {
    ...typography.labelMd,
    color: colors.primary,
  },
  table: {
    borderWidth: 1,
    borderColor: colors['outline-variant'],
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 16,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: colors['surface-container'],
    padding: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors['outline-variant'],
  },
  th: {
    ...typography.labelMd,
    color: colors['on-surface-variant'],
    flex: 1,
  },
  tableRow: {
    flexDirection: 'row',
    padding: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors['outline-variant'],
    backgroundColor: colors['surface-container-lowest'],
  },
  td: {
    ...typography.bodyMd,
    color: colors['on-surface'],
    flex: 1,
  },
  summaryBox: {
    backgroundColor: colors['primary-container'],
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },
  summaryText: {
    ...typography.bodyMd,
    color: colors['on-primary-container'],
  },
  inputArea: {
    padding: spacing.marginMobile,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors['outline-variant'],
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: colors['surface-container-lowest'],
    borderRadius: 24,
    borderWidth: 1,
    borderColor: colors['outline-variant'],
    padding: 4,
    marginBottom: 8,
  },
  micButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 22,
  },
  textInput: {
    flex: 1,
    minHeight: 44,
    maxHeight: 100,
    paddingHorizontal: 8,
    paddingTop: 12,
    paddingBottom: 12,
    ...typography.bodyMd,
    color: colors['on-surface'],
  },
  sendButton: {
    width: 44,
    height: 44,
  },
  sendButtonContainer: {
    flex: 1,
    borderRadius: 22,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disclaimerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  disclaimerText: {
    ...typography.labelMd,
    fontSize: 12,
    color: colors['on-surface-variant'],
  },
});

const markdownStyles = StyleSheet.create({
  body: {
    ...typography.bodyMd,
    color: colors['on-surface'],
  },
  heading1: {
    ...typography.headlineMd,
    color: colors['on-surface'],
    marginTop: 8,
    marginBottom: 4,
  },
  heading2: {
    ...typography.headlineSm,
    color: colors['on-surface'],
    marginTop: 8,
    marginBottom: 4,
  },
  heading3: {
    ...typography.headlineSm,
    color: colors['on-surface'],
    marginTop: 8,
    marginBottom: 4,
  },
  paragraph: {
    marginTop: 4,
    marginBottom: 4,
  },
  list_item: {
    ...typography.bodyMd,
    color: colors['on-surface'],
    marginVertical: 2,
  },
  strong: {
    fontWeight: 'bold',
    color: colors['on-surface'],
  }
});
