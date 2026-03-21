/**
 * useTTS - Text-to-Speech hook using Web Speech Synthesis API
 * Supports EN (en-US) and ES (es-ES) voices
 * Mute preference is persisted in localStorage
 */
import { useState, useEffect, useCallback, useRef } from "react";

const MUTE_KEY = "imaind_tts_muted";

export type TTSLanguage = "en" | "es";

function getBestVoice(lang: TTSLanguage): SpeechSynthesisVoice | null {
  if (typeof window === "undefined" || !window.speechSynthesis) return null;
  const voices = window.speechSynthesis.getVoices();
  const langCode = lang === "en" ? "en-US" : "es-ES";
  const fallbackCode = lang === "en" ? "en" : "es";

  // Prefer native/local voices first, then any matching voice
  const preferred = voices.find(v => v.lang === langCode && !v.localService === false);
  const exact = voices.find(v => v.lang === langCode);
  const partial = voices.find(v => v.lang.startsWith(fallbackCode));
  return preferred || exact || partial || null;
}

export function useTTS() {
  const [isMuted, setIsMuted] = useState<boolean>(() => {
    try { return localStorage.getItem(MUTE_KEY) === "true"; } catch { return false; }
  });
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    setIsSupported(typeof window !== "undefined" && "speechSynthesis" in window);
    // Load voices (some browsers load them async)
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.getVoices();
      window.speechSynthesis.onvoiceschanged = () => { window.speechSynthesis.getVoices(); };
    }
    return () => {
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const speak = useCallback((text: string, lang: TTSLanguage = "en", rate = 0.9) => {
    if (!isSupported || isMuted || !text) return;
    if (typeof window === "undefined") return;

    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang === "en" ? "en-US" : "es-ES";
    utterance.rate = rate;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    // Try to assign a specific voice
    const voice = getBestVoice(lang);
    if (voice) utterance.voice = voice;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  }, [isSupported, isMuted]);

  const stop = useCallback(() => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  }, []);

  const toggleMute = useCallback(() => {
    setIsMuted(prev => {
      const next = !prev;
      try { localStorage.setItem(MUTE_KEY, String(next)); } catch {}
      if (next) {
        if (typeof window !== "undefined" && window.speechSynthesis) {
          window.speechSynthesis.cancel();
          setIsSpeaking(false);
        }
      }
      return next;
    });
  }, []);

  return { speak, stop, toggleMute, isMuted, isSpeaking, isSupported };
}
