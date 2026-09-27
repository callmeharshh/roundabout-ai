export type PlayerContext = {
  id: string;
  name: string;
  interests: string[];
  humorStyle: string;
  previousAnswers?: string[];
  observations?: string[];
  score?: number;
};

export type GeneratedRound = {
  category: string;
  title: string;
  prompt: string;
  difficulty: 'easy' | 'medium' | 'hard';
  personalizationReason: string;
  targetPlayers: string[];
};

export type HostReaction = {
  commentary: string;
  highlightedPlayer: string | null;
  energy: 'low' | 'medium' | 'high' | 'chaos';
};

export type PlayerObservation = {
  playerId: string;
  observations: string[];
  confidence: number;
};

export type RoundHistoryItem = {
  prompt?: string;
  winner?: string;
};

export type AnswerMap = Record<string, string>;

const FALLBACK_CATEGORIES = [
  'Household Chaos',
  'Future Bureaucracy',
  'Tiny Villain Monologues',
  'Public Safety Theater',
  'Mystic Morning Commute',
  'Impossible Job Interviews',
];

const FALLBACK_TITLES = [
  'The Big Dramatic Disaster',
  'The Most Unnecessary Apology',
  'Chaos in 60 Seconds',
  'The Crowd Is Watching',
  'Maximum Ridiculousness',
  'A Flair for the Absurd',
];

const FALLBACK_PROMPTS = [
  'A sentient toaster has finally had enough. What is its dramatic exit speech?',
  'The city council has replaced the fire alarm with a motivational coach. What does it say?',
  'You have been hired as the spokesperson for a chaotic amusement park. Give the opening announcement.',
  'A luxury elevator has started giving life advice. What is its first pearl of wisdom?',
  'Your favorite household object is now a celebrity. What is its acceptance speech?',
];

export class HostService {
  private safeExecute<T>(label: string, fn: () => T, fallback: T): T {
    try {
      return fn();
    } catch (error) {
      console.warn(`[HostService:${label}] Falling back due to error:`, error);
      return fallback;
    }
  }

  private normalizeInterest(raw: string): string {
    return raw.trim().replace(/\s+/g, ' ');
  }

  private buildInterestPool(players: PlayerContext[]): string[] {
    const interestPool = players.flatMap((player) =>
      (player.interests ?? []).map((interest) => this.normalizeInterest(interest)),
    );

    return [...new Set(interestPool.filter(Boolean))];
  }

  private chooseTargetPlayers(players: PlayerContext[], roundNumber: number): string[] {
    if (players.length === 0) return [];

    const ranked = [...players].sort((a, b) => (b.score ?? 0) - (a.score ?? 0));
    const coreTargets = ranked.slice(0, Math.min(2, ranked.length)).map((player) => player.id);

    if (players.length <= 2) return players.map((player) => player.id);

    const seeded = Math.abs(roundNumber) % players.length;
    const spotlightPlayerId = players[seeded]?.id ?? players[0]?.id;

    return [...new Set([spotlightPlayerId, ...coreTargets])];
  }

  private pickCategory(players: PlayerContext[], previousRounds: RoundHistoryItem[]): string {
    const pool = this.buildInterestPool(players);
    const used = new Set(previousRounds.map((round) => round.prompt).filter(Boolean));

    const categories = [...FALLBACK_CATEGORIES].filter((category) => !used.has(category));
    const preferred = pool.length > 0 ? categories.map((category, index) => ({ category, priority: index })) : [];

    if (preferred.length > 0) {
      return preferred[0].category;
    }

    return FALLBACK_CATEGORIES[Math.abs(players.length + previousRounds.length) % FALLBACK_CATEGORIES.length];
  }

  private pickTitle(players: PlayerContext[], category: string): string {
    const playerNames = players.map((player) => player.name);
    const alliterative = playerNames.length > 0 ? `${playerNames[0]}'s ${category}` : category;
    const choices = [
      `${alliterative}: The Impossible Edition`,
      `${category} for the Bold`,
      `The ${category} Showdown`,
      `A Very ${playerNames[0] ?? 'Chaotic'} Situation`,
      ...FALLBACK_TITLES,
    ];

    return choices[Math.abs(category.length + playerNames.length) % choices.length];
  }

