import type { ScoreBreakdown } from '@/lib/judge';

type JudgeResultProps = {
  playerName: string;
  points: number;
  breakdown: ScoreBreakdown;
  rationale: string;
};

export function JudgeResult({ playerName, points, breakdown, rationale }: JudgeResultProps) {
  const rubricLabels: Array<[keyof ScoreBreakdown, string]> = [
    ['promptFit', 'Prompt fit'],
    ['creativity', 'Creativity'],
    ['humor', 'Humor'],
    ['commitment', 'Commitment'],
    ['personalization', 'Personalization'],
  ];

  return (
    <div className="judge-box">
      <div className="player-row">
        <div className="player-name">{playerName}</div>
        <div className="player-score">{points}/100</div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '4px 8px', marginTop: 10, fontSize: '0.75rem' }}>
        {rubricLabels.map(([key, label]) => (
          <div key={key} style={{ display: 'flex', justifyContent: 'space-between', gap: 6 }}>
            <span>{label}</span>
            <strong>{breakdown[key]}/{key === 'commitment' ? 15 : key === 'personalization' ? 10 : 25}</strong>
          </div>
        ))}
      </div>
      <p>{rationale}</p>
    </div>
  );
}
