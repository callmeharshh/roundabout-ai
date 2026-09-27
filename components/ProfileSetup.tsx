'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ROOM_STORAGE_KEY, type Player } from '@/lib/game-data';
import type { HostIntroduction } from '@/lib/host';
import { createInitialSession } from '@/lib/game-session';

type ProfileDraft = {
  id: string;
  name: string;
  interests: string;
  favorites: string;
  preferredTopics: string;
  avoidedTopics: string;
  humorStyle: string;
  funFact: string;
};

const HUMOR_STYLES = [
  'Goofy',
  'Dry',
  'Puns',
];

const DEMO_PROFILES: ProfileDraft[] = [
  { id: 'demo-alex', name: 'Alex', interests: 'Formula 1, coding', favorites: 'racing games', preferredTopics: 'tech, ridiculous inventions', avoidedTopics: '', humorStyle: 'Goofy', funFact: 'Names every unfinished side project' },
  { id: 'demo-maya', name: 'Maya', interests: 'horror movies, cooking', favorites: 'campy monster films', preferredTopics: 'food, spooky stories', avoidedTopics: '', humorStyle: 'Dry', funFact: 'Rates every soup like a film critic' },
  { id: 'demo-sam', name: 'Sam', interests: 'Minecraft, football', favorites: 'co-op games', preferredTopics: 'building things, sports', avoidedTopics: '', humorStyle: 'Puns', funFact: 'Celebrates small victories like a cup final' },
];

function blankProfile(number: number): ProfileDraft {
  return {
    id: `player-${number}`,
    name: '',
    interests: '',
    favorites: '',
    preferredTopics: '',
    avoidedTopics: '',
    humorStyle: 'Goofy',
    funFact: '',
  };
}

function splitList(value: string): string[] {
  return value.split(',').map((item) => item.trim()).filter(Boolean).slice(0, 8);
}

function toPlayers(profiles: ProfileDraft[], introduction: HostIntroduction): Player[] {
  return profiles.map((profile) => ({
    id: profile.id,
    name: profile.name.trim(),
    interests: splitList(profile.interests),
    favorites: splitList(profile.favorites),
    preferredTopics: splitList(profile.preferredTopics),
    avoidedTopics: splitList(profile.avoidedTopics),
    humorStyle: profile.humorStyle,
    funFacts: profile.funFact.trim() ? [profile.funFact.trim()] : [],
    score: 0,
    profileMemory: introduction.playerReads.find((read) => read.playerId === profile.id)?.read ? [introduction.playerReads.find((read) => read.playerId === profile.id)!.read] : [],
    behavioralMemory: [],
  }));
}

