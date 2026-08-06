/**
 * Converts numbers (0 to 2,000,000) to German words
 * Decimals are spoken as complete numbers (e.g., 0.56 → "null komma sechsundfünfzig")
 */

const ONES = [
  'null', 'eins', 'zwei', 'drei', 'vier', 'fünf', 'sechs', 'sieben', 'acht', 'neun',
];

const ONES_COMPOUND = [
  'null', 'ein', 'zwei', 'drei', 'vier', 'fünf', 'sechs', 'sieben', 'acht', 'neun',
];

const TEENS = [
  'zehn', 'elf', 'zwölf', 'dreizehn', 'vierzehn', 'fünfzehn', 
  'sechzehn', 'siebzehn', 'achtzehn', 'neunzehn',
];

const TENS = [
  '', '', 'zwanzig', 'dreißig', 'vierzig', 'fünfzig', 
  'sechzig', 'siebzig', 'achtzig', 'neunzig',
];

const HUNDREDS = [
  '', 'hundert', 'zweihundert', 'dreihundert', 'vierhundert',
  'fünfhundert', 'sechshundert', 'siebenhundert', 'achthundert', 'neunhundert',
];

function convertUnder100(num: number): string {
  if (num === 0) return '';
  if (num < 10) return ONES[num];
  if (num < 20) return TEENS[num - 10];
  if (num < 100) {
    const ten = Math.floor(num / 10);
    const one = num % 10;
    if (one === 0) return TENS[ten];
    return `${ONES_COMPOUND[one]}und${TENS[ten]}`;
  }
  return '';
}

function convertUnder1000(num: number): string {
  if (num === 0) return '';
  if (num < 100) return convertUnder100(num);
  
  const hundred = Math.floor(num / 100);
  const remainder = num % 100;
  
  if (remainder === 0) {
    // Exact hundreds: 100 → "einhundert", 200 → "zweihundert", etc.
    return hundred === 1 ? 'einhundert' : HUNDREDS[hundred];
  }
  
  // Special case: 101 → "hunderteins" (not "einhunderteins")
  if (num === 101) {
    return 'hunderteins';
  }
  
  // Other hundreds with remainder: 123 → "einhundertdreiundzwanzig"
  const hundredWord = hundred === 1 ? 'einhundert' : HUNDREDS[hundred];
  return `${hundredWord}${convertUnder1000(remainder)}`;
}

function convertThousands(thousands: number): string {
  if (thousands === 1) return 'eintausend';
  return `${convertUnder1000(thousands)}tausend`;
}

function convertMillions(millions: number): string {
  if (millions === 1) return 'eine million';
  if (millions === 2) return 'zwei millionen';
  return `${convertUnder1000(millions)} millionen`;
}

function convertInteger(num: number): string {
  if (num === 0) return 'null';
  if (num < 1000) return convertUnder1000(num);
  
  if (num < 1000000) {
    const thousands = Math.floor(num / 1000);
    const remainder = num % 1000;
    const thousandsWord = convertThousands(thousands);
    
    if (remainder === 0) return thousandsWord;
    return `${thousandsWord}${convertUnder1000(remainder)}`;
  }
  
  // 1,000,000 to 2,000,000
  const millions = Math.floor(num / 1000000);
  const remainder = num % 1000000;
  const millionsWord = convertMillions(millions);
  
  if (remainder === 0) return millionsWord;
  
  // Special case: remainder is 1 → "eine million eins" (with space)
  // Other cases: no space → "eine millionzweihundert..."
  if (remainder === 1) {
    return `${millionsWord} ${convertInteger(remainder)}`;
  }
  
  return `${millionsWord}${convertInteger(remainder)}`;
}

/**
 * Convert decimal part to German words as a complete number
 * Always uses 2 digits: 5 → "fünfzig", 05 → "null fünf", 56 → "sechsundfünfzig"
 */
