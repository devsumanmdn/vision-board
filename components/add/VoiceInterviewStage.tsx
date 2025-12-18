import {
  MessageSquare,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
} from "lucide-react-native";
import React, { useEffect, useRef } from "react";
import { ActivityIndicator, Pressable, ScrollView, View } from "react-native";
import Animated, {
  Easing,
  FadeIn,
  SlideInUp,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from "react-native-reanimated";

import { Text } from "@/components/Themed";

import { addStyles as styles } from "./styles";
import { VoiceInterviewStageProps } from "./types";
import { getHistoryFromTranscript, useHybridVoice } from "./useHybridVoice";

export function VoiceInterviewStage({
  goalText,
  onComplete,
  onSwitchToText,
  theme,
}: VoiceInterviewStageProps) {
  const { textColor, tintColor, secondaryText, backgroundColor, isDark } =
    theme;
  const scrollViewRef = useRef<ScrollView>(null);
  const [textInput, setTextInput] = React.useState("");

  const {
    isListening,
    isSpeaking,
    isProcessing,
    transcript,
    error,
    isComplete,
    startListening,
    stopListening,
    stopSpeaking,
  } = useHybridVoice(goalText);

  // Animations
  const orbScale = useSharedValue(1);
  const orbOpacity = useSharedValue(0.6);
  const micScale = useSharedValue(1);
  const pulseScale = useSharedValue(1);

  // Animated styles for the orb (AI speaking indicator)
  const orbAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: orbScale.value }],
    opacity: orbOpacity.value,
  }));

  // Animated styles for mic button
  const micAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: micScale.value }],
  }));

  // Pulse animation for recording
  const pulseAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
    opacity: 2 - pulseScale.value,
  }));

  // AI speaking animation
  useEffect(() => {
    if (isSpeaking) {
      orbScale.value = withRepeat(
        withSequence(
          withTiming(1.2, { duration: 600, easing: Easing.inOut(Easing.ease) }),
          withTiming(1, { duration: 600, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        true
      );
      orbOpacity.value = withTiming(1, { duration: 300 });
    } else {
      orbScale.value = withTiming(1, { duration: 300 });
      orbOpacity.value = withTiming(0.6, { duration: 300 });
    }
  }, [isSpeaking]);

  // Recording pulse animation
  useEffect(() => {
    if (isListening) {
      pulseScale.value = withRepeat(
        withTiming(2, { duration: 1000, easing: Easing.out(Easing.ease) }),
        -1,
        false
      );
      micScale.value = withSpring(1.1);
    } else {
      pulseScale.value = 1;
      micScale.value = withSpring(1);
    }
  }, [isListening]);

  // Handle interview completion
  useEffect(() => {
    if (isComplete) {
      const history = getHistoryFromTranscript(transcript);
      setTimeout(() => onComplete(history), 2000);
    }
  }, [isComplete, transcript, onComplete]);

  // Scroll to bottom when transcript updates
  useEffect(() => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [transcript]);

  const handleMicPress = async () => {
    if (isListening) {
      await stopListening();
    } else {
      // Stop AI speaking first if needed
      if (isSpeaking) {
        stopSpeaking();
      }
      await startListening();
    }
  };

  const getStatusText = () => {
    if (isProcessing) return "Thinking...";
    if (isSpeaking) return "AI is speaking...";
    if (isListening) return "Listening...";
    if (error) return error;
    return "Tap the mic to speak";
  };

  const getStatusColor = () => {
    if (error) return "#ef4444";
    if (isSpeaking) return tintColor;
    if (isListening) return "#22c55e";
    return secondaryText;
  };

  return (
    <Animated.View
      entering={FadeIn}
      style={[styles.voiceContainer, { backgroundColor }]}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Voice Interview 🎤</Text>
        <Text style={[styles.subtitle, { color: getStatusColor() }]}>
          {getStatusText()}
        </Text>
      </View>

      {/* Main Voice UI Area */}
      <View style={styles.voiceMainArea}>
        {/* AI Speaking Orb */}
        <View style={styles.voiceOrbContainer}>
          <Animated.View
            style={[
              styles.voiceOrb,
              orbAnimatedStyle,
              {
                backgroundColor: isDark
                  ? "rgba(139, 92, 246, 0.3)"
                  : "rgba(139, 92, 246, 0.2)",
                borderColor: isSpeaking ? tintColor : secondaryText,
              },
            ]}
          >
            <View
              style={[
                styles.voiceOrbInner,
                {
                  backgroundColor: isSpeaking
                    ? tintColor
                    : isDark
                    ? "rgba(139, 92, 246, 0.4)"
                    : "rgba(139, 92, 246, 0.3)",
                },
              ]}
            >
              {isSpeaking ? (
                <Volume2 size={32} color="#fff" />
              ) : isProcessing ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : null}
            </View>
          </Animated.View>
        </View>

        {/* Transcript */}
        <ScrollView
          ref={scrollViewRef}
          style={styles.voiceTranscriptContainer}
          contentContainerStyle={{ paddingBottom: 20 }}
        >
          {transcript.map((entry, i) => (
            <Animated.View
              key={i}
              entering={SlideInUp.delay(i * 50).duration(300)}
              style={[
                styles.voiceTranscriptBubble,
                entry.role === "ai"
                  ? styles.voiceTranscriptAi
                  : [
                      styles.voiceTranscriptUser,
                      { backgroundColor: tintColor },
                    ],
              ]}
            >
              <Text
                style={[
                  styles.voiceTranscriptText,
                  { color: entry.role === "user" ? "#fff" : textColor },
                ]}
              >
                {entry.text}
              </Text>
            </Animated.View>
          ))}
        </ScrollView>
      </View>

      {/* Bottom Controls */}
      <View style={styles.voiceControls}>
        {/* Control Buttons */}
        <View style={styles.voiceButtonRow}>
          {/* Switch to text mode */}
          <Pressable
            style={[styles.voiceSecondaryBtn, { borderColor: secondaryText }]}
            onPress={onSwitchToText}
          >
            <MessageSquare size={24} color={secondaryText} />
          </Pressable>

          {/* Main Mic Button */}
          <Pressable
            style={styles.voiceMicButtonContainer}
            onPress={handleMicPress}
            disabled={isProcessing}
          >
            {/* Pulse effect when recording */}
            {isListening && (
              <Animated.View
                style={[
                  styles.voiceMicPulse,
                  pulseAnimatedStyle,
                  { backgroundColor: "#22c55e" },
                ]}
              />
            )}

            <Animated.View
              style={[
                styles.voiceMicButton,
                micAnimatedStyle,
                {
                  backgroundColor: isListening ? "#22c55e" : tintColor,
                  opacity: isProcessing ? 0.5 : 1,
                },
              ]}
            >
              {isListening ? (
                <MicOff size={32} color="#fff" />
              ) : (
                <Mic size={32} color="#fff" />
              )}
            </Animated.View>
          </Pressable>

          {/* Stop speaking button */}
          <Pressable
            style={[
              styles.voiceSecondaryBtn,
              { borderColor: isSpeaking ? tintColor : secondaryText },
            ]}
            onPress={stopSpeaking}
            disabled={!isSpeaking}
          >
            <VolumeX size={24} color={isSpeaking ? tintColor : secondaryText} />
          </Pressable>
        </View>
      </View>
    </Animated.View>
  );
}
