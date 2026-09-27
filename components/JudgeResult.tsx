type JudgeResultProps = {
  playerName: string;
  points: number;
  rationale: string;
};

export function JudgeResult({ playerName, points, rationale }: JudgeResultProps) {
  return (
    <div className="judge-box">
      <div className="player-row">
        <div className="player-name">{playerName}</div>
        <div className="player-score">+{points}</div>
      </div>
      <p>{rationale}</p>
    </div>
  );
}
