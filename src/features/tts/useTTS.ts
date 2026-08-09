import { useCallback, useEffect, useRef, useState } from 'react';

interface UseTTSOptions {
  lang?: string;
  rate?: number;
  voice?: string; // selected voiceURI or name; fallback to default German voice
}

export interface TTSVoice {
  name: string;
  voiceURI: string;
  lang: string;
  localService: boolean;
  default: boolean;
}

/**
 * Hook wrapping the browser's Web Speech API (speechSynthesis).
 * Completely free — no external API or keys required.
 */
export function useTTS({ lang = 'de-DE', rate = 1, voice }: UseTTSOptions = {}) {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voicesLoaded, setVoicesLoaded] = useState(false);
  const [voices, setVoices] = useState<TTSVoice[]>([]);
  const voiceRef = useRef<SpeechSynthesisVoice | null>(null);
  const selectedRef = useRef(voice);

  selectedRef.current = voice;

  const selectVoice = useCallback(
    (all: SpeechSynthesisVoice[]) => {
      const german = all.filter(v => v.lang?.toLowerCase().startsWith('de'));
      const selected = selectedRef.current;
      const match =
        (selected && german.find(v => v.voiceURI === selected)) ||
        (selected && german.find(v => v.name === selected)) ||
        german.find(v => v.lang === 'de-DE') ||
        german.find(v => v.lang.toLowerCase().startsWith('de')) ||
        null;
      voiceRef.current = match;
      return german;
    },
    []
  );

  // Cache the available German voices and honor the selected one.
  useEffect(() => {
    const loadVoices = () => {
      const all = window.speechSynthesis?.getVoices() || [];
      const german = selectVoice(all);
      setVoices(
        german.map(v => ({
          name: v.name,
          voiceURI: v.voiceURI,
          lang: v.lang,
          localService: v.localService,
          default: v.default,
        }))
      );
      setVoicesLoaded(true);
    };

    loadVoices();
    // Chrome loads voices asynchronously.
    window.speechSynthesis?.addEventListener('voiceschanged', loadVoices);
    return () => window.speechSynthesis?.removeEventListener('voiceschanged', loadVoices);
  }, [selectVoice]);

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

  return { speak, stop, isSpeaking, voicesLoaded, voices };
}
