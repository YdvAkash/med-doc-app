import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView, StatusBar, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { colors, spacing, typography } from '../theme';
import { useAuthStore } from '../store/useAuth';

type Props = {
  navigation: any;
};

export const AskReportsScreen: React.FC<Props> = ({ navigation }) => {
  const [inputText, setInputText] = useState('');
  const { user } = useAuthStore();
  
  const initials = (user?.name || user?.email || 'U').slice(0, 2).toUpperCase();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.surface} />
      
      {/* TopAppBar */}
      <View style={styles.appBar}>
        <TouchableOpacity 
          style={styles.iconButton} 
          onPress={() => navigation.goBack()}
        >
          <MaterialIcons name="arrow-back" size={24} color={colors['on-surface-variant']} />
        </TouchableOpacity>
        
        <Text style={styles.appBarTitle} numberOfLines={1}>MedDoc</Text>
        
        <TouchableOpacity style={styles.iconButton}>
          <MaterialIcons name="translate" size={24} color={colors['on-surface-variant']} />
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView 
        style={styles.keyboardView} 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
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
                <Text style={styles.messageText}>Hello! I'm here to help you understand your medical records. What would you like to know?</Text>
                
                <Text style={styles.suggestedTitle}>SUGGESTED QUESTIONS:</Text>
                <View style={styles.suggestedChips}>
                  <TouchableOpacity style={styles.chip}>
                    <Text style={styles.chipText}>"What was my blood sugar last year?"</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.chip}>
                    <Text style={styles.chipText}>"Explain my latest blood test."</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.chip}>
                    <Text style={styles.chipText}>"What was my latest HbA1c?"</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            {/* User Message */}
            <View style={[styles.messageRow, styles.messageRowRight]}>
              <View style={[styles.messageBubble, styles.messageBubbleRight]}>
                <Text style={styles.messageTextRight}>What was my blood sugar last year?</Text>
              </View>
              <View style={styles.userAvatar}>
                <Text style={styles.userAvatarText}>{initials}</Text>
              </View>
            </View>

            {/* AI Response */}
            <View style={[styles.messageRow, styles.messageRowLeft]}>
              <View style={styles.botAvatar}>
                <MaterialIcons name="smart-toy" size={20} color={colors.primary} />
              </View>
              <View style={[styles.messageBubble, styles.messageBubbleLeft]}>
                <Text style={styles.messageText}>Here is a summary of your fasting blood sugar readings from last year based on your lab reports:</Text>
                
                <View style={styles.table}>
                  <View style={styles.tableHeader}>
                    <Text style={styles.th}>Date</Text>
                    <Text style={[styles.th, { textAlign: 'right' }]}>Value (mg/dL)</Text>
                  </View>
                  <View style={styles.tableRow}>
                    <Text style={styles.td}>Mar 15, 2023</Text>
                    <Text style={[styles.td, { textAlign: 'right', color: colors.error, fontWeight: '500' }]}>125</Text>
                  </View>
                  <View style={styles.tableRow}>
                    <Text style={styles.td}>Sep 10, 2023</Text>
                    <Text style={[styles.td, { textAlign: 'right', color: colors.primary, fontWeight: '500' }]}>108</Text>
                  </View>
                </View>

                <View style={styles.summaryBox}>
                  <Text style={styles.summaryText}>
                    <Text style={{ fontWeight: 'bold' }}>Summary:</Text> Your blood sugar went down from 125 to 108 mg/dL. Great progress!
                  </Text>
                </View>
              </View>
            </View>
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
            
            <TouchableOpacity style={styles.sendButton}>
              <View style={styles.sendButtonContainer}>
                <MaterialIcons name="send" size={18} color={colors['on-primary']} />
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
