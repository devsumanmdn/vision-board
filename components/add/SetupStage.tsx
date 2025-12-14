import { Image } from "expo-image";
import { ImagePlus } from "lucide-react-native";
import React from "react";
import { Pressable, TextInput, View } from "react-native";
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
  theme,
}: SetupStageProps) {
  const { textColor, tintColor, secondaryText } = theme;

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

      <Pressable
        style={[
          styles.btn,
          {
            backgroundColor: tintColor,
            opacity: !goalText || !image ? 0.5 : 1,
          },
        ]}
        onPress={onContinue}
        disabled={!goalText || !image}
      >
        <Text style={styles.btnText}>Let's Make a Plan</Text>
      </Pressable>
    </Animated.View>
  );
}
