import React, { useState, useRef, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Keyboard,
  TouchableWithoutFeedback,
  PermissionsAndroid,
  ScrollView,
  Animated,
  Dimensions,
  Pressable,
  Easing,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
// import { KBTag, KBPressable } from 'kb-core/src/kbcomponentsV2';
// import SpeechModule from './SpeechService';
// import { kbcrud } from 'kb-core/src';
// import { configType } from '@kotak/utils';

interface Message {
  id: string;
  text: string;
  timestamp: Date;
  type: 'user' | 'response' | 'error' | 'loading';
}

interface ChatModalProps {
  visible: boolean;
  onClose: () => void;
  onMicPress?: () => void;
  placeholder?: string;
  title?: string;
  apiEndpoint?: string;
}

const PRECONFIGURED_QUERIES = [
  'What is my total account balance?',
  'When will my fixed deposit mature?',
  'What is the status of my debit/credit cards?',
  'Give me summary of my overall relationship with bank.',
  'When is my next loan EMI due?',
  'what is the outstanding amount on my loan account?',
];

const LOADING_MESSAGES = [
  'thinking...',
  'fetching account data',
  'let me check',
  'crunching the numbers',
  'putting it together',
  'just a moment',
  'reviewing your details',
  'checking latest info',
  'processing your request',
  'gathering insights now',
  'polishing the numbers',
  'retrieving your info',
  'geting things lined up',
  'retrieving secure records',
];

const ChatModal: React.FC<ChatModalProps> = ({
  visible,
  onClose,
  placeholder = 'Type a message...',
  title = 'Chat',
  apiEndpoint = 'graphlql-ai-agent/v1/chat/completions',
}) => {
  const [inputText, setInputText] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentLoadingMessage, setCurrentLoadingMessage] = useState('');
  const flatListRef = useRef<FlatList>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [showPreconfiguredQueries, setShowPreconfiguredQueries] = useState(true);
  const loadingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const currentLoadingIndexRef = useRef(0);
  const [showMicPopup, setShowMicPopup] = useState(false);
  const micAnimationValue = useRef(new Animated.Value(0)).current;
  const screenWidth = Dimensions.get('window').width;

  // Clear messages when modal closes
  useEffect(() => {
    if (!visible) {
      setMessages([]);
      setInputText('');
      setShowPreconfiguredQueries(true);
      setCurrentLoadingMessage('');
      if (loadingIntervalRef.current) {
        clearInterval(loadingIntervalRef.current);
      }
      setShowMicPopup(false);
    }
  }, [visible]);

  const startLoadingAnimation = () => {
    currentLoadingIndexRef.current = 0;

    // Set initial loading message
    setCurrentLoadingMessage(LOADING_MESSAGES[0]);

    // Cycle through loading messages in endless loop
    loadingIntervalRef.current = setInterval(() => {
      currentLoadingIndexRef.current = (currentLoadingIndexRef.current + 1) % LOADING_MESSAGES.length;
      setCurrentLoadingMessage(LOADING_MESSAGES[currentLoadingIndexRef.current]);
    }, 800);
  };

  const stopLoadingAnimation = () => {
    if (loadingIntervalRef.current) {
      clearInterval(loadingIntervalRef.current);
      loadingIntervalRef.current = null;
    }
    // Clear the loading message
    setCurrentLoadingMessage('');
  };

  const makeAPICall = async (messageText: string) => {
    try {
      startLoadingAnimation();

      //temporary --> Add 5 seconds delay before making the API call and stopping the loading animation
      //await new Promise((resolve) => setTimeout(resolve, 4000));

    //   const axios = kbcrud.Service;
    //   const response = await axios
    //     .send({
    //       configType: configType.standard,
    //       baseurl: 'https://uat.mb2.kotak.com/api/',
    //       method: 'POST',
    //       url: apiEndpoint,
    //       obj: {
    //         messages: [
    //           {
    //             role: 'user',
    //             content: messageText,
    //           },
    //         ],
    //       },
    //       headers: {
    //         'Content-Type': 'application/json',
    //         'X-Session-ID': '2',
    //       },
    //     })
    //     .catch((err) => {
    //       //alert(JSON.stringify(err));
    //       return Promise.reject(err);
    //     });

      stopLoadingAnimation();

      //alert(JSON.stringify(response.data));

    //   if (!response.ok) {
    //     //throw new Error(`HTTP error! status: ${response.status}`);
    //   }

    //   const answer = response.data.choices[0].message || {};

    //   const responseMessage: Message = {
    //     id: (Date.now() + 1).toString(),
    //     text:  answer.content || `Response received for: "${messageText}"`,
    //     timestamp: new Date(),
    //     type: 'response',
    //   };

    //   setMessages((prevMessages) => [...prevMessages, responseMessage]);
    } catch (error) {
      stopLoadingAnimation();

      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: `Failed to send: "${messageText}". Please try again.`,
        timestamp: new Date(),
        type: 'error',
      };

      setMessages((prevMessages) => [...prevMessages, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

//   const handleStopSpeaking = async () => {
//     try {
//       await SpeechModule.stop();
//       setIsSpeaking(false);
//     } catch (error) {
//       console.error('Error stopping speech:', error);
//     }
//   };

  const handleMessagePress = async (message: Message) => {
    if (!message.text.trim()) {
      Alert.alert('No Text', 'Please enter some text to speak');
      return;
    }

    // if (isSpeaking) {
    //   await handleStopSpeaking();
    //   return;
    // }

    // setIsSpeaking(true);
    // try {
    //   await SpeechModule.speak(message.text, 'en-US');
    // } catch (error: any) {
    //   Alert.alert('Error', error.message || 'Failed to speak text');
    // } finally {
    //   setIsSpeaking(false);
    // }
  };

  const dismissKeyboard = () => {
    Keyboard.dismiss();
  };

  const handleInput = (voiceMessage: string) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      text: voiceMessage.trim(),
      timestamp: new Date(),
      type: 'user',
    };

    setMessages((prevMessages) => [...prevMessages, userMessage]);
    setIsLoading(true);
    // Remove this line to keep queries visible:
    // setShowPreconfiguredQueries(false);
    makeAPICall(voiceMessage.trim());
  };

  const handleSend = async () => {
    if (inputText.trim() === '' || isLoading) return;

    Keyboard.dismiss();

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText.trim(),
      timestamp: new Date(),
      type: 'user',
    };

    setMessages((prevMessages) => [...prevMessages, userMessage]);
    setInputText('');
    setIsLoading(true);
    // Remove this line to keep queries visible:
    // setShowPreconfiguredQueries(false);
    makeAPICall(inputText.trim());
  };

  const handlePreconfiguredQuery = (query: string) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      text: query,
      timestamp: new Date(),
      type: 'user',
    };

    setMessages((prevMessages) => [...prevMessages, userMessage]);
    setIsLoading(true);
    // Remove this line to keep queries visible:
    // setShowPreconfiguredQueries(false);
    makeAPICall(query);
  };

