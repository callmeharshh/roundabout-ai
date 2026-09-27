import Link from 'next/link';
import { GameHeader } from '@/components/GameHeader';
import { PlayerCard } from '@/components/PlayerCard';
import { mockPlayers } from '@/lib/game-data';

export default function LobbyPage() {
  return (
    <main className="lobby-shell">
      <GameHeader roundNumber={1} maxRounds={5} hostState="warming up the crowd" title="Prompt Roulette" />

      <div className="lobby-grid" style={{ marginTop: 20 }}>
        <section className="lobby-card">
          <div className="section-title">Game setup</div>
          <h2 style={{ marginBottom: 20 }}>Create your chaos room</h2>

          <div className="form-grid">
            <input className="input" defaultValue="demo-room" readOnly />
            <input className="input" placeholder="Room name" defaultValue="Roundabout Room" />
            <div className="lower-row">
              <Link href="/game/demo-room" className="primary-btn">Launch game</Link>
              <button className="secondary-btn" type="button">Add player</button>
            </div>
          </div>
        </section>

        <aside className="lobby-card">
          <div className="section-title">Players</div>
          <div className="player-list">
            {mockPlayers.map((player, index) => (
              <PlayerCard key={player.id} player={player} isLeader={index === 0} />
            ))}
          </div>
        </aside>
      </div>
    </main>
  );
}
