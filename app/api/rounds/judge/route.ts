import { NextResponse } from 'next/server';
import { judgeAnswers, type JudgeInput, type JudgePlayer } from '@/lib/judge';
import { isPlayMoveId } from '@/lib/play-moves';

export const runtime = 'nodejs';

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === 'string');
}

function isPlayer(value: unknown): value is JudgePlayer {
  if (!isRecord(value)) return false;
  return typeof value.id === 'string'
    && value.id.length > 0
    && typeof value.name === 'string'
    && value.name.length > 0
    && isStringArray(value.interests)
    && (value.avoidedTopics === undefined || isStringArray(value.avoidedTopics))
    && typeof value.humorStyle === 'string'
    && isStringArray(value.funFacts)
    && isStringArray(value.profileMemory)
    && isStringArray(value.behavioralMemory);
}

export async function POST(request: Request) {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: 'Request body must be valid JSON.' }, { status: 400 });
  }

  if (!isRecord(payload)
    || typeof payload.prompt !== 'string'
    || payload.prompt.trim().length === 0
    || payload.prompt.length > 1200
    || typeof payload.category !== 'string'
    || !Array.isArray(payload.players)
    || payload.players.length < 2
    || payload.players.length > 4
    || !payload.players.every(isPlayer)
    || !isRecord(payload.answers)
    || !isRecord(payload.moves)) {
    return NextResponse.json({ error: 'Provide a prompt, category, 2-4 players, an answer, and a play move for everyone.' }, { status: 400 });
  }

  const players = payload.players;
  const playerIds = players.map((player) => player.id);
  if (new Set(playerIds).size !== playerIds.length) {
    return NextResponse.json({ error: 'Player IDs must be unique.' }, { status: 400 });
  }

  const answers = payload.answers;
  if (playerIds.some((id) => typeof answers[id] !== 'string' || (answers[id] as string).trim().length === 0 || (answers[id] as string).length > 2000)) {
    return NextResponse.json({ error: 'Every player needs a non-empty answer under 2,000 characters.' }, { status: 400 });
  }
  const moves = payload.moves;
  if (playerIds.some((id) => !isPlayMoveId(moves[id]))) {
    return NextResponse.json({ error: 'Every player must lock one play move before judging.' }, { status: 400 });
  }

  const input: JudgeInput = {
    prompt: payload.prompt,
    category: payload.category,
    players,
    answers: Object.fromEntries(playerIds.map((id) => [id, (answers[id] as string).trim()])),
    moves: Object.fromEntries(playerIds.map((id) => [id, moves[id] as JudgeInput['moves'][string]])),
  };

  return NextResponse.json(await judgeAnswers(input));
}