  private buildPrompt(players: PlayerContext[], category: string, roundNumber: number): string {
    const interestPool = this.buildInterestPool(players);
    const subject = interestPool[Math.abs(roundNumber + category.length) % Math.max(1, interestPool.length)] ?? 'chaos';
    const leadPlayer = players[Math.abs(roundNumber) % players.length]?.name ?? 'the room';

    const templateSet = [
      `The city has declared ${subject} a public utility. What is the most dramatic announcement ${leadPlayer} could make while pretending it is perfectly normal?`,
      `A luxury hotel has replaced every room service menu with ${subject}. What is the most ridiculous thing the concierge says?`,
      `A wellness retreat has been built around ${subject}. What is the single most believable pitch that sounds completely insane?`,
      `If ${subject} became a personality trait, what would a wildly successful campaign slogan sound like?`,
      `A reality show about ${subject} is being pitched to the public. What is the teaser voiceover?`,
    ];

    return templateSet[(roundNumber + category.length) % templateSet.length];
  }

  private summarizePersonalization(players: PlayerContext[], roundNumber: number): string {
    const relevant = players
      .filter((player) => (player.interests ?? []).length > 0)
      .slice(0, 2)
      .map((player) => `${player.name} (${player.interests.slice(0, 2).join(', ')})`)
      .join(' + ');

    if (!relevant) {
      return 'This round is built to keep the energy unpredictable and room-wide, with a little chaos baked into every answer.';
    }

    return `This round leans into ${relevant} without turning the whole setup into a fan reference; it keeps the prompt surprising, personal, and a little unhinged.`;
  }

  generateRound(
    players: PlayerContext[],
    roundNumber: number = 1,
    previousRounds: RoundHistoryItem[] = [],
  ): GeneratedRound {
    return this.safeExecute('generateRound', () => {
      const safePlayers = players.length > 0 ? players : [{
        id: 'fallback-player',
        name: 'The Room',
        interests: ['chaos'],
        humorStyle: 'chaotic',
        previousAnswers: [],
        observations: ['Absurdity is the whole point.'],
      }];

      const category = this.pickCategory(safePlayers, previousRounds);
      const title = this.pickTitle(safePlayers, category);
      const prompt = this.buildPrompt(safePlayers, category, roundNumber);
      const difficulty = roundNumber >= 3 ? 'hard' : roundNumber >= 2 ? 'medium' : 'easy';

      return {
        category,
        title,
        prompt,
        difficulty,
        personalizationReason: this.summarizePersonalization(safePlayers, roundNumber),
        targetPlayers: this.chooseTargetPlayers(safePlayers, roundNumber),
      };
    }, {
      category: FALLBACK_CATEGORIES[0],
      title: FALLBACK_TITLES[0],
      prompt: FALLBACK_PROMPTS[0],
      difficulty: 'medium',
      personalizationReason: 'Fallback mode keeps the chaos high and the prompt unexpectedly funny without requiring a full AI call.',
      targetPlayers: safePlayersToIds(players),
    });
  }

  introduceRound(round: GeneratedRound, players: PlayerContext[]): HostReaction {
    return this.safeExecute('introduceRound', () => {
      const targetPlayer = players.find((player) => round.targetPlayers.includes(player.id));
      const spotlight = targetPlayer?.name ?? 'the room';
      const energy = round.difficulty === 'hard' ? 'chaos' : round.difficulty === 'medium' ? 'high' : 'medium';

      return {
        commentary: `Alright, ${spotlight}, welcome to ${round.title}. This one has ${round.category.toLowerCase()} energy, a clean setup, and exactly enough danger to make the room nervous. ${round.prompt}`,
        highlightedPlayer: targetPlayer?.id ?? null,
        energy,
      };
    }, {
      commentary: 'Welcome back, chaos lovers. The prompt is live, the room is ready, and nobody is emotionally prepared for what is about to happen.',
      highlightedPlayer: players[0]?.id ?? null,
      energy: 'high',
    });
  }

