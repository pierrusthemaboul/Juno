/************************************************************************************
 * 1. HOOK PRINCIPAL : useGameLogicA
 *
 * 1.A. Description
 *     Hook de logique de jeu principal. Gère la logique de sélection d’événements,
 *     le scoring, la gestion du niveau, l’audio, les récompenses et la fin de partie.
 *
 * 1.B. Paramètres
 *     @param {string} initialEvent - Identifiant éventuel d’un événement initial.
 *
 * 1.C. Retour
 *     {object} - Ensemble d’états et de fonctions utiles au jeu (user, événements, etc.).
 ************************************************************************************/

/* 1.D. Imports et Types */

// 1.D.1. Librairies / Modules
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../supabaseClients';
import useRewards from './useRewards';
import useAudio from './useAudio';
import {
  Event,
  User,
  ExtendedLevelConfig,
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

/* 1.E. Hook : useGameLogicA */

/**
 * Hook de logique de jeu (quiz historique).
 * @function useGameLogicA
 * @param {string} initialEvent - Optionnel, événement de départ.
 * @returns {Object} - Toutes les données et fonctions nécessaires au jeu.
 */
export function useGameLogicA(initialEvent: string) {

  /* 1.E.1. (Récompenses - système) */
  const {
    currentReward,
    checkRewards,
    completeRewardAnimation,
    updateRewardPosition
  } = useRewards({
    onRewardEarned: (reward) => {
      applyReward(reward);
    },
   
  });

  /* 1.E.2. (Audio - sons) */
  const {
    playCorrectSound,
    playIncorrectSound,
    playLevelUpSound,
    playCountdownSound,
    playGameOverSound,
  } = useAudio();

  /* 1.E.3. (Profil utilisateur de base) */
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

  /* 1.E.4. (États du jeu) */
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

  /* 1.E.5. (Événements) */
  const [allEvents, setAllEvents] = useState<Event[]>([]);
  const [previousEvent, setPreviousEvent] = useState<Event | null>(null);
  const [newEvent, setNewEvent] = useState<Event | null>(null);
  const [usedEvents, setUsedEvents] = useState<Set<string>>(new Set());

  /* 1.E.6. (Interface utilisateur) */
  const [timeLeft, setTimeLeft] = useState(20);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isGameOver, setIsGameOver] = useState(false);

  /* 1.E.7. (Chargement d’image) */
  const [isImageLoaded, setIsImageLoaded] = useState(false);

  /* 1.E.8. (Affichage de dates, correctitude) */
  const [showDates, setShowDates] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | undefined>(undefined);

  /* 1.E.9. (Progression) */
  const [streak, setStreak] = useState(0);
  const [highScore, setHighScore] = useState(0);

  /* 1.E.10. (Contrôle du jeu) */
  const [isCountdownActive, setIsCountdownActive] = useState(false);
  const [showLevelModal, setShowLevelModal] = useState(false);
  const [isLevelPaused, setIsLevelPaused] = useState(true);
  const [currentLevelConfig, setCurrentLevelConfig] = useState<ExtendedLevelConfig>({
    ...LEVEL_CONFIGS[1], // Initialisation avec la config du niveau 1
    eventsSummary: []     // Initialisation de eventsSummary comme un tableau vide
  });
  const [leaderboardsReady, setLeaderboardsReady] = useState(false);

  /* 1.E.11. (Classement) */
  const [leaderboards, setLeaderboards] = useState({ daily: [], monthly: [], allTime: [] });

  /* 1.E.12. (Événements de niveau) */
  const [currentLevelEvents, setCurrentLevelEvents] = useState<LevelEventSummary[]>([]);

  /* 1.E.13. (Fallback countdown) */
  const [fallbackCountdown, setFallbackCountdown] = useState<number>(() => {
    return Math.floor(Math.random() * (25 - 12 + 1)) + 12;
  });

  /* 1.E.14. (Animation - streak bar) */
 /* 1.E.14. (Animation - streak bar) */
const [progressAnim] = useState(() => new Animated.Value(0));

const [levelCompletedEvents, setLevelCompletedEvents] = useState<LevelEventSummary[]>([]);

const [forcedJumpEventCount, setForcedJumpEventCount] = useState<number>(() => {
  return Math.floor(Math.random() * (19 - 12 + 1)) + 12;
});

const [eventCount, setEventCount] = useState<number>(0);

const [hasInitialJumped, setHasInitialJumped] = useState<boolean>(false);

const [hasFirstForcedJumpHappened, setHasFirstForcedJumpHappened] = useState<boolean>(false);

const [initialJumpDistance, setInitialJumpDistance] = useState<number>(() => {
  const distances = [500, 750, 1000];
  return distances[Math.floor(Math.random() * distances.length)];
});

const [initialJumpEventCount, setInitialJumpEventCount] = useState<number>(() => {
  return Math.floor(Math.random() * (19 - 12 + 1)) + 12;
});



  /* 1.F. Effet d'initialisation */
  useEffect(() => {
    initGame();
  }, []);

  // 1.G. Compte à rebours
  useEffect(() => {
    let timer: NodeJS.Timeout | undefined;

    if (isCountdownActive && timeLeft > 0 && !isLevelPaused && !isGameOver) {
      timer = setInterval(() => {
        setTimeLeft((prevTime) => {
          if (prevTime <= 1) {
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
  }, [isCountdownActive, isLevelPaused, isGameOver, timeLeft]); // Dépendances optimisées

  /* 1.H. Regroupement des fonctions internes */

  // 1.H.1. initGame
  /**
   * 1.H.1. Initialisation du jeu (fetch user, config niveau 1, etc.)
   * @async
   * @function initGame
   * @returns {void}
   */
  const initGame = async () => {
    try {
      setLoading(true);
      await fetchUserData();

      const initialConfig = LEVEL_CONFIGS[1];
      if (!initialConfig) {
        throw new Error('Configuration du niveau 1 manquante');
      }
      setCurrentLevelConfig(initialConfig);

      const { data: events, error: eventsError } = await supabase
        .from('evenements')
        .select('*')
        .order('date', { ascending: true });

      if (eventsError) throw eventsError;
      if (!events?.length) {
        throw new Error('Aucun événement disponible');
      }

      const validEvents = events.filter(
        (event) =>
          event.date &&
          event.titre &&
          event.illustration_url &&
          event.niveau_difficulte &&
          event.types_evenement
      );
      setAllEvents(validEvents);

      if (validEvents.length < 2) {
        throw new Error("Pas assez d'événements disponibles");
      }

      // --- MODIFICATION ICI : Sélection des événements de niveau 1 uniquement ---
      const level1Events = validEvents.filter((e) => e.niveau_difficulte === 1);

      if (level1Events.length < 2) {
        throw new Error("Pas d'événements adaptés au niveau 1 disponibles");
      }
      // --- FIN DE LA MODIFICATION ---

      const firstIndex = Math.floor(Math.random() * level1Events.length);
      const firstEvent = level1Events[firstIndex];
      const filteredForSecond = level1Events.filter((e) => e.id !== firstEvent.id);
      const secondIndex = Math.floor(Math.random() * filteredForSecond.length);
      const secondEvent = filteredForSecond[secondIndex];

      setPreviousEvent(firstEvent);
      setNewEvent(secondEvent);
      setUsedEvents(new Set([firstEvent.id, secondEvent.id]));

      setIsLevelPaused(false);
      setIsCountdownActive(true);
      setTimeLeft(20);

    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Erreur d'initialisation";
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // 1.H.2. fetchUserData
  /**
   * 1.H.2. Récupération des données user (profils, high score)
   * @async
   * @function fetchUserData
   * @returns {void}
   */
  const fetchUserData = async () => {
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
      // Gestion des erreurs si nécessaire
    }
  };

  // 1.H.3. handleImageLoad
  /**
   * 1.H.3. Gère la fin de chargement d'image pour activer le compte à rebours
   * @function handleImageLoad
   * @returns {void}
   */
  const handleImageLoad = () => {
    setIsImageLoaded(true);
    if (!isLevelPaused) {
      setIsCountdownActive(true);
    }
  };

  // 1.H.4. Fonctions updateGameState et selectNewEvent

  // 1.H.4.a. getTimeDifference
  /**
   * 1.H.4.a. Calcule la différence en années entre deux dates (approx.)
   * @function getTimeDifference
   * @param {string} date1
   * @param {string} date2
   * @returns {number} - Différence en années
   */
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

  // 1.H.4.b. getPeriod
  /**
   * 1.H.4.b. Détermine la période historique à partir d’une date
   * @function getPeriod
   * @param {string} date
   * @returns {HistoricalPeriod}
   */
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

  // 1.H.4.c. updateGameState
  /**
   * 1.H.4.c. Met à jour l’état du jeu après sélection d’un événement
   * @async
   * @function updateGameState
   * @param {Event} selectedEvent
   * @returns {Promise<void>}
   */
  const updateGameState = useCallback(async (selectedEvent: Event) => {
    try {
      setUsedEvents((prev) => new Set([...prev, selectedEvent.id]));
      setNewEvent(selectedEvent);
      setIsImageLoaded(false);
      setShowDates(false);
      setIsCorrect(undefined);

      setIsCountdownActive(false);

      setTimeLeft(20);

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
      // Gestion des erreurs si nécessaire
    }
  }, [getPeriod]);

 // 1.H.4.d. selectNewEvent
/**
 * 1.H.4.d. Sélectionne un nouvel événement en se basant sur la config de niveau
 * @async
 * @function selectNewEvent
 * @param {Event[]} events - Liste d'événements disponibles
 * @param {Event} referenceEvent - Événement de référence
 * @returns {Promise<Event|null>}
 */
const selectNewEvent = useCallback(
  async (events: Event[], referenceEvent: Event) => {
    // 1) Vérification basique
    if (!events || events.length === 0) {
      console.log("[selectNewEvent] Aucun événement disponible");
      return null;
    }

    console.log(
      "[selectNewEvent] Nouveau tirage. fallbackCountdown =",
      fallbackCountdown
    );

    // 2) On incrémente le nombre d'événements joués
    setEventCount((prev) => prev + 1);
    const localEventCount = eventCount + 1;

    console.log(`[selectNewEvent] → localEventCount = ${localEventCount}`);

    // 3) Récupération de l'année de référence
    const referenceYear = new Date(referenceEvent.date).getFullYear();

    // ─────────────────────────────────────────────────────────────────────────
    // 4) checkTimeJump : détermine s'il y a un saut (et combien)
    // ─────────────────────────────────────────────────────────────────────────
    const checkTimeJump = (): number => {
      let jumpDistance = 0;

      // A) Saut forcé si localEventCount == forcedJumpEventCount
      if (localEventCount === forcedJumpEventCount) {
        // Choix aléatoire : 500, 750 ou 1000
        const forcedDistances = [500, 750, 1000];
        jumpDistance =
          forcedDistances[Math.floor(Math.random() * forcedDistances.length)];
        console.log(
          `[checkTimeJump] Saut forcé #${localEventCount}, ±${jumpDistance} ans`
        );
      }

      // B) Sauts conditionnels selon la période
      //    (limités à 1000 ans max)
      if (referenceYear < 500) {
        // localEventCount ∈ [1..5] => +750 ou +1000
        if (localEventCount >= 1 && localEventCount <= 5) {
          const arr = [750, 1000];
          const chosen = arr[Math.floor(Math.random() * arr.length)];
          jumpDistance = Math.max(jumpDistance, chosen);
          console.log(
            `[checkTimeJump] Période <500, localEventCount=${localEventCount} => +${chosen} ans`
          );
        }
      } else if (referenceYear >= 500 && referenceYear < 1000) {
        // localEventCount ∈ [7..12] => +500 ou +1000
        if (localEventCount >= 7 && localEventCount <= 12) {
          const arr = [500, 1000];
          const chosen = arr[Math.random() < 0.5 ? 0 : 1];
          jumpDistance = Math.max(jumpDistance, chosen);
          console.log(
            `[checkTimeJump] Période 500..1000, localEventCount=${localEventCount} => +${chosen} ans`
          );
        }
      } else if (referenceYear >= 1000 && referenceYear < 1800) {
        // localEventCount ∈ [7..12] => +400 ou +750
        if (localEventCount >= 7 && localEventCount <= 12) {
          const arr = [400, 750];
          const chosen = arr[Math.random() < 0.5 ? 0 : 1];
          jumpDistance = Math.max(jumpDistance, chosen);
          console.log(
            `[checkTimeJump] Période 1000..1800, localEventCount=${localEventCount} => +${chosen} ans`
          );
        }
      } else if (referenceYear >= 1800 && referenceYear <= 2024) {
        console.log(
          `[checkTimeJump] Période 1800..2024 => possible saut forcé (12..19).`
        );
      }

      return jumpDistance;
    };

    const timeJump = checkTimeJump();

    // 5) Si on a timeJump > 0 => on cherche un événement "lointain"
    if (timeJump > 0) {
      const isForcedJump = localEventCount === forcedJumpEventCount;

      // Premier saut forcé => passé
      let mainDirection: "past" | "future" = "future";
      if (isForcedJump && !hasFirstForcedJumpHappened) {
        mainDirection = "past";
      }

      // Helpers
      const getPastEvents = (dist: number): Event[] => {
        const target = referenceYear - dist;
        return events.filter((evt) => {
          const yr = new Date(evt.date).getFullYear();
          return yr <= target && !usedEvents.has(evt.id);
        });
      };
      const getFutureEvents = (dist: number): Event[] => {
        const target = referenceYear + dist;
        return events.filter((evt) => {
          const yr = new Date(evt.date).getFullYear();
          return yr >= target && !usedEvents.has(evt.id);
        });
      };

      // On tente le sens principal
      let possibleEvents: Event[] = [];
      if (mainDirection === "past") {
        console.log(
          `[selectNewEvent] Premier saut forcé => on tente -${timeJump} ans (<= ${
            referenceYear - timeJump
          })`
        );
        possibleEvents = getPastEvents(timeJump);
      } else {
        console.log(
          `[selectNewEvent] => on tente +${timeJump} ans (>= ${
            referenceYear + timeJump
          })`
        );
        possibleEvents = getFutureEvents(timeJump);
      }

      if (possibleEvents.length === 0) {
        console.log("[selectNewEvent] Échec. On tente l'autre sens...");
        // Autre sens
        if (mainDirection === "past") {
          // on avait tenté past => future
          possibleEvents = getFutureEvents(timeJump);
        } else {
          // on avait tenté future => past
          possibleEvents = getPastEvents(timeJump);
        }

        if (possibleEvents.length === 0) {
          console.log(
            "[selectNewEvent] Rien trouvé non plus => on passe à la logique normale."
          );
        } else {
          console.log("[selectNewEvent] Trouvé dans l'autre sens !");
        }
      }

      if (possibleEvents.length > 0) {
        const chosen =
          possibleEvents[Math.floor(Math.random() * possibleEvents.length)];
        console.log(`[selectNewEvent] Événement lointain : ${chosen.titre}`);

        await updateGameState(chosen);
        setIsCountdownActive(true);

        await supabase
          .from("evenements")
          .update({
            frequency_score: (chosen as any).frequency_score + 1 || 1,
            last_used: new Date().toISOString(),
          })
          .eq("id", chosen.id);

        // Si c'était un saut forcé
        if (isForcedJump) {
          // Premier ?
          if (!hasFirstForcedJumpHappened) {
            setHasFirstForcedJumpHappened(true);
            console.log(
              `[selectNewEvent] Premier saut forcé => hasFirstForcedJumpHappened = true`
            );
          }
          // On recalcule le prochain forcedJumpEventCount
          const newPalier = Math.floor(Math.random() * (19 - 12 + 1)) + 12;
          setForcedJumpEventCount(localEventCount + newPalier);
          console.log(
            `[selectNewEvent] Nouveau forcedJumpEventCount = ${
              localEventCount + newPalier
            }`
          );
        }

        return chosen;
      }
      // Sinon => on poursuit la sélection normale
      console.log("[selectNewEvent] Pas d'événement lointain => sélection normale");
    }

    // 6) Logique normale
    const config = LEVEL_CONFIGS[user.level];
    if (!config) {
      console.error("Config de niveau manquante :", user.level);
      return null;
    }

    const calculateDynamicTimeGap = (referenceDate: string) => {
      const now = new Date().getFullYear();
      const refY = new Date(referenceDate).getFullYear();
      const yearsFromPresent = now - refY;
      const proximityFactor = Math.max(0.2, Math.min(1, yearsFromPresent / 500));

      const baseGap = config.timeGap.base * proximityFactor;
      const minGap = config.timeGap.minimum * proximityFactor;
      const maxGap = config.timeGap.base * proximityFactor * 1.5;

      return { base: baseGap, min: minGap, max: maxGap };
    };

    const timeGap = calculateDynamicTimeGap(referenceEvent.date);

    const scoreEvent = (evt: Event, diff: number): number => {
      const randomFactor = 0.85 + Math.random() * 0.3;
      const idealGap = timeGap.base;

      const gapScore =
        35 * (1 - Math.abs(diff - idealGap) / idealGap) * randomFactor;

      const idealDifficulty = 2;
      const difficultyScore =
        25 *
        (1 - Math.abs(evt.niveau_difficulte - idealDifficulty) / 2) *
        randomFactor;

      const variationBonus = Math.random() * 10;
      return gapScore + difficultyScore + variationBonus;
    };

    const available = events.filter((e) => !usedEvents.has(e.id));

    const scored = available
      .map((e) => {
        const diff = getTimeDifference(e.date, referenceEvent.date);
        const s = scoreEvent(e, diff);
        return { event: e, timeDiff: diff, score: s };
      })
      .filter(
        ({ timeDiff }) => timeDiff >= timeGap.min && timeDiff <= timeGap.max
      )
      .sort((a, b) => b.score - a.score);

    if (scored.length === 0) {
      // Recherche relaxée
      const relaxed = available
        .map((e) => {
          const diff = getTimeDifference(e.date, referenceEvent.date);
          const s = scoreEvent(e, diff);
          return { event: e, timeDiff: diff, score: s };
        })
        .filter(
          ({ timeDiff }) =>
            timeDiff >= timeGap.min * 0.5 && timeDiff <= timeGap.max * 2
        )
        .sort((a, b) => b.score - a.score);

      if (relaxed.length > 0) {
        const selected = relaxed[0].event;
        await updateGameState(selected);
        setIsCountdownActive(true);

        await supabase
          .from("evenements")
          .update({
            frequency_score: (selected as any).frequency_score + 1 || 1,
            last_used: new Date().toISOString(),
          })
          .eq("id", selected.id);

        setFallbackCountdown((prev) => prev - 1);
        return selected;
      }

      // Aléatoire
      const randomEvt =
        available[Math.floor(Math.random() * available.length)];
      if (randomEvt) {
        await updateGameState(randomEvt);
        setIsCountdownActive(true);

        await supabase
          .from("evenements")
          .update({
            frequency_score: (randomEvt as any).frequency_score + 1 || 1,
            last_used: new Date().toISOString(),
          })
          .eq("id", randomEvt.id);

        setFallbackCountdown((prev) => prev - 1);
        return randomEvt;
      }
      return null;
    } else {
      // Difficulté [min..max]
      const { minDifficulty, maxDifficulty } = config.eventSelection;
      let selectedEvent: Event | null = null;
      let attempts = 0;
      const maxAttempts = 100;
      let currentMin = minDifficulty;
      let currentMax = maxDifficulty;

      while (!selectedEvent && attempts < maxAttempts) {
        attempts++;

        const diffFiltered = scored.filter(
          ({ event }) =>
            event.niveau_difficulte >= currentMin &&
            event.niveau_difficulte <= currentMax
        );

        if (diffFiltered.length > 0) {
          const rndIdx = Math.floor(Math.random() * diffFiltered.length);
          selectedEvent = diffFiltered[rndIdx].event;
        } else {
          currentMin = Math.max(1, currentMin - 1);
          currentMax = Math.min(3, currentMax + 1);

          if (currentMin === 1 && currentMax === 3) {
            break;
          }
        }
      }

      if (!selectedEvent) {
        selectedEvent =
          scored[Math.floor(Math.random() * scored.length)].event;
      }

      await updateGameState(selectedEvent);
      setIsCountdownActive(true);

      await supabase
        .from("evenements")
        .update({
          frequency_score: (selectedEvent as any).frequency_score + 1 || 1,
          last_used: new Date().toISOString(),
        })
        .eq("id", selectedEvent.id);

      setFallbackCountdown((prev) => prev - 1);
      return selectedEvent;
    }
  },
  [
    user.level,
    usedEvents,
    fallbackCountdown,
    updateGameState,
    getTimeDifference,
    eventCount,
    forcedJumpEventCount,
    setForcedJumpEventCount,
    hasFirstForcedJumpHappened,
    setHasFirstForcedJumpHappened
  ]
);




  // 1.H.5. updatePerformanceStats
  /**
   * 1.H.5. Met à jour les statistiques de performance de l’utilisateur
   * @function updatePerformanceStats
   * @param {string} type
   * @param {string} period
   * @param {boolean} success
   * @returns {void}
   */
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

  // 1.H.6. calculatePoints
  /**
   * 1.H.6. Calcule le nombre de points gagnés en fonction du temps, difficulté, streak, etc.
   * @function calculatePoints
   * @param {number} timeLeft
   * @param {number} difficulty
   * @param {number} streak
   * @param {string} eventType
   * @returns {number}
   */
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

        const phaseMultiplier = 1; // Non utilisé pour l’instant

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

  // 1.H.7. applyReward
  /**
   * 1.H.7. Applique la récompense obtenue (vie supplémentaire, points, etc.)
   * @function applyReward
   * @param {{ type: RewardType; amount: number }} reward
   * @returns {void}
   */
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

  // 1.H.8. handleTimeout
  /**
   * 1.H.8. Gère la fin de timer (temps écoulé => perte de vie)
   * @function handleTimeout
   * @returns {void}
   */
  const handleTimeout = useCallback(() => {
    if (isLevelPaused) return;

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

/**
   * Gère la réponse de l’utilisateur : "avant" ou "après"
   * @function handleChoice
   * @param {'avant' | 'après'} choice
   * @returns {void}
   */
const handleChoice = useCallback(
  (choice: 'avant' | 'après') => {
    if (!previousEvent || !newEvent || isLevelPaused) {
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
      responseTime: 20 - timeLeft,
      description_detaillee: newEvent.description_detaillee,
    };

    if (isAnswerCorrect) {
      playCorrectSound();
      const newStreak = streak + 1;
      setStreak(newStreak);

      Animated.timing(progressAnim, {
        toValue: newStreak,
        duration: 500,
        useNativeDriver: false,
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

      checkRewards({ type: 'streak', value: newStreak }, user);

      if (Number.isFinite(pts) && pts > 0) {
        setUser((prev) => {
          const currentPoints = Math.max(0, Number(prev.points) || 0);
          const newPoints = currentPoints + pts;

          const updatedUser = {
            ...prev,
            points: newPoints,
            streak: newStreak,
            maxStreak: Math.max(prev.maxStreak, newStreak),
            eventsCompletedInLevel: prev.eventsCompletedInLevel + 1,
          };

          if (
            updatedUser.eventsCompletedInLevel >=
            LEVEL_CONFIGS[prev.level].eventsNeeded
          ) {
            const nextLevel = prev.level + 1;
            updatedUser.level = nextLevel;
            updatedUser.eventsCompletedInLevel = 0;

            setPreviousEvent(newEvent);
            setLevelCompletedEvents((prevEvents) => [
              ...prevEvents,
              ...currentLevelEvents,
            ]);
            setCurrentLevelConfig((prevConf) => ({
              ...LEVEL_CONFIGS[nextLevel],
              eventsSummary: [],
            }));
            setCurrentLevelEvents([]);
            setShowLevelModal(true);
            setIsLevelPaused(true);
            playLevelUpSound();
            checkRewards({ type: 'level', value: nextLevel }, updatedUser);
          } else {
            setCurrentLevelEvents((prevEvents) => [
              ...prevEvents,
              eventSummaryItem,
            ]);
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
      playIncorrectSound();
      setStreak(0);

      Animated.timing(progressAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: false,
      }).start();

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
          streak: 0,
        };
      });

      setCurrentLevelEvents((prev) => [...prev, eventSummaryItem]);

      setTimeout(() => {
        if (!isGameOver && !showLevelModal) {
          setPreviousEvent(newEvent);
          selectNewEvent(allEvents, newEvent);
        }
      }, 2000);
    }
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
    progressAnim,
    user,
  ]
);

  /* ******* MODIFICATION ******* */
  // 1.H.10. handleLevelUp (correction du bug de type)
  const handleLevelUp = useCallback(() => {
    setUser(prevUser => {
      const nextLevel = prevUser.level + 1;
      const config = LEVEL_CONFIGS[nextLevel];
      if (!config) {
        return prevUser;
      }

      setCurrentLevelConfig(prevConf => ({
        ...config,
        eventsSummary: [...(prevConf?.eventsSummary || []), ...currentLevelEvents]
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

      return {
        ...prevUser,
        level: nextLevel
      };
    });
  }, [currentLevelEvents, applyReward, saveProgress]);

  // 1.H.11. endGame
  /**
   * 1.H.11. Termine la partie et sauvegarde le score (classements)
   * @async
   * @function endGame
   * @returns {Promise<void>}
   */
  const endGame = useCallback(async () => {
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
      // Gestion des erreurs si nécessaire
    }
  }, [user, playGameOverSound, saveProgress]);

  // 1.H.12. saveProgress
  /**
   * 1.H.12. Sauvegarde le progrès (niveau, score)
   * @async
   * @function saveProgress
   * @returns {Promise<void>}
   */
  const saveProgress = useCallback(async () => {
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
      // Gestion des erreurs si nécessaire
    }
  }, [user.points, user.level, user.totalEventsCompleted, highScore]);

  // 1.H.13. setScoresAndShow
  /**
   * 1.H.13. Met en forme les tableaux de scores et affiche le leaderboard
   * @function setScoresAndShow
   * @param {any[]} dailyScores
   * @param {any[]} monthlyScores
   * @param {any[]} allTimeScores
   * @returns {void}
   */
  const setScoresAndShow = (
    dailyScores: any[],
    monthlyScores: any[],
    allTimeScores: any[]
  ) => {
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

  // 1.H.14. restartGame
  /**
   * 1.H.14. Redémarre la partie (remise à zéro de l'état)
   * @function restartGame
   * @returns {void}
   */
  const restartGame = () => {
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
    setLevelCompletedEvents([]); // Réinitialisation des événements du niveau terminé
    setTimeLeft(20);

    // On réinitialise aussi le fallbackCountdown
    setFallbackCountdown(() => Math.floor(Math.random() * (25 - 12 + 1)) + 12);

    // On réinitialise le compteur d’événements et le saut initial
    setEventCount(0);
    setHasInitialJumped(false);
    const distances = [500, 750, 1000];
    setInitialJumpDistance(distances[Math.floor(Math.random() * distances.length)]);
    setInitialJumpEventCount(Math.floor(Math.random() * (19 - 12 + 1)) + 12);

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

        setIsImageLoaded(false);
        setIsCorrect(undefined);
      }
    }
  };

  /* ******* MODIFICATION ******* */
  // 1.H.15. startLevel
  /**
   * 1.H.15. Lance le niveau (ferme le modal et relance la sélection d’événements)
   * @function startLevel
   * @returns {void}
   */
  const startLevel = useCallback(() => {
    setShowLevelModal(false);
    setIsLevelPaused(false);
    setIsCountdownActive(true);
    setTimeLeft(20);

    setLevelCompletedEvents([]); // On vide les événements du niveau terminé

    if (previousEvent) {
      selectNewEvent(allEvents, previousEvent);
    } else {
      // Aucun événement précédent, aucune action spécifique définie
    }
  }, [allEvents, previousEvent, selectNewEvent]);


  /* 1.I. Retour du hook */
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

    currentReward,
    completeRewardAnimation,
    updateRewardPosition,

    handleChoice,
    startLevel,
    restartGame,
    handleLevelUp,

    remainingEvents: allEvents.length - usedEvents.size,

    progressAnim,

    onImageLoad: handleImageLoad,

    /* ******* NOUVELLE VALEUR RETOURNÉE ******* */
    levelCompletedEvents,
  };
}