//   const handleMicPress = () => {
//     isRecording ? handleStopRecording() : handleStartRecording();
//   };

//   const startMicAnimation = () => {
//     Animated.loop(
//       Animated.sequence([
//         Animated.timing(micAnimationValue, {
//           toValue: 1,
//           duration: 600,
//           useNativeDriver: false,
//         }),
//         Animated.timing(micAnimationValue, {
//           toValue: 0,
//           duration: 600,
//           useNativeDriver: false,
//         }),
//       ])
//     ).start();
//   };

//   const handleStartRecording = async () => {
//     const hasPermission = await requestMicrophonePermission();
//     if (!hasPermission) {
//       Alert.alert('Permission Denied', 'Microphone permission is required for speech recognition');
//       return;
//     }

//     setIsRecording(true);
//     setShowMicPopup(true);
//     startMicAnimation();

//     try {
//       const result = await SpeechModule.startSpeechRecognition('en-US');
//       handleInput(result);
//     } catch (error: any) {
//       Alert.alert('Error', error.message || 'Failed to recognize speech');
//     } finally {
//       setIsRecording(false);
//       setShowMicPopup(false);
//       micAnimationValue.setValue(0);
//     }
//   };

//   const handleStopRecording = async () => {
//     try {
//       await SpeechModule.stopSpeechRecognition();
//     } catch (error) {
//       console.error('Error stopping recording:', error);
//     } finally {
//       setIsRecording(false);
//       setShowMicPopup(false);
//       micAnimationValue.setValue(0);
//     }
//   };

//   const requestMicrophonePermission = async (): Promise<boolean> => {
//     if (Platform.OS === 'android') {
//       try {
//         const granted = await PermissionsAndroid.request(
//           PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
//           {
//             title: 'Microphone Permission',
//             message: 'This app needs access to your microphone for speech recognition',
//             buttonNeutral: 'Ask Me Later',
//             buttonNegative: 'Cancel',
//             buttonPositive: 'OK',
//           },
//         );
//         return granted === PermissionsAndroid.RESULTS.GRANTED;
//       } catch (err) {
//         return false;
//       }
//     }
//     return true;
//   };

//   const renderMicPopup = () => {
//     if (!showMicPopup) return null;

