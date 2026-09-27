import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="page-shell">
      <div className="game-show-panel" style={{ maxWidth: 560, padding: 36 }}>
        <div className="eyebrow">404</div>
        <h1 style={{ marginTop: 18, marginBottom: 12 }}>This room does not exist.</h1>
        <p className="lede">The game you were trying to reach isn&apos;t in the current local game state.</p>
        <Link href="/lobby" className="primary-btn">Back to lobby</Link>
      </div>
    </main>
  );
}
