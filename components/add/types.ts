import { InterviewResponse } from "@/services/ai";
import { ScheduleItem } from "@/store/visionStore";

export type Stage = "SETUP" | "INTERVIEW" | "VOICE_INTERVIEW" | "PROPOSAL";

export interface HistoryItem {
  q: string;
  a: string;
}

export interface ThemeColors {
  backgroundColor: string;
  textColor: string;
  tintColor: string;
  secondaryText: string;
  isDark: boolean;
}

export interface SetupStageProps {
  goalText: string;
  setGoalText: (text: string) => void;
  image: string | null;
  pickImage: () => void;
  onContinue: () => void;
  onVoiceContinue?: () => void;
  onClose: () => void;
  theme: ThemeColors;
}

export interface InterviewStageProps {
  history: HistoryItem[];
  currentQ: InterviewResponse | null;
  answer: string;
  setAnswer: (text: string) => void;
  loading: boolean;
  submitAnswer: () => void;
  onClose: () => void;
  theme: ThemeColors;
}

export interface ProposalStageProps {
  goalText: string;
  motivations: string[];
  schedule: ScheduleItem[];
  saving: boolean;
  exporting: boolean;
  onRedo: () => void;
  onSave: () => void;
  onExport: () => void;
  onClose: () => void;
  theme: ThemeColors;
}

export interface PlanData {
  goalText: string;
  motivations: string[];
  schedule: ScheduleItem[];
  createdAt?: number;
}

export interface VoiceInterviewStageProps {
  goalText: string;
  onComplete: (history: HistoryItem[]) => void;
  onSwitchToText: () => void;
  onClose: () => void;
  theme: ThemeColors;
}

