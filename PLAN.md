# German Learning App - Comprehensive Implementation Plan

## Overview

A web application for learning German numbers and vocabulary through interactive audio exercises. Users hear a number or word spoken in German and must type the correct German spelling.

---

## Updated Requirements

| Requirement | Specification |
|-------------|--------------|
| Number Range | 0 to 2,000,000 (2 million) |
| Decimal Places | Up to 2 decimal places |
| Decimal Pronunciation | As complete numbers: `0,56` → "null komma sechsundfünfzig" |
| Game Modes | Numbers, Words, Mixed (user selectable) |
| Difficulty Levels | Easy, Medium, Hard (for words) |
| Audio | Google Cloud TTS (primary) + Web Speech API (fallback) |
| Dictionary | External API (Wiktionary/DWDS) |
| User Accounts | Yes (Supabase Auth) |
| Progress Tracking | Streaks, scores, history |
| UI Language | German primary, English toggle |
| Deployment | Vercel + Supabase (free tiers) |

---

## Technical Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Browser (React App)                       │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐              │
│  │   Pages     │  │  Components │  │   Stores    │              │
│  │ (Home,Game, │  │  (UI,Game,  │  │ (auth,game, │              │
│  │ Settings)   │  │  Layout)    │  │  settings)  │              │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘              │
│         │                │                │                      │
│         └────────────────┼────────────────┘                      │
│                          ▼                                       │
│              ┌───────────────────────┐                           │
│              │    Feature Modules    │                           │
│              │  (auth, game, dict,   │                           │
│              │   tts)                │                           │
│              └───────────┬───────────┘                           │
│                          │                                       │
└──────────────────────────┼──────────────────────────────────────┘
                           │
              ┌────────────▼────────────┐
              │     Supabase Backend    │
              │  ┌───────────────────┐  │
              │  │   Auth (Users)    │  │
              │  ├───────────────────┤  │
              │  │  PostgreSQL DB    │  │
              │  │  (profiles,       │  │
              │  │   sessions,       │  │
              │  │   answers)        │  │
              │  ├───────────────────┤  │
              │  │ Edge Functions    │  │
              │  │ (TTS Proxy)       │  │
              │  └───────────────────┘  │
              └────────────┬────────────┘
                           │
              ┌────────────▼────────────┐
              │    External Services    │
              │  ┌───────────────────┐  │
              │  │ Google Cloud TTS  │  │
              │  ├───────────────────┤  │
              │  │ Dictionary APIs   │  │
              │  │ (Wiktionary/DWDS) │  │
              │  └───────────────────┘  │
              └─────────────────────────┘
