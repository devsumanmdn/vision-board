import { Send } from "lucide-react-native";
import React, { useRef } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  TextInput,
  View,
} from "react-native";
import Animated, { SlideInRight } from "react-native-reanimated";

import { Text } from "@/components/Themed";

import { addStyles as styles } from "./styles";
import { InterviewStageProps } from "./types";

export function InterviewStage({
  history,
  currentQ,
  answer,
  setAnswer,
  loading,
  submitAnswer,
  theme,
}: InterviewStageProps) {
  const { textColor, tintColor, secondaryText, backgroundColor, isDark } =
    theme;
  const scrollViewRef = useRef<ScrollView>(null);
  const inputRef = useRef<TextInput>(null);

  return (
    <View style={{ flex: 1 }}>
      <View style={styles.header}>
        <Text style={styles.title}>The Interview</Text>
        <Text style={styles.subtitle}>Analyzing realistic capability...</Text>
      </View>

      <ScrollView
        ref={scrollViewRef}
        style={styles.chatContainer}
        contentContainerStyle={{ paddingBottom: 100, gap: 16 }}
        onContentSizeChange={() =>
          scrollViewRef.current?.scrollToEnd({ animated: true })
        }
      >
        {history.map((h, i) => (
          <View key={i} style={{ gap: 8 }}>
            <View style={[styles.bubble, styles.aiBubble]}>
              <Text style={styles.bubbleText}>{h.q}</Text>
            </View>
            <View
              style={[
                styles.bubble,
                styles.userBubble,
                { backgroundColor: tintColor },
              ]}
            >
              <Text style={[styles.bubbleText, { color: "#FFF" }]}>{h.a}</Text>
            </View>
          </View>
        ))}

        {loading && (
          <View style={[styles.bubble, styles.aiBubble]}>
            <ActivityIndicator color={textColor} size="small" />
          </View>
        )}

        {!loading && currentQ && (
          <Animated.View
            entering={SlideInRight}
            style={[styles.bubble, styles.aiBubble]}
          >
            <Text style={styles.bubbleText}>{currentQ.question}</Text>
          </Animated.View>
        )}
      </ScrollView>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={100}
      >
        <View
          style={[
            styles.inputBar,
            { backgroundColor: backgroundColor, borderTopColor: secondaryText },
          ]}
        >
          {currentQ?.inputType === "select" ||
          currentQ?.inputType === "chips" ? (
            <ScrollView
              horizontal
              contentContainerStyle={{ gap: 8 }}
              showsHorizontalScrollIndicator={false}
            >
              {currentQ.options?.map((opt) => (
                <Pressable
                  key={opt}
                  style={[styles.chip, { borderColor: tintColor }]}
                  onPress={() => {
                    setAnswer(opt);
                    setTimeout(submitAnswer, 0);
                  }}
                >
                  <Text style={{ color: textColor }}>{opt}</Text>
                </Pressable>
              ))}
            </ScrollView>
          ) : (
            <View style={styles.textInputRow}>
              <TextInput
                ref={inputRef}
                style={[
                  styles.chatInput,
                  {
                    color: textColor,
                    backgroundColor: isDark
                      ? "rgba(255,255,255,0.08)"
                      : "rgba(0,0,0,0.05)",
                  },
                ]}
                value={answer}
                onChangeText={setAnswer}
                placeholder="Type your excuse..."
                placeholderTextColor={secondaryText}
                onSubmitEditing={submitAnswer}
                returnKeyType="send"
                autoFocus
              />
              <Pressable
                onPress={submitAnswer}
                style={({ pressed }) => [
                  styles.sendBtn,
                  {
                    backgroundColor: tintColor,
                    opacity: pressed ? 0.8 : 1,
                    transform: [{ scale: pressed ? 0.95 : 1 }],
                  },
                ]}
              >
                <Send size={20} color="#FFF" />
              </Pressable>
            </View>
          )}
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}
