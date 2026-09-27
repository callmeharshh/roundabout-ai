import type { Player } from '@/lib/game-data';

type ScoreboardProps = {
  players: Player[];
};

export function Scoreboard({ players }: ScoreboardProps) {
  const orderedPlayers = [...players].sort((a, b) => b.score - a.score);

  return (
    <div className="scoreboard-box">
      <div className="section-title">Leaderboard</div>
      {orderedPlayers.map((player, index) => (
        <div key={player.id} className="score-row">
          <div>
            <strong>{index + 1}. {player.name}</strong>
          </div>
          <div className="player-score">{player.score}</div>
        </div>
      ))}
    </div>
  );
}
