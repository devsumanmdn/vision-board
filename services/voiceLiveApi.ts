
const API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY;

// Live API WebSocket endpoint
const LIVE_API_URL = `wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1beta.GenerativeService.BidiGenerateContent?key=${API_KEY}`;

// Audio format specifications for Gemini Live API
export const AUDIO_CONFIG = {
  inputSampleRate: 16000,  // 16kHz for input
  outputSampleRate: 24000, // 24kHz for output
  inputMimeType: "audio/pcm;rate=16000",
  outputMimeType: "audio/pcm;rate=24000",
};

export interface LiveSessionConfig {
  goal: string;
  onTranscript?: (role: "user" | "ai", text: string) => void;
  onAudioData?: (base64Audio: string) => void;
  onInterviewComplete?: () => void;
  onError?: (error: string) => void;
  onConnectionStateChange?: (state: ConnectionState) => void;
}

export type ConnectionState = "disconnected" | "connecting" | "connected" | "error";

export interface VoiceLiveSession {
  connect: () => Promise<void>;
  disconnect: () => void;
  sendAudio: (base64Audio: string) => void;
  sendText: (text: string) => void;
  getState: () => ConnectionState;
}

/**
 * Create a voice live session with Gemini Live API
 */
export function createVoiceLiveSession(config: LiveSessionConfig): VoiceLiveSession {
  let ws: WebSocket | null = null;
  let state: ConnectionState = "disconnected";

  const updateState = (newState: ConnectionState) => {
    state = newState;
    config.onConnectionStateChange?.(newState);
  };

  // System instruction matching the text interview personality
  const systemInstruction = `You are a witty, slightly sarcastic but genuinely helpful AI assistant helping someone plan their goal: "${config.goal}".

YOUR PERSONALITY:
- Warm and encouraging with a dash of playful humor
- Make jokes that land, not cringe
- Be genuinely curious and empathetic
- Think like a friend who happens to be a great life coach
- Keep responses SHORT (2-3 sentences max) since this is voice

WHAT YOU NEED (but be smart about getting it):
1. Roughly how much time they can dedicate (daily/weekly)
2. When in their day works best (morning person? night owl?)
3. What's driving this goal (optional - infer from context if obvious)

RULES:
- INFER from context! Don't interrogate.
- After 2-3 exchanges, you should have enough info
- Ask ONE question at a time
- Be conversational and brief

WHEN DONE:
- Say "Alright, I've got everything I need! Let me put together a plan for you."
- This signals the interview is complete`;

  const connect = async (): Promise<void> => {
    return new Promise((resolve, reject) => {
      updateState("connecting");
      
      try {
        ws = new WebSocket(LIVE_API_URL);
        
        ws.onopen = () => {
          console.log("[VoiceLive] WebSocket connected");
          
          // Send setup message with configuration
          const setupMessage = {
            setup: {
              model: "models/gemini-2.0-flash-exp",
              generation_config: {
                response_modalities: ["AUDIO", "TEXT"],
                speech_config: {
                  voice_config: {
                    prebuilt_voice_config: {
                      voice_name: "Charon" // A friendly, conversational voice
                    }
                  }
                }
              },
              system_instruction: {
                parts: [{ text: systemInstruction }]
              }
            }
          };
          
          ws?.send(JSON.stringify(setupMessage));
          updateState("connected");
          resolve();
        };

        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            handleServerMessage(data);
          } catch (e) {
            console.error("[VoiceLive] Failed to parse message:", e);
          }
        };

        ws.onerror = (error) => {
          console.error("[VoiceLive] WebSocket error:", error);
          updateState("error");
          config.onError?.("Connection error occurred");
          reject(error);
        };

        ws.onclose = (event) => {
          console.log("[VoiceLive] WebSocket closed:", event.code, event.reason);
          updateState("disconnected");
          ws = null;
        };
      } catch (error) {
        console.error("[VoiceLive] Failed to create WebSocket:", error);
        updateState("error");
        config.onError?.("Failed to connect");
        reject(error);
      }
    });
  };

  const handleServerMessage = (data: any) => {
    // Handle setup complete
    if (data.setupComplete) {
      console.log("[VoiceLive] Setup complete");
      // Send initial greeting to start the conversation
      sendText("Hello! I'm ready to discuss my goal with you.");
      return;
    }

    // Handle server content (model responses)
    if (data.serverContent) {
      const content = data.serverContent;
      
      // Handle model turn
      if (content.modelTurn) {
        const parts = content.modelTurn.parts || [];
        
        for (const part of parts) {
          // Handle text response
          if (part.text) {
            config.onTranscript?.("ai", part.text);
            
            // Check if interview is complete
            if (part.text.toLowerCase().includes("i've got everything i need") ||
                part.text.toLowerCase().includes("let me put together a plan")) {
              setTimeout(() => {
                config.onInterviewComplete?.();
              }, 2000);
            }
          }
          
          // Handle audio response
          if (part.inlineData?.mimeType?.includes("audio")) {
            config.onAudioData?.(part.inlineData.data);
          }
        }
      }

      // Handle input transcription (what user said)
      if (content.inputTranscription) {
        config.onTranscript?.("user", content.inputTranscription);
      }

      // Handle turn complete
      if (content.turnComplete) {
        console.log("[VoiceLive] Turn complete");
      }
    }

    // Handle tool calls if needed in future
    if (data.toolCall) {
      console.log("[VoiceLive] Tool call:", data.toolCall);
    }
  };

  const disconnect = () => {
    if (ws) {
      ws.close();
      ws = null;
    }
    updateState("disconnected");
  };

  const sendAudio = (base64Audio: string) => {
    if (!ws || state !== "connected") {
      console.warn("[VoiceLive] Cannot send audio - not connected");
      return;
    }

    const message = {
      realtimeInput: {
        mediaChunks: [{
          mimeType: AUDIO_CONFIG.inputMimeType,
          data: base64Audio
        }]
      }
    };

    ws.send(JSON.stringify(message));
  };

  const sendText = (text: string) => {
    if (!ws || state !== "connected") {
      console.warn("[VoiceLive] Cannot send text - not connected");
      return;
    }

    const message = {
      clientContent: {
        turns: [{
          role: "user",
          parts: [{ text }]
        }],
        turnComplete: true
      }
    };

    ws.send(JSON.stringify(message));
  };

  const getState = () => state;

  return {
    connect,
    disconnect,
    sendAudio,
    sendText,
    getState,
  };
}

/**
 * Convert audio buffer to base64 for sending to Live API
 */
export function audioBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

/**
 * Convert base64 audio from Live API to audio buffer for playback
 */
export function base64ToAudioBuffer(base64: string): ArrayBuffer {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
}
