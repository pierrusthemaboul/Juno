// 1. Introduction
// ==============
// Ce hook gère les récompenses du jeu, leurs animations et leur file d'attente

// 1.A. Architecture générale
// ------------------------
// Le système de récompenses s'organise autour de plusieurs composants clés

// 1.A.a. Points d'attention
// Structure optimisée pour la maintenabilité et la lisibilité

import { useState, useCallback } from 'react';
import { 
  RewardType, 
  User, 
  STREAK_BONUS_BASE, 
  MAX_LIVES,
  LEVEL_CONFIGS 
} from '../hooks/types';
import { gameLogger } from '../utils/gameLogger';

// 2. Types et Interfaces
// =====================
// 2.A. Structures de données
// ------------------------

// 2.A.a. Gestion des positions
interface Position {
  x: number;
  y: number;
}
// Fin de la section 2.A.a Gestion des positions

// 2.A.b. Gestion des récompenses
interface Reward {
  type: RewardType;
  amount: number;
  reason: string;
  sourcePosition?: Position;
  targetPosition?: Position;
}
// Fin de la section 2.A.b Gestion des récompenses

// 2.A.c. Déclencheurs de récompenses
interface RewardTrigger {
  type: 'streak' | 'level' | 'precision';
  value: number;
}
// Fin de la section 2.A.c Déclencheurs de récompenses

// 2.A.d. Props du hook
interface UseRewardsProps {
  onRewardEarned?: (reward: Reward) => void;
  onRewardAnimationComplete?: () => void;
}
// Fin de la section 2.A.d Props du hook
// Fin de la section 2.A Structures de données

// 3. Système de Logs
// =================
// 3.A. Configuration des logs debug
// ------------------------------
const debugLogs = {
  // 3.A.a. Logs de calcul
  calculateStreak: (streak: number, user: User) => {
    console.log('[useRewards] Calcul récompense streak:', { streak, userLives: user.lives });
  },
  streakReward: (streak: number, reward: Reward) => {
    console.log('[useRewards] Récompense streak calculée:', { streak, reward });
  },
  calculateLevel: (newLevel: number, user: User) => {
    console.log('[useRewards] Calcul récompense niveau:', { newLevel, userLives: user.lives });
  },
  // Fin de la section 3.A.a Logs de calcul

  // 3.A.b. Logs de traitement
  levelReward: (newLevel: number, reward: Reward) => {
    console.log('[useRewards] Récompense niveau calculée:', { newLevel, reward });
  },
  processingReward: (reward: Reward) => {
    console.log('[useRewards] Traitement récompense:', reward);
  },
  addingReward: (reward: Reward) => {
    console.log('[useRewards] Ajout récompense à la file:', reward);
  },
  // Fin de la section 3.A.b Logs de traitement

  // 3.A.c. Logs d'état
  noRewardToProcess: () => {
    console.log('[useRewards] Aucune récompense à traiter');
  },
  completingAnimation: () => {
    console.log('[useRewards] Fin animation récompense');
  },
  updatingPosition: (position: Position) => {
    console.log('[useRewards] Mise à jour position:', position);
  },
  // Fin de la section 3.A.c Logs d'état

  // 3.A.d. Logs d'erreur et vérification
  error: (context: string, error: any) => {
    console.error(`[useRewards] Erreur dans ${context}:`, error);
  },
  checkingRewards: (trigger: RewardTrigger, user: User) => {
    console.log('[useRewards] Vérification des récompenses:', { trigger, userState: user });
  }
  // Fin de la section 3.A.d Logs d'erreur et vérification
};
// Fin de la section 3.A Configuration des logs debug

