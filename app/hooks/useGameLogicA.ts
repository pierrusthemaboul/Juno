// useGameLogicA.ts

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../supabaseClients';
import useRewards from './useRewards';
import useAudio from './useAudio';
import {
  Event,
  User,
  LevelConfig,
  RewardType,
  MAX_LIVES,
  HistoricalPeriod,
  LevelEventSummary,
  CategoryMastery,
  HistoricalPeriodStats,
  LevelPerformance,
  ActiveBonus
} from '../hooks/types';
import { LEVEL_CONFIGS } from '../hooks/levelConfigs';
import { Animated } from 'react-native';

export function useGameLogicA(initialEvent: string) {
  console.log('useGameLogicA => (RENDER OR INIT) => initialEvent:', initialEvent);

  // Récompenses (système)
  const {
    currentReward,
    checkRewards,
    completeRewardAnimation,
    updateRewardPosition
  } = useRewards({
    onRewardEarned: (reward) => {
      applyReward(reward);
    }
  });

  // Audio (sons)
  const {
    playCorrectSound,
    playIncorrectSound,
    playLevelUpSound,
    playCountdownSound,
    playGameOverSound,
  } = useAudio();

  // Profil utilisateur de base
  const [user, setUser] = useState<User>({
    name: '',
    points: 0,
    lives: MAX_LIVES,
    level: 1,
    eventsCompletedInLevel: 0,
    totalEventsCompleted: 0,
    streak: 0,
    maxStreak: 0,
    performanceStats: {
      typeSuccess: {},
      periodSuccess: {},
      overallAccuracy: 0,
      averageResponseTime: 0
    }
  });

  // Quelques états du jeu
  const [activeBonus, setActiveBonus] = useState<ActiveBonus[]>([]);
  const [periodStats, setPeriodStats] = useState<Record<HistoricalPeriod, HistoricalPeriodStats>>({});
  const [categoryMastery, setCategoryMastery] = useState<Record<string, CategoryMastery>>({});
  const [eventHistory, setEventHistory] = useState<{ type: string; period: string; success: boolean; }[]>([]);
  const [performanceStats, setPerformanceStats] = useState<{
    typeSuccess: Record<string, number>;
    periodSuccess: Record<string, number>;
    overallAccuracy: number;
  }>({
    typeSuccess: {},
    periodSuccess: {},
    overallAccuracy: 0
  });

  // Événements
  const [allEvents, setAllEvents] = useState<Event[]>([]);
  const [previousEvent, setPreviousEvent] = useState<Event | null>(null);
  const [newEvent, setNewEvent] = useState<Event | null>(null);
  const [usedEvents, setUsedEvents] = useState<Set<string>>(new Set());

  // Interface utilisateur
  const [timeLeft, setTimeLeft] = useState(20);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isGameOver, setIsGameOver] = useState(false);

  // **Cette variable** détermine si l'image est chargée ou non.
  // Si elle reste "false", les boutons restent "disabled".
  const [isImageLoaded, setIsImageLoaded] = useState(false);

  const [showDates, setShowDates] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | undefined>(undefined);

  // Progression
  const [streak, setStreak] = useState(0);
  const [highScore, setHighScore] = useState(0);

  // Contrôle du jeu
  const [isCountdownActive, setIsCountdownActive] = useState(false);
  const [showLevelModal, setShowLevelModal] = useState(false);
  const [isLevelPaused, setIsLevelPaused] = useState(true);
  const [currentLevelConfig, setCurrentLevelConfig] = useState<LevelConfig>(LEVEL_CONFIGS[1]);
  const [leaderboardsReady, setLeaderboardsReady] = useState(false);

  // Classement (leaderboards)
  const [leaderboards, setLeaderboards] = useState({ daily: [], monthly: [], allTime: [] });

  // Événements de niveau
  const [currentLevelEvents, setCurrentLevelEvents] = useState<LevelEventSummary[]>([]);

  // Fallback countdown
  const [fallbackCountdown, setFallbackCountdown] = useState<number>(() => {
    return Math.floor(Math.random() * (25 - 12 + 1)) + 12;
  });

  // Animation (streak bar)
  const [progressAnim] = useState(() => new Animated.Value(0));

  // -- Effet d'initialisation --
  useEffect(() => {
    console.log('useGameLogicA => Effet d\'initialisation => initGame()');
    initGame();
  }, []);

  // -- Compte à rebours --
  useEffect(() => {
    let timer: NodeJS.Timeout | undefined;

    if (isCountdownActive && timeLeft > 0 && !isLevelPaused && !isGameOver) {
      timer = setInterval(() => {
        setTimeLeft((prevTime) => {
          if (prevTime <= 1) {
            console.log('useGameLogicA => Timer reached 0 => handleTimeout()');
            handleTimeout();
            return 0;
          }
          if (prevTime <= 5) {
            playCountdownSound();
          }
          return prevTime - 1;
        });
      }, 1000);
    }

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [
    isCountdownActive,
    isLevelPaused,
    isGameOver,
    timeLeft,
    handleTimeout,
    playCountdownSound
  ]);

  // =======================================================================
  // ============================ FONCTIONS ================================
  // =======================================================================

  // [A] Initialisation du jeu
  const initGame = async () => {
    try {
      setLoading(true);
      await fetchUserData();
      console.log('useGameLogicA => initGame => fetchUserData OK');

      const initialConfig = LEVEL_CONFIGS[1];
      if (!initialConfig) {
        throw new Error('Configuration du niveau 1 manquante');
      }
      setCurrentLevelConfig(initialConfig);

      // Récupération depuis la table "evenements"
      const { data: events, error: eventsError } = await supabase
        .from('evenements')
        .select('*')
        .order('date', { ascending: true });

      console.log(`→ 'evenements' total: ${events?.length}`);
      if (eventsError) throw eventsError;
      if (!events?.length) {
        throw new Error('Aucun événement disponible');
      }

      // Filtrage
      const validEvents = events.filter(
        (event) =>
          event.date &&
          event.titre &&
          event.illustration_url &&
          event.niveau_difficulte &&
          event.types_evenement
      );
      setAllEvents(validEvents);
      console.log(`useGameLogicA => initGame => validEvents: ${validEvents.length}`);

      if (validEvents.length < 2) {
        throw new Error("Pas assez d'événements disponibles");
      }

      // Filtre pour le niveau 1
      const level1Events = validEvents.filter((e) => e.niveau_difficulte <= 2);
      console.log(`useGameLogicA => initGame => level1Events => count: ${level1Events.length}`);

      if (level1Events.length < 2) {
        throw new Error("Pas d'événements adaptés au niveau 1 disponibles");
      }

      // Sélection aléatoire
      const firstIndex = Math.floor(Math.random() * level1Events.length);
      const firstEvent = level1Events[firstIndex];
      const filteredForSecond = level1Events.filter((e) => e.id !== firstEvent.id);
      const secondIndex = Math.floor(Math.random() * filteredForSecond.length);
      const secondEvent = filteredForSecond[secondIndex];

      setPreviousEvent(firstEvent);
      setNewEvent(secondEvent);
      setUsedEvents(new Set([firstEvent.id, secondEvent.id]));

      console.log('useGameLogicA => initGame => firstEvent:', firstEvent.id);
      console.log('useGameLogicA => initGame => secondEvent:', secondEvent.id);

      // Démarrage
      setIsLevelPaused(false);
      setIsCountdownActive(true);
      setTimeLeft(20);

    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Erreur d'initialisation";
      setError(errorMsg);
      console.log('useGameLogicA => initGame => ERROR:', errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // [B] Récupération des données user
  const fetchUserData = async () => {
    console.log('useGameLogicA => fetchUserData()');
    try {
      const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
      if (authError) throw authError;

      if (authUser) {
        const { data, error } = await supabase
          .from('profiles')
          .select('display_name, high_score')
          .eq('id', authUser.id)
          .single();
        if (error) throw error;

        if (data) {
          setUser((prev) => ({
            ...prev,
            name: data.display_name
          }));
          setHighScore(data.high_score || 0);
        }
      }
    } catch (error) {
      console.log('useGameLogicA => fetchUserData => error:', error);
    }
  };

  // [C] handleImageLoad (appelée quand l'image est chargée)
  const handleImageLoad = () => {
    console.log('handleImageLoad triggered');
    setIsImageLoaded(true);
    if (!isLevelPaused) {
      setIsCountdownActive(true);
    }
  }; 

  // [D] Fonctions "updateGameState" et "selectNewEvent"
  const getTimeDifference = useCallback((date1: string, date2: string) => {
    try {
      const d1 = new Date(date1).getTime();
      const d2 = new Date(date2).getTime();
      const diffInYears = Math.abs(d1 - d2) / (365.25 * 24 * 60 * 60 * 1000);
      return diffInYears;
    } catch (error) {
      return Infinity;
    }
  }, []);

  const getPeriod = useCallback((date: string): HistoricalPeriod => {
    try {
      const year = new Date(date).getFullYear();
      if (year < 500) return HistoricalPeriod.ANTIQUITY;
      if (year < 1500) return HistoricalPeriod.MIDDLE_AGES;
      if (year < 1800) return HistoricalPeriod.RENAISSANCE;
      if (year < 1900) return HistoricalPeriod.NINETEENTH;
      if (year < 2000) return HistoricalPeriod.TWENTIETH;
      return HistoricalPeriod.TWENTYFIRST;
    } catch {
      return HistoricalPeriod.TWENTIETH;
    }
  }, []);

  const updateGameState = useCallback(async (selectedEvent: Event) => {
    try {
      console.log('useGameLogicA => updateGameState => event:', selectedEvent.id);
      setUsedEvents((prev) => new Set([...prev, selectedEvent.id]));
      setNewEvent(selectedEvent);
      setIsImageLoaded(false);
      setShowDates(false);
      setIsCorrect(undefined);
      setTimeLeft(20);
      setIsCountdownActive(false); // Add this line
  
      const period = getPeriod(selectedEvent.date);
      setEventHistory((prev) => [
        ...prev,
        {
          type: selectedEvent.types_evenement[0],
          period,
          success: false
        }
      ]);
    } catch (err) {
      console.log('useGameLogicA => updateGameState => ERROR:', err);
    }
  }, [getPeriod]);

  const selectNewEvent = useCallback(
    async (events: Event[], referenceEvent: Event) => {
      console.log('selectNewEvent => Attempting to pick next event');
      if (!events || events.length === 0) {
        console.log('selectNewEvent => No events or empty list');
        return null;
      }

      if (fallbackCountdown <= 0) {
        console.log('selectNewEvent => random fallback triggered => among available unselected events');
        const available = events.filter((e) => !usedEvents.has(e.id));
        if (available.length === 0) {
          console.log('selectNewEvent => no available events at all => returning null');
          return null;
        }
        const randomEvt = available[Math.floor(Math.random() * available.length)];
        await updateGameState(randomEvt);

        const newCount = Math.floor(Math.random() * (25 - 12 + 1)) + 12;
        console.log(`selectNewEvent => new fallbackCountdown = ${newCount}`);
        setFallbackCountdown(newCount);

        await supabase
          .from('evenements')
          .update({
            frequency_score: (randomEvt as any).frequency_score + 1 || 1,
            last_used: new Date().toISOString()
          })
          .eq('id', randomEvt.id);

        return randomEvt;
      }

      // Config
      const config = LEVEL_CONFIGS[user.level];
      if (!config) {
        console.log(`selectNewEvent => No config for level ${user.level}`);
        return null;
      }

      const calculateDynamicTimeGap = (referenceDate: string) => {
        const currentYear = new Date().getFullYear();
        const referenceYear = new Date(referenceDate).getFullYear();
        const yearsFromPresent = currentYear - referenceYear;
        const proximityFactor = Math.max(0.2, Math.min(1, yearsFromPresent / 500));

        const baseGap = config.timeGap.base * proximityFactor;
        const minGap = config.timeGap.minimum * proximityFactor;
        const maxGap = config.timeGap.base * proximityFactor * 1.5;

        return {
          base: baseGap,
          min: minGap,
          max: maxGap,
        };
      };

      const timeGap = calculateDynamicTimeGap(referenceEvent.date);
      const scoreEvent = (event: Event, timeDiff: number): number => {
        const randomFactor = 0.85 + Math.random() * 0.3;
        const idealGap = timeGap.base;

        const gapScore =
          35 * (1 - Math.abs(timeDiff - idealGap) / idealGap) * randomFactor;

        const idealDifficulty =
          (config.eventSelection.minDifficulty + config.eventSelection.maxDifficulty) / 2;
        const difficultyScore =
          25 *
          (1 - Math.abs(event.niveau_difficulte - idealDifficulty) / 5) *
          randomFactor;

        const variationBonus = Math.random() * 10;
        return gapScore + difficultyScore + variationBonus;
      };

      const availableEvents = events.filter((e) => !usedEvents.has(e.id));
      console.log(`selectNewEvent => availableEvents.length = ${availableEvents.length}`);

      const scoredEvents = availableEvents
        .map((event) => {
          const timeDiff = getTimeDifference(event.date, referenceEvent.date);
          const score = scoreEvent(event, timeDiff);
          return { event, timeDiff, score };
        })
        .filter(({ timeDiff }) => timeDiff >= timeGap.min && timeDiff <= timeGap.max)
        .sort((a, b) => b.score - a.score);

      console.log(`selectNewEvent => scoredEvents.length = ${scoredEvents.length} (timeGap = ${timeGap.min}..${timeGap.max})`);

      if (scoredEvents.length === 0) {
        const relaxedEvents = availableEvents
          .map((event) => {
            const timeDiff = getTimeDifference(event.date, referenceEvent.date);
            const score = scoreEvent(event, timeDiff);
            return { event, timeDiff, score };
          })
          .filter(({ timeDiff }) => timeDiff >= timeGap.min * 0.5 && timeDiff <= timeGap.max * 2)
          .sort((a, b) => b.score - a.score);

        console.log(`selectNewEvent => relaxedEvents.length = ${relaxedEvents.length}`);

        if (relaxedEvents.length > 0) {
          const selected = relaxedEvents[0].event;
          await updateGameState(selected);
          console.log(`selectNewEvent => relaxed selected => ${selected.id}`);

          await supabase
            .from('evenements')
            .update({
              frequency_score: (selected as any).frequency_score + 1 || 1,
              last_used: new Date().toISOString()
            })
            .eq('id', selected.id);

          setFallbackCountdown((prev) => {
            console.log(`selectNewEvent => fallbackCountdown-- => ${prev - 1}`);
            return prev - 1;
          });

          return selected;
        }

        const randomEvent =
          availableEvents[Math.floor(Math.random() * availableEvents.length)];
        if (randomEvent) {
          await updateGameState(randomEvent);
          console.log(`selectNewEvent => fallback => random => ${randomEvent.id}`);

          await supabase
            .from('evenements')
            .update({
              frequency_score: (randomEvent as any).frequency_score + 1 || 1,
              last_used: new Date().toISOString()
            })
            .eq('id', randomEvent.id);

          setFallbackCountdown((prev) => prev - 1);
          return randomEvent;
        }
        return null;
      }

      const topEvents = scoredEvents.slice(0, Math.min(10, scoredEvents.length));
      const chosen = topEvents[Math.floor(Math.random() * topEvents.length)].event;

      await supabase
        .from('evenements')
        .update({
          frequency_score: (chosen as any).frequency_score + 1 || 1,
          last_used: new Date().toISOString()
        })
        .eq('id', chosen.id);

      await updateGameState(chosen);
      console.log(`selectNewEvent => selected => ${chosen.id}`);

      setFallbackCountdown((prev) => prev - 1);
      return chosen;
    },
    [
      user.level,
      performanceStats,
      usedEvents,
      fallbackCountdown,
      updateGameState,
      getTimeDifference
    ]
  );

  // [E] Statistiques
  const updatePerformanceStats = useCallback((type: string, period: string, success: boolean) => {
    setPerformanceStats((prev) => {
      const typeSuccesses = Number(prev.typeSuccess[type]) || 0;
      const periodSuccesses = Number(prev.periodSuccess[period]) || 0;
      const totalAttemptsBefore = eventHistory.length;

      const typeSuccessRatio =
        (typeSuccesses + (success ? 1 : 0)) / (typeSuccesses + 1);

      const periodSuccessRatio =
        (periodSuccesses + (success ? 1 : 0)) / (periodSuccesses + 1);

      const overallAccuracy =
        (prev.overallAccuracy * totalAttemptsBefore + (success ? 1 : 0)) /
        (totalAttemptsBefore + 1);

      return {
        typeSuccess: {
          ...prev.typeSuccess,
          [type]: Number.isFinite(typeSuccessRatio) ? typeSuccessRatio : 0
        },
        periodSuccess: {
          ...prev.periodSuccess,
          [period]: Number.isFinite(periodSuccessRatio) ? periodSuccessRatio : 0
        },
        overallAccuracy: Number.isFinite(overallAccuracy)
          ? overallAccuracy
          : 0
      };
    });
  }, [eventHistory.length]);

  // [F] Calcul de points
  const calculatePoints = useCallback(
    (timeLeft: number, difficulty: number, streak: number, eventType: string): number => {
      try {
        const config = LEVEL_CONFIGS[user.level];
        const basePoints = config.scoring.basePoints * difficulty;

        const timeMultiplier = Math.min(
          1 + (timeLeft / 20) * config.scoring.timeMultiplier,
          2.5
        );
        const streakMultiplier = Math.min(
          1 + Math.floor(streak / config.scoring.comboThreshold) * config.scoring.streakMultiplier,
          3.0
        );

        const phaseMultiplier = 1; // On ne l’utilise pas pour l’instant

        const calculatedPoints = Math.floor(
          basePoints * timeMultiplier * streakMultiplier * phaseMultiplier
        );
        return Math.max(0, calculatedPoints);
      } catch (error) {
        return 0;
      }
    },
    [user.level]
  );

  // [G] Récompenses
  const applyReward = useCallback((reward: { type: RewardType; amount: number }) => {
    try {
      const safeAmount = Math.max(0, Math.floor(Number(reward.amount) || 0));
      setUser((prev) => {
        const currentPoints = Math.max(0, Number(prev.points) || 0);
        const updatedPoints = currentPoints + safeAmount;
        return {
          ...prev,
          points: updatedPoints,
          lives:
            reward.type === RewardType.EXTRA_LIFE
              ? Math.min(prev.lives + 1, MAX_LIVES)
              : prev.lives
        };
      });
    } catch (error) {
      // Rien
    }
  }, []);

  // [H] Timeout
  const handleTimeout = useCallback(() => {
    if (isLevelPaused) return;
    console.log('useGameLogicA => handleTimeout => lose 1 life');

    setUser((prev) => {
      const newLives = prev.lives - 1;
      if (newLives <= 0) {
        endGame();
        return { ...prev, lives: newLives, streak: 0 };
      }
      return {
        ...prev,
        lives: newLives,
        streak: 0
      };
    });

    setStreak(0);

    Animated.timing(progressAnim, {
      toValue: 0,
      duration: 500,
      useNativeDriver: false
    }).start();

    if (newEvent) {
      setPreviousEvent(newEvent);
      selectNewEvent(allEvents, newEvent);
    }
  }, [newEvent, allEvents, isLevelPaused, selectNewEvent, endGame, progressAnim]);

  // [I] handleChoice
  const handleChoice = useCallback(
    (choice: 'avant' | 'après') => {
      console.log('====== DÉBUT HANDLECOMPARISON ======');
      console.log(`Choix de l'utilisateur: ${choice}`);

      if (!previousEvent || !newEvent || isLevelPaused) {
        console.log('❌ Comparaison annulée');
        return;
      }

      const previousDate = new Date(previousEvent.date);
      const newDate = new Date(newEvent.date);

      const newBeforePrevious = newDate < previousDate;
      const newAfterPrevious = newDate > previousDate;

      const isAnswerCorrect =
        (choice === 'avant' && newBeforePrevious) ||
        (choice === 'après' && newAfterPrevious);

      setIsCorrect(isAnswerCorrect);
      setShowDates(true);

      const eventSummaryItem: LevelEventSummary = {
        id: newEvent.id,
        titre: newEvent.titre,
        date: newEvent.date,
        date_formatee: newEvent.date_formatee || newEvent.date,
        illustration_url: newEvent.illustration_url,
        wasCorrect: isAnswerCorrect,
        responseTime: 20 - timeLeft
      };

      if (isAnswerCorrect) {
        console.log('Réponse correcte');
        playCorrectSound();
        const newStreak = streak + 1;
        setStreak(newStreak);

        Animated.timing(progressAnim, {
          toValue: newStreak,
          duration: 500,
          useNativeDriver: false
        }).start();

        updatePerformanceStats(
          newEvent.types_evenement?.[0] || 'default',
          getPeriod(newEvent.date),
          true
        );

        const pts = calculatePoints(
          timeLeft,
          newEvent.niveau_difficulte || 1,
          newStreak,
          'default'
        );

        setCurrentLevelEvents((prev) => [...prev, eventSummaryItem]);

        if (Number.isFinite(pts) && pts > 0) {
          setUser((prev) => {
            const currentPoints = Math.max(0, Number(prev.points) || 0);
            const newPoints = currentPoints + pts;

            const updatedUser = {
              ...prev,
              points: newPoints,
              streak: newStreak,
              maxStreak: Math.max(prev.maxStreak, newStreak),
              eventsCompletedInLevel: prev.eventsCompletedInLevel + 1
            };

            // Changement de niveau ?
            if (updatedUser.eventsCompletedInLevel >= LEVEL_CONFIGS[prev.level].eventsNeeded) {
              const nextLevel = prev.level + 1;
              updatedUser.level = nextLevel;
              updatedUser.eventsCompletedInLevel = 0;

              setPreviousEvent(newEvent);
              setCurrentLevelConfig((prevConf) => ({
                ...prevConf,
                eventsSummary: [...currentLevelEvents, eventSummaryItem]
              }));
              setCurrentLevelEvents([]);
              setShowLevelModal(true);
              setIsLevelPaused(true);
              playLevelUpSound();

              checkRewards({ type: 'level', value: nextLevel }, updatedUser);
            } else {
              setTimeout(() => {
                if (!isGameOver && !showLevelModal) {
                  setPreviousEvent(newEvent);
                  selectNewEvent(allEvents, newEvent);
                }
              }, 2000);
            }
            return updatedUser;
          });
        }
      } else {
        console.log('Réponse incorrecte');
        playIncorrectSound();
        setStreak(0);

        Animated.timing(progressAnim, {
          toValue: 0,
          duration: 500,
          useNativeDriver: false
        }).start();

        setCurrentLevelEvents((prev) => [...prev, eventSummaryItem]);

        updatePerformanceStats(
          newEvent.types_evenement?.[0] || 'default',
          getPeriod(newEvent.date),
          false
        );

        setUser((prev) => {
          const updatedLives = prev.lives - 1;
          if (updatedLives <= 0) {
            endGame();
          }
          return {
            ...prev,
            lives: updatedLives,
            streak: 0
          };
        });

        setTimeout(() => {
          if (!isGameOver && !showLevelModal) {
            setPreviousEvent(newEvent);
            selectNewEvent(allEvents, newEvent);
          }
        }, 2000);
      }

      console.log('====== FIN HANDLECOMPARISON ======\n');
    },
    [
      previousEvent,
      newEvent,
      streak,
      timeLeft,
      isLevelPaused,
      isGameOver,
      showLevelModal,
      getPeriod,
      calculatePoints,
      playCorrectSound,
      playIncorrectSound,
      checkRewards,
      selectNewEvent,
      currentLevelEvents,
      endGame,
      updatePerformanceStats,
      allEvents,
      progressAnim
    ]
  );

  // [J] handleLevelUp (forcé)
  const handleLevelUp = useCallback(() => {
    const nextLevel = user.level + 1;
    const config = LEVEL_CONFIGS[nextLevel];
    if (!config) return;

    console.log(`handleLevelUp => forced => new level = ${nextLevel}`);
    setCurrentLevelConfig((prevConf) => ({
      ...config,
      eventsSummary: [...currentLevelEvents]
    }));
    setShowLevelModal(true);
    setIsLevelPaused(true);
    setIsCountdownActive(false);
    setCurrentLevelEvents([]);

    const reward: { type: RewardType; amount: number } = {
      type: RewardType.POINTS,
      amount: config.pointsReward || 500
    };
    applyReward(reward);
    saveProgress();
  }, [user.level, currentLevelEvents, applyReward]);

  // [K] endGame
  const endGame = useCallback(async () => {
    console.log('useGameLogicA => endGame() => isGameOver = true');
    setIsGameOver(true);
    playGameOverSound();
    setLeaderboardsReady(false);

    try {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser?.id) return;

      const today = new Date().toISOString().split('T')[0];
      const firstDayOfMonth = `${today.substring(0, 7)}-01`;

      await supabase.from('game_scores').insert({
        user_id: authUser.id,
        display_name: user.name,
        score: user.points,
        created_at: new Date().toISOString()
      });

      const { data: dailyScores } = await supabase
        .from('game_scores')
        .select('display_name, score')
        .gte('created_at', today)
        .order('score', { ascending: false })
        .limit(5);

      const { data: monthlyScores } = await supabase
        .from('game_scores')
        .select('display_name, score')
        .gte('created_at', firstDayOfMonth)
        .order('score', { ascending: false })
        .limit(5);

      const { data: allTimeScores } = await supabase
        .from('profiles')
        .select('display_name, high_score')
        .order('high_score', { ascending: false })
        .limit(5);

      const { data: currentProfile } = await supabase
        .from('profiles')
        .select('high_score')
        .eq('id', authUser.id)
        .single();

      if (currentProfile && user.points > currentProfile.high_score) {
        await supabase
          .from('profiles')
          .update({ high_score: user.points })
          .eq('id', authUser.id);
      }

      if (dailyScores && monthlyScores && allTimeScores) {
        setScoresAndShow(dailyScores, monthlyScores, allTimeScores);
      }
      await saveProgress();
    } catch (error) {
      console.log('useGameLogicA => endGame => error:', error);
    }
  }, [user, playGameOverSound, saveProgress]);

  // [L] Sauvegarde
  const saveProgress = useCallback(async () => {
    console.log('useGameLogicA => saveProgress()');
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) return;

      const saveData = {
        high_score: Math.max(user.points, highScore),
        current_level: user.level,
        total_events_completed: user.totalEventsCompleted,
        last_played: new Date().toISOString()
      };
      await supabase.from('profiles').update(saveData).eq('id', authUser.id);
    } catch (error) {
      console.log('useGameLogicA => saveProgress => error:', error);
    }
  }, [user.points, user.level, user.totalEventsCompleted, highScore]);

  const setScoresAndShow = (
    dailyScores: any[],
    monthlyScores: any[],
    allTimeScores: any[]
  ) => {
    console.log('useGameLogicA => setScoresAndShow() => format leaderboards');
    const formatted = {
      daily: dailyScores.map((score, index) => ({
        name: score.display_name.trim(),
        score: score.score,
        rank: index + 1
      })),
      monthly: monthlyScores.map((score, index) => ({
        name: score.display_name.trim(),
        score: score.score,
        rank: index + 1
      })),
      allTime: allTimeScores.map((score, index) => ({
        name: score.display_name.trim(),
        score: score.high_score || 0,
        rank: index + 1
      }))
    };
    setLeaderboards(formatted);
    setLeaderboardsReady(true);
  };

  // [M] Redémarrage
  const restartGame = () => {
    console.log('useGameLogicA => restartGame() => reset everything');
    setUser((prev) => ({
      ...prev,
      points: 0,
      lives: MAX_LIVES,
      level: 1,
      streak: 0,
      eventsCompletedInLevel: 0,
      totalEventsCompleted: 0
    }));

    setStreak(0);
    Animated.timing(progressAnim, {
      toValue: 0,
      duration: 500,
      useNativeDriver: false
    }).start();

    setUsedEvents(new Set());
    setIsGameOver(false);
    setError(null);
    setShowLevelModal(false);
    setIsLevelPaused(false);
    setIsCountdownActive(true);
    setCurrentLevelConfig(LEVEL_CONFIGS[1]);
    setCurrentLevelEvents([]);
    setTimeLeft(20);

    setFallbackCountdown(() => Math.floor(Math.random() * (25 - 12 + 1)) + 12);

    if (allEvents.length > 0) {
      const level1Events = allEvents.filter((event) => event.niveau_difficulte <= 2);
      if (level1Events.length >= 2) {
        const firstIndex = Math.floor(Math.random() * level1Events.length);
        const firstEvent = level1Events[firstIndex];
        const filteredForSecond = level1Events.filter((e) => e.id !== firstEvent.id);
        const secondIndex = Math.floor(Math.random() * filteredForSecond.length);
        const secondEvent = filteredForSecond[secondIndex];

        setPreviousEvent(firstEvent);
        setNewEvent(secondEvent);
        setUsedEvents(new Set([firstEvent.id, secondEvent.id]));
        setShowDates(false);

        // Remet isImageLoaded à false au démarrage
        setIsImageLoaded(false);

        setIsCorrect(undefined);
      }
    }
  };

  // [N] Démarrage du niveau
  const startLevel = useCallback(() => {
    console.log('useGameLogicA => startLevel() => unpause level');
    setShowLevelModal(false);
    setIsLevelPaused(false);
    setIsCountdownActive(true);
    setTimeLeft(20);

    if (previousEvent) {
      console.log('startLevel => selecting new event to compare with previous level event');
      selectNewEvent(allEvents, previousEvent);
    } else {
      console.log('startLevel => ERROR: no previous event found');
    }
  }, [allEvents, previousEvent, selectNewEvent]);

  // [O] Exposition de l'interface
  return {
    user,
    previousEvent,
    newEvent,
    timeLeft,
    loading,
    error,
    isGameOver: isGameOver && leaderboardsReady,
    showDates,
    isCorrect,
    isImageLoaded,
    streak,
    highScore,
    showLevelModal,
    isLevelPaused,
    currentLevelConfig,
    leaderboards,
    performanceStats,
    categoryMastery,
    periodStats,
    activeBonus,

    // Récompenses
    currentReward,
    completeRewardAnimation,
    updateRewardPosition,

    // Fonctions
    handleChoice,
    startLevel,
    restartGame,
    handleLevelUp,

    // Pour affichage ou debug
    remainingEvents: allEvents.length - usedEvents.size,

    // Animation
    progressAnim,

    // Important : callback pour signaler que l’image est chargée
    onImageLoad: handleImageLoad
  };
}