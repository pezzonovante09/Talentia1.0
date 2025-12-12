# Talentia Prototype

Educational React app for ages 4–7 featuring a friendly dinosaur guide (Tali), playful map navigation, and AI-powered math hints + chat.

## Requirements

- Node 18+
- Gemini API key (from [ai.google.dev](https://ai.google.dev/))

Create a `.env` in the project root:

```
GEMINI_API_KEY=your_key_here
PORT=5001
```

## Scripts

Run the backend (Gemini-powered API):

```
npm run server
```

Run the React app:

```
npm start
```

Build for production:

```
npm run build
```

## Features

- **Home / Story / Map / Islands:** Tailwind-styled screens with React Router navigation.
- **Math Missions:** Ten islands with unique questions + multiple-choice answers.
- **AI Hints:** Wrong answers trigger a Gemini hint via `/api/hints`.
- **Chat with Tali:** Text chat box powered by Gemini through `/api/chat`.
- **Voice Chat:** Temporarily disabled while we migrate TTS/STT providers (UI shows notice).

## Architecture

- `src/components` – Reusable UI (buttons, cards, chat panel).
- `src/pages` – Home, Dino intro, map, and dynamic island quiz.
- `src/data/islands.js` – Island definitions (question, answers, icon, colors).
- `server/index.js` – Express API that proxies Gemini for hints + chat (and placeholder voice route).

To deploy, build (`npm run build`) and host the `build` folder with your static host of choice; run the Express server separately (or adapt to your hosting platform). Make sure the frontend points to the correct API base URL in production (currently `/api/...`, so use a reverse proxy or configure environment variables).