```

---

## File Structure (Detailed)

```
german-learning-app/
├── .github/
│   └── workflows/
│       └── ci-cd.yml              # GitHub Actions for CI/CD
├── public/
│   ├── favicon.ico
│   ├── manifest.json              # PWA manifest
│   └── robots.txt
├── src/
│   ├── components/
│   │   ├── ui/
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Select.tsx
│   │   │   ├── Toggle.tsx         # Language toggle
│   │   │   ├── Badge.tsx
│   │   │   ├── ProgressBar.tsx
│   │   │   ├── Modal.tsx
│   │   │   ├── Tooltip.tsx
│   │   │   └── index.ts
│   │   ├── game/
│   │   │   ├── NumberDisplay.tsx
│   │   │   ├── WordDisplay.tsx
│   │   │   ├── AudioPlayer.tsx
│   │   │   ├── AnswerInput.tsx
│   │   │   ├── FeedbackBanner.tsx # "Richtig"/"Falsch"
│   │   │   ├── ScoreDisplay.tsx
│   │   │   ├── StreakDisplay.tsx
│   │   │   ├── ModeSelector.tsx
│   │   │   ├── DifficultySelector.tsx
│   │   │   └── index.ts
│   │   ├── layout/
│   │   │   ├── Header.tsx
│   │   │   ├── Footer.tsx
│   │   │   ├── MainLayout.tsx
│   │   │   ├── LanguageToggle.tsx
│   │   │   └── index.ts
│   │   └── index.ts
│   ├── features/
│   │   ├── auth/
│   │   │   ├── components/
│   │   │   │   ├── LoginForm.tsx
│   │   │   │   ├── RegisterForm.tsx
│   │   │   │   ├── ProfileCard.tsx
│   │   │   │   └── AuthGuard.tsx
│   │   │   ├── hooks/
│   │   │   │   ├── useAuth.ts
│   │   │   │   └── useProfile.ts
│   │   │   ├── api/
│   │   │   │   └── authApi.ts
│   │   │   ├── types.ts
│   │   │   └── index.ts
│   │   ├── game/
│   │   │   ├── components/
│   │   │   │   ├── GameSetup.tsx
│   │   │   │   ├── GamePlay.tsx
│   │   │   │   ├── GameResults.tsx
│   │   │   │   └── QuestionCard.tsx
│   │   │   ├── hooks/
│   │   │   │   ├── useGameSession.ts
│   │   │   │   ├── useQuestionGenerator.ts
│   │   │   │   ├── useAnswerValidation.ts
│   │   │   │   └── useScoring.ts
│   │   │   ├── utils/
│   │   │   │   ├── gameModes.ts
│   │   │   │   ├── scoring.ts
│   │   │   │   └── answerNormalization.ts
│   │   │   ├── api/
│   │   │   │   └── gameApi.ts
│   │   │   ├── types.ts
│   │   │   └── index.ts
│   │   ├── dictionary/
│   │   │   ├── components/
│   │   │   │   └── WordList.tsx
│   │   │   ├── hooks/
│   │   │   │   ├── useDictionary.ts
│   │   │   │   └── useWordFetch.ts
│   │   │   ├── api/
│   │   │   │   ├── wiktionaryApi.ts
│   │   │   │   └── dwdsApi.ts
│   │   │   ├── utils/
│   │   │   │   ├── difficultyClassifier.ts
│   │   │   │   └── wordCache.ts
│   │   │   ├── types.ts
│   │   │   └── index.ts
│   │   ├── tts/
│   │   │   ├── providers/
│   │   │   │   ├── GoogleTTSProvider.ts
│   │   │   │   ├── WebSpeechProvider.ts
│   │   │   │   └── TTSProvider.ts (interface)
│   │   │   ├── hooks/
│   │   │   │   └── useTTS.ts
│   │   │   ├── utils/
│   │   │   │   ├── audioCache.ts
│   │   │   │   └── textSanitization.ts
│   │   │   ├── api/
│   │   │   │   └── ttsApi.ts
│   │   │   ├── types.ts
│   │   │   └── index.ts
│   │   └── index.ts
│   ├── hooks/
│   │   ├── useLocalStorage.ts
│   │   ├── useDebounce.ts
│   │   ├── useMediaQuery.ts
│   │   └── index.ts
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts          # Browser client
│   │   │   ├── server.ts          # Server client (for Edge Functions)
│   │   │   └── types.ts           # Generated DB types
│   │   ├── queryClient.ts         # TanStack Query config
│   │   ├── utils.ts               # General utilities
│   │   └── constants.ts
│   ├── pages/
│   │   ├── Home.tsx
│   │   ├── Game.tsx
│   │   ├── Settings.tsx
│   │   ├── Profile.tsx
│   │   ├── Auth/
│   │   │   ├── Login.tsx
│   │   │   ├── Register.tsx
│   │   │   └── ForgotPassword.tsx
│   │   └── NotFound.tsx
│   ├── store/
│   │   ├── authStore.ts
│   │   ├── gameStore.ts
│   │   ├── settingsStore.ts
│   │   └── index.ts
│   ├── types/
│   │   ├── game.ts
│   │   ├── dictionary.ts
│   │   ├── tts.ts
│   │   ├── auth.ts
│   │   └── index.ts
│   ├── utils/
│   │   ├── numberToGermanWords.ts # Core number converter
│   │   ├── germanNumberParser.ts  # Parse German number words
│   │   ├── formatting.ts
│   │   ├── validation.ts
│   │   └── index.ts
│   ├── styles/
│   │   ├── globals.css
│   │   ├── tailwind.css
│   │   └── variables.css
│   ├── i18n/
│   │   ├── de.json
│   │   ├── en.json
│   │   ├── index.ts
│   │   └── useTranslation.ts
│   ├── App.tsx
│   ├── main.tsx
│   ├── routes.tsx
│   └── vite-env.d.ts
├── supabase/
│   ├── functions/
│   │   └── tts-proxy/
│   │       ├── index.ts           # Edge Function entry
│   │       ├── google-tts.ts      # Google TTS integration
│   │       ├── types.ts
│   │       └── deno.json
│   ├── migrations/
│   │   ├── 001_initial_schema.sql
│   │   ├── 002_rls_policies.sql
│   │   ├── 003_indexes.sql
│   │   └── 004_functions.sql
│   ├── seed/
│   │   └── initial_data.sql
│   ├── config.toml
│   └── seed.sql
├── .env.example
├── .env.local (gitignored)
├── .gitignore
├── package.json
├── tsconfig.json
├── tsconfig.node.json
├── tailwind.config.js
├── tailwind.config.ts
├── postcss.config.js
├── vite.config.ts
├── vercel.json
├── supabase.ts                    # Supabase CLI config
├── README.md
└── PLAN.md
```

---

## Core Implementation Details

### 1. Number to German Words Converter (`src/utils/numberToGermanWords.ts`)

**Range**: 0 to 2,000,000 with 2 decimal places

**Rules**:
- Integers: Standard German number words
- Decimals: "komma" + complete number word for decimal part
- Examples:
  - `0` → "null"
  - `7` → "sieben"
  - `42` → "zweiundvierzig"
  - `101` → "hunderteins"
  - `1000` → "eintausend"
  - `1234.56` → "eintausendzweihundertvierunddreißig komma sechsundfünfzig"
  - `1000000.00` → "eine million"
  - `2000000` → "zwei millionen"
  - `0.56` → "null komma sechsundfünfzig"
  - `1.5` → "eins komma fünfzig"
  - `1.05` → "eins komma null fünf"

**Implementation Approach**:
```typescript
// Split into integer and decimal parts
// Convert integer part using recursive hundreds/thousands/millions
// Convert decimal part as complete number (not digit by digit)
// Join with " komma "
```

**Test Cases**:
```typescript
const testCases = [
  { input: 0, expected: "null" },
  { input: 7, expected: "sieben" },
  { input: 42, expected: "zweiundvierzig" },
  { input: 101, expected: "hunderteins" },
  { input: 1000, expected: "eintausend" },
  { input: 1234.56, expected: "eintausendzweihundertvierunddreißig komma sechsundfünfzig" },
  { input: 1000000, expected: "eine million" },
  { input: 2000000, expected: "zwei millionen" },
  { input: 0.56, expected: "null komma sechsundfünfzig" },
  { input: 1.5, expected: "eins komma fünfzig" },
  { input: 1.05, expected: "eins komma null fünf" },
  { input: 123456.78, expected: "einhundertdreiundzwanzigtausendvierhundertsechsundfünfzig komma achtundsiebzig" },
];
```

### 2. TTS System (`src/features/tts/`)

**Provider Interface**:
```typescript
interface TTSProvider {
  speak(text: string, options?: TTSOptions): Promise<ArrayBuffer>;
  getVoices(): Promise<TTSVoice[]>;
  isAvailable(): boolean;
}
```

**Google TTS Provider**:
- Calls Supabase Edge Function (hides API key)
- Supports: Standard, Wavenet, Neural2 voices
- Caching: IndexedDB with text+voice as key

**Web Speech Provider**:
- Browser native `speechSynthesis`
- No API key needed
- Quality varies by browser/OS

**Fallback Logic**:
1. Try Google TTS
2. On error/quota exceeded → Web Speech
3. Cache successful audio in IndexedDB
4. Serve from cache on repeat

### 3. Dictionary Integration (`src/features/dictionary/`)

**Source**: Wiktionary API (primary) + DWDS (fallback)

**Wiktionary API**:
```
https://de.wiktionary.org/w/api.php?action=query&list=search&srsearch=häufige%20wörter&format=json
```

**Difficulty Classification**:
- **Easy**: Top 1000 most frequent German words (A1/A2)
- **Medium**: 1000-3000 frequency (B1)
- **Hard**: 3000+ frequency, compound words, technical terms (B2/C1)

**Caching Strategy**:
- localStorage: Recent words (last 100)
- Supabase: User's learned words, favorites
- IndexedDB: Audio cache

**Word Object**:
```typescript
interface GermanWord {
  word: string;
  translation: string;
  difficulty: 'easy' | 'medium' | 'hard';
  partOfSpeech: string;
  frequency: number;
  audioUrl?: string;
  examples?: string[];
}
```

### 4. Game Engine (`src/features/game/`)

**Game Modes**:
```typescript
type GameMode = 'numbers' | 'words' | 'mixed';
type Difficulty = 'easy' | 'medium' | 'hard';
```

**Session Flow**:
```
1. User selects mode + difficulty → POST /api/game/sessions
2. GET /api/game/questions?mode=X&difficulty=Y
3. Play audio → User types answer
4. POST /api/game/answers (validate server-side)
5. Return { correct, correctAnswer, score, streak }
6. Show feedback → Next question
7. User ends session → PATCH /api/game/sessions/:id/complete
```

**Scoring System**:
```typescript
// Base points per correct answer
const BASE_POINTS = 10;

