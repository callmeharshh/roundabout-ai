export type Player = {
  id: string;
  name: string;
  interests: string[];
  humorStyle: string;
  funFacts: string[];
  score: number;
  profileMemory: string[];
  behavioralMemory: string[];
};

export type Round = {
  id: string;
  number: number;
  category: string;
  prompt: string;
  answers: Record<string, string>;
  judging: Array<{ playerId: string; points: number; rationale: string }>;
  winner: string | null;
  hostCommentary: string;
};

export type Game = {
  id: string;
  status: 'lobby' | 'playing' | 'finished';
  roundNumber: number;
  maxRounds: number;
  hostState: string;
  players: Player[];
  rounds: Round[];
  createdAt: string;
};

export const mockPlayers: Player[] = [
  {
    id: 'p1',
    name: 'Ari',
    interests: ['tech', 'chaos', 'midnight snacks'],
    humorStyle: 'dry sarcasm',
    funFacts: ['Can identify a movie by a single sound effect.', 'Keeps a spreadsheet of favorite snacks.'],
    score: 14,
    profileMemory: ['Loves weird prompts with category twists.', 'Acts competitive when the host is dramatic.'],
    behavioralMemory: ['Writes short but devastatingly clever lines.'],
  },
  {
    id: 'p2',
    name: 'Mina',
    interests: ['design', 'music', 'storytelling'],
    humorStyle: 'whimsical chaos',
    funFacts: ['Has a 10-song playlist for every mood.', 'Claims she can bluff at poker with a straight face.'],
    score: 19,
    profileMemory: ['Prefers answers that feel cinematic.', 'Will absolutely weaponize a metaphor.'],
    behavioralMemory: ['Gets louder when the room is watching.'],
  },
  {
    id: 'p3',
    name: 'Jules',
    interests: ['food', 'games', 'meme history'],
    humorStyle: 'chaotic energy',
    funFacts: ['Knows the origin of 200 online phrases.', 'Can name five breakfast cereals from memory.'],
    score: 12,
    profileMemory: ['Will go for absurdity over polish.', 'Likes topical references when they land.'],
    behavioralMemory: ['Paces before submitting a high-risk answer.'],
  },
];

export const mockGame: Game = {
  id: 'demo-room',
  status: 'playing',
  roundNumber: 2,
  maxRounds: 5,
  hostState: 'rising to the challenge',
  players: mockPlayers,
  rounds: [
    {
      id: 'r1',
      number: 1,
      category: 'Household Chaos',
      prompt: 'Name the most dramatic thing a toaster could say before a breakup.',
      answers: {
        p1: 'I just wanted to make you toast, but you kept trying to brown me for attention.',
        p2: 'I can feel your crumbs, and I know this is just a little slice of our shared history.',
        p3: 'I am not overheating, I am just trying to become a piece of art in a kitchen museum.',
      },
      judging: [
        { playerId: 'p1', points: 8, rationale: 'Sharp and unexpectedly emotional.' },
        { playerId: 'p2', points: 9, rationale: 'Best cadence and dramatic flourish.' },
        { playerId: 'p3', points: 7, rationale: 'Wildly funny but slightly less precise.' },
      ],
      winner: 'p2',
      hostCommentary: 'That was a surprisingly heartfelt meltdown from the toaster aisle. Keep your most ridiculous ideas in the air, not the sink.',
    },
    {
      id: 'r2',
      number: 2,
      category: 'Future Spin',
      prompt: 'A city of the future runs on vibes instead of energy. What does the public transit announcer say?',
      answers: {
        p1: 'Next stop: emotional resonance, please mind the spiritual turbulence.',
        p2: 'Passengers, the train is powered by hype and terrible choices. Please hold onto your screens.',
        p3: 'We are now arriving at Mood Plaza, where all delays are interpreted as a character arc.',
      },
      judging: [
        { playerId: 'p1', points: 9, rationale: 'Inventive and poetically smug.' },
        { playerId: 'p2', points: 8, rationale: 'High-energy parody with a clean punchline.' },
        { playerId: 'p3', points: 6, rationale: 'Strong theatricality, weaker finish.' },
      ],
      winner: 'p1',
      hostCommentary: 'That was pure game-show absurdity. The future is chaos, but it definitely has personality.',
    },
  ],
  createdAt: new Date().toISOString(),
};

export const getGameById = (id: string): Game => mockGame;
