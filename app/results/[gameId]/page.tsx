import Link from 'next/link';
import { GameHeader } from '@/components/GameHeader';
import { PlayerCard } from '@/components/PlayerCard';
import { HostMessage } from '@/components/HostMessage';
import { getGameById } from '@/lib/game-data';

export default function ResultsPage({ params }: { params: { gameId: string } }) {
  const game = getGameById(params.gameId);
  const winner = [...game.players].sort((a, b) => b.score - a.score)[0];

  return (
    <main className="results-shell">
      <GameHeader roundNumber={game.maxRounds} maxRounds={game.maxRounds} hostState="finale in progress" title="Final board" />

      <div className="results-grid" style={{ marginTop: 18 }}>
        <section className="result-card">
          <div className="section-title">Winner</div>
          <h2 style={{ marginBottom: 12 }}>{winner?.name ?? 'Nobody'}</h2>
          <div className="player-score" style={{ fontSize: '2rem' }}>{winner?.score ?? 0}</div>
          <div style={{ marginTop: 18 }}>
            <HostMessage message="The room has spoken, and somehow it is still a little bit ridiculous. One more round if you want to make the chaos official." />
          </div>
        </section>

        <aside className="result-card">
          <div className="section-title">Final standings</div>
          <div className="player-list">
            {[...game.players].sort((a, b) => b.score - a.score).map((player) => (
              <PlayerCard key={player.id} player={player} isLeader={player.id === winner?.id} />
            ))}
          </div>
        </aside>
      </div>

      <div className="lower-row" style={{ marginTop: 22 }}>
        <Link href="/lobby" className="secondary-btn">Back to lobby</Link>
        <Link href="/game/demo-room" className="primary-btn">Play again</Link>
      </div>
    </main>
  );
}
