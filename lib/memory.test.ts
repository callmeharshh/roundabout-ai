import { buildMemoryAwareRoundPrompt, updatePlayerMemory } from './memory';

const gameState = {
  players: [
    {
      id: 'p1',
      name: 'Ari',
      interests: ['tech', 'chaos'],
      humorStyle: 'dry sarcasm',
      funFacts: [],
      score: 12,
      profileMemory: ['likes absurd prompts'],
      sessionMemory: ['round 1 landed a clean punchline'],
      behavioralMemory: ['Strong at compact punchlines', 'Prefers absurd premises'],
    },
    {
      id: 'p2',
      name: 'Mina',
      interests: ['design', 'storytelling'],
      humorStyle: 'whimsical chaos',
      funFacts: [],
      score: 16,
      profileMemory: ['likes cinematic prompts'],
      sessionMemory: ['round 1 preferred roleplay'],
      behavioralMemory: ['Leans into roleplay', 'Builds dramatic metaphors'],
    },
  ],
  rounds: [
    { id: 'r1', prompt: 'The toaster is holding a press conference.', category: 'Household Chaos', winner: 'p1', answers: {}, judging: [{ playerId: 'p1', points: 8, rationale: 'great punchline' }] },
    { id: 'r2', prompt: 'City transit is powered by vibes.', category: 'Future Bureaucracy', winner: 'p2', answers: {}, judging: [{ playerId: 'p2', points: 9, rationale: 'excellent metaphor' }] },
  ],
};

const memory = updatePlayerMemory(gameState, {
  playerId: 'p1',
  answer: 'The toaster said: I am not broken, I am just deeply committed to my art.',
  points: 9,
  rationale: 'Good absurd premise and solid final line.',
});

const prompt = buildMemoryAwareRoundPrompt({
  category: 'Future Bureaucracy',
  title: 'The Future Is Loud',
  prompt: 'A city council vote is being held to regulate emotional turbulence.',
  difficulty: 'medium',
  personalizationReason: 'Ari likes absurd prompts with a sharper punchline.',
  targetPlayers: ['p1'],
}, gameState.players);

console.log(JSON.stringify({ memory, prompt }, null, 2));
