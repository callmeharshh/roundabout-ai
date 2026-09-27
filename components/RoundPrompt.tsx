type RoundPromptProps = {
  category: string;
  prompt: string;
  roundNumber: number;
};

export function RoundPrompt({ category, prompt, roundNumber }: RoundPromptProps) {
  return (
    <div className="prompt-box">
      <div className="section-title">Round {roundNumber}</div>
      <h2>{prompt}</h2>
      <p>{category}</p>
      <div className="round-meta">
        <span className="meta-chip">Category: {category}</span>
        <span className="meta-chip">Answer in one truth bomb</span>
      </div>
    </div>
  );
}