// Difficulty multiplier
const DIFFICULTY_MULTIPLIER = { easy: 1, medium: 1.5, hard: 2 };

// Streak bonus (capped)
const STREAK_BONUS = Math.min(streak * 2, 20);

// Speed bonus
const SPEED_BONUS = responseTime < 3000 ? 5 : responseTime < 5000 ? 3 : 0;

// Total
const points = Math.round((BASE_POINTS + STREAK_BONUS + SPEED_BONUS) * DIFFICULTY_MULTIPLIER[difficulty]);
```

**Answer Validation**:
- Normalize: lowercase, trim, "ß" → "ss", "ä" → "ae", etc.
- For numbers: Accept both "eintausend" and "tausend"
- For decimals: "komma" required, decimal part as complete number

### 5. Internationalization (`src/i18n/`)

**Structure**:
```json
// de.json
{
  "common": { "loading": "Laden...", "error": "Fehler" },
  "ui": { "start": "Starten", "settings": "Einstellungen", "profile": "Profil" },
  "game": {
    "modes": { "numbers": "Zahlen", "words": "Wörter", "mixed": "Gemischt" },
    "difficulty": { "easy": "Leicht", "medium": "Mittel", "hard": "Schwer" },
    "feedback": { "correct": "Richtig!", "incorrect": "Falsch", "correctAnswer": "Richtige Antwort:" },
    "stats": { "score": "Punkte", "streak": "Serie", "accuracy": "Genauigkeit" }
  },
  "auth": { "login": "Anmelden", "register": "Registrieren", "logout": "Abmelden" }
}
```

---

## Database Schema (Supabase)

```sql
-- 1. Profiles (extends auth.users)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users PRIMARY KEY,
  username TEXT UNIQUE,
  preferred_language TEXT DEFAULT 'de' CHECK (preferred_language IN ('de', 'en')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Game Sessions
CREATE TABLE game_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE,
  mode TEXT NOT NULL CHECK (mode IN ('numbers', 'words', 'mixed')),
  difficulty TEXT NOT NULL CHECK (difficulty IN ('easy', 'medium', 'hard')),
  score INTEGER DEFAULT 0,
  streak INTEGER DEFAULT 0,
  max_streak INTEGER DEFAULT 0,
  total_questions INTEGER DEFAULT 0,
  correct_answers INTEGER DEFAULT 0,
  total_response_time_ms INTEGER DEFAULT 0,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- 3. Answers
CREATE TABLE answers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID REFERENCES game_sessions ON DELETE CASCADE,
  question_type TEXT NOT NULL CHECK (question_type IN ('number', 'word')),
  question_value TEXT NOT NULL,           -- e.g., "1234.56" or "Haus"
  correct_answer TEXT NOT NULL,           -- e.g., "eintausendzweihundert... komma sechsundfünfzig"
  user_answer TEXT NOT NULL,
  is_correct BOOLEAN NOT NULL,
  response_time_ms INTEGER NOT NULL,
  points_earned INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. User Vocabulary (learned words)
CREATE TABLE user_vocabulary (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE,
  word TEXT NOT NULL,
  difficulty TEXT NOT NULL CHECK (difficulty IN ('easy', 'medium', 'hard')),
  times_practiced INTEGER DEFAULT 0,
  times_correct INTEGER DEFAULT 0,
  last_practiced_at TIMESTAMPTZ DEFAULT NOW(),
  mastered BOOLEAN DEFAULT FALSE,
  UNIQUE(user_id, word)
);

-- Indexes
CREATE INDEX idx_game_sessions_user_id ON game_sessions(user_id);
CREATE INDEX idx_game_sessions_started_at ON game_sessions(started_at DESC);
CREATE INDEX idx_answers_session_id ON answers(session_id);
CREATE INDEX idx_user_vocabulary_user_id ON user_vocabulary(user_id);

-- Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_vocabulary ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can view own sessions" ON game_sessions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own sessions" ON game_sessions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own sessions" ON game_sessions FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own answers" ON answers FOR SELECT USING (
  EXISTS (SELECT 1 FROM game_sessions WHERE id = answers.session_id AND user_id = auth.uid())
);
CREATE POLICY "Users can insert answers to own sessions" ON answers FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM game_sessions WHERE id = answers.session_id AND user_id = auth.uid())
);

