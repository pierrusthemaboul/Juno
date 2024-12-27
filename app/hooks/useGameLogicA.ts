// 1. Introduction
// ==============
// 1.A. Description générale
// ------------------------
// Ce fichier contient la logique principale du jeu de chronologie historique.

// 1.B. Configuration IA
// --------------------
// FORMAT_COMMENT: Les commentaires commençant par "AI:" sont des points d'attention
// spécifiques pour les futures modifications avec Claude AI

// 1.C. Points clés de maintenance
// -----------------------------
// - La sélection des événements est critique et utilise des fallbacks progressifs
// - Les niveaux sont basés sur les écarts temporels et la difficulté
// - Le système de points et de récompenses est modulaire
// - Les logs détaillés aident au debugging

// 2. Imports
// =========
// 2.A. Imports React
// ----------------
import { useState, useEffect, useCallback } from 'react';

// 2.B. Imports Services
// -------------------
import { supabase } from '../../supabaseClients';
import { useRewards } from './useRewards';
import { useAudio } from './useAudio';

// 2.C. Imports Types et Constantes
// ------------------------------
import { 
  Event, 
  User, 
  LEVEL_CONFIGS, 
  LevelConfig, 
  RewardType,
  GamePhase,
  MAX_LIVES,
  LIFE_BONUS_THRESHOLD,
  BASE_POINTS,
  MAX_TIME_MULTIPLIER,
  MAX_STREAK_MULTIPLIER,
  STREAK_BONUS_BASE,
  LEVEL_UP_LIFE_BONUS,
  MAX_BONUS_STACKS,
  MAX_MASTERY_MULTIPLIER,
  MAX_PERIOD_MULTIPLIER,
  MAX_COMBO_MULTIPLIER,
  BONUS_DURATION,
  BonusType,
  HistoricalPeriod,
  HistoricalPeriodStats,
  ActiveBonus,
  BonusStack,
  CategoryMastery,
  PerformanceStats,
  LevelPerformance,
  DifficultyModifiers,
} from '../hooks/types';

// 2.D. Imports Utilitaires
// ----------------------
import { gameLogger } from '../utils/gameLogger';

