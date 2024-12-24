// 1. Configuration du Composant RewardAnimation
// =====================================
// Composant principal gérant l'animation des récompenses dans l'interface

// 1.A. Imports et Dépendances
// ---------------------------
import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { RewardType } from '../hooks/types';
import { colors } from '../styles/colors';

// 1.B. Interface et Types
// ----------------------
// 1.B.a. Définition des props du composant
interface RewardAnimationProps {
  type: RewardType;
  amount: number;
  targetPosition?: { x: number; y: number };
  onComplete?: () => void;
}

// 2. Implémentation du Composant
// =============================
const RewardAnimation: React.FC<RewardAnimationProps> = ({
  type,
  amount,
  targetPosition = { x: 0, y: 0 },
  onComplete,
}) => {
  // 2.A. Gestion de l'Animation
  // --------------------------
  // 2.A.a. Initialisation des valeurs animées
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(0)).current;

  // 2.A.b. Configuration et exécution de l'animation
  useEffect(() => {
    if (!targetPosition) {
      console.warn('Target position is undefined. Using default position {x: 0, y: 0}.');
    }

    console.log('[RewardAnimation] Starting animation with:', {
      type,
      amount,
      targetPosition,
    });

    // 2.A.c. Séquences d'animation
    const fadeIn = Animated.timing(opacity, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    });

    const moveAndFade = Animated.parallel([
      Animated.timing(translateY, {
        toValue: -50,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]);

    Animated.sequence([fadeIn, moveAndFade]).start(() => {
      console.log('[RewardAnimation] Animation completed');
      if (onComplete) {
        onComplete();
      }
    });
  }, [targetPosition, onComplete, opacity, translateY]);

  // 2.B. Configuration Visuelle
  // -------------------------
  // 2.B.a. Gestion des types de récompenses
  const getConfig = () => {
    switch (type) {
      case RewardType.POINTS:
        return {
          icon: 'star',
          color: colors.warningYellow,
        };
      case RewardType.EXTRA_LIFE:
        return {
          icon: 'heart',
          color: colors.incorrectRed,
        };
      case RewardType.STREAK_BONUS:
        return {
          icon: 'flame',
          color: colors.primary,
        };
      default:
        console.warn('Unknown RewardType. Falling back to default.');
        return {
          icon: 'star',
          color: colors.primary,
        };
    }
  };

  const config = getConfig();

  // 2.C. Rendu du Composant
  // ----------------------
  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ translateY }],
          opacity,
          left: targetPosition?.x - 30,
          top: targetPosition?.y - 30,
        },
      ]}
    >
      <View style={[styles.bubble, { backgroundColor: config.color }]}>
        <Ionicons name={config.icon} size={20} color="white" style={styles.icon} />
        <Text style={styles.amount}>+{amount}</Text>
      </View>
    </Animated.View>
  );
};

// 3. Styles
// ========
const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  bubble: {
    width: '100%',
    height: '100%',
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  icon: {
    marginBottom: 2,
  },
  amount: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
    position: 'absolute',
    bottom: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
});

// 4. Système de Logs
// ================
// 4.A. Configuration des Logs de Récompenses
// ---------------------------------------
const rewardLogs = {
  // 4.A.a. Logs d'Animation
  animation: {
    start: (props: { type: RewardType, amount: number, targetPosition?: Position }) => {
      console.log('[RewardAnimation] Démarrage animation:', {
        type: props.type,
        amount: props.amount,
        targetPosition: props.targetPosition 
      });
    },
    complete: () => {
      console.log('[RewardAnimation] Animation terminée');
    },
    error: (context: string, error: any) => {
      console.error(`[RewardAnimation] Erreur dans ${context}:`, error);
    }
  },
  // 4.A.b. Logs de Séries
  streak: {
    update: (current: number, isIncrease: boolean) => {
      console.log(`[Streak] ${isIncrease ? 'Augmentation' : 'Réinitialisation'} à ${current}`);
    },
    bonus: (value: number) => {
      console.log(`[Streak] Bonus de points: ${value}`); 
    }
  },
  // 4.A.c. Logs de Récompenses
  rewards: {
    points: (amount: number, reason: string) => {
      console.log('[Reward] Points gagnés:', { amount, reason });
    },
    life: (current: number) => {
      console.log('[Reward] Vie bonus, total:', current);
    },
    level: (newLevel: number) => {
      console.log('[Reward] Passage niveau:', newLevel);
    }
  }
};

export default RewardAnimation;