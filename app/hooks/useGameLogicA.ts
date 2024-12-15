/**
 * @fileoverview Logique principale du jeu de chronologie historique
 * 
 * --- Note pour les interactions avec Claude AI ---
 * FORMAT_COMMENT: Les commentaires commençant par "AI:" sont des points d'attention 
 * spécifiques pour les futures modifications avec Claude AI
 * 
 * AI: Points clés pour la maintenance:
 * 1. La sélection des événements est critique et utilise des fallbacks progressifs
 * 2. Les niveaux sont basés sur les écarts temporels et la difficulté
 * 3. Le système de points et de récompenses est modulaire
 * 4. Les logs détaillés aident au debugging
 * 
 * AI: Sections principales:
 * - États (États et hooks du jeu)
 * - Initialisation (Chargement initial et configuration)
 * - Événements (Sélection et gestion des événements)
 * - Points et Récompenses (Calculs et attributions)
 * - Interface utilisateur (Gestion des interactions)
 */

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../supabaseClients';
import { useRewards } from './useRewards';
import { useAudio } from './useAudio';
import { 
  Event, 
  User, 
  LEVEL_CONFIGS, 
  LevelConfig, 
  RewardType,
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
  PerformanceStats
} from '../hooks/types';
import { gameLogger } from '../utils/gameLogger';

/**
 * Hook principal de la logique du jeu
 * AI: Point d'entrée unique pour la logique, tous les états sont gérés ici
 */
