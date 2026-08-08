import { describe, it, expect } from 'vitest';
import { WORDS, getWordsByDifficulty, getRandomWord } from './words';

describe('words data', () => {
  it('has at least 15 words per difficulty', () => {
    expect(getWordsByDifficulty('easy').length).toBeGreaterThanOrEqual(15);
    expect(getWordsByDifficulty('medium').length).toBeGreaterThanOrEqual(15);
    expect(getWordsByDifficulty('hard').length).toBeGreaterThanOrEqual(15);
  });

  it('has unique word entries', () => {
    const seen = new Set<string>();
    for (const w of WORDS) {
      expect(seen.has(w.word)).toBe(false);
      seen.add(w.word);
    }
  });

  it('every word has all required fields', () => {
    for (const w of WORDS) {
      expect(w.word.length).toBeGreaterThan(0);
      expect(typeof w.translation).toBe('string');
      expect(w.partOfSpeech.length).toBeGreaterThan(0);
      expect(['easy', 'medium', 'hard']).toContain(w.difficulty);
    }
  });

  it('getRandomWord returns a word of the requested difficulty', () => {
    for (const diff of ['easy', 'medium', 'hard'] as const) {
      const w = getRandomWord(diff);
      expect(w.difficulty).toBe(diff);
    }
  });
});
