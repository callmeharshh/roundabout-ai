import Link from 'next/link';

export default function LandingPage() {
  return (
    <main className="page-shell landing-page">
      <div className="game-show-panel hero-panel">
        <div className="eyebrow">Roundabout AI</div>
        <h1>Prompt Roulette</h1>
        <p className="lede">
          A neon-lit game show where your weirdest, funniest, and most chaotic answers win the crowd.
        </p>

        <div className="cta-row">
          <Link href="/lobby" className="primary-btn">Start a game</Link>
          <Link href="/game/demo-room" className="secondary-btn">View demo round</Link>
        </div>

        <div className="feature-grid">
          <div className="feature-card">
            <span>2-4 players</span>
            <strong>Quick party chaos</strong>
          </div>
          <div className="feature-card">
            <span>Live judging</span>
            <strong>Host commentary</strong>
          </div>
          <div className="feature-card">
            <span>Points, jokes</span>
            <strong>Final showdown</strong>
          </div>
        </div>
      </div>
    </main>
  );
}