function convertDecimalPart(decimalStr: string): string {
  // Ensure exactly 2 digits
  const padded = decimalStr.padEnd(2, '0').slice(0, 2);
  
  if (padded === '00') return '';
  
  // Handle leading zeros: "05" → "null fünf", "01" → "null eins"
  if (padded.startsWith('0')) {
    const secondDigit = parseInt(padded[1], 10);
    if (secondDigit === 0) return 'null';
    return `null ${ONES[secondDigit]}`;
  }
  
  // Normal two-digit number
  const num = parseInt(padded, 10);
  return convertUnder100(num);
}

export function numberToGermanWords(num: number): string {
  // Validate range
  if (num < 0 || num > 2000000) {
    throw new Error('Number must be between 0 and 2,000,000');
  }
  
  // Handle decimals
  const numStr = num.toString();
  if (numStr.includes('.')) {
    const [integerPart, decimalPart] = numStr.split('.');
    const integer = parseInt(integerPart, 10);
    const decimalWords = convertDecimalPart(decimalPart);
    
    const integerWords = convertInteger(integer);
    
    if (!decimalWords) return integerWords;
    return `${integerWords} komma ${decimalWords}`;
  }
  
  return convertInteger(num);
}

/**
 * Parse a German number word back to a number (for validation)
 * This is a simplified version - handles the most common cases
 */
export function parseGermanNumber(words: string): number | null {
  const normalized = words
    .toLowerCase()
    .trim()
    .replace(/ß/g, 'ss')
    .replace(/ä/g, 'ae')
    .replace(/ö/g, 'oe')
    .replace(/ü/g, 'ue');
  
  // Handle "komma" for decimals
  if (normalized.includes('komma')) {
    const [intPart, decPart] = normalized.split('komma').map(s => s.trim());
    const integer = parseGermanInteger(intPart);
    if (integer === null) return null;
    
    const decimal = parseGermanInteger(decPart);
    if (decimal === null) return null;
    
    // Determine decimal places
    const decimalStr = decimal.toString();
    const divisor = Math.pow(10, decimalStr.length);
    return integer + decimal / divisor;
  }
  
  return parseGermanInteger(normalized);
}

function parseGermanInteger(words: string): number | null {
  // This is a simplified parser - a full implementation would be more complex
  // For now, we'll use a lookup for common patterns
  const wordToNum: Record<string, number> = {
    'null': 0, 'eins': 1, 'einen': 1, 'ein': 1, 'eine': 1,
    'zwei': 2, 'zwo': 2, 'drei': 3, 'vier': 4, 'fünf': 5,
    'sechs': 6, 'sieben': 7, 'acht': 8, 'neun': 9, 'zehn': 10,
    'elf': 11, 'zwölf': 12, 'dreizehn': 13, 'vierzehn': 14, 'fünfzehn': 15,
    'sechzehn': 16, 'siebzehn': 17, 'achtzehn': 18, 'neunzehn': 19,
    'zwanzig': 20, 'dreißig': 30, 'vierzig': 40, 'fünfzig': 50,
    'sechzig': 60, 'siebzig': 70, 'achtzig': 80, 'neunzig': 90,
    'hundert': 100, 'tausend': 1000, 'million': 1000000, 'millionen': 1000000,
  };
  
  // Very basic parsing - would need proper grammar parsing for production
  let result = 0;
  let current = 0;
  
  const parts = words.split(/[\s\-]+/);
  
  for (const part of parts) {
    if (part === 'und') continue;
    
    if (part === 'million' || part === 'millionen') {
      current = current || 1;
      result += current * 1000000;
      current = 0;
    } else if (part === 'tausend') {
      current = current || 1;
      result += current * 1000;
      current = 0;
    } else if (part === 'hundert') {
      current = (current || 1) * 100;
    } else if (wordToNum[part] !== undefined) {
      current += wordToNum[part];
    } else {
      // Try compound words like "zweiundzwanzig"
      let matched = false;
      for (const [word, value] of Object.entries(wordToNum)) {
        if (part.endsWith(word) && part !== word) {
          const prefix = part.slice(0, -word.length);
          if (wordToNum[prefix] !== undefined) {
            current += wordToNum[prefix] + value;
            matched = true;
            break;
          }
        }
      }
      if (!matched) return null;
    }
  }
  
  return result + current;
}