import type { Player } from '@/lib/game-data';

type PlayerCardProps = {
  player: Player;
  isLeader?: boolean;
};

export function PlayerCard({ player, isLeader = false }: PlayerCardProps) {
  return (
    <div className={`player-card ${isLeader ? 'top-player' : ''}`}>
      <div className="player-row">
        <div className="player-meta">
          <div className="avatar">{player.name.slice(0, 1)}</div>
          <div>
            <div className="player-name">{player.name}</div>
          </div>
        </div>
        <div className="player-score">{player.score}</div>
      </div>

      <div className="tag-row">
        {player.interests.slice(0, 2).map((interest) => (
          <span className="tag" key={`${player.id}-${interest}`}>{interest}</span>
        ))}
      </div>
    </div>
  );
}