export function ProfileSetup() {
  const router = useRouter();
  const [profiles, setProfiles] = useState<ProfileDraft[]>([blankProfile(1), blankProfile(2)]);
  const [nextProfileNumber, setNextProfileNumber] = useState(3);
  const [introduction, setIntroduction] = useState<HostIntroduction | null>(null);
  const [isReading, setIsReading] = useState(false);
  const [error, setError] = useState('');

  function updateProfile(id: string, key: keyof ProfileDraft, value: string) {
    setProfiles((current) => current.map((profile) => profile.id === id ? { ...profile, [key]: value } : profile));
    setIntroduction(null);
  }

  function loadDemoCrew() {
    setProfiles(DEMO_PROFILES.map((profile) => ({ ...profile })));
    setNextProfileNumber(4);
    setIntroduction(null);
    setError('');
  }

  async function meetHost() {
    setError('');
    for (const profile of profiles) {
      if (!profile.name.trim()) {
        setError('Every player needs a name. Nicknames absolutely count.');
        return;
      }
      if (!splitList(profile.interests).length) {
        setError(`Give ${profile.name.trim()} at least one interest so the host has something to work with.`);
        return;
      }
    }

    setIsReading(true);
    try {
      const response = await fetch('/api/rounds/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          players: profiles.map((profile) => ({
            id: profile.id,
            name: profile.name.trim(),
            interests: splitList(profile.interests),
            favorites: splitList(profile.favorites),
            preferredTopics: splitList(profile.preferredTopics),
            avoidedTopics: splitList(profile.avoidedTopics),
            humorStyle: profile.humorStyle,
            funFacts: profile.funFact.trim() ? [profile.funFact.trim()] : [],
          })),
        }),
      });
      const result = await response.json() as HostIntroduction & { error?: string };
      if (!response.ok) throw new Error(result.error || 'The host dropped the clipboard. Try again.');
      setIntroduction(result);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'The host dropped the clipboard. Try again.');
    } finally {
      setIsReading(false);
    }
  }

  function startGame() {
    if (!introduction) return;
    const players = toPlayers(profiles, introduction);
    localStorage.setItem(ROOM_STORAGE_KEY, JSON.stringify(createInitialSession(players, introduction)));
    router.push('/game/your-room');
  }

  return (
    <main className="lobby-shell setup-page">
      <div className="setup-brand-row">
        <div className="brand-pill"><span className="brand-dot" />Prompt Roulette</div>
        <span className="setup-progress">{introduction ? 'STEP 2 OF 2' : 'STEP 1 OF 2'}</span>
      </div>
      <header className="setup-heading">
        <div className="eyebrow">STEP 1 OF 2 · QUICK VIBE CHECK</div>
        <h1>Let the host meet your group.</h1>
        <p>Add 2-4 players. Just name, one interest, and joke style. The rest is bonus lore.</p>
        <button className="demo-crew-btn" type="button" onClick={loadDemoCrew}>Use a ready-made demo crew</button>
      </header>

      {!introduction ? (
        <>
          <div className="profile-grid">
            {profiles.map((profile, index) => (
              <section className="profile-card" key={profile.id}>
                <header className="profile-header">
                  <span className="profile-number">0{index + 1}</span>
                  <h2>Player {index + 1}</h2>
                  {profiles.length > 2 && (
                    <button className="remove-player" type="button" onClick={() => setProfiles((current) => current.filter((item) => item.id !== profile.id))} aria-label={`Remove player ${index + 1}`} title="Remove player">
                      Remove
                    </button>
                  )}
                </header>

                <label className="profile-field">
                  Name or nickname <span className="required-mark">Required</span>
                  <input className="input" value={profile.name} onChange={(event) => updateProfile(profile.id, 'name', event.target.value)} placeholder="Captain Snack" maxLength={40} />
                </label>
                <label className="profile-field">
                  One thing you love <span className="required-mark">Required</span>
                  <input className="input" value={profile.interests} onChange={(event) => updateProfile(profile.id, 'interests', event.target.value)} placeholder="Baking, astronomy, street art" />
                  <span className="field-hint">One is enough. Add more with commas if the lore demands it.</span>
                </label>
                <fieldset className="humor-field">
                  <legend>Pick your joke flavor</legend>
                  <div className="humor-options">
                    {HUMOR_STYLES.map((style) => (
                      <button className={`humor-choice ${profile.humorStyle === style ? 'selected' : ''}`} type="button" key={style} aria-pressed={profile.humorStyle === style} onClick={() => updateProfile(profile.id, 'humorStyle', style)}>
                        {style}
                      </button>
                    ))}
                  </div>
                </fieldset>
                <details className="profile-extras">
                  <summary>More about me <span>Optional bonus lore</span></summary>
                  <div className="profile-extra-fields">
                    <label className="profile-field">
                      Favorite game, show, music, or movie
                      <input className="input" value={profile.favorites} onChange={(event) => updateProfile(profile.id, 'favorites', event.target.value)} placeholder="Mario Kart, sitcoms, old musicals" />
                    </label>
                    <label className="profile-field">
                      One fun fact
                      <input className="input" value={profile.funFact} onChange={(event) => updateProfile(profile.id, 'funFact', event.target.value)} placeholder="I name every houseplant" maxLength={160} />
                    </label>
                    <label className="profile-field">
                      Topics you enjoy
                      <input className="input" value={profile.preferredTopics} onChange={(event) => updateProfile(profile.id, 'preferredTopics', event.target.value)} placeholder="Pets, silly competitions" />
                    </label>
                    <label className="profile-field">
                      Anything the host should skip?
                      <input className="input" value={profile.avoidedTopics} onChange={(event) => updateProfile(profile.id, 'avoidedTopics', event.target.value)} placeholder="Work stress, scary stuff" />
                    </label>
                  </div>
                </details>
              </section>
            ))}
          </div>

          <div className="setup-actions setup-actions-bar">
            {profiles.length < 4 && (
              <button className="secondary-btn" type="button" onClick={() => {
                setProfiles((current) => [...current, blankProfile(nextProfileNumber)]);
                setNextProfileNumber((current) => current + 1);
              }}>
                + Add a player
              </button>
            )}
            <button className="primary-btn" type="button" onClick={meetHost} disabled={isReading}>
              {isReading ? 'Host is connecting the dots...' : 'Meet the host'}
            </button>
          </div>
        </>
      ) : (
        <section className="host-readout" aria-live="polite">
          <div className="readout-topline">THE HOST HAS NOTES</div>
          <span className={`ai-mode-badge ${introduction.usedFallback ? 'backup-mode' : ''}`}>
            {introduction.usedFallback ? 'BACKUP HOST · LIVE AI UNAVAILABLE' : 'LIVE AI HOST'}
          </span>
          <h2>{introduction.hostGreeting}</h2>
          <p className="room-read">{introduction.profileRead}</p>
          <div className="player-read-list">
            {introduction.playerReads.map((read) => (
              <p key={read.playerId}><strong>{profiles.find((profile) => profile.id === read.playerId)?.name}:</strong> {read.read}</p>
            ))}
          </div>
          <div className="prompt-preview">
            <div className="section-title">Your first challenge · {introduction.category}</div>
            <p>{introduction.prompt}</p>
          </div>
          {introduction.usedFallback && <p className="fallback-note">The live host was unavailable, so the built-in backup kept the game moving. Check the local AI configuration and connection before your demo.</p>}
          <div className="setup-actions">
            <button className="secondary-btn" type="button" onClick={() => setIntroduction(null)}>Edit profiles</button>
            <button className="primary-btn" type="button" onClick={startGame}>That sounds like us. Let&apos;s play</button>
          </div>
        </section>
      )}
      {error && <p className="setup-error" role="alert">{error}</p>}
    </main>
  );
}
