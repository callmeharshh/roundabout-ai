'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { GameHeader } from '@/components/GameHeader';
import { PlayerCard } from '@/components/PlayerCard';
import { HostMessage } from '@/components/HostMessage';
import { RoundPrompt } from '@/components/RoundPrompt';
import { AnswerInput } from '@/components/AnswerInput';
import { Scoreboard } from '@/components/Scoreboard';
import { JudgeResult } from '@/components/JudgeResult';
import { PlayMovePicker } from '@/components/PlayMovePicker';
import { getGameById, ROOM_STORAGE_KEY } from '@/lib/game-data';
import type { JudgeResponse } from '@/lib/judge';
import type { GameSession } from '@/lib/game-session';
import { completeRound, finishSession, startNextRound } from '@/lib/game-session';
import type { NextRound } from '@/lib/host';
import type { PlayMoveId } from '@/lib/play-moves';

export default function GamePage({ params }: { params: { gameId: string } }) {
  const [session, setSession] = useState<GameSession | null>(null);
  const [isJudging, setIsJudging] = useState(false);
  const [isStartingNext, setIsStartingNext] = useState(false);
  const [actionError, setActionError] = useState('');
  const [hasLoaded, setHasLoaded] = useState(false);
  const router = useRouter();
  const players = session?.players ?? [];
  const answers = session?.answers ?? {};
  const moves = session?.moves ?? {};
  const currentRound = session?.rounds[session.rounds.length - 1];
  const judgeResult = session?.phase === 'results' || session?.phase === 'finished' ? currentRound?.result ?? null : null;
  const roundNumber = session?.roundNumber ?? 1;

  function saveSession(nextSession: GameSession) {
    localStorage.setItem(ROOM_STORAGE_KEY, JSON.stringify(nextSession));
    setSession(nextSession);
  }

  useEffect(() => {
    const saved = localStorage.getItem(ROOM_STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as GameSession;
        if (parsed.version === 1 && parsed.players?.length && parsed.introduction?.prompt && parsed.roundNumber) setSession(parsed);
      } catch {
        localStorage.removeItem(ROOM_STORAGE_KEY);
      }
    }
    setHasLoaded(true);
  }, []);

  useEffect(() => {
    if (hasLoaded && !session) router.replace('/lobby');
  }, [hasLoaded, session, router]);

  if (!hasLoaded || !session) {
    return (
      <main className="game-shell game-loading" aria-live="polite">
        <div className="host-pulse" />
        <p>Setting the stage. The host is looking for its clipboard.</p>
      </main>
    );
  }

  async function revealResults() {
    if (!session || session.phase !== 'answering' || isJudging || players.some((player) => !answers[player.id]?.trim() || !moves[player.id])) return;

    setIsJudging(true);
    setActionError('');
    try {
      const response = await fetch('/api/rounds/judge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: session.prompt,
          category: session.category,
          players: players.map(({ id, name, interests, favorites, preferredTopics, avoidedTopics, humorStyle, funFacts, profileMemory, behavioralMemory }) => ({
            id,
            name,
            interests,
            favorites,
            preferredTopics,
            avoidedTopics,
            humorStyle,
            funFacts,
            profileMemory,
            behavioralMemory,
          })),
          answers,
          moves,
        }),
      });
      const result = await response.json() as JudgeResponse & { error?: string };
      if (!response.ok) throw new Error(result.error || 'The judge could not score this round.');

      saveSession(completeRound(session, answers, moves, result));
    } catch (error) {
      setActionError(error instanceof Error ? error.message : 'The judge could not score this round. Try again.');
    } finally {
      setIsJudging(false);
    }
  }

  async function startNext() {
    if (!session || session.phase !== 'results' || session.roundNumber !== 1 || isStartingNext) return;
    setIsStartingNext(true);
    setActionError('');
    try {
      const response = await fetch('/api/rounds/next', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session }),
      });
      const nextRound = await response.json() as NextRound & { error?: string };
      if (!response.ok) throw new Error(nextRound.error || 'The host needs a moment to check its notes.');
      saveSession(startNextRound(session, nextRound));
    } catch (error) {
      setActionError(error instanceof Error ? error.message : 'The host needs a moment to check its notes. Try again.');
    } finally {
      setIsStartingNext(false);
    }
  }

  function finishGame() {
    if (!session || session.phase !== 'results' || session.roundNumber !== 2) return;
    saveSession(finishSession(session));
  }

  function updateAnswer(playerId: string, answer: string) {
    if (!session || session.phase !== 'answering') return;
    saveSession({ ...session, answers: { ...session.answers, [playerId]: answer } });
  }

  function updateMove(playerId: string, move: PlayMoveId) {
    if (!session || session.phase !== 'answering') return;
    saveSession({ ...session, moves: { ...session.moves, [playerId]: move } });
  }

  return (
    <main className="game-shell">
      <GameHeader roundNumber={roundNumber} hostState={session.phase === 'finished' ? 'crowning a champion' : 'learning as you play'} />
      <div className="group-read-banner">
        <strong>{session.memoryCallout ? 'The host learned something' : 'The host read your profiles'}</strong>
        <span>{session.memoryCallout ?? session.introduction.profileRead}</span>
        <div className="game-player-reads">
          {session.introduction.playerReads.map((read) => (
            <span key={read.playerId}><b>{players.find((player) => player.id === read.playerId)?.name}:</b> {read.read}</span>
          ))}
        </div>
        {session.roundNumber === 1 && session.introduction.usedFallback && <small>Quick-wit host mode. Your profiles still shaped the prompt.</small>}
        {session.roundNumber === 2 && (
          <div className="learned-notes">
            <strong>HOST MEMORY UPDATED · {currentRound?.result.usedFallback ? 'BACKUP OBSERVATION' : 'AI OBSERVATION'}</strong>
            {players.map((player) => player.behavioralMemory.slice(-2).map((note) => (
              <span key={`${player.id}-${note}`}><b>{player.name}:</b> {note}</span>
            )))}
          </div>
        )}
      </div>
      <div className="game-layout" style={{ marginTop: 18 }}>
        <aside className="panel">
          <div className="section-title">Players</div>
          <div className="player-list">
            {players.map((player) => (
              <PlayerCard key={player.id} player={player} isLeader={player.score === Math.max(...players.map((item) => item.score))} />
            ))}
          </div>
        </aside>

        <section style={{ display: 'grid', gap: 18 }}>
          <RoundPrompt category={session.category} prompt={session.prompt} roundNumber={roundNumber} />
          {session.phase === 'answering' ? (
            <div className="answer-box">
              <div className="section-title">Pick a move. Make your answer. Own it.</div>
              <div className="answer-grid">
                {players.map((player) => (
                  <div className="player-answer-turn" key={player.id}>
                    <PlayMovePicker playerName={player.name} value={moves[player.id]} onChange={(move) => updateMove(player.id, move)} disabled={isJudging} />
                    <AnswerInput
                      label={player.name}
                      value={answers[player.id] || ''}
                      onChange={(value) => updateAnswer(player.id, value)}
                      placeholder={`${player.name}, make it weird...`}
                      disabled={isJudging}
                    />
                  </div>
                ))}
              </div>
              <div className="answer-actions">
                <button type="button" className="primary-btn" onClick={revealResults} disabled={isJudging || players.some((player) => !answers[player.id]?.trim() || !moves[player.id])}>
                  {isJudging ? 'The judge is comparing every answer...' : 'Lock answers & reveal'}
                </button>
              </div>
              {actionError && <p role="alert">{actionError}</p>}
            </div>
          ) : (
            <div className="answer-box results-step">
              <div className="section-title">{session.phase === 'finished' ? 'That is the show!' : `Round ${roundNumber} is in the books`}</div>
              <div className="submitted-answers">
                {players.map((player) => (
                  <p key={player.id}><strong>{player.name}:</strong> “{currentRound?.answers[player.id]}”</p>
                ))}
              </div>
              {session.phase === 'results' && session.roundNumber === 1 && (
                <button type="button" className="primary-btn" onClick={startNext} disabled={isStartingNext}>
                  {isStartingNext ? 'The host is studying its notes...' : 'Show me what the host learned'}
                </button>
              )}
              {session.phase === 'results' && session.roundNumber === 2 && (
                <button type="button" className="primary-btn" onClick={finishGame}>Reveal the winner</button>
              )}
              {session.phase === 'finished' && (
                <div className="final-winner">
                  <span>THE GROUP CHAMPION</span>
                  <strong>{[...players].sort((left, right) => right.score - left.score)[0]?.name}</strong>
                  <p>The host knows the group a little better now. That&apos;s a dangerous amount of power.</p>
                </div>
              )}
              {actionError && <p role="alert">{actionError}</p>}
            </div>
          )}
          <HostMessage message={judgeResult?.hostCommentary ?? session.hostGreeting ?? session.introduction.hostGreeting} />
        </section>

        <aside style={{ display: 'grid', alignContent: 'start', gap: 18 }}>
          <div className="panel">
            <div className="section-title">Judge panel</div>
            {judgeResult && (
              <p className="ai-mode-badge">
                {judgeResult.usedFallback ? 'BACKUP JUDGE · LIVE AI UNAVAILABLE' : 'LIVE AI JUDGE'}
              </p>
            )}
            {judgeResult?.rankings.map((result) => (
              <JudgeResult
                key={result.playerId}
                playerName={players.find((player) => player.id === result.playerId)?.name ?? 'Unknown'}
                points={result.score}
                breakdown={result.breakdown}
                rationale={result.reason}
              />
            ))}
          </div>
          <Scoreboard players={players} />
        </aside>
      </div>
    </main>
  );
}
