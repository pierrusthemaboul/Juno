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
} from './types'; // types est aussi dans le meme dossier

import { LEVEL_CONFIGS } from './levelConfigs'; 

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
   
  },
  streakReward: (streak: number, reward: Reward) => {

  },
  calculateLevel: (newLevel: number, user: User) => {
    
  },
  // Fin de la section 3.A.a Logs de calcul

  // 3.A.b. Logs de traitement
  levelReward: (newLevel: number, reward: Reward) => {
 
  },
  processingReward: (reward: Reward) => {
   
  },
  addingReward: (reward: Reward) => {
   
  },
  // Fin de la section 3.A.b Logs de traitement

  // 3.A.c. Logs d'état
  noRewardToProcess: () => {
   
  },
  completingAnimation: () => {

  },
  updatingPosition: (position: Position) => {
  
  },
  // Fin de la section 3.A.c Logs d'état

  // 3.A.d. Logs d'erreur et vérification
  error: (context: string, error: any) => {
   
  },
  checkingRewards: (trigger: RewardTrigger, user: User) => {
   
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
    // LOG : Début du calcul de la récompense de série
    debugLogs.calculateStreak(streak, user);

    if (streak % 10 !== 0) {
      // LOG : Pas de récompense pour une série qui n'est pas un multiple de 10
    
      return null;
    }

    const reward: Reward = {
      type: user.lives < MAX_LIVES ? RewardType.EXTRA_LIFE : RewardType.POINTS,
      amount: user.lives < MAX_LIVES ? 1 : STREAK_BONUS_BASE * Math.floor(streak / 10),
      reason: `Série de ${streak} bonnes réponses !`
    };

    // LOG : Récompense de série calculée
    debugLogs.streakReward(streak, reward);
    return reward;
  }, []);
  // Fin de la section 4.C.a Calcul des séries

  // 4.C.b. Calcul des niveaux
  const calculateLevelReward = useCallback((newLevel: number, user: User): Reward | null => {
    // LOG : Début du calcul de la récompense de niveau
    debugLogs.calculateLevel(newLevel, user);
    // LOG: Affiche l'ensemble des levels configurés


    const levelConfig = LEVEL_CONFIGS[newLevel];
    // LOG : Vérification si le niveau actuel a une configuration


    if (!levelConfig) {
      // LOG : Pas de configuration trouvée pour ce niveau

      return null;
    }

    const reward: Reward = {
      type: user.lives < MAX_LIVES ? RewardType.EXTRA_LIFE : RewardType.POINTS,
      amount: user.lives < MAX_LIVES ? 1 : levelConfig.pointsReward || 1000,
      reason: `Niveau ${newLevel} atteint !`
    };

    // LOG : Récompense de niveau calculée
    debugLogs.levelReward(newLevel, reward);
    return reward;
  }, []);
  // Fin de la section 4.C.b Calcul des niveaux

  // 4.D. Gestion de la file d'attente
  // -------------------------------
  // 4.D.a. Traitement des récompenses
  const processNextReward = useCallback(() => {
    // LOG : Vérification s'il y a des récompenses en attente et si une animation n'est pas en cours
    
    if (pendingRewards.length === 0 || isAnimating) {
      // LOG : Aucune récompense à traiter ou une animation est en cours
      debugLogs.noRewardToProcess();

    }

    const nextReward = pendingRewards[0];
    // LOG : Traitement de la prochaine récompense
    debugLogs.processingReward(nextReward);

    onRewardEarned?.(nextReward);

    setCurrentReward(nextReward);
    setIsAnimating(true);
    setPendingRewards(prev => prev.slice(1));
    // LOG : Mise à jour de l'état des récompenses après traitement

  }, [pendingRewards, isAnimating, onRewardEarned]);
  // Fin de la section 4.D.a Traitement des récompenses

  // 4.D.b. Vérification des récompenses
  const checkRewards = useCallback((trigger: RewardTrigger, user: User) => {
    // LOG : Début de la vérification des récompenses pour un déclencheur
    debugLogs.checkingRewards(trigger, user);

    let reward: Reward | null = null;

    switch (trigger.type) {
      case 'streak':
        // LOG : Calcul de la récompense pour une série
       
        reward = calculateStreakReward(trigger.value, user);
        break;
      case 'level':
        // LOG : Calcul de la récompense pour un niveau

        reward = calculateLevelReward(trigger.value, user);
        break;
    }

    if (reward) {
      // LOG : Ajout de la récompense à la file d'attente
      debugLogs.addingReward(reward);
      setPendingRewards(prev => [...prev, reward!]);
   
      if (!isAnimating) {
        // LOG : Traitement immédiat de la récompense si aucune animation n'est en cours
   
        processNextReward();
      }
    } else {
      // LOG : Aucune récompense calculée pour ce déclencheur
  
    }
  }, [isAnimating, calculateStreakReward, calculateLevelReward, processNextReward]);
  // Fin de la section 4.D.b Vérification des récompenses

  // 4.E. Gestion des animations
  // ------------------------
  // 4.E.a. Complétion des animations
  const completeRewardAnimation = useCallback(() => {
    // LOG : Fin de l'animation de récompense
    debugLogs.completingAnimation();
    setCurrentReward(null);
    setIsAnimating(false);
    onRewardAnimationComplete?.();

    // LOG : Vérification s'il y a d'autres récompenses à traiter après la fin de l'animation
   
    if (pendingRewards.length > 0) {
      // LOG : Planification du traitement de la prochaine récompense après un délai
    
      setTimeout(processNextReward, 500);
    }
  }, [pendingRewards, processNextReward, onRewardAnimationComplete]);
  // Fin de la section 4.E.a Complétion des animations

  // 4.E.b. Mise à jour des positions
  const updateRewardPosition = useCallback((position: Position) => {
    // LOG : Mise à jour de la position de la récompense
    debugLogs.updatingPosition(position);
    if (currentReward) {
      setCurrentReward(prev => prev ? {
        ...prev,
        targetPosition: position
      } : null);
      // LOG : Position de la récompense mise à jour
     
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