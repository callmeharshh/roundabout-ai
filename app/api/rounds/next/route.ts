import { NextResponse } from 'next/server';
import { createNextRound } from '@/lib/host';
import type { GameSession } from '@/lib/game-session';

export const runtime = 'nodejs';

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function isSession(value: unknown): value is GameSession {
  if (!isRecord(value) || value.version !== 1 || value.roundNumber !== 1 || value.phase !== 'results') return false;
  if (!Array.isArray(value.players) || value.players.length < 2 || value.players.length > 4) return false;
  if (!Array.isArray(value.rounds) || value.rounds.length !== 1 || !isRecord(value.introduction)) return false;
  return value.players.every((player) => isRecord(player)
    && typeof player.id === 'string'
    && typeof player.name === 'string'
    && Array.isArray(player.behavioralMemory)
    && player.behavioralMemory.length > 0)
    && isRecord(value.rounds[0])
    && isRecord(value.rounds[0].result);
}

export async function POST(request: Request) {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: 'The host lost its notes. Please reveal the round again.' }, { status: 400 });
  }
  if (!isRecord(payload) || !isSession(payload.session)) {
    return NextResponse.json({ error: 'Finish judging Round 1 before asking for the next challenge.' }, { status: 400 });
  }
  return NextResponse.json(await createNextRound(payload.session));
}