// 3. Hook Principal
// ===============
// 3.A. Définition du hook
// ----------------------
export function useGameLogicA(initialEvent: string) {

  // 3.B. Hooks système
  // ----------------
  // 3.B.a. Hook de récompenses
  const { 
    currentReward, 
    checkRewards, 
    completeRewardAnimation, 
    updateRewardPosition 
  } = useRewards({
    onRewardEarned: (reward) => {
      console.log('Reward earned:', reward);
      applyReward(reward);
    }
  });

  // 3.B.b. Hook audio
  const { 
    playCorrectSound, 
    playIncorrectSound, 
    playLevelUpSound,
    playCountdownSound,
    playGameOverSound,
    toggleBackgroundMusic,
    setMusicVolume,
    setSoundVolume
  } = useAudio();


// 4. États du jeu
// ==============

// 4.0. Définitions d'énumération
// ---------------------------
// 4.0.a. Phases de jeu
enum GamePhase {
  LEARNING = 'LEARNING',
  INTERMEDIATE = 'INTERMEDIATE',
  ADVANCED = 'ADVANCED',
  EXPERT = 'EXPERT',
  LEGENDARY = 'LEGENDARY'
}

// 4.A. États des séries et récompenses
// ----------------------------------
const [streakAlerts, setStreakAlerts] = useState<string[]>([]);
const [lastLevelWithReward, setLastLevelWithReward] = useState(0);
const [showingReward, setShowingReward] = useState(false);

// 4.B. États utilisateur
// --------------------
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

// 4.C. États bonus
// --------------
const [activeBonus, setActiveBonus] = useState<ActiveBonus[]>([]);
const [bonusStack, setBonusStack] = useState<BonusStack>({
  currentMultiplier: 1,
  activeStacks: [],
  maxStacks: MAX_BONUS_STACKS
});

// 4.D. États performances
// ---------------------
const [previousEventTypes, setPreviousEventTypes] = useState<string[]>([]);
const [periodStats, setPeriodStats] = useState<Record<HistoricalPeriod, HistoricalPeriodStats>>({});
const [categoryMastery, setCategoryMastery] = useState<Record<string, CategoryMastery>>({});

// 4.E. États historique
// -------------------
const [eventHistory, setEventHistory] = useState<{
  type: string;
  period: string;
  success: boolean;
}[]>([]);

// 4.F. États statistiques
// ---------------------
const [performanceStats, setPerformanceStats] = useState<{
  typeSuccess: Record<string, number>;
  periodSuccess: Record<string, number>;
  overallAccuracy: number;
}>({
  typeSuccess: {},
  periodSuccess: {},
  overallAccuracy: 0
});

// 4.G. États événements
// -------------------
const [allEvents, setAllEvents] = useState<Event[]>([]);
const [previousEvent, setPreviousEvent] = useState<Event | null>(null);
const [newEvent, setNewEvent] = useState<Event | null>(null);
const [usedEvents, setUsedEvents] = useState<Set<string>>(new Set());

// 4.H. États interface
// ------------------
const [timeLeft, setTimeLeft] = useState(20);
const [loading, setLoading] = useState(true);
const [error, setError] = useState<string | null>(null);
const [isGameOver, setIsGameOver] = useState(false);
const [isImageLoaded, setIsImageLoaded] = useState(false);
const [showDates, setShowDates] = useState(false);
const [isCorrect, setIsCorrect] = useState<boolean | undefined>(undefined);

// 4.I. États progression
// --------------------
const [streak, setStreak] = useState(0);
const [highScore, setHighScore] = useState(0);

// 4.J. États contrôle
// -----------------
const [isCountdownActive, setIsCountdownActive] = useState(false);
const [showLevelModal, setShowLevelModal] = useState(true);
const [isLevelPaused, setIsLevelPaused] = useState(true);
const [currentLevelConfig, setCurrentLevelConfig] = useState<LevelConfig>(LEVEL_CONFIGS[1]);
const [leaderboardsReady, setLeaderboardsReady] = useState(false);

// 4.K. États classement
// -------------------
const [leaderboards, setLeaderboards] = useState({
  daily: [],
  monthly: [],
  allTime: []
});

// 4.L. États de progression
// -----------------
// 4.L.a. Phase de jeu
const [gamePhase, setGamePhase] = useState<GamePhase>(GamePhase.LEARNING);

// 4.L.b. Performance
const [performance, setPerformance] = useState<LevelPerformance>({
  accuracy: 0,
  averageTime: 0,
  streakLength: 0,
  perfectRounds: 0,
  specialEventsCompleted: 0
});

// 4.L.c. Modificateurs de difficulté
const [difficultyModifiers, setDifficultyModifiers] = useState<DifficultyModifiers>({
  timeGapModifier: 1,
  eventDifficultyModifier: 1,
  scoringModifier: 1
});

// 4.M. États de suivi des événements du niveau
// ---------------------------------------
const [currentLevelEvents, setCurrentLevelEvents] = useState<LevelEventSummary[]>([]);
  

  
  // 5. Effets
  // =========
  // 5.A. Effet d'initialisation
  // --------------------------
  useEffect(() => {
    initGame();
    return () => {
      console.log('Cleaning up game...');
    };
  }, []);

  // 5.B. Effet de compte à rebours
  // ----------------------------
  useEffect(() => {
    let timer;
    if (isCountdownActive && timeLeft > 0 && !isLevelPaused) {
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
    return () => clearInterval(timer);
  }, [isCountdownActive, isLevelPaused]);

// 6. Fonctions d'initialisation
// ===========================

// 6.A. Initialisation du jeu
// -------------------------
const initGame = async () => {
  try {
    setLoading(true);
    console.log('[initGame] Starting game initialization');

    // 6.A.x. Récupération de l’utilisateur
    // ------------------------------------
    console.log('[initGame] About to call fetchUserData...');
    await fetchUserData();
    console.log('[initGame] fetchUserData finished. Current user name:', user.name);

    // Vérification de la configuration initiale
    const initialConfig = LEVEL_CONFIGS[1];
    if (!initialConfig) {
      throw new Error('Configuration du niveau 1 manquante');
    }

    console.log('[initGame] Initial config loaded:', {
      timeGap: initialConfig.timeGap
    });

    setCurrentLevelConfig(initialConfig);

    // 6.A.a. Chargement des événements
    // --------------------------------
    const { data: events, error: eventsError } = await supabase
      .from('evenements')
      .select('*')
      .order('date', { ascending: true });

    if (eventsError) throw eventsError;

    if (!events?.length) {
      throw new Error('Aucun événement disponible');
    }

    // 6.A.b. Filtrage et stockage des événements valides
    // -------------------------------------------------
    const validEvents = events.filter(event => 
      event.date && 
      event.titre && 
      event.illustration_url &&
      event.niveau_difficulte && 
      event.types_evenement
    );

    // Important : Stocker les événements valides dans l'état
    setAllEvents(validEvents);
    console.log(`[initGame] ${validEvents.length} événements valides chargés`);

    if (validEvents.length < 2) {
      throw new Error('Pas assez d\'événements disponibles');
    }

    // 6.A.c. Configuration niveau 1
    // -----------------------------
    const level1Events = validEvents.filter(event => 
      event.niveau_difficulte <= 2 && 
      event.universel
    );

    if (level1Events.length === 0) {
      throw new Error('Pas d\'événements universels de niveau 1-2 disponibles');
    }

    const startEvent = level1Events[Math.floor(Math.random() * level1Events.length)];
    setPreviousEvent(startEvent);
    setUsedEvents(new Set([startEvent.id]));

    const nextEvent = await selectNewEvent(validEvents, startEvent);
    if (!nextEvent) {
      throw new Error('Impossible de trouver un second événement valide');
    }

    // 6.A.d. Configuration initiale
    // -----------------------------
    setCurrentLevelConfig(LEVEL_CONFIGS[1]);
    setShowLevelModal(true);
    setIsLevelPaused(true);
    setIsCountdownActive(false);

  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Erreur d\'initialisation';
    console.error('[initGame] Init game error:', errorMsg);
    setError(errorMsg);
  } finally {
    setLoading(false);
    console.log('[initGame] Initialization finished');
  }
};

// 6.B. Chargement données utilisateur
// ---------------------------------
const fetchUserData = async () => {
  try {
    console.log('[fetchUserData] Starting fetchUserData...');
    const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();

    if (authError) {
      throw authError;
    }

    console.log('[fetchUserData] supabase.auth.getUser() result:', authUser);

    if (authUser) {
      const { data, error } = await supabase
        .from('profiles')
        .select('display_name, high_score')
        .eq('id', authUser.id)
        .single();

      if (error) throw error;

      if (data) {
        setUser(prev => ({
          ...prev,
          name: data.display_name
        }));
        setHighScore(data.high_score || 0);

        console.log('[fetchUserData] User data fetched successfully:', {
          display_name: data.display_name,
          high_score: data.high_score
        });
      } else {
        console.log('[fetchUserData] No profile data returned for this user.');
      }
    } else {
      console.log('[fetchUserData] No authUser found (not logged in?)');
    }
  } catch (error) {
    console.error('[fetchUserData] Error fetching user data:', error);
  }
};

// 7. Gestion des événements
// ========================


// 7.A. Calcul différence temporelle
// -------------------------------
const getTimeDifference = useCallback((date1: string, date2: string): number => {
  try {
    const d1 = new Date(date1).getTime();
    const d2 = new Date(date2).getTime();
    const diffInYears = Math.abs(d1 - d2) / (365.25 * 24 * 60 * 60 * 1000);
    return diffInYears;
  } catch (error) {
    return Infinity;
  }
}, []);

// 7.B. Détermination de la période
// -----------------------------
const getPeriod = useCallback((date: string): HistoricalPeriod => {
  try {
    const year = new Date(date).getFullYear();
    if (year < 500) return HistoricalPeriod.ANTIQUITY;
    if (year < 1500) return HistoricalPeriod.MIDDLE_AGES;
    if (year < 1800) return HistoricalPeriod.RENAISSANCE;
    if (year < 1900) return HistoricalPeriod.NINETEENTH;
    if (year < 2000) return HistoricalPeriod.TWENTIETH;
    return HistoricalPeriod.TWENTYFIRST;
  } catch (error) {
    return HistoricalPeriod.TWENTIETH;
  }
}, []);

// 7.C. Mise à jour de l'état du jeu
// -------------------------------
const updateGameState = useCallback(async (selectedEvent: Event) => {
  try {
    setUsedEvents(prev => new Set([...prev, selectedEvent.id]));
    setNewEvent(selectedEvent);
    setIsImageLoaded(false);
    setShowDates(false);
    setIsCorrect(undefined);
    setIsCountdownActive(false);
    setTimeLeft(20);

    const period = getPeriod(selectedEvent.date);
    setEventHistory(prev => [...prev, {
      type: selectedEvent.types_evenement[0],
      period,
      success: false
    }]);
  } catch (error) {
  }
}, [getPeriod]);

// 7.D. Sélection des événements
// ---------------------------

// 7.D.1 Sélection nouvel événement
const selectNewEvent = useCallback(async (events: Event[], referenceEvent: Event) => {
  if (!events || !Array.isArray(events) || events.length === 0) {
    return null;
  }

  // 7.D.1.c Configuration du niveau
  const config = LEVEL_CONFIGS[user.level];
  if (!config) {
    return null;
  }

  // 7.D.2 Calcul de l'écart temporel dynamique
  // ----------------------------------------
  const calculateDynamicTimeGap = (referenceDate: string): { base: number; min: number; max: number } => {
    const currentYear = 2024;
    const referenceYear = new Date(referenceDate).getFullYear();
    const yearsFromPresent = currentYear - referenceYear;
    const proximityFactor = Math.max(0.2, Math.min(1, yearsFromPresent / 500));
    
    const baseGap = config.timeGap.base * proximityFactor;
    const minGap = config.timeGap.minimum * proximityFactor;
    const maxGap = config.timeGap.base * proximityFactor * 1.5;

    return {
      base: baseGap,
      min: minGap * difficultyModifiers.timeGapModifier,
      max: maxGap * difficultyModifiers.timeGapModifier
    };
  };

  const timeGap = calculateDynamicTimeGap(referenceEvent.date);

  // 7.D.3 Système de scoring des événements
  // ------------------------------------
  const scoreEvent = (event: Event, timeDiff: number): number => {
    const randomFactor = 0.85 + (Math.random() * 0.3);
    const idealGap = timeGap.base;
    const gapScore = 35 * (1 - Math.abs(timeDiff - idealGap) / idealGap) * randomFactor;
    
    const idealDifficulty = (config.eventSelection.minDifficulty + config.eventSelection.maxDifficulty) / 2;
    const difficultyScore = 25 * (1 - Math.abs(event.niveau_difficulte - idealDifficulty) / 5) * randomFactor;
    
    const typeScore = !previousEventTypes.includes(event.types_evenement[0]) ? 25 : 0;
    const universalScore = event.universel ? 5 : 0;
    const variationBonus = Math.random() * 10;
    const recentlyUsedPenalty = previousEventTypes.length > 0 ? 
      previousEventTypes.filter(t => event.types_evenement.includes(t)).length * 5 : 0;

    return gapScore + difficultyScore + typeScore + universalScore + variationBonus - recentlyUsedPenalty;
  };

  // 7.D.4 Filtrage et sélection
  // --------------------------
  const availableEvents = events.filter(event => !usedEvents.has(event.id));
  
  const scoredEvents = availableEvents
    .map(event => {
      const timeDiff = getTimeDifference(event.date, referenceEvent.date);
      const score = scoreEvent(event, timeDiff);
      return { event, timeDiff, score };
    })
    .filter(({ timeDiff }) => timeDiff >= timeGap.min && timeDiff <= timeGap.max)
    .sort((a, b) => b.score - a.score);

  // 7.D.5 Gestion des cas spéciaux
  // -----------------------------
  if (scoredEvents.length === 0) {
    const relaxedEvents = availableEvents
      .map(event => {
        const timeDiff = getTimeDifference(event.date, referenceEvent.date);
        const score = scoreEvent(event, timeDiff);
        return { event, timeDiff, score };
      })
      .filter(({ timeDiff }) => 
        timeDiff >= timeGap.min * 0.5 && 
        timeDiff <= timeGap.max * 2
      )
      .sort((a, b) => b.score - a.score);

    if (relaxedEvents.length > 0) {
      const selected = relaxedEvents[0].event;
      await updateGameState(selected);
      return selected;
    }

    const randomEvent = availableEvents[Math.floor(Math.random() * availableEvents.length)];
    if (randomEvent) {
      await updateGameState(randomEvent);
      return randomEvent;
    }
  }

  // 7.D.6 Sélection finale
  // ----------------------
  const topEvents = scoredEvents.slice(0, Math.min(3, scoredEvents.length));
  const selectedEvent = topEvents[Math.floor(Math.random() * topEvents.length)].event;

  await supabase
    .from('evenements')
    .update({
      frequency_score: (selectedEvent.frequency_score || 0) + 1,
      last_used: new Date().toISOString()
    })
    .eq('id', selectedEvent.id);

  await updateGameState(selectedEvent);
  return selectedEvent;
}, [
  user.level, 
  gamePhase, 
  difficultyModifiers, 
  performanceStats, 
  usedEvents, 
  previousEventTypes, 
  getTimeDifference, 
  updateGameState
]);

 // 8. Gestion des statistiques
// =========================
// 8.A. Mise à jour des performances
// ------------------------------
const updatePerformanceStats = useCallback((type: string, period: string, success: boolean) => {
  setPerformanceStats(prev => {
    // 8.A.a. Initialisation sûre des compteurs
    const typeSuccesses = Number(prev.typeSuccess[type]) || 0;
    const typeAttempts = Number(prev.typeSuccess[type]) || 0;
    const periodSuccesses = Number(prev.periodSuccess[period]) || 0;
    const periodAttempts = Number(prev.periodSuccess[period]) || 0;

    // 8.A.b. Calcul des nouveaux taux de succès
    const typeSuccess = (typeSuccesses + (success ? 1 : 0)) / (typeAttempts + 1);
    const periodSuccess = (periodSuccesses + (success ? 1 : 0)) / (periodAttempts + 1);

    // 8.A.c. Calcul de la précision globale
    const totalAttempts = eventHistory.length + 1;
    const overallAccuracy = ((prev.overallAccuracy * eventHistory.length) + (success ? 1 : 0)) / totalAttempts;

    // 8.A.d. Construction de la mise à jour
    return {
      typeSuccess: {
        ...prev.typeSuccess,
        [type]: Number.isFinite(typeSuccess) ? typeSuccess : 0
      },
      periodSuccess: {
        ...prev.periodSuccess,
        [period]: Number.isFinite(periodSuccess) ? periodSuccess : 0
      },
      overallAccuracy: Number.isFinite(overallAccuracy) ? overallAccuracy : 0
    };
  });
}, [eventHistory.length]);

// 8.B. Initialisation des statistiques
// ---------------------------------
const initializeStats = useCallback(() => {
  setPerformanceStats({
    typeSuccess: {},
    periodSuccess: {},
    overallAccuracy: 0
  });
  setCategoryMastery({});
  setPeriodStats({});
}, []);

// 9. Gestion des points
// ===================
// 9.A. Calcul des points
// ------------------
const calculatePoints = useCallback((timeLeft: number, difficulty: number, streak: number, eventType: string): number => {
  try {
    // 9.A.a. Configuration de base
    const config = LEVEL_CONFIGS[user.level];
    const phase = gamePhase;
    
    // 9.A.b. Points de base adaptatifs
    const basePoints = config.scoring.basePoints * 
                      difficulty * 
                      difficultyModifiers.scoringModifier;
    
    // 9.A.c. Multiplicateur de temps
    const timeMultiplier = Math.min(
      1 + (timeLeft / 20) * config.scoring.timeMultiplier,
      2.5
    );
    
    // 9.A.d. Multiplicateur de série
    const streakMultiplier = Math.min(
      1 + Math.floor(streak / config.scoring.comboThreshold) * 
          config.scoring.streakMultiplier,
      3.0
    );
    
    // 9.A.e. Multiplicateur de phase
    const phaseMultiplier = {
      [GamePhase.LEARNING]: 1.0,
      [GamePhase.INTERMEDIATE]: 1.2,
      [GamePhase.ADVANCED]: 1.4,
      [GamePhase.EXPERT]: 1.6,
      [GamePhase.LEGENDARY]: 2.0
    }[phase];

    // 9.A.f. Calcul final
    const calculatedPoints = Math.floor(
      basePoints * 
      timeMultiplier * 
      streakMultiplier * 
      phaseMultiplier
    );

    // 9.A.g. Log et sécurité
    console.log('Points calculation:', {
      base: basePoints,
      multipliers: {
        time: timeMultiplier,
        streak: streakMultiplier,
        phase: phaseMultiplier
      },
      final: calculatedPoints
    });

    return Math.max(0, calculatedPoints);

  } catch (error) {
    console.error('Error in points calculation:', error);
    return 0;
  }
}, [user.level, gamePhase, difficultyModifiers]);

// 9.B. Application des récompenses
// ------------------------------
const applyReward = useCallback((reward: { type: RewardType; amount: number }) => {
  try {
    const safeAmount = Math.max(0, Math.floor(Number(reward.amount) || 0));
    console.log('Applying reward:', { type: reward.type, amount: safeAmount });

    setUser(prev => {
      const currentPoints = Math.max(0, Number(prev.points) || 0);
      const updatedPoints = currentPoints + safeAmount;

      return {
        ...prev,
        points: updatedPoints,
        lives: reward.type === RewardType.EXTRA_LIFE 
          ? Math.min(prev.lives + 1, MAX_LIVES)
          : prev.lives
      };
    });
  } catch (error) {
    console.error('Error applying reward:', error);
  }
}, []);

 // 10. Mécanique de jeu
// ==================
// 10.A. Gestion du timeout
// ----------------------
const handleTimeout = useCallback(() => {
  if (isLevelPaused) return;
  
  // 10.A.a. Mise à jour vie et streak
  setUser(prev => {
    const newLives = prev.lives - 1;
    if (newLives <= 0) {
      endGame();
      return prev;
    }
    
    return {
      ...prev,
      lives: newLives,
      streak: 0
    };
  });

  // 10.A.b. Réinitialisation et suite
  setPreviousEventTypes([]);
  if (newEvent) {
    setPreviousEvent(newEvent);
    selectNewEvent(allEvents, newEvent);
  }
}, [newEvent, allEvents, isLevelPaused]);

// 10.B. Gestion des choix joueur
// ----------------------------
const handleChoice = useCallback((choice: 'avant' | 'après') => {
  if (!previousEvent || !newEvent || isLevelPaused) return;

  // 10.B.a. Vérification réponse
  setIsCountdownActive(false);
  const previousDate = new Date(previousEvent.date);
  const newDate = new Date(newEvent.date);
  
  const isCorrect = (choice === 'avant' && newDate < previousDate) || 
                   (choice === 'après' && newDate > previousDate);

  setIsCorrect(isCorrect);
  setShowDates(true);
  
  if (isCorrect) {
    // 10.B.b. Traitement réponse correcte
    playCorrectSound();
    const newStreak = streak + 1;
    setStreak(newStreak);
    
    const currentType = newEvent.types_evenement?.[0] || 'default';
    setPreviousEventTypes(prev => [...prev, currentType]);

    // Mise à jour des statistiques
    updatePerformanceStats(
      currentType,
      getPeriod(newEvent.date),
      true
    );

    const calculatedPoints = calculatePoints(
      timeLeft,
      newEvent.niveau_difficulte || 1,
      newStreak,
      currentType
    );

    // Ajout de l'événement au résumé
setCurrentLevelEvents(prev => [...prev, {
  id: newEvent.id,
  titre: newEvent.titre,
  date: newEvent.date,
  date_formatee: newEvent.date_formatee || newEvent.date,
  illustration_url: newEvent.illustration_url,
  wasCorrect: true,
  responseTime: 20 - timeLeft
}]);

    // 10.B.c. Mise à jour des points et progression
    if (Number.isFinite(calculatedPoints) && calculatedPoints > 0) {
      setUser(prev => {
        const currentPoints = Math.max(0, Number(prev.points) || 0);
        const newPoints = currentPoints + calculatedPoints;

        console.log('Updating points:', {
          current: currentPoints,
          adding: calculatedPoints,
          new: newPoints
        });

        const updatedUser = {
          ...prev,
          points: newPoints,
          streak: newStreak,
          maxStreak: Math.max(prev.maxStreak || 0, newStreak),
          eventsCompletedInLevel: prev.eventsCompletedInLevel + 1
        };

        // 10.B.d. Vérification passage niveau
        if (updatedUser.eventsCompletedInLevel >= LEVEL_CONFIGS[prev.level].eventsNeeded) {
          const nextLevel = prev.level + 1;
          updatedUser.level = nextLevel;
          updatedUser.eventsCompletedInLevel = 0;
          setShowLevelModal(true);
          setIsLevelPaused(true);
          playLevelUpSound();
          
          checkRewards({ type: 'level', value: nextLevel }, updatedUser);
        }

        return updatedUser;
      });
    }

    checkRewards({ type: 'streak', value: newStreak }, user);
  } else {
    // 10.B.e. Traitement réponse incorrecte
    playIncorrectSound();
    setStreak(0);
    setPreviousEventTypes([]);

    // Mise à jour des statistiques
    updatePerformanceStats(
      newEvent.types_evenement?.[0] || 'default',
      getPeriod(newEvent.date),
      false
    );

    setUser(prev => ({
      ...prev,
      lives: prev.lives - 1,
      streak: 0
    }));

    if (user.lives <= 1) {
      endGame();
      return;
    }
  }

  // 10.B.f. Passage à l'événement suivant
  setTimeout(() => {
    if (!isGameOver) {
      setPreviousEvent(newEvent);
      selectNewEvent(allEvents, newEvent);
    }
  }, 2000);
}, [
  previousEvent, newEvent, timeLeft, user.level, streak,
  isLevelPaused, allEvents, checkRewards, calculatePoints,
  updatePerformanceStats
]);
  // ====================
  // 11.A. Passage au niveau suivant
  // ----------------------------
  const handleLevelUp = useCallback(() => {
    const nextLevel = user.level + 1;
    const config = LEVEL_CONFIGS[nextLevel];

    if (!config) {
      console.warn('No config found for next level', { nextLevel });
      return;
    }

    // 11.A.a. Configuration nouveau niveau
    setCurrentLevelConfig(config);
    setShowLevelModal(true);
    setIsLevelPaused(true);
    setIsCountdownActive(false);
    config.eventsSummary = currentLevelEvents;
setCurrentLevelEvents([]); // Réinitialiser pour le prochain niveau;

    // 11.A.b. Attribution récompense
    const reward = {
      type: RewardType.POINTS,
      amount: config.pointsReward || 500 
    };
    applyReward(reward);

    saveProgress();
  }, [user.level]);

 // 12. Sauvegarde et fin de partie
  // ============================
  // 12.A. Sauvegarde progression
  // -------------------------
  const saveProgress = async () => {
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) return;

      // 12.A.a. Données à sauvegarder
      const saveData = {
        high_score: Math.max(user.points, highScore),
        current_level: user.level,
        total_events_completed: user.totalEventsCompleted,
        last_played: new Date().toISOString()
      };

      // 12.A.b. Mise à jour profil
      await supabase
        .from('profiles')
        .update(saveData)
        .eq('id', authUser.id);

    } catch (error) {
      console.error('Error saving progress:', error);
    }
  };

  // 12.B. Gestion des scores et classements
  // ------------------------------------
  const setScoresAndShow = (dailyScores, monthlyScores, allTimeScores) => {
    // 12.B.a. Traitement des classements
    console.log('Processing leaderboards');
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

    // 12.B.b. Mise à jour interface
    setLeaderboards(formatted);
    setLeaderboardsReady(true);
  };

  // 12.C. Fin de partie
