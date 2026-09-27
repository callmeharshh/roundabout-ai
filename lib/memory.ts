import type { Player } from './game-data';
import type { GeneratedRound } from './host';

export type MemoryObservation = {
  text: string;
  confidence: number;
};

export type PlayerMemoryUpdate = {
  playerId: string;
  newObservations: MemoryObservation[];
  updatedTraits: Record<string, number>;
};

export type GameStateForMemory = {
  players: Player[];
  rounds: Array<{
    id: string;
    prompt: string;
    category: string;
    winner: string | null;
    answers: Record<string, string>;
    judging: Array<{ playerId: string; points: number; rationale: string }>;
  }>;
};

const traitSeeds = {
  absurdHumor: 0.45,
  roleplay: 0.42,
  oneLiners: 0.38,
  theatricality: 0.4,
  metaphorical: 0.37,
  chaosPreference: 0.35,
};

function dedupeObservations(items: MemoryObservation[]): MemoryObservation[] {
  const seen = new Set<string>();
  const unique: MemoryObservation[] = [];

  for (const item of items) {
    const key = item.text.toLowerCase();
    if (!seen.has(key)) {
      seen.add(key);
      unique.push({
        text: item.text,
        confidence: Math.min(0.99, Math.max(0.5, Number(item.confidence.toFixed(2)))),
      });
    }
  }

  return unique.slice(0, 4);
}

export function updatePlayerMemory(gameState: GameStateForMemory, roundResult: { playerId: string; answer: string; points: number; rationale: string }): PlayerMemoryUpdate {
  const player = gameState.players.find((entry) => entry.id === roundResult.playerId);

  if (!player) {
    return { playerId: roundResult.playerId, newObservations: [], updatedTraits: {} };
  }

  const answerText = roundResult.answer || '';
  const previousRounds = gameState.rounds.length;
  const likelyAbsurd = /toaster|vending|elevator|monster|space|chaos|ridiculous|absurd|dramatic|public transport|mood/i.test(answerText);
  const likelyRoleplay = /voiceover|acceptance speech|announcer|concierge|campaign|interview|monologue|confession/i.test(answerText);
  const likelyOneLiner = answerText.length < 120 && answerText.includes('.') ? true : answerText.length < 160;
  const likelyMetaphor = /metaphor|soul|heart|emotion|drama|spiritual|story|cinematic|vibes/i.test(answerText);

  const newObservations = dedupeObservations([
    {
      text: likelyAbsurd ? 'Uses absurd, high-concept premises when the prompt gives room for chaos.' : 'Builds clean, punchy answers under pressure.',
      confidence: roundResult.points >= 8 ? 0.9 : 0.72,
    },
    {
      text: likelyRoleplay ? 'Leans into roleplay and voiced character framing.' : 'Prefers direct, single-voice jokes over full character work.',
      confidence: likelyRoleplay ? 0.84 : 0.7,
    },
    {
      text: likelyOneLiner ? 'Strong at compact punchlines and sharp one-liners.' : 'Tends to build longer narrative-style answers.',
      confidence: likelyOneLiner ? 0.85 : 0.68,
    },
    {
      text: likelyMetaphor ? 'Frequently turns the prompt into a dramatic metaphor.' : 'Keeps the delivery grounded when the premise is less theatrical.',
      confidence: likelyMetaphor ? 0.79 : 0.66,
    },
  ]);

  const updatedTraits = {
    absurdHumor: Math.min(0.99, (traitSeeds.absurdHumor + (likelyAbsurd ? 0.3 : 0.05) + (roundResult.points > 7 ? 0.18 : 0.04) + (previousRounds * 0.02))),
    roleplay: Math.min(0.99, (traitSeeds.roleplay + (likelyRoleplay ? 0.25 : 0.04) + (roundResult.points > 7 ? 0.12 : 0.02))),
    oneLiners: Math.min(0.99, (traitSeeds.oneLiners + (likelyOneLiner ? 0.24 : 0.05) + (roundResult.points > 7 ? 0.12 : 0.03))),
    theatricality: Math.min(0.99, (traitSeeds.theatricality + (likelyAbsurd ? 0.2 : 0.03) + (roundResult.points > 7 ? 0.12 : 0.02))),
    metaphorical: Math.min(0.99, (traitSeeds.metaphorical + (likelyMetaphor ? 0.26 : 0.03) + (roundResult.points > 7 ? 0.1 : 0.02))),
    chaosPreference: Math.min(0.99, (traitSeeds.chaosPreference + (likelyAbsurd ? 0.2 : 0.02) + (roundResult.points > 7 ? 0.1 : 0.03))),
  };

  return {
    playerId: player.id,
    newObservations,
    updatedTraits,
  };
}

export function applyMemoryToPlayer(player: Player, memory: PlayerMemoryUpdate): Player {
  const merged = [...player.behavioralMemory, ...memory.newObservations.map((obs) => `${obs.text} (confidence ${obs.confidence.toFixed(2)})`)]
    .filter((value, index, arr) => arr.indexOf(value) === index)
    .slice(-4);

  return {
    ...player,
    behavioralMemory: merged,
    score: player.score,
  };
}

export function buildMemoryAwareRoundPrompt(round: GeneratedRound, gamePlayers: Player[]): string {
  const memoryHints = gamePlayers.flatMap((player) => player.behavioralMemory.slice(0, 1));
  const hintText = memoryHints.length > 0 ? `The host is leaning into: ${memoryHints.join('; ')}.` : '';
  return `${round.prompt} ${hintText}`.trim();
}