export function useGameLogicA(initialEvent: string) {
  const { 
    currentReward, 
    checkRewards, 
    completeRewardAnimation, 
    updateRewardPosition 
  } = useRewards({
    onRewardEarned: (reward) => {
      gameLogger.info('Reward earned:', reward);
      applyReward(reward);
    }
  });

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
  
  /**
   * AI: États principaux du jeu
   * Toute nouvelle fonctionnalité nécessitant un état doit être ajoutée ici
   */
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

// États du système de bonus
const [activeBonus, setActiveBonus] = useState<ActiveBonus[]>([]);
const [bonusStack, setBonusStack] = useState<BonusStack>({
    currentMultiplier: 1,
    activeStacks: [],
    maxStacks: MAX_BONUS_STACKS
});

// États pour le système de bonus thématique
const [previousEventTypes, setPreviousEventTypes] = useState<string[]>([]);

// États des performances par période
const [periodStats, setPeriodStats] = useState<Record<HistoricalPeriod, HistoricalPeriodStats>>({});
const [categoryMastery, setCategoryMastery] = useState<Record<string, CategoryMastery>>({});

// États pour la sélection dynamique d'événements
const [eventHistory, setEventHistory] = useState<{
    type: string;
    period: string;
    success: boolean;
}[]>([]);

const [performanceStats, setPerformanceStats] = useState<{
    typeSuccess: Record<string, number>;
    periodSuccess: Record<string, number>;
    overallAccuracy: number;
}>({
    typeSuccess: {},
    periodSuccess: {},
    overallAccuracy: 0
});

// États des événements
const [allEvents, setAllEvents] = useState<Event[]>([]);
const [previousEvent, setPreviousEvent] = useState<Event | null>(null);
const [newEvent, setNewEvent] = useState<Event | null>(null);
const [usedEvents, setUsedEvents] = useState<Set<string>>(new Set());

// États du gameplay
const [timeLeft, setTimeLeft] = useState(20);
const [loading, setLoading] = useState(true);
const [error, setError] = useState<string | null>(null);
const [isGameOver, setIsGameOver] = useState(false);
const [isImageLoaded, setIsImageLoaded] = useState(false);
const [showDates, setShowDates] = useState(false);
const [isCorrect, setIsCorrect] = useState<boolean | undefined>(undefined);
const [streak, setStreak] = useState(0);
const [highScore, setHighScore] = useState(0);

// États de contrôle
const [isCountdownActive, setIsCountdownActive] = useState(false);
const [showLevelModal, setShowLevelModal] = useState(true);
const [isLevelPaused, setIsLevelPaused] = useState(true);
const [currentLevelConfig, setCurrentLevelConfig] = useState<LevelConfig>(LEVEL_CONFIGS[1]);
const [leaderboardsReady, setLeaderboardsReady] = useState(false);

// États de leaderboard
const [leaderboards, setLeaderboards] = useState({
    daily: [],
    monthly: [],
    allTime: []
});

  // ------------------------
  // Effets et Initialisation
  // ------------------------

  /**
   * AI: Effet d'initialisation
   * Déclenché une seule fois au montage du composant
   */
  useEffect(() => {
    initGame();
    // On désactive temporairement la musique de fond
    // toggleBackgroundMusic(true);
    return () => {
      gameLogger.info('Cleaning up game...');
      // toggleBackgroundMusic(false);
    };
  }, []);
  /**
   * AI: Gestion du compte à rebours
   * Intervalle nettoyé automatiquement
   */
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

  // ------------------------
  // Fonctions d'initialisation
  // ------------------------

  /**
   * Récupère les données utilisateur depuis Supabase
   * AI: Initialisation du profil utilisateur 
   */
  const fetchUserData = async () => {
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser();
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
        }
        gameLogger.info('User data fetched successfully');
      }
    } catch (error) {
      gameLogger.error('Error fetching user data:', error);
    }
  };

  /**
   * Initialise le jeu
   * AI: Point critique pour le chargement des données
   */
  const initGame = async () => {
    try {
      setLoading(true);
      gameLogger.info('Starting game initialization');

      // Chargement des événements
      const { data: events, error: eventsError } = await supabase
        .from('evenements')
        .select('*')
        .order('date', { ascending: true });

      if (eventsError) throw eventsError;

      if (!events?.length) {
        throw new Error('Aucun événement disponible');
      }

      // Filtrage des événements valides
      const validEvents = events.filter(event => 
        event.date && 
        event.titre && 
        event.illustration_url &&
        event.niveau_difficulte && 
        event.types_evenement
      );

      if (validEvents.length < 2) {
        throw new Error('Pas assez d\'événements disponibles');
      }

      setAllEvents(validEvents);
      await fetchUserData();

      // Sélection événements niveau 1
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

      // Configuration initiale
      setCurrentLevelConfig(LEVEL_CONFIGS[1]);
      setShowLevelModal(true);
      setIsLevelPaused(true);
      setIsCountdownActive(false);

    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Erreur d\'initialisation';
      gameLogger.error('Init game error:', errorMsg);
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // ------------------------
  // Gestion des événements
  // ------------------------

  /**
   * Sélectionne un nouvel événement avec système de fallback
   * AI: Fonction critique pour la difficulté du jeu
   */
  const selectNewEvent = useCallback(async (events: Event[], referenceEvent: Event) => {
    const config = LEVEL_CONFIGS[user.level];
    let selectedEvent: Event | null = null;
    
    // Définition des écarts temporels
    let currentGap = {
      min: config.timeGap.min,
      max: config.timeGap.max
    };

    // Calcul des probabilités basées sur les performances
    const calculateEventScore = (event: Event, referenceEvent: Event) => {
      const yearDiff = Math.abs(
        new Date(event.date).getFullYear() - 
        new Date(referenceEvent.date).getFullYear()
      );

      // Score de base basé sur la difficulté configurée
      let score = 1;

      // Ajustement selon les performances du joueur
      const eventType = event.types_evenement[0];
      const typeSuccess = performanceStats.typeSuccess[eventType] || 0.5;
      const periodSuccess = performanceStats.periodSuccess[getPeriod(event.date)] || 0.5;

      // Bonus/Malus selon les performances
      if (typeSuccess < 0.4) score *= 1.5; // Favoriser les types difficiles
      if (typeSuccess > 0.8) score *= 0.7; // Réduire les types trop faciles
      if (periodSuccess < 0.4) score *= 1.3; // Favoriser les périodes difficiles
      if (yearDiff < currentGap.max && yearDiff > currentGap.min) score *= 1.2;

      return score;
    };

    // Sélection avec système de score
    const eligibleEvents = events.filter(event => {
      if (usedEvents.has(event.id)) return false;
      if (config.universalOnly && !event.universel) return false;
      return event.niveau_difficulte >= config.difficulty.min && 
             event.niveau_difficulte <= config.difficulty.max;
    });

    if (eligibleEvents.length > 0) {
      // Trier par score et sélectionner aléatoirement parmi les meilleurs
      const scoredEvents = eligibleEvents
        .map(event => ({
          event,
          score: calculateEventScore(event, referenceEvent)
        }))
        .sort((a, b) => b.score - a.score);

      // Sélectionner parmi les 30% meilleurs scores
      const topEvents = scoredEvents.slice(0, Math.max(3, Math.floor(scoredEvents.length * 0.3)));
      selectedEvent = topEvents[Math.floor(Math.random() * topEvents.length)].event;
    }

    // Mise à jour des états si un événement est sélectionné
    if (selectedEvent) {
      setUsedEvents(prev => new Set([...prev, selectedEvent!.id]));
      setNewEvent(selectedEvent);
      setIsImageLoaded(false);
      setShowDates(false);
      setIsCorrect(undefined);
      setIsCountdownActive(false);
      setTimeLeft(20);

      // Mise à jour de l'historique
      const period = getPeriod(selectedEvent.date);
      setEventHistory(prev => [...prev, {
        type: selectedEvent!.types_evenement[0],
        period,
        success: false // Sera mis à jour lors de la réponse
      }]);
    }

    return selectedEvent;
  }, [user.level, usedEvents, performanceStats]);

  // Fonction auxiliaire pour déterminer la période d'un événement
const getPeriod = (date: string): string => {
  const year = new Date(date).getFullYear();
  if (year < 500) return "Antiquité";
  if (year < 1500) return "Moyen Âge";
  if (year < 1800) return "Renaissance";
  if (year < 1900) return "XIX";
  if (year < 2000) return "XX";
  return "XXI";
};

// Mise à jour des statistiques de performance
const updatePerformanceStats = useCallback((type: string, period: string, success: boolean) => {
  setPerformanceStats(prev => {
    const typeSuccesses = prev.typeSuccess[type] || 0;
    const typeAttempts = prev.typeSuccess[type] || 0;
    const periodSuccesses = prev.periodSuccess[period] || 0;
    const periodAttempts = prev.periodSuccess[period] || 0;

    return {
      typeSuccess: {
        ...prev.typeSuccess,
        [type]: (typeSuccesses + (success ? 1 : 0)) / (typeAttempts + 1)
      },
      periodSuccess: {
        ...prev.periodSuccess,
        [period]: (periodSuccesses + (success ? 1 : 0)) / (periodAttempts + 1)
      },
      overallAccuracy: (prev.overallAccuracy * eventHistory.length + (success ? 1 : 0)) / (eventHistory.length + 1)
    };
  });
}, [eventHistory.length]);

// ------------------------
// Gestion des points et récompenses
// ------------------------
// ------------------------
// Gestion des points et récompenses
// ------------------------
const calculatePoints = useCallback((timeLeft: number, difficulty: number, streak: number, eventType: string): number => {
  const basePoints = BASE_POINTS * difficulty;
  
  const timeMultiplier = Math.min(
    timeLeft >= 15 ? 1.5 : 
    timeLeft >= 10 ? 1.3 :
    timeLeft >= 5 ? 1.2 : 1.1,
    MAX_TIME_MULTIPLIER
  );
  
  const streakMultiplier = Math.min(1 + (Math.floor(streak / 2) * 0.1), MAX_STREAK_MULTIPLIER);
  
  const categoryMasteryBonus = categoryMastery[eventType]?.masteryLevel || 1;
  const masteryMultiplier = Math.min(categoryMasteryBonus * 0.2 + 1, MAX_MASTERY_MULTIPLIER);
  
  const period = getPeriod(newEvent?.date || '') as HistoricalPeriod;
  const periodMasteryBonus = periodStats[period]?.masteryLevel || 1;
  const periodMultiplier = Math.min(periodMasteryBonus * 0.15 + 1, MAX_PERIOD_MULTIPLIER);
  
  const activeMultiplier = activeBonus.reduce((acc, bonus) => {
    if (Date.now() < bonus.expiresAt) {
      return acc * bonus.multiplier;
    }
    return acc;
  }, 1);

  let thematicBonus = 0;
  if (previousEventTypes.length > 0) {
    const currentType = newEvent?.types_evenement?.[0];
    if (currentType && previousEventTypes[previousEventTypes.length - 1] === currentType) {
      const seriesLength = previousEventTypes.length + 1;
      thematicBonus = seriesLength === 2 ? 100 :
                      seriesLength === 3 ? 200 :
                      seriesLength === 4 ? 400 :
                      seriesLength >= 5 ? 800 : 0;
    }
  }
  
  const finalMultiplier = Math.min(
    timeMultiplier * streakMultiplier * masteryMultiplier * periodMultiplier * activeMultiplier,
    MAX_COMBO_MULTIPLIER
  );
  
  const points = Math.floor(basePoints * finalMultiplier) + thematicBonus;
  
  gameLogger.info('Points calculation:', {
    basePoints,
    timeMultiplier,
    streakMultiplier,
    masteryMultiplier,
    periodMultiplier,
    activeMultiplier,
    thematicBonus,
    finalPoints: points
  });
  
  return points;
}, [categoryMastery, periodStats, activeBonus, previousEventTypes, newEvent]);

const applyReward = useCallback((reward: { type: RewardType; amount: number }) => {
  gameLogger.info('Applying reward:', reward);
  setUser(prev => {
    const updatedUser = {
      ...prev,
      lives: reward.type === RewardType.EXTRA_LIFE 
        ? Math.min(prev.lives + reward.amount, MAX_LIVES)
        : prev.lives,
      points: reward.type === RewardType.POINTS 
        ? prev.points + reward.amount
        : prev.points
    };
    gameLogger.info('Updated user state:', updatedUser);
    return updatedUser;
  });
}, []);

const addBonus = useCallback((
  type: BonusType,
  multiplier: number,
  duration: number
) => {
  const bonus: ActiveBonus = {
    type,
    multiplier,
    duration,
    expiresAt: Date.now() + duration,
    stackable: type === BonusType.STREAK
  };

  setActiveBonus(prev => {
    const newBonuses = prev.filter(b => Date.now() < b.expiresAt);
    if (!bonus.stackable) {
      return [...newBonuses.filter(b => b.type !== type), bonus];
    }
    if (newBonuses.length >= MAX_BONUS_STACKS) {
      return [...newBonuses.slice(1), bonus];
    }
    return [...newBonuses, bonus];
  });
}, []);
// ------------------------
// Gestion du gameplay
// ------------------------
  /**
   * Gère le timeout d'une question
   * AI: Logique de pénalité pour timeout
   */
  const handleTimeout = useCallback(() => {
    if (isLevelPaused) return;
    
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

    setPreviousEventTypes([]); // Réinitialisation de la série thématique

    if (newEvent) {
        setPreviousEvent(newEvent);
        selectNewEvent(allEvents, newEvent);
    }
}, [newEvent, allEvents, isLevelPaused]);

  /**
   * Gère la réponse du joueur
   * AI: Logique centrale du gameplay
   */
  const handleChoice = useCallback((choice: 'avant' | 'après') => {
    if (!previousEvent || !newEvent || isLevelPaused) return;
  
    setIsCountdownActive(false);
    const previousDate = new Date(previousEvent.date);
    const newDate = new Date(newEvent.date);
    
    const isCorrect = (choice === 'avant' && newDate < previousDate) || 
                     (choice === 'après' && newDate > previousDate);
  
    setIsCorrect(isCorrect);
    setShowDates(true);
    
    if (isCorrect) {
      playCorrectSound();
      const newStreak = streak + 1;
      setStreak(newStreak);
      
      // Mise à jour des types d'événements pour le bonus thématique
      const currentType = newEvent.types_evenement[0];
      setPreviousEventTypes(prev => [...prev, currentType]);
      
      const points = calculatePoints(
          timeLeft, 
          newEvent.niveau_difficulte, 
          newStreak,
          currentType
      );
      
      checkRewards({ type: 'streak', value: newStreak }, user);
      
      setUser(prev => {
        const updatedUser = {
          ...prev,
          points: prev.points + points,
          streak: newStreak,
          maxStreak: Math.max(prev.maxStreak || 0, newStreak),
          eventsCompletedInLevel: prev.eventsCompletedInLevel + 1
        };
  
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
    } else {
      playIncorrectSound();
      setStreak(0);
      setPreviousEventTypes([]); // Réinitialise la série thématique en cas d'erreur
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
  
    setTimeout(() => {
      if (!isGameOver) {
        setPreviousEvent(newEvent);
        selectNewEvent(allEvents, newEvent);
      }
    }, 2000);
}, [previousEvent, newEvent, timeLeft, user.level, streak, isLevelPaused, allEvents, checkRewards]);

  /**
   * Gère le passage au niveau suivant
   * AI: Logique de progression
   */
  const handleLevelUp = useCallback(() => {
    const nextLevel = user.level + 1;
    const config = LEVEL_CONFIGS[nextLevel];

    if (!config) {
        gameLogger.warn('No config found for next level', { nextLevel });
        return;
    }

    setCurrentLevelConfig(config);
    setShowLevelModal(true);
    setIsLevelPaused(true);
    setIsCountdownActive(false);

    // Récompense de base pour le passage de niveau
    const reward = {
        type: RewardType.POINTS,
        amount: config.pointsReward || 500 
    };
    applyReward(reward);

    saveProgress();
}, [user.level]);
   
  /**
   * Sauvegarde la progression du joueur
   * AI: Points de sauvegarde et persistance
   */
  const saveProgress = async () => {
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) return;

      const saveData = {
        high_score: Math.max(user.points, highScore),
        current_level: user.level,
        total_events_completed: user.totalEventsCompleted,
        last_played: new Date().toISOString()
      };

      await supabase
        .from('profiles')
        .update(saveData)
        .eq('id', authUser.id);

    } catch (error) {
      gameLogger.error('Error saving progress:', error);
    }
  };

/**
 * Termine la partie
 * AI: Gestion de fin de partie
 */
/**
 * Termine la partie avec gestion des scores, mise à jour des leaderboards et logs détaillés
 */
/**
 * Termine la partie et met à jour les tableaux des scores
 */
const setScoresAndShow = (dailyScores, monthlyScores, allTimeScores) => {
  gameLogger.info('Processing leaderboards');
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

const endGame = async () => {
  setIsGameOver(true);
  playGameOverSound();
  setLeaderboardsReady(false);

  console.log('[endGame] Game over triggered');

  try {
    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (!authUser?.id) {
      console.error('[endGame] No authenticated user found.');
      return;
    }

    console.log('[endGame] User state before processing:', user);

    // Insertion du score actuel
    await supabase.from('game_scores').insert({
      user_id: authUser.id,
      display_name: user.name,
      score: user.points,
      created_at: new Date().toISOString()
    });

    // Récupération des scores journaliers
    const today = new Date().toISOString().split('T')[0];
    const { data: dailyScores } = await supabase
      .from('game_scores')
      .select('display_name, score')
      .gte('created_at', today)
      .order('score', { ascending: false })
      .limit(10);

    console.log('[endGame] Daily scores fetched:', dailyScores);

    // Récupération des scores mensuels
    const firstDayOfMonth = `${today.substring(0, 7)}-01T00:00:00.000Z`;
    const { data: monthlyScores } = await supabase
      .from('game_scores')
      .select('display_name, score')
      .gte('created_at', firstDayOfMonth)
      .order('score', { ascending: false })
      .limit(10);

    console.log('[endGame] Monthly scores fetched:', monthlyScores);

    // Scores de tous les temps
    const { data: allTimeScores } = await supabase
      .from('profiles')
      .select('display_name, high_score')
      .order('high_score', { ascending: false })
      .limit(10);

    console.log('[endGame] All time scores fetched:', allTimeScores);

    // Mise à jour du high score si nécessaire
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

    // Important: on s'assure que les données sont présentes avant de les formater et mettre à jour
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

/**
 * Redémarre la partie
 * AI: Réinitialisation complète du jeu
 */
  const restartGame = () => {
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
    
    setStreak(0);
    setUsedEvents(new Set());
    setIsGameOver(false);
    setError(null);
    setShowLevelModal(true);
    setIsLevelPaused(true);
    setIsCountdownActive(false);
    setCurrentLevelConfig(LEVEL_CONFIGS[1]);
    
    if (allEvents.length > 0) {
      const startEvent = allEvents.find(event => 
        event.niveau_difficulte <= 2 && 
        event.universel
      );

      if (startEvent) {
        setPreviousEvent(startEvent);
        setUsedEvents(new Set([startEvent.id]));
        selectNewEvent(allEvents, startEvent);
      }
    }
  };

  /**
   * Gère le chargement des images
   * AI: État de chargement des ressources
   */
  const handleImageLoad = () => {
    setIsImageLoaded(true);
    if (!isLevelPaused) {
      setIsCountdownActive(true);
    }
};

  /**
   * Démarre un niveau
   * AI: Point d'entrée pour chaque niveau
   */
  const startLevel = useCallback(() => {
    gameLogger.info('Starting level', { 
      level: user.level,
      config: currentLevelConfig
    });

    setShowLevelModal(false);
    setIsLevelPaused(false);
    setIsCountdownActive(true);
    setTimeLeft(20);
  }, [user.level, currentLevelConfig]);

  // ------------------------
  // Interface externe
  // ------------------------
  return {
    // État du jeu
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
    
    // Statistiques de performance
    performanceStats,
    categoryMastery,
    periodStats,
    
    // Système de bonus
    activeBonus,
    bonusStack,
    
    // Récompenses
    currentReward,
    completeRewardAnimation,
    updateRewardPosition,
    
    // Actions 
    handleChoice,
    handleImageLoad,
    startLevel,
    restartGame,
    
    // Stats du jeu
    remainingEvents: allEvents.length - usedEvents.size
};
}

export default useGameLogicA;