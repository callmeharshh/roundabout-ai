# Prompt Roulette

An AI-hosted party game that builds challenges around the group, judges answers, and adapts its next round based on what players actually did.

## Run locally

1. Install Node.js and run `npm ci`.
2. Copy `.env.example` to `.env.local`.
3. Create a new OpenAI API key and put it in `.env.local` as `OPENAI_API_KEY`. Never paste keys into chat, source files, or GitHub. If a key has been exposed, revoke it before creating a replacement.
4. Run `npm run dev` and open `http://localhost:3000`.

The key is read only by server-side routes. `.env.local` is ignored by Git. `OPENAI_MODEL` defaults to `gpt-4o-mini` and can be set in `.env.local`.

## Netlify deployment

Production site: https://roundabout-ai.netlify.app/ Netlify detects the Next.js App Router and uses its maintained Next.js runtime automatically.

<img width="2560" height="1438" alt="image" src="https://github.com/user-attachments/assets/088a821a-9a33-4485-9717-4ee751930eb5" />

To enable live AI in production, revoke any key that has been pasted into chat, create a replacement, then add `OPENAI_API_KEY` as a **secret environment variable** in Netlify at **Site configuration → Environment variables**. Redeploy after setting it. Never put the value in this repository or a deploy command. Until configured, the clearly labeled backup host and judge keep the game playable.

## Demo flow

Choose **Use a ready-made demo crew**, meet the host, and launch the game. In Round 1, have a player make a distinctive choice in their answer, such as a comparison, a quoted character voice, a callback, or a playful metaphor. The judge returns a score and an evidence-backed observation for each player. Choose **Show me what the host learned**: the next challenge uses an observation and quote from the actual answer. Finish Round 2 to reveal the cumulative winner.

The browser saves the session, answers, scores, and learned notes, so refreshing resumes the current step. If the OpenAI request fails or no key is configured, the app uses its clearly labeled local backup behavior; the core demo remains playable.

## AI and memory

The judge evaluates all answers together against the same fixed rubric. It returns structured scores, short explanations, host commentary, and one observable learning note per player. Each note includes a quote that must appear in that player's answer. Later challenge generation receives the saved notes and round history; its visible memory callout is checked against the evidence. No chain-of-thought is requested or shown.
