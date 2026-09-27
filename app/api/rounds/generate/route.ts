import { NextResponse } from 'next/server';
import { createHostIntroduction } from '@/lib/host';
import type { Player } from '@/lib/game-data';

export const runtime = 'nodejs';

type ProfileInput = Pick<Player, 'id' | 'name' | 'interests' | 'favorites' | 'preferredTopics' | 'avoidedTopics' | 'humorStyle' | 'funFacts'>;

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function isStringList(value: unknown): value is string[] {
  return Array.isArray(value)
    && value.length <= 12
    && value.every((item) => typeof item === 'string' && item.trim().length <= 120);
}

function isProfile(value: unknown): value is ProfileInput {
  if (!isRecord(value)) return false;
  return typeof value.id === 'string'
    && value.id.length > 0
    && typeof value.name === 'string'
    && value.name.trim().length > 0
    && value.name.length <= 40
    && isStringList(value.interests)
    && isStringList(value.favorites)
    && isStringList(value.preferredTopics)
    && isStringList(value.avoidedTopics)
    && typeof value.humorStyle === 'string'
    && value.humorStyle.length <= 60
    && isStringList(value.funFacts);
}

export async function POST(request: Request) {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: 'The host needs valid profile cards to read.' }, { status: 400 });
  }

  if (!isRecord(payload) || !Array.isArray(payload.players) || payload.players.length < 2 || payload.players.length > 4 || !payload.players.every(isProfile)) {
    return NextResponse.json({ error: 'Add 2-4 player profiles before meeting the host.' }, { status: 400 });
  }

  const profiles = payload.players;
  if (new Set(profiles.map((player) => player.id)).size !== profiles.length) {
    return NextResponse.json({ error: 'Each player needs a unique profile.' }, { status: 400 });
  }

  const players: Player[] = profiles.map((profile) => ({
    ...profile,
    score: 0,
    profileMemory: [],
    sessionMemory: [],
    behavioralMemory: [],
  }));

  return NextResponse.json(await createHostIntroduction(players));
}