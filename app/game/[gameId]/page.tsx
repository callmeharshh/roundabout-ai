'use client';

import { useState } from 'react';
import { GameHeader } from '@/components/GameHeader';
import { PlayerCard } from '@/components/PlayerCard';
import { HostMessage } from '@/components/HostMessage';
import { RoundPrompt } from '@/components/RoundPrompt';
import { AnswerInput } from '@/components/AnswerInput';
import { Scoreboard } from '@/components/Scoreboard';
import { JudgeResult } from '@/components/JudgeResult';
import { Countdown } from '@/components/Countdown';
import { ChaosModeBanner } from '@/components/ChaosModeBanner';
import { getGameById } from '@/lib/game-data';

export default function GamePage({ params }: { params: { gameId: string } }) {
  const game = getGameById(params.gameId);
  const [answers, setAnswers] = useState<Record<string, string>>({
    p1: 'I am just here to be the dramatic side dish.',
    p2: 'This answer is powered by pure chaos and trending confetti.',
    p3: 'The toaster is emotionally unavailable and I respect that.',
  });

  return (
    <main className="game-shell">
      <GameHeader roundNumber={game.roundNumber} maxRounds={game.maxRounds} hostState={game.hostState} />
      <div className="game-layout" style={{ marginTop: 18 }}>
        <aside className="panel">
          <div className="section-title">Players</div>
          <div className="player-list">
            {game.players.map((player) => (
              <PlayerCard key={player.id} player={player} isLeader={player.score === Math.max(...game.players.map((p) => p.score))} />
            ))}
          </div>
        </aside>

        <section style={{ display: 'grid', gap: 18 }}>
          <ChaosModeBanner />
          <RoundPrompt category={game.rounds[game.rounds.length - 1]?.category ?? 'Live prompt'} prompt={game.rounds[game.rounds.length - 1]?.prompt ?? 'Name the weirdest thing a vending machine would confess.'} roundNumber={game.roundNumber} />
          <div className="answer-box">
            <div className="section-title">Submit your answer</div>
            <div className="answer-grid">
              {game.players.map((player) => (
                <AnswerInput
                  key={player.id}
                  label={player.name}
                  value={answers[player.id] || ''}
                  onChange={(value) => setAnswers((current) => ({ ...current, [player.id]: value }))}
                />
              ))}
            </div>
            <div className="answer-actions">
              <button type="button" className="primary-btn">Reveal results</button>
            </div>
          </div>
          <HostMessage message={game.rounds[game.rounds.length - 1]?.hostCommentary ?? 'It is showtime. Keep it chaotic, specific, and a little bit deranged.'} />
        </section>

        <aside style={{ display: 'grid', gap: 18 }}>
          <div className="panel">
            <div className="section-title">Countdown</div>
            <Countdown seconds={18} />
          </div>
          <div className="panel">
            <div className="section-title">Judge panel</div>
            {game.rounds[game.rounds.length - 1]?.judging.map((result) => (
              <JudgeResult
                key={result.playerId}
                playerName={game.players.find((player) => player.id === result.playerId)?.name ?? 'Unknown'}
                points={result.points}
                rationale={result.rationale}
              />
            ))}
          </div>
          <Scoreboard players={game.players} />
        </aside>
      </div>
    </main>
  );
}
