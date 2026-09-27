import type { Player } from '@/lib/game-data';
import type { HostIntroduction } from '@/lib/host';
import type { JudgeResponse, ScoreBreakdown } from '@/lib/judge';
import type { PlayMoveId } from '@/lib/play-moves';

export type PlayedRound = {
  number: number;
  category: string;
  prompt: string;
  answers: Record<string, string>;
  moves: Record<string, PlayMoveId>;
  result: JudgeResponse;
};

export type GameSession = {
  version: 1;
  players: Player[];
  introduction: HostIntroduction;
  roundNumber: number;
  category: string;
  prompt: string;
  rounds: PlayedRound[];
  answers: Record<string, string>;
  moves: Record<string, PlayMoveId>;
  memoryCallout?: string;
  hostGreeting?: string;
  phase: 'answering' | 'results' | 'finished';
};

const RUBRIC_LABELS: Record<keyof ScoreBreakdown, string> = {
  promptFit: 'prompt fit',
  creativity: 'creative answers',
  humor: 'humor',
  commitment: 'commitment to the bit',
  personalization: 'personal references',
};

export function createInitialSession(players: Player[], introduction: HostIntroduction): GameSession {
  return {
    version: 1,
    players,
    introduction,
    roundNumber: 1,
    category: introduction.category,
    prompt: introduction.prompt,
    rounds: [],
    answers: {},
    moves: {},
    phase: 'answering',
  };
}

export function completeRound(session: GameSession, answers: Record<string, string>, moves: Record<string, PlayMoveId>, result: JudgeResponse): GameSession {
  const round: PlayedRound = {
    number: session.roundNumber,
    category: session.category,
    prompt: session.prompt,
    answers,
    moves,
    result,
  };
  const players = session.players.map((player) => {
    const ranking = result.rankings.find((row) => row.playerId === player.id);
    if (!ranking) return player;

    const notes = [...player.behavioralMemory];
    const memoryUpdate = result.memoryUpdates.find((update) => update.playerId === player.id);
    if (memoryUpdate) {
      notes.push(`Round ${session.roundNumber}: chose ${memoryUpdate.playMove}; ${memoryUpdate.moveLanded ? 'landed the move' : 'the move did not quite land'}; ${memoryUpdate.observation}. Evidence: “${memoryUpdate.evidence}”`);
    }
    const strongest = (Object.keys(RUBRIC_LABELS) as Array<keyof ScoreBreakdown>).reduce((best, key) => ranking.breakdown[key] > ranking.breakdown[best] ? key : best, 'promptFit');
    notes.push(`Round ${session.roundNumber}: scored strongest on ${RUBRIC_LABELS[strongest]}.`);

    return {
      ...player,
      score: player.score + ranking.score,
      behavioralMemory: Array.from(new Set(notes)).slice(-6),
    };
  });

  return {
    ...session,
    players,
    rounds: [...session.rounds, round],
    answers: {},
    moves: {},
    phase: 'results',
  };
}

export function startNextRound(session: GameSession, nextRound: { category: string; prompt: string; memoryCallout: string; hostGreeting: string }): GameSession {
  return {
    ...session,
    roundNumber: 2,
    category: nextRound.category,
    prompt: nextRound.prompt,
    answers: {},
    moves: {},
    memoryCallout: nextRound.memoryCallout,
    hostGreeting: nextRound.hostGreeting,
    phase: 'answering',
  };
}

export function finishSession(session: GameSession): GameSession {
  return { ...session, phase: 'finished' };
}