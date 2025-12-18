/**
 * Hybrid Voice Service
 * Uses: Device STT (free) → Gemini Text API (existing quota) → Device TTS (free)
 * This avoids the expensive Live API while providing voice-based interviews.
 */

import * as Speech from "expo-speech";
import {
    ExpoSpeechRecognitionModule,
    useSpeechRecognitionEvent,
} from "expo-speech-recognition";
import { useCallback, useEffect, useState } from "react";

import {
    generateInterviewQuestion,
    InterviewResponse,
} from "@/services/ai";

export interface HybridVoiceState {
  isListening: boolean;
  isSpeaking: boolean;
  isProcessing: boolean;
  transcript: { role: "user" | "ai"; text: string }[];
  currentQuestion: InterviewResponse | null;
  error: string | null;
  isComplete: boolean;
}

export interface UseHybridVoiceReturn extends HybridVoiceState {
  startListening: () => Promise<void>;
  stopListening: () => Promise<void>;
  speak: (text: string) => void;
  stopSpeaking: () => void;
  reset: () => void;
}

export function useHybridVoice(goalText: string): UseHybridVoiceReturn {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcript, setTranscript] = useState<{ role: "user" | "ai"; text: string }[]>([]);
  const [history, setHistory] = useState<{ q: string; a: string }[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState<InterviewResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isComplete, setIsComplete] = useState(false);
  const [recognizedText, setRecognizedText] = useState("");

  // Speech recognition event handlers
  useSpeechRecognitionEvent("start", () => {
    setIsListening(true);
    setRecognizedText("");
  });

  useSpeechRecognitionEvent("end", () => {
    setIsListening(false);
    // Process the recognized text when speech recognition ends
    if (recognizedText.trim()) {
      handleUserInput(recognizedText.trim());
    }
  });

  useSpeechRecognitionEvent("result", (event) => {
    // Get the most confident result
    // The event.results is an array of ExpoSpeechRecognitionResult objects
    if (event.results && event.results.length > 0) {
      const latestResult = event.results[event.results.length - 1];
      // Each result has a transcript property
      if (latestResult && latestResult.transcript) {
        setRecognizedText(latestResult.transcript);
      }
    }
  });

  useSpeechRecognitionEvent("error", (event) => {
    console.log("[HybridVoice] Recognition event:", event.error);
    setIsListening(false);
    
    // Handle common non-error scenarios gracefully
    if (event.error === "no-speech") {
      // User didn't speak - not an error, just reset and let them try again
      console.log("[HybridVoice] No speech detected, user can tap mic again");
      return;
    }
    
    if (event.error === "aborted" || event.error === "client") {
      // User or system stopped recognition - not a real error
      return;
    }
    
    // Only show actual errors to the user
    setError(`Speech recognition: ${event.error}`);
  });

  // Add to transcript
  const addTranscript = useCallback((role: "user" | "ai", text: string) => {
    setTranscript((prev) => [...prev, { role, text }]);
  }, []);

  // Handle user input after speech recognition
  const handleUserInput = useCallback(async (userText: string) => {
    if (!userText || !currentQuestion?.question) return;

    addTranscript("user", userText);
    setIsProcessing(true);

    // Update conversation history
    const newHistory = [...history, { q: currentQuestion.question, a: userText }];
    setHistory(newHistory);

    try {
      // Get next question from Gemini
      const next = await generateInterviewQuestion(goalText, newHistory);

      if (next.final) {
        // Interview complete
        setIsComplete(true);
        const completionMessage = "Alright, I've got everything I need! Let me put together a plan for you.";
        addTranscript("ai", completionMessage);
        speak(completionMessage);
      } else if (next.question) {
        setCurrentQuestion(next);
        addTranscript("ai", next.question);
        speak(next.question);
      }
    } catch (e) {
      console.error("[HybridVoice] AI error:", e);
      setError("Failed to get AI response");
    } finally {
      setIsProcessing(false);
    }
  }, [currentQuestion, history, goalText, addTranscript]);

  // Text-to-Speech
  const speak = useCallback((text: string) => {
    setIsSpeaking(true);
    Speech.speak(text, {
      language: "en-US",
      pitch: 1.0,
      rate: 0.95,
      onDone: () => setIsSpeaking(false),
      onStopped: () => setIsSpeaking(false),
      onError: () => {
        setIsSpeaking(false);
        console.error("[HybridVoice] TTS error");
      },
    });
  }, []);

  const stopSpeaking = useCallback(() => {
    Speech.stop();
    setIsSpeaking(false);
  }, []);

  // Start listening with speech recognition
  const startListening = useCallback(async () => {
    try {
      // Stop any ongoing speech first
      stopSpeaking();

      // Request permissions
      const result = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
      if (!result.granted) {
        setError("Microphone permission denied");
        return;
      }

      // Start speech recognition
      await ExpoSpeechRecognitionModule.start({
        lang: "en-US",
        interimResults: true,
        maxAlternatives: 1,
      });
    } catch (e) {
      console.error("[HybridVoice] Start listening error:", e);
      setError("Failed to start speech recognition");
    }
  }, [stopSpeaking]);

  const stopListening = useCallback(async () => {
    try {
      await ExpoSpeechRecognitionModule.stop();
    } catch (e) {
      console.error("[HybridVoice] Stop listening error:", e);
    }
    setIsListening(false);
  }, []);

  // Reset the voice session
  const reset = useCallback(() => {
    stopSpeaking();
    stopListening();
    setTranscript([]);
    setHistory([]);
    setCurrentQuestion(null);
    setError(null);
    setIsComplete(false);
    setRecognizedText("");
  }, [stopSpeaking, stopListening]);

  // Initialize with first question
  useEffect(() => {
    const initInterview = async () => {
      setIsProcessing(true);
      try {
        const firstQ = await generateInterviewQuestion(goalText, []);
        if (firstQ.question) {
          setCurrentQuestion(firstQ);
          addTranscript("ai", firstQ.question);
          // Small delay before speaking
          setTimeout(() => speak(firstQ.question!), 500);
        }
      } catch (e) {
        console.error("[HybridVoice] Init error:", e);
        setError("Failed to start interview");
      } finally {
        setIsProcessing(false);
      }
    };

    initInterview();

    return () => {
      Speech.stop();
    };
  }, [goalText]);

  return {
    isListening,
    isSpeaking,
    isProcessing,
    transcript,
    currentQuestion,
    error,
    isComplete,
    startListening,
    stopListening,
    speak,
    stopSpeaking,
    reset,
  };
}

/**
 * Get history in format needed for schedule generation
 */
export function getHistoryFromTranscript(
  transcript: { role: "user" | "ai"; text: string }[]
): { q: string; a: string }[] {
  const history: { q: string; a: string }[] = [];

  for (let i = 0; i < transcript.length - 1; i++) {
    if (transcript[i].role === "ai" && transcript[i + 1]?.role === "user") {
      history.push({
        q: transcript[i].text,
        a: transcript[i + 1].text,
      });
    }
  }

  return history;
}