  reactToAnswers(answerMap: AnswerMap, players: PlayerContext[], round?: GeneratedRound): HostReaction {
    return this.safeExecute('reactToAnswers', () => {
      const answers = Object.entries(answerMap).filter(([, value]) => typeof value === 'string' && value.trim().length > 0);
      const winnerId = answers
        .map(([playerId, value]) => ({ playerId, score: value.length + (value.includes('toaster') ? 10 : 0) }))
        .sort((a, b) => b.score - a.score)[0]?.playerId ?? players[0]?.id ?? null;

      const winner = players.find((player) => player.id === winnerId);
      const energy = answers.length > 0 && answers.length >= 2 ? 'chaos' : 'high';

      return {
        commentary: winner
          ? `That answer from ${winner.name} was absolutely delicious. It had the right mix of nonsense, precision, and panic. Why this scored highly: strong prompt fit, originality, and commitment to the joke.`
          : `The room is being weird in the best possible way. This is exactly the kind of answer that makes a game show look suspiciously fun.`,
        highlightedPlayer: winnerId,
        energy,
      };
    }, {
      commentary: 'The room is laughing, the room is confused, and somehow the room is also winning. That is exactly why this format works.',
      highlightedPlayer: players[0]?.id ?? null,
      energy: 'high',
    });
  }

  generateJudgeCommentary(
    players: PlayerContext[],
    answerMap: AnswerMap,
    round: GeneratedRound,
  ): string {
    return this.safeExecute('generateJudgeCommentary', () => {
      const winner = players.find((player) => player.id === Object.entries(answerMap).sort((a, b) => b[1].length - a[1].length)[0]?.[0]) ?? players[0];
      const reason = winner
        ? `${winner.name} wins this round because the answer had incredible timing, the right amount of absurdity, and a hook that landed instantly.`
        : 'This round is a classic blur of nonsense and impressive commitment.';

      return `${reason} Why this scored highly: strong prompt fit, originality, and commitment to the joke.`;
    }, `This round was a mess in the best way. Why this scored highly: strong prompt fit, originality, and commitment to the joke.`);
  }

  generateFinalCommentary(players: PlayerContext[]): string {
    return this.safeExecute('generateFinalCommentary', () => {
      const topPlayer = [...players].sort((a, b) => (b.score ?? 0) - (a.score ?? 0))[0];
      const winnerName = topPlayer?.name ?? 'The room';

      return `${winnerName} takes the crown, and the entire room walks away a little louder, a little stranger, and infinitely more entertained. The final score is chaos, confidence, and a suspicious amount of style.`;
    }, 'The final round was absurd, dramatic, and somehow still deeply competitive. The room wins, the jokes win, and that is the whole point.');
  }

  updatePlayerObservations(
    player: PlayerContext,
    round: GeneratedRound,
    answer?: string,
  ): PlayerObservation {
    return this.safeExecute('updatePlayerObservations', () => {
      const baseObservations = [...(player.observations ?? [])];
      const freshNotes = [
        `${player.name} responds well to prompts with a theatrical twist.`,
        `${player.name} leans into ${player.humorStyle ?? 'chaotic'} humor when the premise feels absurd enough.`,
        answer ? `This answer showed confidence and a strong sense of comedic timing.` : 'The player remained sharply engaged with the premise.',
        `Prompt theme: ${round.category}.`,
      ];

      const merged = [...new Set([...baseObservations, ...freshNotes].filter(Boolean).slice(0, 4))];

      return {
        playerId: player.id,
        observations: merged,
        confidence: Math.min(0.99, 0.55 + merged.length * 0.1),
      };
    }, {
      playerId: player.id,
      observations: [
        `${player.name} handled the prompt with a confident, slightly chaotic energy.`,
        'The room responded well to the style and timing.',
      ],
      confidence: 0.72,
    });
  }
}

export const hostService = new HostService();

function safePlayersToIds(players: PlayerContext[]): string[] {
  return players.filter(Boolean).map((player) => player.id);
}
