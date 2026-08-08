import re
import spacy
from wordfreq import top_n_list

PER = 500
OUT = 'src/data/words.ts'
KEEP_POS = {'NOUN', 'VERB', 'ADJ'}

# Safety net: a few stubborn non-content tokens that occasionally survive POS.
EXTRA_DROP = {
    'siehe', 'sie', 'doch', 'aber', 'auch', 'erst', 'weiter', 'noch', 'sehr',
    'immer', 'mehr', 'schon', 'jetzt', 'heute', 'dann', 'hier', 'da', 'dort',
    'gut', 'ganz', 'viel', 'alle', 'alles', 'keine', 'keinen', 'keiner', 'mal',
    'weln', 'schulz', 'erster', 'hasse', 'teilnahmen',
    'dein', 'mein', 'deine', 'meine', 'sein', 'seine', 'seiner', 'ihrer', 'ihrem',
    'unser', 'euer', 'bewusst', 'einen', 'einer', 'einem', 'dieser', 'diese',
    'grosse', 'damen', 'bundestag',
}

def main():
    nlp = spacy.load('de_core_news_sm')
    words = top_n_list('de', 20000, wordlist='best')

    seen = set()
    ordered = []  # list of (lemma, pos)
    for w in words:
        if len(w) < 3:
            continue
        t = nlp(w)[0]
        pos = t.pos_
        if pos not in KEEP_POS:
            continue
        lemma = t.lemma_
        if not re.fullmatch(r'[A-Za-zÄÖÜäöüß-]+', lemma):
            continue
        key = lemma.lower()
        if key in seen or key in EXTRA_DROP:
            continue
        seen.add(key)
        ordered.append((lemma, pos))

    total = PER * 3
    if len(ordered) < total:
        print(f"Only {len(ordered)} content lemmas; need {total}")
        return

    easy = ordered[:PER]
    medium = ordered[PER:PER*2]
    hard = ordered[PER*2:PER*3]

    def pos_name(p):
        return {'NOUN': 'noun', 'VERB': 'verb', 'ADJ': 'adjective'}[p]

    lines = []
    for bucket, diff in [(easy, 'easy'), (medium, 'medium'), (hard, 'hard')]:
        for lemma, p in bucket:
            lines.append(
                f"  makeWord({lemma!r}, '', {pos_name(p)!r}, '{diff}'),"
            )

    header = """export type WordDifficulty = 'easy' | 'medium' | 'hard';

export interface GermanWord {
  word: string;
  translation: string;
  partOfSpeech: string;
  difficulty: WordDifficulty;
}

function makeWord(word: string, translation: string, partOfSpeech: string, difficulty: WordDifficulty): GermanWord {
  return { word, translation, partOfSpeech, difficulty };
}

// Auto-generated: wordfreq German lemmas, POS-tagged + lemmatized with spaCy
// (de_core_news_sm). Function words, determiners, pronouns, numbers removed.
// Root forms bucketed by frequency into easy / medium / hard.
export const WORDS: GermanWord[] = [
"""
    footer = """];

const byDifficulty = WORDS.reduce<Record<WordDifficulty, GermanWord[]>>(
  (acc, w) => { acc[w.difficulty].push(w); return acc; },
  { easy: [], medium: [], hard: [] }
);

export function getWordsByDifficulty(difficulty: WordDifficulty): GermanWord[] {
  return byDifficulty[difficulty];
}

export function getRandomWord(difficulty: WordDifficulty): GermanWord {
  const pool = byDifficulty[difficulty];
  return pool[Math.floor(Math.random() * pool.length)];
}
"""
    with open(OUT, 'w', encoding='utf-8') as f:
        f.write(header)
        f.write('\n'.join(lines))
        f.write('\n')
        f.write(footer)

    print(f"Wrote {OUT}: easy={len(easy)}, medium={len(medium)}, hard={len(hard)}")
    for name, b in [('easy', easy), ('medium', medium), ('hard', hard)]:
        print(name, ':', ', '.join(f'{w}' for w, _ in b[:30]))

if __name__ == '__main__':
    main()
