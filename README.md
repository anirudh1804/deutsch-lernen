# German Learning App

A web application for learning German numbers and vocabulary through interactive audio exercises.

## Features

- **Number Practice**: Generate random numbers (0–2,000,000) with up to 2 decimal places, spoken as full German words — the number is only heard, not shown; user types what they hear
  - Example: audio plays "eintausendzweihundertvierunddreißig Komma sechsundfünfzig" → user types `1234.56`
- **Vocabulary Practice**: Learn German words by difficulty level (easy/medium/hard) — the word is only heard, not shown; user types the German spelling
- **Game Modes**: Numbers only, Words only, or Mixed
- **Audio**: High-quality Google Cloud TTS with Web Speech API fallback
- **Progress Tracking**: User accounts with Supabase (streaks, scores, history)
- **Bilingual UI**: German/English toggle (German primary)

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + TypeScript + Vite |
| Styling | Tailwind CSS |
| State | Zustand + TanStack Query |
| Auth/DB | Supabase (Auth + PostgreSQL + Edge Functions) |
| TTS | Google Cloud TTS (via Edge Function) + Web Speech API fallback |
| Dictionary | Wiktionary API / DWDS API |
| Deployment | Vercel (frontend) + Supabase (backend) |

## Project Structure

```
german-learning-app/
├── public/
├── src/
│   ├── components/
│   │   ├── ui/           # Reusable UI components (Button, Input, Card, etc.)
│   │   ├── game/         # Game-specific components (NumberDisplay, AudioPlayer)
│   │   └── layout/       # Layout components (Header, Footer, LanguageToggle)
│   ├── features/
│   │   ├── auth/         # Authentication (login, register, profile)
│   │   ├── game/         # Game logic, modes, scoring
│   │   ├── dictionary/   # Word fetching, caching, difficulty classification
│   │   └── tts/          # TTS abstraction (Google + Web Speech)
│   ├── hooks/            # Custom React hooks
│   ├── lib/              # Utilities, Supabase client, helpers
│   ├── pages/            # Route pages (Home, Game, Settings, Profile)
│   ├── store/            # Zustand stores
│   ├── types/            # TypeScript types
│   ├── utils/            # numberToGermanWords, formatting
│   ├── styles/           # Global styles, Tailwind config
│   ├── i18n/             # German/English translations
│   ├── App.tsx
│   └── main.tsx
├── supabase/
│   ├── functions/        # Edge Functions (TTS proxy)
│   ├── migrations/       # Database schema
│   └── seed/             # Initial data
├── package.json
├── tsconfig.json
├── tailwind.config.js
├── vite.config.ts
└── vercel.json
```

## Getting Started

### Prerequisites
- Node.js 18+
- Supabase account
- Google Cloud account (for TTS API)

### Installation

```bash
# Clone and install
cd german-learning-app
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your Supabase and Google Cloud credentials

# Start development server
npm run dev
```

### Environment Variables

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
GOOGLE_TTS_API_KEY=your_google_cloud_tts_key
```

## Database Schema

- **profiles** - User preferences (language, username)
- **game_sessions** - Game sessions with mode, difficulty, scores
- **answers** - Individual answers with timing and correctness

All tables use Row Level Security (RLS).

## Development

```bash
# Run dev server
npm run dev

# Type check
npm run typecheck

# Lint
npm run lint

# Build for production
npm run build

# Preview production build
npm run preview
```

## Deployment

1. Push to GitHub
2. Connect repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy Supabase Edge Functions: `supabase functions deploy tts-proxy`
5. Run migrations: `supabase db push`

## License

MIT