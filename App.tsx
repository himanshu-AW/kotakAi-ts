import { Image, Pressable, ScrollView, StatusBar, StyleSheet, Text, useColorScheme, View } from 'react-native';
import {
  SafeAreaProvider,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import Animated, { Extrapolation, SharedValue, interpolate, useAnimatedScrollHandler, useAnimatedStyle, useSharedValue } from "react-native-reanimated";
import { useState } from 'react';
import ChatBot from './ChatBot';

function App() {
  const isDarkMode = useColorScheme() === 'dark';
  const [showChatBot, setShowChatBot] = useState(true);

  const scrollY = useSharedValue(0);
  const onScroll = useAnimatedScrollHandler({
    onScroll: (e) => {
      const y = e.contentOffset.y;
      scrollY.value = y;
    }
  });

  return (
    <SafeAreaProvider>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <AppContent onScroll={onScroll} scrollY={scrollY} />
      <FabKotakAiButton scrollY={scrollY} onPress={() => setShowChatBot(true)} />
      <ChatBot visible={showChatBot} onClose={() => setShowChatBot(false)} />
    </SafeAreaProvider>
  );
}

function FabKotakAiButton({ scrollY, onPress }: { scrollY: SharedValue<number>; onPress: () => void }) {

  const botAnim = useAnimatedStyle(() => {

    const translateX = interpolate(
      scrollY.value,
      [150, 350],
      [0, 90],
      Extrapolation.CLAMP
    );

    return {
      transform: [{ translateX }],
    };
  });

  return (
    <Animated.View
      style={[styles.botContainer,
        botAnim,
      ]}
    >
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [
          styles.inner,
          {
            opacity: pressed ? 0.8 : 1,
            transform: [{ scale: pressed ? 0.98 : 1 }],
          },
        ]}
      >
        <View style={styles.botIcon}>
          <Text>Bot</Text>
          {/* <Image source={BotLogo} style={{ width: 52, height: 52 }} /> */}
        </View>
      </Pressable>
    </Animated.View>
  );
}

function AppContent({ onScroll, scrollY }: { onScroll: (e: any) => void, scrollY: SharedValue<number> }) {
  const safeAreaInsets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: safeAreaInsets.top, paddingBottom: safeAreaInsets.bottom }]}>
      <Animated.ScrollView onScroll={onScroll} scrollEventThrottle={16}
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        <View style={{ width: "100%", height: "100%", justifyContent: "center", alignItems: "center" }}>
          {Array.from({ length: 100 }).map((_, index) => (
            <Text key={index} style={{ color: "#121212", fontSize: 24 }}>AppContent</Text>
          ))}
        </View>
      </Animated.ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    height: "100%",
  },
  botContainer: {
    position: "absolute",
    right: 16,
    bottom: 86,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#3B5BFF",
    borderRadius: 52,
    flexDirection: "row",
    height: 52,
    width: 52,
    overflow: "hidden",
  },

  inner: {
    flexDirection: "row",
    alignItems: "center",
    height: 44,
  },

  icon: {
    width: 44,
    height: 44,
    borderRadius: 52,
    alignItems: "center",
    justifyContent: "center",
  },

  label: {
    fontSize: 16,
    fontFamily: "Roboto-Medium",
    lineHeight: 22,
    color: "#fff",
    marginRight: 20
  },

  botIcon: {
    width: 52,
    height: 52,
    alignItems: "center",
    justifyContent: "center",
  },
});

export default App;