CREATE POLICY "Users can view own vocabulary" ON user_vocabulary FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own vocabulary" ON user_vocabulary FOR ALL USING (auth.uid() = user_id);
```

---

## Supabase Edge Function: TTS Proxy

**File**: `supabase/functions/tts-proxy/index.ts`

```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface TTSRequest {
  text: string;
  lang?: string;
  voice?: string;
  speed?: number;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { text, lang = "de-DE", voice = "de-DE-Neural2-A", speed = 1.0 } = await req.json() as TTSRequest;

    if (!text || text.length > 5000) {
      return new Response(JSON.stringify({ error: "Invalid text" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    const apiKey = Deno.env.get("GOOGLE_TTS_API_KEY");
    if (!apiKey) {
      return new Response(JSON.stringify({ error: "TTS not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    const response = await fetch(
      `https://texttospeech.googleapis.com/v1/text:synthesize?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          input: { text },
          voice: { languageCode: lang, name: voice },
          audioConfig: { audioEncoding: "MP3", speakingRate: speed }
        })
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || "Google TTS error");
    }

    const data = await response.json();
    
    return new Response(JSON.stringify({ audioContent: data.audioContent }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
});
```

---

## Deployment Configuration

### Vercel (`vercel.json`)
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ],
  "env": {
    "VITE_SUPABASE_URL": "@supabase-url",
    "VITE_SUPABASE_ANON_KEY": "@supabase-anon-key"
  }
}
```

### Supabase CLI (`supabase/config.toml`)
```toml
project_id = "your-project-id"

[functions]
  verify_jwt = false

[functions.tts-proxy]
  verify_jwt = true
```

---

## Implementation Phases

### Phase 0: Project Setup (Day 1)
- [ ] Initialize Vite + React + TypeScript + Tailwind
- [ ] Configure ESLint, Prettier, Husky
- [ ] Set up Supabase project
- [ ] Create GitHub repo + Vercel project
- [ ] CI/CD pipeline (lint, typecheck, build)

### Phase 1: Core Utilities (Day 2-3)
- [ ] `numberToGermanWords.ts` with comprehensive tests
- [ ] i18n system (de/en JSON files + React context)
- [ ] UI component library (Button, Input, Card, etc.)
- [ ] Tailwind config with German-friendly fonts

### Phase 2: Auth & Database (Day 4-5)
- [ ] Supabase client setup
- [ ] Auth pages (Login, Register, Forgot Password)
- [ ] Profile management
- [ ] RLS policies + migrations
- [ ] Auth store (Zustand)

### Phase 3: TTS System (Day 6-7)
- [ ] Edge Function for Google TTS
- [ ] TTS Provider interface + implementations
- [ ] Audio caching (IndexedDB)
- [ ] Fallback logic
- [ ] AudioPlayer component

### Phase 4: Dictionary (Day 8-9)
- [ ] Wiktionary API integration
- [ ] Difficulty classification
- [ ] Word caching
- [ ] Word fetching hooks

### Phase 5: Game Engine (Day 10-12)
- [ ] Question generation (numbers + words)
- [ ] Answer validation + normalization
- [ ] Scoring system
- [ ] Game session management
- [ ] Game play components

### Phase 6: Pages & Polish (Day 13-14)
- [ ] Home page (mode/difficulty selection)
- [ ] Game page (play area)
- [ ] Settings page (language, voice, difficulty defaults)
- [ ] Profile page (stats, history, vocabulary)
- [ ] Responsive design
- [ ] Accessibility (ARIA, keyboard nav)

### Phase 7: Deploy & Test (Day 15)
- [ ] Deploy Edge Functions
- [ ] Run migrations
- [ ] Deploy to Vercel
- [ ] End-to-end testing
- [ ] Performance optimization

---

## Open Decisions (To Confirm)

1. **Auth Methods**: Email/password only, or add OAuth (Google/GitHub)?
2. **Dictionary API**: Wiktionary (free) vs DWDS (official, may need registration)?
3. **Voice Options**: Offer voice selection (Standard/Wavenet/Neural2)?
4. **Offline Support**: Service Worker + IndexedDB for offline play?
5. **Leaderboards**: Global, friends-only, or none?
6. **Spaced Repetition**: Add SRS algorithm for vocabulary review?

---

## Success Metrics

| Metric | Target |
|--------|--------|
| Page Load | < 2s |
| TTS Latency | < 1s (cached), < 3s (fresh) |
| Answer Validation | < 100ms |
| Lighthouse Score | > 90 |
| Test Coverage | > 80% |

---

## Risk Mitigation

| Risk | Mitigation |
|------|------------|
| Google TTS quota exceeded | Web Speech fallback + caching |
| Dictionary API rate limits | Aggressive caching + local fallback word list |
| Supabase free tier limits | Monitor usage, optimize queries |
| German number complexity | Comprehensive test suite + edge case handling |
| Mobile audio issues | Test on iOS/Android, provide manual play button |

---

## Next Steps

1. **Confirm open decisions** above
2. **Initialize project** with Phase 0
3. **Build number converter** first (independently testable)
4. **Set up Supabase** project and run migrations
5. **Deploy TTS Edge Function** early to test integration

---

*Document Version: 1.0*  
*Last Updated: 2026-08-06*  
*Project: German Learning App*