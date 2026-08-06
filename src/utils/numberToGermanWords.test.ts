import { describe, it, expect } from 'vitest';
import { numberToGermanWords } from './numberToGermanWords';

describe('numberToGermanWords', () => {
  describe('Basic numbers', () => {
    it('converts 0', () => {
      expect(numberToGermanWords(0)).toBe('null');
    });

    it('converts single digits', () => {
      expect(numberToGermanWords(1)).toBe('eins');
      expect(numberToGermanWords(5)).toBe('fünf');
      expect(numberToGermanWords(9)).toBe('neun');
    });

    it('converts teens', () => {
      expect(numberToGermanWords(10)).toBe('zehn');
      expect(numberToGermanWords(11)).toBe('elf');
      expect(numberToGermanWords(12)).toBe('zwölf');
      expect(numberToGermanWords(13)).toBe('dreizehn');
      expect(numberToGermanWords(19)).toBe('neunzehn');
    });

    it('converts tens', () => {
      expect(numberToGermanWords(20)).toBe('zwanzig');
      expect(numberToGermanWords(30)).toBe('dreißig');
      expect(numberToGermanWords(40)).toBe('vierzig');
      expect(numberToGermanWords(50)).toBe('fünfzig');
      expect(numberToGermanWords(60)).toBe('sechzig');
      expect(numberToGermanWords(70)).toBe('siebzig');
      expect(numberToGermanWords(80)).toBe('achtzig');
      expect(numberToGermanWords(90)).toBe('neunzig');
    });

    it('converts compound numbers under 100', () => {
      expect(numberToGermanWords(21)).toBe('einundzwanzig');
      expect(numberToGermanWords(42)).toBe('zweiundvierzig');
      expect(numberToGermanWords(99)).toBe('neunundneunzig');
    });
  });

  describe('Hundreds', () => {
    it('converts exact hundreds', () => {
      expect(numberToGermanWords(100)).toBe('einhundert');
      expect(numberToGermanWords(200)).toBe('zweihundert');
      expect(numberToGermanWords(900)).toBe('neunhundert');
    });

    it('converts hundreds with remainder', () => {
      expect(numberToGermanWords(101)).toBe('hunderteins');
      expect(numberToGermanWords(123)).toBe('einhundertdreiundzwanzig');
      expect(numberToGermanWords(999)).toBe('neunhundertneunundneunzig');
    });
  });

  describe('Thousands', () => {
    it('converts exact thousands', () => {
      expect(numberToGermanWords(1000)).toBe('eintausend');
      expect(numberToGermanWords(2000)).toBe('zweitausend');
      expect(numberToGermanWords(10000)).toBe('zehntausend');
    });

    it('converts thousands with remainder', () => {
      expect(numberToGermanWords(1001)).toBe('eintausendeins');
      expect(numberToGermanWords(1234)).toBe('eintausendzweihundertvierunddreißig');
      expect(numberToGermanWords(9999)).toBe('neuntausendneunhundertneunundneunzig');
      expect(numberToGermanWords(12345)).toBe('zwölftausenddreihundertfünfundvierzig');
      expect(numberToGermanWords(123456)).toBe('einhundertdreiundzwanzigtausendvierhundertsechsundfünfzig');
    });
  });

  describe('Millions', () => {
    it('converts exact millions', () => {
      expect(numberToGermanWords(1000000)).toBe('eine million');
      expect(numberToGermanWords(2000000)).toBe('zwei millionen');
    });

    it('converts millions with remainder', () => {
      expect(numberToGermanWords(1000001)).toBe('eine million eins');
      expect(numberToGermanWords(1234567)).toBe('eine millionzweihundertvierunddreißigtausendfünfhundertsiebenundsechzig');
      expect(numberToGermanWords(2000000)).toBe('zwei millionen');
    });
  });

  describe('Decimals', () => {
    it('converts simple decimals', () => {
      expect(numberToGermanWords(0.5)).toBe('null komma fünfzig');
      expect(numberToGermanWords(1.5)).toBe('eins komma fünfzig');
      expect(numberToGermanWords(2.5)).toBe('zwei komma fünfzig');
    });

    it('converts two decimal places', () => {
      expect(numberToGermanWords(0.56)).toBe('null komma sechsundfünfzig');
      expect(numberToGermanWords(1.56)).toBe('eins komma sechsundfünfzig');
      expect(numberToGermanWords(1234.56)).toBe('eintausendzweihundertvierunddreißig komma sechsundfünfzig');
    });

    it('handles leading zeros in decimals', () => {
      expect(numberToGermanWords(1.05)).toBe('eins komma null fünf');
      expect(numberToGermanWords(0.05)).toBe('null komma null fünf');
    });

    it('handles trailing zeros', () => {
      expect(numberToGermanWords(1.50)).toBe('eins komma fünfzig');
      expect(numberToGermanWords(1.00)).toBe('eins');
    });

    it('handles .01 to .09', () => {
      expect(numberToGermanWords(1.01)).toBe('eins komma null eins');
      expect(numberToGermanWords(1.09)).toBe('eins komma null neun');
    });
  });

  describe('Edge cases', () => {
    it('throws on negative numbers', () => {
      expect(() => numberToGermanWords(-1)).toThrow('Number must be between 0 and 2,000,000');
    });

    it('throws on numbers > 2 million', () => {
      expect(() => numberToGermanWords(2000001)).toThrow('Number must be between 0 and 2,000,000');
    });

    it('handles maximum value', () => {
      expect(numberToGermanWords(2000000)).toBe('zwei millionen');
    });
  });
});