//     const scale = micAnimationValue.interpolate({
//       inputRange: [0, 1],
//       outputRange: [1, 1.2],
//     });

//     const opacity = micAnimationValue.interpolate({
//       inputRange: [0, 1],
//       outputRange: [0.6, 1],
//     });

//     return (
//       <Modal transparent visible={showMicPopup} animationType="fade">
//         <View style={styles.micPopupOverlay}>
//           <View style={styles.micPopupContainer}>
//             <Text style={styles.micPopupTitle}>Listening...</Text>

//             <Animated.View
//               style={[
//                 styles.micWaveContainer,
//                 { transform: [{ scale }], opacity },
//               ]}
//             >
//               <Text style={styles.micPopupIcon}>🎤</Text>
//             </Animated.View>

//             <Text style={styles.micPopupSubtitle}>Speak now</Text>

//             <TouchableOpacity
//               style={styles.micCancelButton}
//               onPress={handleStopRecording}
//               activeOpacity={0.7}
//             >
//               <Text style={styles.micCancelButtonText}>Cancel</Text>
//             </TouchableOpacity>
//           </View>
//         </View>
//       </Modal>
//     );
//   };

  const renderMessage = ({ item }: { item: Message }) => {
    const isUser = item.type === 'user';
    const isError = item.type === 'error';
    const isResponse = item.type === 'response';

    return (
      <TouchableOpacity
        onPress={() => handleMessagePress(item)}
        activeOpacity={0.7}
      >
        <View
          style={[
            styles.messageBubble,
            isUser && styles.userBubble,
            isResponse && styles.responseBubble,
            isError && styles.errorBubble,
          ]}
        >
          <Text
            style={[
              styles.messageText,
              isUser && styles.userMessageText,
              isResponse && styles.responseMessageText,
              isError && styles.errorMessageText,
            ]}
          >
            {item.text}
          </Text>
          <Text
            style={[
              styles.timestamp,
              isUser && styles.userTimestamp,
              (isResponse || isError) && styles.responseTimestamp,
            ]}
          >
            {item.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  const renderPreconfiguredQueries = () => {
    if (!showPreconfiguredQueries) return null;

    // Create endless circular array by repeating queries
    const endlessQueries = Array(10)
      .fill(null)
      .flatMap(() => PRECONFIGURED_QUERIES);

    return (
      <View style={styles.queriesContainer}>
        <Text style={styles.queriesTitle}>Popular Queries</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.queriesScrollContent}
          scrollEventThrottle={16}
        >
          {endlessQueries.map((query, index) => (
            <Pressable
              key={index}
              onPress={() => handlePreconfiguredQuery(query)}
              style={styles.queryTag}
            >
              {/* <KBTag
                title={query}
                containerStyle={styles.queryTagContainer}
                textStyle={styles.queryTagTitle}
              /> */}
              <Text style={styles.queryTagTitle}>{query}</Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>
    );
  };


const FeedbackToast = ({
  message,
  visible,
}: {
  message: string;
  visible: boolean;
}) => {
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.timing(opacity, {
        toValue: 1,
        duration: 200,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
      }).start(() => {
        setTimeout(() => {
          Animated.timing(opacity, {
            toValue: 0,
            duration: 300,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }).start();
        }, 2000);
      });
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <Animated.View style={[styles.toast, { opacity }]}>
      <Text style={styles.toastText}>{message}</Text>
    </Animated.View>
  );
};


  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>{title}</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
        </View>

        {/* Preconfigured Queries - Fixed on Top */}
        {showPreconfiguredQueries && renderPreconfiguredQueries()}

        {/* Chat Messages */}
        <KeyboardAvoidingView
          style={styles.chatContainer}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 20 : 20}
        >
          <TouchableWithoutFeedback onPress={dismissKeyboard}>
            <View style={styles.chatContent}>
              {messages.length === 0 ? (
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyText}>No messages yet. Start a conversation!</Text>
                </View>
              ) : (
                <FlatList
                  ref={flatListRef}
                  data={messages}
                  renderItem={renderMessage}
                  keyExtractor={(item) => item.id}
                  contentContainerStyle={styles.messagesList}
                  onContentSizeChange={() =>
                    flatListRef.current?.scrollToEnd({ animated: true })
                  }
                  ListFooterComponent={
                    currentLoadingMessage ? (
                      <View style={styles.loadingRowContainer}>
                        <ScrollView
                          horizontal
                          showsHorizontalScrollIndicator={false}
                          scrollEventThrottle={16}
                        >
                          <View style={styles.loadingMessageBubble}>
                            <Text style={styles.loadingMessageText}>{currentLoadingMessage}</Text>
                          </View>
                        </ScrollView>
                      </View>
                    ) : null
                  }
                />
              )}
            </View>
          </TouchableWithoutFeedback>

          {/* Input Row */}
          <View style={styles.inputRow}>
            <TextInput
              style={styles.textInput}
              value={inputText}
              onChangeText={setInputText}
              placeholder={placeholder}
              placeholderTextColor="#999"
              multiline
              maxLength={1000}
              editable={!isLoading}
            />
            <TouchableOpacity
              style={styles.micButton}
            //   onPress={handleMicPress}
              activeOpacity={0.7}
              disabled={isLoading}
            >
              <Text style={styles.micIcon}>🎤</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.sendButton,
                (inputText.trim() === '' || isLoading) && styles.sendButtonDisabled,
              ]}
              onPress={handleSend}
              disabled={inputText.trim() === '' || isLoading}
              activeOpacity={0.7}
            >
              <Text style={styles.sendIcon}>➤</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>

      {/* Mic Popup */}
      {/* {renderMicPopup()} */}
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FEF2F2',
  },
  chatContent: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: '#DC2626',
    borderBottomWidth: 1,
    borderBottomColor: '#B91C1C',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  closeButton: {
    position: 'absolute',
    right: 16,
    padding: 8,
  },
  closeButtonText: {
    fontSize: 20,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  chatContainer: {
    flex: 1,
  },
  queriesContainer: {
    paddingVertical: 16,
    paddingHorizontal: 0,
    backgroundColor: '#FEF2F2',
    borderBottomColor: '#FECACA',
  },
  queriesTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
    paddingHorizontal: 16,
  },
  queriesScrollContent: {
    paddingHorizontal: 8,
    flexDirection: 'row',
  },
  queryTag: {
    marginHorizontal: 8,
  },
  queryTagContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#FECACA',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  queryTagTitle: {
    fontSize: 14,
    color: '#999999',
    fontWeight: '500',
    textAlign: 'center',
  },
  messagesList: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingBottom: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
  },
  messageBubble: {
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginVertical: 4,
    maxWidth: '80%',
  },
  userBubble: {
    backgroundColor: '#DC2626',
    alignSelf: 'flex-end',
  },
  userMessageText: {
    color: '#FFFFFF',
  },
  userTimestamp: {
    color: 'rgba(255, 255, 255, 0.7)',
  },
  responseBubble: {
    backgroundColor: '#DCFCE7',
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: '#16A34A',
  },
  responseMessageText: {
    color: '#15803D',
  },
  responseTimestamp: {
    color: '#166534',
  },
  errorBubble: {
    backgroundColor: '#FEE2E2',
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: '#DC2626',
  },
  errorMessageText: {
    color: '#DC2626',
  },
  loadingRowContainer: {
    paddingHorizontal: 0,
    paddingVertical: 8,
    backgroundColor: 'transparent',
  },
  loadingMessageBubble: {
    backgroundColor: '#FEF3C7',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FBBF24',
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginLeft: 0,
    marginRight: 8,
    minWidth: 150,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingMessageText: {
    color: '#92400E',
    fontStyle: 'italic',
    fontSize: 13,
    fontWeight: '500',
    textAlign: 'center',
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  timestamp: {
    fontSize: 11,
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#FECACA',
    paddingBottom: Platform.OS === 'ios' ? 10 : 10,
  },
  textInput: {
    flex: 1,
    minHeight: 40,
    maxHeight: 100,
    backgroundColor: '#FEF2F2',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 16,
    color: '#333',
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  micButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FECACA',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  micIcon: {
    fontSize: 20,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#DC2626',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  sendButtonDisabled: {
    backgroundColor: '#FECACA',
  },
  sendIcon: {
    fontSize: 20,
    color: '#FFFFFF',
  },
  micPopupOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  micPopupContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 20,
    alignItems: 'center',
    width: '50%',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  micPopupTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  micWaveContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#DC2626',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  micPopupIcon: {
    fontSize: 28,
  },
  micPopupSubtitle: {
    fontSize: 12,
    color: '#666',
    marginBottom: 12,
    fontWeight: '500',
  },
  micCancelButton: {
    backgroundColor: '#DC2626',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  micCancelButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },

  toast: {
        backgroundColor: '#323232',
        height: 48,
        padding: 12,
        marginBottom: 16,
        width: '90%',
        marginHorizontal: 'auto',
        borderRadius: 4,
    },
    toastText: {
        color: "#fff",
        fontSize: 14,
    },
});

export default ChatModal;