// ----------------
const endGame = async () => {
  // 12.C.a. Initialisation fin de partie
  setIsGameOver(true);
  playGameOverSound();
  setLeaderboardsReady(false);

  console.log('[endGame] Game over triggered');

  try {
    // 12.C.b. Vérification utilisateur
    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (!authUser?.id) {
      console.error('[endGame] No authenticated user found.');
      return;
    }

    console.log('[endGame] User state before processing:', user);

    // Définition des dates pour les requêtes
    const today = new Date().toISOString().split('T')[0];
    const firstDayOfMonth = `${today.substring(0, 7)}-01`;

    // 12.C.c. Enregistrement score final
    await supabase.from('game_scores').insert({
      user_id: authUser.id,
      display_name: user.name,
      score: user.points,
      created_at: new Date().toISOString()
    });

    // 12.C.d. Récupération scores journaliers
    const { data: dailyScores } = await supabase
      .from('game_scores')
      .select('display_name, score')
      .gte('created_at', today)
      .order('score', { ascending: false })
      .limit(5);

    // 12.C.e. Récupération scores mensuels
    const { data: monthlyScores } = await supabase
      .from('game_scores')
      .select('display_name, score')
      .gte('created_at', firstDayOfMonth)
      .order('score', { ascending: false })
      .limit(5);

    // 12.C.f. Récupération meilleurs scores
    const { data: allTimeScores } = await supabase
      .from('profiles')
      .select('display_name, high_score')
      .order('high_score', { ascending: false })
      .limit(5);

      console.log('[endGame] All time scores fetched:', allTimeScores);

      // 12.C.g. Mise à jour high score
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

      // 12.C.h. Mise à jour classements
      if (dailyScores && monthlyScores && allTimeScores) {
        setScoresAndShow(dailyScores, monthlyScores, allTimeScores);
      } else {
        console.error('[endGame] Missing scores data:', {
          daily: !!dailyScores,
          monthly: !!monthlyScores,
          allTime: !!allTimeScores
        });
      }

      await saveProgress();

    } catch (error) {
      console.error('[endGame] Error:', error);
    }
  };

  // 13. Redémarrage et gestion des ressources
  // ======================================
  // 13.A. Redémarrage de partie
  // -------------------------
  const restartGame = () => {
    // 13.A.a. Réinitialisation états utilisateur
    setUser({
      ...user,
      points: 0,
      lives: 3,
      level: 1,
      currentStreak: 0,
      eventsCompletedInLevel: 0,
      totalEventsCompleted: 0,
      consecutiveCorrectAnswers: 0
    });
    
    // 13.A.b. Réinitialisation états jeu
    setStreak(0);
    setUsedEvents(new Set());
    setIsGameOver(false);
    setError(null);
    setShowLevelModal(true);
    setIsLevelPaused(true);
    setIsCountdownActive(false);
    setCurrentLevelConfig(LEVEL_CONFIGS[1]);
    setCurrentLevelEvents([]);
    
    // 13.A.c. Configuration événement initial
    if (allEvents.length > 0) {
      // Filtrer pour obtenir les événements faciles
      const easyEvents = allEvents.filter(event => 
        event.niveau_difficulte <= 2 && 
        event.universel
      );

      if (easyEvents.length >= 2) {
        // Trier tous les événements faciles par date
        const sortedEvents = [...easyEvents].sort(
          (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
        );

        // Choisir un index aléatoire pour le premier événement
        const randomIndex = Math.floor(Math.random() * (sortedEvents.length - 1));
        
        // Définir le premier événement (plus ancien) et le second (plus récent)
        setPreviousEvent(sortedEvents[randomIndex]);
        setNewEvent(sortedEvents[randomIndex + 1]);

        // Mettre à jour les événements utilisés
        setUsedEvents(new Set([
          sortedEvents[randomIndex].id,
          sortedEvents[randomIndex + 1].id
        ]));

        // Réinitialiser les états visuels
        setShowDates(false);
        setIsImageLoaded(false);
        setIsCorrect(undefined);
      } else {
        // Fallback si pas assez d'événements faciles
        console.warn('Not enough easy events available for restart');
        const startEvent = easyEvents[0] || allEvents[0];
        setPreviousEvent(startEvent);
        setUsedEvents(new Set([startEvent.id]));
        selectNewEvent(allEvents, startEvent);
      }
    }
  };

  // 13.B. Gestion des ressources
  // --------------------------
  // 13.B.a. Chargement des images
  const handleImageLoad = () => {
    setIsImageLoaded(true);
    if (!isLevelPaused) {
      setIsCountdownActive(true);
    }
  };

  // 13.B.b. Démarrage de niveau
  const startLevel = useCallback(() => {
    console.log('Starting level', { 
      level: user.level,
      config: currentLevelConfig
    });

    setShowLevelModal(false);
    setIsLevelPaused(false);
    setIsCountdownActive(true);
    setTimeLeft(20);
  }, [user.level, currentLevelConfig]);

  // 14. Interface externe
  // ==================
  // 14.A. États exposés
  // -----------------
  return {
    // 14.A.a. États du jeu
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
    
    // 14.A.b. États des performances
    performanceStats,
    categoryMastery,
    periodStats,
    
    // 14.A.c. États des bonus
    activeBonus,
    bonusStack,
    
    // 14.A.d. États des récompenses
    currentReward,
    completeRewardAnimation,
    updateRewardPosition,
    
    // 14.A.e. Actions exposées
    handleChoice,
    handleImageLoad,
    startLevel,
    restartGame,
    
    // 14.A.f. Statistiques
    remainingEvents: allEvents.length - usedEvents.size
  };
}

export default useGameLogicA;