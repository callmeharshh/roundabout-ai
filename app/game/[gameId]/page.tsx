'use client';

import { useMemo, useState } from 'react';
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
import { hostService } from '@/lib/host';

export default function GamePage({ params }: { params: { gameId: string } }) {
  const game = getGameById(params.gameId);
  const [showMemoryPanel, setShowMemoryPanel] = useState(false);
  const [answers, setAnswers] = useState<Record<string, string>>({
    p1: 'I am just here to be the dramatic side dish.',
    p2: 'This answer is powered by pure chaos and trending confetti.',
    p3: 'The toaster is emotionally unavailable and I respect that.',
  });

  const currentRound = useMemo(() => {
    const hostPlayers = game.players.map((player) => ({
      id: player.id,
      name: player.name,
      interests: player.interests,
      humorStyle: player.humorStyle,
      previousAnswers: player.sessionMemory,
      observations: player.behavioralMemory,
      score: player.score,
    }));

    return hostService.generateRound(
      hostPlayers,
      game.roundNumber,
      game.rounds.map((round) => ({ prompt: round.prompt, winner: round.winner ?? undefined })),
    );
  }, [game]);

  const hostSpin = useMemo(() => {
    const hostPlayers = game.players.map((player) => ({
      id: player.id,
      name: player.name,
      interests: player.interests,
      humorStyle: player.humorStyle,
      previousAnswers: player.sessionMemory,
      observations: player.behavioralMemory,
      score: player.score,
    }));

    return hostService.introduceRound(currentRound, hostPlayers);
  }, [currentRound, game.players]);

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
          <RoundPrompt category={currentRound.category} prompt={currentRound.prompt} roundNumber={game.roundNumber} />
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
          <HostMessage message={hostSpin.commentary} />

          <div className="panel">
            <button type="button" className="secondary-btn" onClick={() => setShowMemoryPanel((value) => !value)}>
              {showMemoryPanel ? 'Hide' : 'Show'} what the host has learned
            </button>
            {showMemoryPanel && (
              <div style={{ marginTop: 16 }}>
                {game.players.map((player) => (
                  <div key={player.id} style={{ marginBottom: 14 }}>
                    <div className="section-title" style={{ marginBottom: 8 }}>{player.name}</div>
                    <ul style={{ margin: 0, paddingLeft: 18, color: 'var(--muted)' }}>
                      {(player.behavioralMemory ?? []).map((memory, index) => (
                        <li key={`${player.id}-${index}`}>{memory}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        <aside style={{ display: 'grid', gap: 18 }}>
          <div className="panel">
            <div className="section-title">Countdown</div>
            <Countdown seconds={18} />
          </div>
          <div className="panel">
            <div className="section-title">Judge panel</div>
            {game.rounds[game.rounds.length - 1]?.judging.map((result) => {
              const breakdown = {
                promptFit: 20,
                creativity: 18,
                humor: 21,
                commitment: 12,
                personalization: 9,
              };

              return (
                <JudgeResult
                  key={result.playerId}
                  playerName={game.players.find((player) => player.id === result.playerId)?.name ?? 'Unknown'}
                  points={result.points}
                  breakdown={breakdown}
                  rationale={result.rationale}
                />
              );
            })}
          </div>
          <Scoreboard players={game.players} />
        </aside>
      </div>
    </main>
  );
}
