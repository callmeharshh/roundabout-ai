type GameHeaderProps = {
  roundNumber: number;
  maxRounds: number;
  hostState: string;
  title?: string;
};

export function GameHeader({ roundNumber, maxRounds, hostState, title = 'Prompt Roulette' }: GameHeaderProps) {
  return (
    <header className="topbar">
      <div className="brand-pill">
        <span className="brand-dot" />
        {title}
      </div>
      <div className="host-badge">Host: {hostState}</div>
      <div className="meta-chip">Round {roundNumber}/{maxRounds}</div>
    </header>
  );
}
