import { Image } from "expo-image";
import { ImagePlus, MessageSquare, Mic } from "lucide-react-native";
import React from "react";
import { Pressable, StyleSheet, TextInput, View } from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";

import { Text } from "@/components/Themed";

import { addStyles as styles } from "./styles";
import { SetupStageProps } from "./types";

export function SetupStage({
  goalText,
  setGoalText,
  image,
  pickImage,
  onContinue,
  onVoiceContinue,
  theme,
}: SetupStageProps) {
  const { textColor, tintColor, secondaryText, isDark } = theme;
  const canContinue = !!goalText && !!image;

  return (
    <Animated.View entering={FadeIn} style={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>What's the Dream?</Text>
        <Text style={styles.subtitle}>Be honest. I won't judge (yet).</Text>
      </View>

      <Pressable
        onPress={pickImage}
        style={[styles.imagePlaceholder, { borderColor: tintColor }]}
      >
        {image ? (
          <Image
            source={{ uri: image }}
            style={styles.image}
            contentFit="cover"
          />
        ) : (
          <View style={[styles.placeholderContent, { opacity: 0.6 }]}>
            <ImagePlus size={48} color={textColor} />
            <Text>Visual Evidence</Text>
          </View>
        )}
      </Pressable>

      <TextInput
        style={[styles.input, { color: textColor, borderColor: secondaryText }]}
        placeholder="e.g., Run a Marathon, Get Rich..."
        placeholderTextColor={secondaryText}
        value={goalText}
        onChangeText={setGoalText}
        autoFocus
      />

      {/* Mode Selection Buttons */}
      <View style={localStyles.buttonContainer}>
        {/* Text Chat Button */}
        <Pressable
          style={[
            localStyles.modeButton,
            {
              backgroundColor: isDark
                ? "rgba(255,255,255,0.08)"
                : "rgba(0,0,0,0.05)",
              borderColor: tintColor,
              opacity: canContinue ? 1 : 0.5,
            },
          ]}
          onPress={onContinue}
          disabled={!canContinue}
        >
          <MessageSquare size={24} color={tintColor} />
          <Text style={[localStyles.modeButtonText, { color: textColor }]}>
            Chat with AI
          </Text>
          <Text
            style={[localStyles.modeButtonSubtext, { color: secondaryText }]}
          >
            Type your answers
          </Text>
        </Pressable>

        {/* Voice Button */}
        {onVoiceContinue && (
          <Pressable
            style={[
              localStyles.modeButton,
              {
                backgroundColor: tintColor,
                opacity: canContinue ? 1 : 0.5,
              },
            ]}
            onPress={onVoiceContinue}
            disabled={!canContinue}
          >
            <Mic size={24} color="#fff" />
            <Text style={[localStyles.modeButtonText, { color: "#fff" }]}>
              Talk with AI
            </Text>
            <Text
              style={[
                localStyles.modeButtonSubtext,
                { color: "rgba(255,255,255,0.7)" },
              ]}
            >
              Voice conversation
            </Text>
          </Pressable>
        )}
      </View>
    </Animated.View>
  );
}

const localStyles = StyleSheet.create({
  buttonContainer: {
    flexDirection: "row",
    gap: 12,
    marginTop: 8,
  },
  modeButton: {
    flex: 1,
    padding: 16,
    borderRadius: 16,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },
  modeButtonText: {
    fontSize: 16,
    fontWeight: "700",
    marginTop: 4,
  },
  modeButtonSubtext: {
    fontSize: 12,
  },
});
