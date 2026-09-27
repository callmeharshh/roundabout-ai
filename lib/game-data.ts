export type Player = {
  id: string;
  name: string;
  interests: string[];
  favorites: string[];
  preferredTopics: string[];
  avoidedTopics: string[];
  humorStyle: string;
  funFacts: string[];
  score: number;
  profileMemory: string[];
  sessionMemory: string[];
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
    favorites: ['Formula 1', 'The Office'],
    preferredTopics: ['snacks', 'clever twists'],
    avoidedTopics: [],
    humorStyle: 'dry sarcasm',
    funFacts: ['Can identify a movie by a single sound effect.', 'Keeps a spreadsheet of favorite snacks.'],
    score: 14,
    profileMemory: ['Loves weird prompts with category twists.', 'Acts competitive when the host is dramatic.'],
    sessionMemory: ['Round 1: landed a sharp, dry one-liner with precise shutdown energy.', 'Round 2: used an emotional metaphor that made the host laugh.'],
    behavioralMemory: ['Writes short but devastatingly clever lines.', 'Often turns emotional stakes into a joke without losing the punch.'],
  },
  {
    id: 'p2',
    name: 'Mina',
    interests: ['design', 'music', 'storytelling'],
    favorites: ['Studio Ghibli', 'indie pop'],
    preferredTopics: ['music', 'big feelings'],
    avoidedTopics: [],
    humorStyle: 'whimsical chaos',
    funFacts: ['Has a 10-song playlist for every mood.', 'Claims she can bluff at poker with a straight face.'],
    score: 19,
    profileMemory: ['Prefers answers that feel cinematic.', 'Will absolutely weaponize a metaphor.'],
    sessionMemory: ['Round 1: delivered a cleaner, more theatrical voice.', 'Round 2: leaned into public transit chaos and crowd energy.'],
    behavioralMemory: ['Gets louder when the room is watching.', 'Builds big, cinematic metaphors and strong final twists.'],
  },
  {
    id: 'p3',
    name: 'Jules',
    interests: ['food', 'games', 'meme history'],
    favorites: ['Mario Kart', 'breakfast cereal'],
    preferredTopics: ['food', 'internet lore'],
    avoidedTopics: [],
    humorStyle: 'chaotic energy',
    funFacts: ['Knows the origin of 200 online phrases.', 'Can name five breakfast cereals from memory.'],
    score: 12,
    profileMemory: ['Will go for absurdity over polish.', 'Likes topical references when they land.'],
    sessionMemory: ['Round 1: pushed absurdity over precision and won the room.', 'Round 2: overperformed on theatrical voice but missed the last beat.'],
    behavioralMemory: ['Paces before submitting a high-risk answer.', 'Favors outrageous premises and playful chaos.'],
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

export const ROOM_STORAGE_KEY = 'prompt-roulette-room-v1';

export const getGameById = (id: string): Game => mockGame;
