import { AudioModule, RecordingPresets, useAudioRecorder, useAudioRecorderState } from "expo-audio";
import { useCallback, useEffect, useRef, useState } from "react";

import {
    ConnectionState,
    createVoiceLiveSession,
    VoiceLiveSession,
} from "@/services/voiceLiveApi";

export interface TranscriptEntry {
  role: "user" | "ai";
  text: string;
  timestamp: number;
}

export interface UseLiveVoiceReturn {
  // Connection state
  connectionState: ConnectionState;
  isConnected: boolean;
  
  // Recording state
  isRecording: boolean;
  
  // AI state
  isAISpeaking: boolean;
  
  // Transcript
  transcript: TranscriptEntry[];
  
  // Error state
  error: string | null;
  
  // Interview complete flag
  isComplete: boolean;
  
  // Actions
  connect: (goal: string) => Promise<void>;
  disconnect: () => void;
  startRecording: () => Promise<void>;
  stopRecording: () => Promise<void>;
  toggleRecording: () => Promise<void>;
  sendTextMessage: (text: string) => void;
}

export function useLiveVoice(): UseLiveVoiceReturn {
  const [connectionState, setConnectionState] = useState<ConnectionState>("disconnected");
  const [isRecording, setIsRecording] = useState(false);
  const [isAISpeaking, setIsAISpeaking] = useState(false);
  const [transcript, setTranscript] = useState<TranscriptEntry[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isComplete, setIsComplete] = useState(false);

  const sessionRef = useRef<VoiceLiveSession | null>(null);
  
  // Audio recorder from expo-audio with preset
  const audioRecorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const recorderState = useAudioRecorderState(audioRecorder);

  // Add transcript entry
  const addTranscript = useCallback((role: "user" | "ai", text: string) => {
    setTranscript((prev) => [
      ...prev,
      { role, text, timestamp: Date.now() },
    ]);
  }, []);

  // Handle incoming audio from AI
  const handleAudioData = useCallback(async (base64Audio: string) => {
    setIsAISpeaking(true);
    
    try {
      // For now, we'll just track state - actual audio playback
      // requires converting PCM to a playable format
      console.log("[useLiveVoice] Received audio data, length:", base64Audio.length);
      
      // Simulate audio playback duration based on data size
      // PCM at 24kHz, 16-bit = 48000 bytes per second
      const audioBytes = base64Audio.length * 0.75; // Base64 to bytes
      const duration = (audioBytes / 48000) * 1000; // ms
      
      setTimeout(() => {
        setIsAISpeaking(false);
      }, Math.max(duration, 500));
    } catch (e) {
      console.error("[useLiveVoice] Audio playback error:", e);
      setIsAISpeaking(false);
    }
  }, []);

  // Connect to Live API
  const connect = useCallback(async (goal: string) => {
    setError(null);
    setTranscript([]);
    setIsComplete(false);

    const session = createVoiceLiveSession({
      goal,
      onTranscript: addTranscript,
      onAudioData: handleAudioData,
      onInterviewComplete: () => {
        console.log("[useLiveVoice] Interview complete!");
        setIsComplete(true);
      },
      onError: (err) => {
        console.error("[useLiveVoice] Error:", err);
        setError(err);
      },
      onConnectionStateChange: setConnectionState,
    });

    sessionRef.current = session;

    try {
      await session.connect();
    } catch (e) {
      setError("Failed to connect to voice service");
      console.error("[useLiveVoice] Connection failed:", e);
    }
  }, [addTranscript, handleAudioData]);

  // Disconnect from Live API
  const disconnect = useCallback(() => {
    sessionRef.current?.disconnect();
    sessionRef.current = null;
    setConnectionState("disconnected");
    setIsRecording(false);
    setIsAISpeaking(false);
  }, []);

  // Start recording
  const startRecording = useCallback(async () => {
    if (!sessionRef.current || connectionState !== "connected") {
      console.warn("[useLiveVoice] Cannot record - not connected");
      return;
    }

    try {
      // Request permissions
      const permissionResponse = await AudioModule.requestRecordingPermissionsAsync();
      
      if (!permissionResponse.granted) {
        setError("Microphone permission denied");
        return;
      }

      // Set audio mode for recording
      await AudioModule.setAudioModeAsync({
        allowsRecording: true,
        playsInSilentMode: true,
      });

      // Start recording
      await audioRecorder.record();
      setIsRecording(true);
    } catch (e) {
      console.error("[useLiveVoice] Recording start failed:", e);
      setError("Failed to start recording");
    }
  }, [connectionState, audioRecorder]);

  // Stop recording and send audio
  const stopRecording = useCallback(async () => {
    if (!recorderState.isRecording) return;

    try {
      await audioRecorder.stop();
      setIsRecording(false);

      const uri = audioRecorder.uri;
      if (uri) {
        console.log("[useLiveVoice] Recording stopped, URI:", uri);
        
        // Note: In a full implementation, we would:
        // 1. Read the recorded audio file
        // 2. Convert to PCM if needed
        // 3. Base64 encode
        // 4. Send via sessionRef.current?.sendAudio(base64Audio)
        
        // For now, we add a placeholder transcript
        addTranscript("user", "[Voice message sent]");
        
        // The Live API primarily uses real-time streaming,
        // so for file-based audio we'd need to stream it in chunks
      }
    } catch (e) {
      console.error("[useLiveVoice] Recording stop failed:", e);
      setIsRecording(false);
    }
  }, [recorderState.isRecording, audioRecorder, addTranscript]);

  // Toggle recording
  const toggleRecording = useCallback(async () => {
    if (recorderState.isRecording) {
      await stopRecording();
    } else {
      await startRecording();
    }
  }, [recorderState.isRecording, startRecording, stopRecording]);

  // Send text message (fallback when voice not working)
  const sendTextMessage = useCallback((text: string) => {
    if (!sessionRef.current || connectionState !== "connected") {
      console.warn("[useLiveVoice] Cannot send text - not connected");
      return;
    }
    
    addTranscript("user", text);
    sessionRef.current.sendText(text);
  }, [connectionState, addTranscript]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  return {
    connectionState,
    isConnected: connectionState === "connected",
    isRecording: recorderState.isRecording,
    isAISpeaking,
    transcript,
    error,
    isComplete,
    connect,
    disconnect,
    startRecording,
    stopRecording,
    toggleRecording,
    sendTextMessage,
  };
}
