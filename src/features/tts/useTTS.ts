import { useCallback, useEffect, useRef, useState } from 'react';

interface UseTTSOptions {
  lang?: string;
  rate?: number;
}

/**
 * Hook wrapping the browser's Web Speech API (speechSynthesis).
 * Completely free — no external API or keys required.
 */
export function useTTS({ lang = 'de-DE', rate = 1 }: UseTTSOptions = {}) {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voicesLoaded, setVoicesLoaded] = useState(false);
  const voiceRef = useRef<SpeechSynthesisVoice | null>(null);

  // Cache the best matching German voice.
  useEffect(() => {
    const loadVoices = () => {
      const voices = window.speechSynthesis?.getVoices() || [];
      const germanVoice =
        voices.find(v => v.lang === 'de-DE') ||
        voices.find(v => v.lang.toLowerCase().startsWith('de')) ||
        voices.find(v => v.lang === 'de_DE') ||
        null;
      voiceRef.current = germanVoice;
      setVoicesLoaded(true);
    };

    loadVoices();
    // Chrome loads voices asynchronously.
    window.speechSynthesis?.addEventListener('voiceschanged', loadVoices);
    return () => window.speechSynthesis?.removeEventListener('voiceschanged', loadVoices);
  }, []);

  const speak = useCallback(
    (text: string) => {
      if (!text || !('speechSynthesis' in window)) return;

      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang;
      utterance.rate = rate;
      if (voiceRef.current) {
        utterance.voice = voiceRef.current;
      }

      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);

      window.speechSynthesis.speak(utterance);
    },
    [lang, rate]
  );

  const stop = useCallback(() => {
    window.speechSynthesis?.cancel();
    setIsSpeaking(false);
  }, []);

  useEffect(() => {
    return () => stop();
  }, [stop]);

  return { speak, stop, isSpeaking, voicesLoaded };
}
