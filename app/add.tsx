import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { X } from "lucide-react-native";
import { useState } from "react";
import { Platform, Pressable, View } from "react-native";

import {
  InterviewStage,
  ProposalStage,
  SetupStage,
  Stage,
  addStyles as styles,
  ThemeColors,
} from "@/components/add";
import { useThemeColor } from "@/components/Themed";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/context/ThemeContext";
import {
  generateInterviewQuestion,
  generateSchedule,
  InterviewResponse,
} from "@/services/ai";
import { uploadToCloudinary } from "@/services/cloudinary";
import { scheduleRegimen } from "@/services/notifications";
import { generatePlanPDF } from "@/services/pdfGenerator";
import { ScheduleItem, useVisionStore } from "@/store/visionStore";

export default function ModalScreen() {
  const router = useRouter();
  const addItem = useVisionStore((state) => state.addItem);

  // Stage State
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

  // UI State
  const [saving, setSaving] = useState(false);
  const [exporting, setExporting] = useState(false);

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

  const theme: ThemeColors = {
    backgroundColor,
    textColor,
    tintColor,
    secondaryText,
    isDark,
  };

  // --- Actions ---

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });
    if (!result.canceled) setImage(result.assets[0].uri);
  };

  const startInterview = async () => {
    setLoading(true);
    setStage("INTERVIEW");
    try {
      const firstQ = await generateInterviewQuestion(goalText, []);
      setCurrentQ(firstQ);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const submitAnswer = async () => {
    if (!answer.trim() || !currentQ || !currentQ.question) return;

    const newHistory = [...history, { q: currentQ.question!, a: answer }];
    setHistory(newHistory);
    setAnswer("");
    setLoading(true);

    try {
      const next = await generateInterviewQuestion(goalText, newHistory);

      if (next.final) {
        const result = await generateSchedule(goalText, newHistory);
        // Add IDs to schedule items
        const scheduleWithIds = result.schedule.map((item, i) => ({
          ...item,
          id: `schedule-${Date.now()}-${i}`,
        }));
        setSchedule(scheduleWithIds);
        setMotivations(result.motivations);
        setStage("PROPOSAL");
      } else {
        setCurrentQ(next);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const saveVision = async () => {
    if (!image || saving) return;

    setSaving(true);
    try {
      // Upload image to Cloudinary first
      const cloudinaryUrl = await uploadToCloudinary(image);

      const itemData = {
        text: goalText,
        imageUri: cloudinaryUrl, // Use Cloudinary URL instead of local URI
        interviewData: {
          questions: history.map((h) => ({ question: h.q, answer: h.a })),
          summary: "AI Generated",
        },
        schedule,
        motivations,
      };

      await addItem(itemData as any);
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

  const handleExportPDF = async () => {
    setExporting(true);
    try {
      await generatePlanPDF({ goalText, motivations, schedule });
    } catch (e) {
      console.error("PDF export failed:", e);
    } finally {
      setExporting(false);
    }
  };

  const handleRedo = () => {
    setStage("INTERVIEW");
    setCurrentQ({
      question:
        "Fine. Tell me what was wrong with the plan and we'll try again.",
      inputType: "text",
    });
  };

  const handleClose = () => router.back();

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <StatusBar style={Platform.OS === "ios" ? "light" : "auto"} />

      {/* Close Button */}
      <Pressable style={styles.closeButton} onPress={handleClose} hitSlop={20}>
        <X size={24} color={textColor} />
      </Pressable>

      {stage === "SETUP" && (
        <SetupStage
          goalText={goalText}
          setGoalText={setGoalText}
          image={image}
          pickImage={pickImage}
          onContinue={startInterview}
          onClose={handleClose}
          theme={theme}
        />
      )}

      {stage === "INTERVIEW" && (
        <InterviewStage
          history={history}
          currentQ={currentQ}
          answer={answer}
          setAnswer={setAnswer}
          loading={loading}
          submitAnswer={submitAnswer}
          onClose={handleClose}
          theme={theme}
        />
      )}

      {stage === "PROPOSAL" && (
        <ProposalStage
          goalText={goalText}
          motivations={motivations}
          schedule={schedule}
          saving={saving}
          exporting={exporting}
          onRedo={handleRedo}
          onSave={saveVision}
          onExport={handleExportPDF}
          onClose={handleClose}
          theme={theme}
        />
      )}
    </View>
  );
}
