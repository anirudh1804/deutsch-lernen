import { useCallback, useEffect, useRef, useState } from 'react';
import { Capacitor } from '@capacitor/core';
import { TextToSpeech } from '@capacitor-community/text-to-speech';

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

const isNative = Capacitor.isNativePlatform();

/**
 * Hook wrapping text-to-speech.
 * - On native (Capacitor) platforms it uses the device's built-in TTS engine
 *   via @capacitor-community/text-to-speech (works in the Android WebView).
 * - On web/desktop it falls back to the browser's Web Speech API.
 */
export function useTTS({ lang = 'de-DE', rate = 1, voice }: UseTTSOptions = {}) {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voicesLoaded, setVoicesLoaded] = useState(false);
  const [voices, setVoices] = useState<TTSVoice[]>([]);
  const voiceRef = useRef<SpeechSynthesisVoice | null>(null);
  const nativeVoiceRef = useRef<number | undefined>(undefined);
  const selectedRef = useRef(voice);

  selectedRef.current = voice;

  // Load available German voices (web only; native voices are resolved on speak).
  useEffect(() => {
    if (isNative) {
      setVoicesLoaded(true);
      return;
    }
    const loadVoices = () => {
      const all = window.speechSynthesis?.getVoices() || [];
      const german = all.filter(v => v.lang?.toLowerCase().startsWith('de'));
      const selected = selectedRef.current;
      const match =
        (selected && german.find(v => v.voiceURI === selected)) ||
        (selected && german.find(v => v.name === selected)) ||
        german.find(v => v.lang === 'de-DE') ||
        german.find(v => v.lang.toLowerCase().startsWith('de')) ||
        null;
      voiceRef.current = match;
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
  }, []);

  const speak = useCallback(
    (text: string) => {
      if (!text) return;

      if (isNative) {
        setIsSpeaking(true);
        TextToSpeech.speak({
          text,
          lang,
          rate,
          voice: nativeVoiceRef.current,
        }).finally(() => setIsSpeaking(false));
        return;
      }

      if (!('speechSynthesis' in window)) return;

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
    if (isNative) {
      TextToSpeech.stop();
      setIsSpeaking(false);
      return;
    }
    window.speechSynthesis?.cancel();
    setIsSpeaking(false);
  }, []);

  useEffect(() => {
    return () => stop();
  }, [stop]);

  return { speak, stop, isSpeaking, voicesLoaded, voices };
}
