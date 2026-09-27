'use client';

import { useEffect, useMemo, useState } from 'react';

const STORAGE_KEY = 'prompt-roulette-guide-v1';

const steps = [
  {
    title: 'Create your room',
    body: 'Start a private party room and share the code with friends on video chat or in the same room.',
  },
  {
    title: 'Add your crew',
    body: 'Pick your player name, favorite silly topic, and humor vibe so the host can personalize the round.',
  },
  {
    title: 'Play your turn',
    body: 'Answer only as your own player on screen. The group can join live while you keep the pace moving.',
  },
  {
    title: 'Laugh, score, repeat',
    body: 'The AI host tracks what lands, comments on the chaos, and keeps the party moving without making things confusing.',
  },
];

export function FirstTimerGuide() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (!saved) return;
      const parsed = JSON.parse(saved) as { index?: number; done?: boolean };
      if (typeof parsed.index === 'number') {
        setActiveIndex(Math.min(parsed.index, steps.length - 1));
      }
      if (parsed.done) {
        setDone(true);
      }
    } catch {
      // Ignore malformed storage and fall back to defaults.
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ index: activeIndex, done }));
  }, [activeIndex, done]);

  const currentStep = useMemo(() => steps[activeIndex], [activeIndex]);

  const progress = ((activeIndex + 1) / steps.length) * 100;

  return (
    <aside className="guide-card" aria-live="polite">
      <div className="guide-header">
        <div>
          <span className="eyebrow guide-eyebrow">AI guide</span>
          <h3>First-timer walkthrough</h3>
        </div>
        <span className="guide-pill">{done ? 'Complete' : `${activeIndex + 1}/${steps.length}`}</span>
      </div>

      <div className="guide-progress">
        <span style={{ width: `${progress}%` }} />
      </div>

      <div className="guide-content">
        <strong>{currentStep.title}</strong>
        <p>{currentStep.body}</p>
      </div>

      <div className="guide-actions">
        <button
          type="button"
          className="secondary-btn"
          onClick={() => setActiveIndex((value) => Math.max(value - 1, 0))}
          disabled={activeIndex === 0}
        >
          Back
        </button>
        {activeIndex < steps.length - 1 ? (
          <button type="button" className="primary-btn" onClick={() => setActiveIndex((value) => value + 1)}>
            Next
          </button>
        ) : (
          <button type="button" className="primary-btn" onClick={() => setDone(true)}>
            Ready to play
          </button>
        )}
      </div>
    </aside>
  );
}
