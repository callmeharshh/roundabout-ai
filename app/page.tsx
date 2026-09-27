import Link from 'next/link';

export default function LandingPage() {
  return (
    <main className="page-shell landing-page">
      <div className="game-show-panel hero-panel">
        <div className="eyebrow">Roundabout AI</div>
        <h1>Prompt Roulette</h1>
        <p className="lede">
          Tell the host what your group loves. It will make a ridiculous challenge from your interests, then judge the chaos.
        </p>

        <div className="cta-row">
          <Link href="/lobby" className="primary-btn">Set up our players</Link>
        </div>

        <div className="feature-grid">
          <div className="feature-card">
            <span>First: the vibe check</span>
            <strong>Tell the host what you like</strong>
          </div>
          <div className="feature-card">
            <span>Then: your kind of weird</span>
            <strong>Get a prompt made for your group</strong>
          </div>
          <div className="feature-card">
            <span>Finally: defend your answer</span>
            <strong>Collect points, survive the jokes</strong>
          </div>
        </div>
      </div>
    </main>
  );
}
