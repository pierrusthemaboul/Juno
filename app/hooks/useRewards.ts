/**
 * @fileoverview Hook de gestion des récompenses
 * Gère les récompenses, leurs animations et leur file d'attente
 * 
 * --- Note sur l'architecture ---
 * FORMAT_COMMENT: Les commentaires sont organisés en sections pour une meilleure lisibilité
 * 
 * Points clés :
 * 1. Gestion de la file d'attente des récompenses
 * 2. Calcul des récompenses (streak, niveau)
 * 3. Positionnement des animations
 * 4. Callbacks de completion
 */

import { useState, useCallback } from 'react';
import { 
  RewardType, 
  User, 
  STREAK_BONUS_BASE, 
  MAX_LIVES,
  LEVEL_CONFIGS 
} from '../hooks/types';
import { gameLogger } from '../utils/gameLogger';

// ------------------------
// Types et Interfaces
// ------------------------
interface Position {
  x: number;
  y: number;
}

interface Reward {
  type: RewardType;
  amount: number;
  reason: string;
  sourcePosition?: Position;
  targetPosition?: Position;
}

interface RewardTrigger {
  type: 'streak' | 'level' | 'precision';
  value: number;
}

interface UseRewardsProps {
  onRewardEarned?: (reward: Reward) => void;
  onRewardAnimationComplete?: () => void;
}

// ------------------------
// Système de Logs
// ------------------------
const debugLogs = {
  calculateStreak: (streak: number, user: User) => {
    console.log('[useRewards] Calcul récompense streak:', { streak, userLives: user.lives });
  },
  streakReward: (streak: number, reward: Reward) => {
    console.log('[useRewards] Récompense streak calculée:', { streak, reward });
  },
  calculateLevel: (newLevel: number, user: User) => {
    console.log('[useRewards] Calcul récompense niveau:', { newLevel, userLives: user.lives });
  },
  levelReward: (newLevel: number, reward: Reward) => {
    console.log('[useRewards] Récompense niveau calculée:', { newLevel, reward });
  },
  processingReward: (reward: Reward) => {
    console.log('[useRewards] Traitement récompense:', reward);
  },
  addingReward: (reward: Reward) => {
    console.log('[useRewards] Ajout récompense à la file:', reward);
  },
  noRewardToProcess: () => {
    console.log('[useRewards] Aucune récompense à traiter');
  },
  completingAnimation: () => {
    console.log('[useRewards] Fin animation récompense');
  },
  updatingPosition: (position: Position) => {
    console.log('[useRewards] Mise à jour position:', position);
  },
  error: (context: string, error: any) => {
    console.error(`[useRewards] Erreur dans ${context}:`, error);
  },
  checkingRewards: (trigger: RewardTrigger, user: User) => {
    console.log('[useRewards] Vérification des récompenses:', { trigger, userState: user });
  }
};

/**
 * Hook useRewards
 * Gère la logique des récompenses et leurs animations
 */
export const useRewards = ({
  onRewardEarned,
  onRewardAnimationComplete
}: UseRewardsProps = {}) => {
  // ------------------------
  // États
  // ------------------------
  const [currentReward, setCurrentReward] = useState<Reward | null>(null);
  const [pendingRewards, setPendingRewards] = useState<Reward[]>([]);
  const [isAnimating, setIsAnimating] = useState(false);

  // ------------------------
  // Calcul des récompenses
  // ------------------------
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

  // ------------------------
  // Gestion des récompenses
  // ------------------------
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

  // ------------------------
  // Gestion des animations
  // ------------------------
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

  const updateRewardPosition = useCallback((position: Position) => {
    debugLogs.updatingPosition(position);
    if (currentReward) {
      setCurrentReward(prev => prev ? {
        ...prev,
        targetPosition: position
      } : null);
    }
  }, [currentReward]);

  return {
    currentReward,
    pendingRewards,
    isAnimating,
    checkRewards,
    completeRewardAnimation,
    updateRewardPosition
  };
};