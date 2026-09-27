export const PLAY_MOVES = [
  {
    id: 'comparison',
    label: 'Make a comparison',
    hint: '“It is like…”',
    pattern: /\b(like|as if|as though|compared to|resembles?)\b/i,
  },
  {
    id: 'character',
    label: 'Become a character',
    hint: 'Give it a voice',
    pattern: /["“”]|\b(said|whispered|announced|yelled|asks|says)\b/i,
  },
  {
    id: 'escalation',
    label: 'Escalate the chaos',
    hint: 'Make it get worse',
    pattern: /\b(then|until|suddenly|somehow|even|by the end|and then)\b/i,
  },
  {
    id: 'callback',
    label: 'Use a personal callback',
    hint: 'Bring your thing into it',
    pattern: null,
  },
] as const;

export type PlayMoveId = (typeof PLAY_MOVES)[number]['id'];

export function isPlayMoveId(value: unknown): value is PlayMoveId {
  return PLAY_MOVES.some((move) => move.id === value);
}

export function getPlayMove(id: PlayMoveId) {
  return PLAY_MOVES.find((move) => move.id === id)!;
}