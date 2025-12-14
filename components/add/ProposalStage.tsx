import { Check, Clock, FileDown } from "lucide-react-native";
import React from "react";
import { ActivityIndicator, Pressable, ScrollView, View } from "react-native";
import Animated, { FadeInUp } from "react-native-reanimated";

import { Text } from "@/components/Themed";

import { addStyles as styles } from "./styles";
import { ProposalStageProps } from "./types";

const DAY_LETTERS = ["S", "M", "T", "W", "T", "F", "S"];

export function ProposalStage({
  motivations,
  schedule,
  saving,
  exporting,
  onRedo,
  onSave,
  onExport,
  theme,
}: ProposalStageProps) {
  const { textColor, tintColor, secondaryText } = theme;

  return (
    <Animated.View entering={FadeInUp} style={{ flex: 1, gap: 24 }}>
      <View style={styles.header}>
        <Text style={styles.title}>The Verdict</Text>
        <Text style={styles.subtitle}>Review your plan and confirm</Text>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ gap: 16, paddingBottom: 100 }}
      >
        <View style={styles.motivationBox}>
          <Text style={[styles.sectionHeader, { color: textColor }]}>
            Why you're doing this:
          </Text>
          {motivations.map((m, i) => (
            <View key={i} style={styles.motivationRow}>
              <Check size={16} color={tintColor} />
              <Text style={[styles.motivationText, { color: secondaryText }]}>
                {m}
              </Text>
            </View>
          ))}
        </View>

        <View style={styles.scheduleBox}>
          <Text style={[styles.sectionHeader, { color: textColor }]}>
            The Regimen:
          </Text>
          {schedule.map((item, i) => (
            <View
              key={i}
              style={[styles.scheduleCard, { borderColor: secondaryText }]}
            >
              <View style={styles.scheduleHeader}>
                <Clock size={16} color={tintColor} />
                <Text style={[styles.scheduleTime, { color: textColor }]}>
                  {item.time}
                </Text>
                <Text style={[styles.scheduleType, { color: secondaryText }]}>
                  {item.type.toUpperCase()}
                </Text>
              </View>
              <Text style={[styles.scheduleTask, { color: textColor }]}>
                {item.task}
              </Text>
              <View style={styles.daysRow}>
                {DAY_LETTERS.map((day, idx) => (
                  <Text
                    key={idx}
                    style={{
                      color: item.activeDays.includes(idx)
                        ? tintColor
                        : secondaryText,
                      fontWeight: item.activeDays.includes(idx)
                        ? "bold"
                        : "normal",
                      opacity: item.activeDays.includes(idx) ? 1 : 0.3,
                    }}
                  >
                    {day}
                  </Text>
                ))}
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Confirmation Buttons */}
      <View style={styles.confirmationButtons}>
        <Pressable
          style={[styles.iconBtn, { borderColor: secondaryText }]}
          onPress={onExport}
          disabled={exporting}
        >
          {exporting ? (
            <ActivityIndicator color={textColor} size="small" />
          ) : (
            <FileDown size={22} color={textColor} />
          )}
        </Pressable>
        <Pressable
          style={[styles.secondaryBtn, { borderColor: secondaryText }]}
          onPress={onRedo}
        >
          <Text style={[styles.secondaryBtnText, { color: textColor }]}>
            Redo
          </Text>
        </Pressable>
        <Pressable
          style={[
            styles.btn,
            { backgroundColor: tintColor, flex: 1, opacity: saving ? 0.6 : 1 },
          ]}
          onPress={onSave}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator color="#FFF" size="small" />
          ) : (
            <Text style={styles.btnText}>Commit to This</Text>
          )}
        </Pressable>
      </View>
    </Animated.View>
  );
}
