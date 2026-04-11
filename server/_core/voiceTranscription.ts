/**
 * Voice Transcription - Removed Manus Forge dependency
 * 
 * Note: Speech-to-text is now handled entirely on the client side using Web Speech API
 * This file is kept for backward compatibility but is no longer used
 * 
 * For server-side transcription in the future, integrate with:
 * - Google Cloud Speech-to-Text API
 * - OpenAI Whisper API
 * - Azure Speech Services
 */

export type TranscriptionInput = {
  audioUrl: string;
  language?: string;
  prompt?: string;
};

export type TranscriptionResult = {
  text: string;
  language?: string;
  segments?: Array<{
    id: number;
    seek: number;
    start: number;
    end: number;
    text: string;
    avg_logprob: number;
    compression_ratio: number;
    no_speech_prob: number;
  }>;
  error?: string;
  code?: string;
  details?: string;
};

/**
 * Transcribe audio using Web Speech API (client-side only)
 * Server-side transcription not implemented in this version
 */
export async function transcribeAudio(
  input: TranscriptionInput
): Promise<TranscriptionResult> {
  console.warn(
    "[Voice Transcription] Server-side transcription not implemented. Use Web Speech API on the client side."
  );

  return {
    text: "",
    error: "Server-side transcription not implemented",
    code: "NOT_IMPLEMENTED",
    details:
      "Use Web Speech API on the client side for speech-to-text. For server-side transcription, integrate with Google Cloud Speech-to-Text, OpenAI Whisper, or Azure Speech Services.",
  };
}
