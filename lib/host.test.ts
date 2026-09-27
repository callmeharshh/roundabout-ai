import { hostService, type PlayerContext } from './host';

const players: PlayerContext[] = [
  {
    id: 'alex',
    name: 'Alex',
    interests: ['F1', 'Minecraft', 'AI'],
    humorStyle: 'absurd',
    previousAnswers: ['This train is powered by pure panic and very expensive caffeine.', 'I would trust a vending machine with my soul.'],
    observations: ['Frequently references F1', 'Enjoys absurd scenarios', 'Strong at one-liners'],
    score: 14,
  },
  {
    id: 'mila',
    name: 'Mila',
    interests: ['design', 'music', 'books'],
    humorStyle: 'witty',
    previousAnswers: ['A museum of awkward silences would absolutely sell out.', 'The moon has invented a better brand strategy.'],
    observations: ['Good with metaphors', 'Strong on turnout and rhythm'],
    score: 18,
  },
  {
    id: 'zoe',
    name: 'Zoe',
    interests: ['food', 'chaos', '90s sitcoms'],
    humorStyle: 'chaotic',
    previousAnswers: ['The toaster and I are in a passive-aggressive relationship.', 'I would trust a haunted printer more than a manager.'],
    observations: ['Loves outrageous premises', 'Delivers big physical energy'],
    score: 12,
  },
];

const round = hostService.generateRound(players, 2, [{ prompt: 'Some previous challenge' }]);
const intro = hostService.introduceRound(round, players);
const reaction = hostService.reactToAnswers({ alex: 'I am the vending machine whisperer and I have a treat for you.', mila: 'The moon wants a rebrand, but only if it can keep the drama.' }, players, round);
const commentary = hostService.generateJudgeCommentary(players, { alex: 'The city has feelings and no accountability.' }, round);
const finalCommentary = hostService.generateFinalCommentary(players);
const observations = players.map((player) => hostService.updatePlayerObservations(player, round, player.previousAnswers[0]));

console.log(JSON.stringify({ round, intro, reaction, commentary, finalCommentary, observations }, null, 2));