// 4. Hook Principal useRewards
// ==========================
// 4.A. Définition du hook
// ---------------------
export const useRewards = ({
  onRewardEarned,
  onRewardAnimationComplete
}: UseRewardsProps = {}) => {
  // 4.B. États internes
  // -----------------
  // 4.B.a. Gestion des récompenses
  const [currentReward, setCurrentReward] = useState<Reward | null>(null);
  const [pendingRewards, setPendingRewards] = useState<Reward[]>([]);
  const [isAnimating, setIsAnimating] = useState(false);
  // Fin de la section 4.B.a Gestion des récompenses

  // 4.C. Logique de calcul
  // --------------------
  // 4.C.a. Calcul des séries
  const calculateStreakReward = useCallback((streak: number, user: User): Reward | null => {
    debugLogs.calculateStreak(streak, user);

    if (streak % 10 !== 0) return null;
    
    const reward: Reward = {
      type: user.lives < MAX_LIVES ? RewardType.EXTRA_LIFE : RewardType.POINTS,
      amount: user.lives < MAX_LIVES ? 1 : STREAK_BONUS_BASE * Math.floor(streak / 10),
      reason: `Série de ${streak} bonnes réponses !`
    };
    
    debugLogs.streakReward(streak, reward);
    return reward;
  }, []);
  // Fin de la section 4.C.a Calcul des séries

  // 4.C.b. Calcul des niveaux
  const calculateLevelReward = useCallback((newLevel: number, user: User): Reward | null => {
    debugLogs.calculateLevel(newLevel, user);

    const levelConfig = LEVEL_CONFIGS[newLevel];
    if (!levelConfig) return null;

    const reward: Reward = {
      type: user.lives < MAX_LIVES ? RewardType.EXTRA_LIFE : RewardType.POINTS,
      amount: user.lives < MAX_LIVES ? 1 : levelConfig.pointsReward || 1000,
      reason: `Niveau ${newLevel} atteint !`
    };

    debugLogs.levelReward(newLevel, reward);
    return reward;
  }, []);
  // Fin de la section 4.C.b Calcul des niveaux

  // 4.D. Gestion de la file d'attente
  // -------------------------------
  // 4.D.a. Traitement des récompenses
  const processNextReward = useCallback(() => {
    if (pendingRewards.length === 0 || isAnimating) {
      debugLogs.noRewardToProcess();
      return;
    }
  
    const nextReward = pendingRewards[0];
    debugLogs.processingReward(nextReward);
  
    onRewardEarned?.(nextReward);
    
    setCurrentReward(nextReward);
    setIsAnimating(true);
    setPendingRewards(prev => prev.slice(1));
  }, [pendingRewards, isAnimating, onRewardEarned]);
  // Fin de la section 4.D.a Traitement des récompenses

  // 4.D.b. Vérification des récompenses
  const checkRewards = useCallback((trigger: RewardTrigger, user: User) => {
    debugLogs.checkingRewards(trigger, user);

    let reward: Reward | null = null;

    switch (trigger.type) {
      case 'streak':
        reward = calculateStreakReward(trigger.value, user);
        break;
      case 'level':
        reward = calculateLevelReward(trigger.value, user);
        break;
    }

    if (reward) {
      debugLogs.addingReward(reward);
      setPendingRewards(prev => [...prev, reward!]);
      if (!isAnimating) {
        processNextReward();
      }
    }
  }, [isAnimating, calculateStreakReward, calculateLevelReward, processNextReward]);
  // Fin de la section 4.D.b Vérification des récompenses

  // 4.E. Gestion des animations
  // ------------------------
  // 4.E.a. Complétion des animations
  const completeRewardAnimation = useCallback(() => {
    debugLogs.completingAnimation();
    setCurrentReward(null);
    setIsAnimating(false);
    onRewardAnimationComplete?.();

    // Délai pour la prochaine animation
    if (pendingRewards.length > 0) {
      setTimeout(processNextReward, 500);
    }
  }, [pendingRewards, processNextReward, onRewardAnimationComplete]);
  // Fin de la section 4.E.a Complétion des animations

  // 4.E.b. Mise à jour des positions
  const updateRewardPosition = useCallback((position: Position) => {
    debugLogs.updatingPosition(position);
    if (currentReward) {
      setCurrentReward(prev => prev ? {
        ...prev,
        targetPosition: position
      } : null);
    }
  }, [currentReward]);
  // Fin de la section 4.E.b Mise à jour des positions

  // 4.F. Interface du hook
  // -------------------
  return {
    currentReward,
    pendingRewards,
    isAnimating,
    checkRewards,
    completeRewardAnimation,
    updateRewardPosition
  };
};

export default useRewards;
// Fin de la section 4.F Interface du hook
// Fin de la section 4 Hook Principal useRewards