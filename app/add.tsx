import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Check, Clock, ImagePlus, Send } from "lucide-react-native"; // Renamed Calendar to CalendarIcon to avoid conflict
import { useRef, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from "react-native";
import Animated, {
  FadeIn,
  FadeInUp,
  SlideInRight,
} from "react-native-reanimated";

import { Text, useThemeColor } from "@/components/Themed";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/context/ThemeContext";
import {
  generateInterviewQuestion,
  generateSchedule,
  InterviewResponse,
} from "@/services/ai";
import { scheduleRegimen } from "@/services/notifications";
import { ScheduleItem, useVisionStore } from "@/store/visionStore";

type Stage = "SETUP" | "INTERVIEW" | "PROPOSAL";

export default function ModalScreen() {
  const router = useRouter();
  const addItem = useVisionStore((state) => state.addItem);
  const inputRef = useRef<any>(null);

  // State
  const [stage, setStage] = useState<Stage>("SETUP");
  const [goalText, setGoalText] = useState("");
  const [image, setImage] = useState<string | null>(null);

  // Interview State
  const [history, setHistory] = useState<{ q: string; a: string }[]>([]);
  const [currentQ, setCurrentQ] = useState<InterviewResponse | null>(null);
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);

  // Schedule State
  const [schedule, setSchedule] = useState<ScheduleItem[]>([]);
  const [motivations, setMotivations] = useState<string[]>([]);

  // Theme
  const backgroundColor = useThemeColor(
    { light: "#fff", dark: "#121212" },
    "background"
  );
  const textColor = useThemeColor({ light: "#000", dark: "#fff" }, "text");
  const tintColor = useThemeColor(
    { light: Colors.light.tint, dark: Colors.dark.tint },
    "tint"
  );
  const secondaryText = useThemeColor({ light: "#666", dark: "#ccc" }, "icon");
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const scrollViewRef = useRef<ScrollView>(null);

  // --- Actions ---

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });
    if (!result.canceled) setImage(result.assets[0].uri);
  };

  const startInterview = async () => {
    if (!goalText || !image) return;
    setStage("INTERVIEW");
    setLoading(true);

    // Initial AI Call
    const res = await generateInterviewQuestion(goalText, []);
    setCurrentQ(res);
    setLoading(false);
  };

  const submitAnswer = async () => {
    if (!currentQ || !answer.trim()) return;

    const newHistory = [...history, { q: currentQ.question || "", a: answer }];
    setHistory(newHistory);
    setAnswer("");
    setLoading(true);

    // Get next question
    const res = await generateInterviewQuestion(goalText, newHistory);

    if (res.final) {
      // Generate Schedule
      const proposal = await generateSchedule(goalText, newHistory);
      const scheduleWithIds: ScheduleItem[] = proposal.schedule.map((s, i) => ({
        ...s,
        id: Date.now().toString() + i,
      }));
      setSchedule(scheduleWithIds);
      setMotivations(proposal.motivations);
      setStage("PROPOSAL");
    } else {
      setCurrentQ(res);
      // Refocus input after AI responds
      setTimeout(() => inputRef.current?.focus(), 100);
    }
    setLoading(false);
  };

  const [saving, setSaving] = useState(false);

  const saveVision = async () => {
    if (!image || saving) return;

    setSaving(true);
    try {
      const itemData = {
        text: goalText,
        imageUri: image,
        interviewData: {
          questions: history.map((h) => ({ question: h.q, answer: h.a })),
          summary: "AI Generated",
        },
        schedule: schedule,
        motivations: motivations,
      };

      await addItem(itemData as any);

      // Trigger notifications (using a temp ID since store doesn't return it yet, acceptable for MVP)
      await scheduleRegimen({
        ...itemData,
        id: "temp-recent",
        createdAt: Date.now(),
        milestones: [],
      });

      router.back();
    } catch (e) {
      console.error("Save failed:", e);
      setSaving(false);
    }
  };

  // --- Renders ---

  const renderSetup = () => (
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
        onPress={startInterview}
        disabled={!goalText || !image}
      >
        <Text style={styles.btnText}>Let's Make a Plan</Text>
      </Pressable>
    </Animated.View>
  );

  const renderInterview = () => (
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
                    submitAnswer();
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

  const renderProposal = () => (
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
                {["S", "M", "T", "W", "T", "F", "S"].map((day, idx) => (
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
          style={[styles.secondaryBtn, { borderColor: secondaryText }]}
          onPress={() => {
            // Go back to interview to regenerate
            setStage("INTERVIEW");
            setCurrentQ({
              question:
                "Fine. Tell me what was wrong with the plan and we'll try again.",
              inputType: "text",
            });
          }}
        >
          <Text style={[styles.secondaryBtnText, { color: textColor }]}>
            Not Happy
          </Text>
        </Pressable>
        <Pressable
          style={[
            styles.btn,
            { backgroundColor: tintColor, flex: 1, opacity: saving ? 0.6 : 1 },
          ]}
          onPress={saveVision}
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

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <StatusBar style={Platform.OS === "ios" ? "light" : "auto"} />
      {stage === "SETUP" && renderSetup()}
      {stage === "INTERVIEW" && renderInterview()}
      {stage === "PROPOSAL" && renderProposal()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
  },
  content: {
    gap: 24,
    flex: 1,
  },
  header: {
    marginBottom: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: "900",
  },
  subtitle: {
    fontSize: 16,
    opacity: 0.6,
  },
  imagePlaceholder: {
    width: "100%",
    aspectRatio: 1.5,
    borderRadius: 24,
    borderWidth: 2,
    borderStyle: "dashed",
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
    backgroundColor: "rgba(255,255,255,0.05)",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  placeholderContent: {
    alignItems: "center",
    gap: 8,
  },
  input: {
    borderWidth: 1,
    padding: 16,
    borderRadius: 12,
    fontSize: 18,
    textAlignVertical: "top",
  },
  btn: {
    padding: 20,
    borderRadius: 16,
    alignItems: "center",
  },
  btnText: {
    color: "#FFF",
    fontWeight: "bold",
    fontSize: 18,
  },
  // Chat
  chatContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  bubble: {
    padding: 16,
    borderRadius: 20,
    maxWidth: "85%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  aiBubble: {
    backgroundColor: "rgba(60, 60, 70, 0.95)",
    alignSelf: "flex-start",
    borderBottomLeftRadius: 4,
    marginLeft: 0,
  },
  userBubble: {
    alignSelf: "flex-end",
    borderBottomRightRadius: 4,
    marginRight: 0,
  },
  bubbleText: {
    fontSize: 16,
    lineHeight: 24,
    color: "#fff",
  },
  inputBar: {
    padding: 16,
    paddingBottom: 24,
    borderTopWidth: 0,
  },
  textInputRow: {
    flexDirection: "row",
    gap: 12,
    alignItems: "center",
  },
  chatInput: {
    flex: 1,
    borderWidth: 0,
    borderRadius: 24,
    paddingHorizontal: 20,
    paddingVertical: 14,
    fontSize: 16,
  },
  sendBtn: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 8,
  },
  // Proposal
  motivationBox: {
    gap: 8,
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
  },
  motivationRow: {
    flexDirection: "row",
    gap: 12,
    alignItems: "center",
  },
  motivationText: {
    fontSize: 16,
    flex: 1,
    fontStyle: "italic",
  },
  scheduleBox: {
    gap: 12,
    marginTop: 20,
  },
  scheduleCard: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    gap: 8,
    backgroundColor: "rgba(127,127,127,0.05)",
  },
  scheduleHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  scheduleTime: {
    fontWeight: "bold",
    fontSize: 16,
  },
  scheduleType: {
    fontSize: 12,
    opacity: 0.7,
  },
  scheduleTask: {
    fontSize: 16,
  },
  daysRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 8,
  },
  confirmationButtons: {
    flexDirection: "row",
    gap: 12,
    paddingBottom: 20,
  },
  secondaryBtn: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  secondaryBtnText: {
    fontWeight: "600",
    fontSize: 16,
  },
});
