'use client';

import { PLAY_MOVES, type PlayMoveId } from '@/lib/play-moves';

type PlayMovePickerProps = {
  playerName: string;
  value?: PlayMoveId;
  disabled?: boolean;
  onChange: (move: PlayMoveId) => void;
};

export function PlayMovePicker({ playerName, value, disabled = false, onChange }: PlayMovePickerProps) {
  return (
    <fieldset className="play-move-picker" disabled={disabled}>
      <legend><span>{playerName}</span><small>Choose your move</small></legend>
      <div className="play-move-options">
        {PLAY_MOVES.map((move) => (
          <button
            key={move.id}
            type="button"
            className={`play-move-option ${value === move.id ? 'selected' : ''}`}
            aria-pressed={value === move.id}
            onClick={() => onChange(move.id)}
          >
            <strong>{move.label}</strong>
            <span>{move.hint}</span>
          </button>
        ))}
      </div>
    </fieldset>
  );
}
