# Prompt Roulette Architecture

## Goal and Scope

Build a polished, single-device party-game demo for 2-4 players. Players take turns entering answers on the same screen. Skip accounts, voice, external databases, and cross-device rooms for the hackathon; persist the room in that browser so a refresh does not erase the game.

## Frontend

- Next.js App Router with TypeScript and React; one responsive game flow covers setup, player profiles, round play, results, and replay.
- Keep UI and game state in the app rather than introducing a separate frontend service.
- Store the current room in `localStorage`, with a versioned state shape so it can be reset or migrated during development.

## Backend and AI Layer

- Next.js Route Handlers provide the only backend surface. The browser sends the current player profiles, round history, and memory summaries to the routes that need them.
- Call one hosted LLM provider from server-only code using its official TypeScript SDK and a server-side API key. Keep provider-specific prompt and structured-output handling in one module so it can be swapped without changing the game flow.
- Request schema-validated JSON, not prose that the UI must parse. Validate route inputs and model outputs; return a clear retryable error if generation or judging fails.
- Do not send secrets to the browser. Do not persist player data on the server in the demo.

## Game State

The browser's versioned room state is the source of truth. It contains the room phase, players, current round, completed rounds, scores, and each player's memory. Updates are saved after each meaningful action. For this hackathon, all players use one browser and one device; a reload resumes the room, but another device cannot join it.

## Memory Model

Keep compact, explicit per-player memory rather than building a vector database or long-term profile service:

- Profile: name, interests, favorite media/games, humor style, fun facts, and preferred topics.
- Learned notes: a short list of observations with evidence, such as recurring references, answer style, strengths, and topics to avoid.
- Round history: recent submitted answers, scores, and round identifiers; retain only a small recent window in prompts.

At judging time, return both scores and brief evidence-backed memory updates per player. Merge those updates into the room state and cap note/history lengths. Treat all player-provided text as untrusted game content, not as instructions to the model. Do not infer sensitive traits; allow players to edit or clear their profile and learned notes.

## API Routes

- `POST /api/rounds/generate`: accept player profiles, compact memory, and recent round context; return a challenge, answer constraints, and judging rubric.
- `POST /api/rounds/judge`: accept the challenge, rubric, player answers, profiles, and relevant memory; return a score and short rationale for every player, host commentary, and memory updates.

The client owns retries and applies successful results atomically to its room state. Keep judging rubric and score range fixed across a game; require the model to score every player against the same criteria and return structured values.

## Data Model

```ts
type Player = {
  id: string;
  name: string;
  interests: string[];
  favorites: string[];
  humorStyle: string;
  funFacts: string[];
  preferredTopics: string[];
  memoryNotes: MemoryNote[];
  score: number;
};

type MemoryNote = {
  text: string;
  evidenceRoundId: string;
};

type Round = {
  id: string;
  challenge: string;
  constraints: string[];
  rubric: string[];
  answers: Record<string, string>;
  results?: Array<{
    playerId: string;
    points: number;
    rationale: string;
    commentary: string;
  }>;
};

type Room = {
  version: 1;
  phase: "setup" | "answering" | "results" | "finished";
  players: Player[];
  rounds: Round[];
  currentRoundId?: string;
};
```

## Round Lifecycle

1. Create a room and collect 2-4 player profiles.
2. Generate a challenge from profiles and compact learned memory; save the round and show it to players.
3. Collect one answer per player in turn and save each answer locally.
4. Submit all answers together for one consistent judging call.
5. Validate the result, award points, show host commentary and rationales, merge memory updates, and persist the results.
6. Start the next round using updated memory, or finish and offer a replay with the same players.

If generation or judging fails, keep the current room and answers intact so the action can be retried.

## Deliberate Demo Limits

No authentication, database, live synchronization, moderation pipeline, or multi-device room links. Browser storage is not a privacy boundary: avoid collecting sensitive information, provide a clear-room action, and use short prompt context. These can be revisited only if the demo's core loop is already working.