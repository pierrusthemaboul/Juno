/**
 * @fileoverview Composant d'affichage des informations utilisateur dans le jeu
 * 
 * --- Note pour les interactions avec Claude AI ---
 * FORMAT_COMMENT: Les commentaires commençant par "AI:" sont des points d'attention 
 * spécifiques pour les futures modifications avec Claude AI
 * 
 * AI: Points clés pour la maintenance:
 * 1. La mesure des positions est critique pour les animations de récompense
 * 2. Le système de bonus doit rester modulaire et extensible
 * 3. Les animations des vies et points sont synchronisées
 * 4. Le rendu est optimisé pour les performances
 * 
 * AI: Sections principales:
 * - Interfaces et Types (Définition du contrat du composant)
 * - Gestion des Refs (Mesure des positions pour les animations)
 * - Système de Bonus (Affichage des multiplicateurs actifs)
 * - Rendu des Vies (Animation et état des vies)
 * - Interface Utilisateur (Organisation du layout)
 */

import React, { forwardRef, useImperativeHandle, useEffect } from 'react';
import { View, Text, StyleSheet, Platform, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../styles/colors';
import { MAX_LIVES, ActiveBonus, BonusType } from '../hooks/types';

/**
 * AI: Interfaces du composant
 * Définition des types pour les props et les refs
 */
interface UserInfoProps {
  name: string;
  points: number;
  lives: number;
  level: number;
  streak: number;
  activeBonus?: ActiveBonus[];
}

export interface UserInfoHandle {
  getPointsPosition: () => Promise<{ x: number; y: number }>;
  getLifePosition: () => Promise<{ x: number; y: number }>;
}

/**
 * Composant UserInfo
 * AI: Point d'entrée du composant avec gestion des refs pour les animations
 */
const UserInfo = forwardRef<UserInfoHandle, UserInfoProps>(
  ({ name, points, lives, level, streak, activeBonus = [] }, ref) => {
    /**
     * AI: Refs et animations
     * Gestion des positions et des animations de bounce
     */
    const pointsRef = React.useRef<View>(null);
    const livesRef = React.useRef<View>(null);
    const bounceAnim = React.useRef(new Animated.Value(1)).current;

    /**
     * AI: Animation des points
     * Effet de bounce lors du changement de score
     */
    useEffect(() => {
      Animated.sequence([
        Animated.spring(bounceAnim, {
          toValue: 1.1,
          friction: 3,
          tension: 40,
          useNativeDriver: true,
        }),
        Animated.spring(bounceAnim, {
          toValue: 1,
          friction: 3,
          useNativeDriver: true,
        }),
      ]).start();
    }, [points]);

    /**
     * AI: Mesure des positions
     * Expose les méthodes de mesure pour les animations de récompense
     */
    useImperativeHandle(ref, () => ({
      getPointsPosition: () =>
        new Promise((resolve) => {
          debugLogs.positions.pointsRequested(); // Ajout du log
          
          if (!pointsRef.current) {
            debugLogs.refs.pointsRefMissing(); // Ajout du log
            debugLogs.positions.pointsDefaulted(); // Ajout du log
            resolve({ x: 0, y: 0 });
            return;
          }
    
          pointsRef.current.measure((x, y, width, height, pageX, pageY) => {
            if (typeof pageX === 'number' && typeof pageY === 'number') {
              const position = { 
                x: pageX + (width || 0) / 2, 
                y: pageY + (height || 0) / 2 
              };
              debugLogs.positions.pointsCalculated(position); // Ajout du log
              resolve(position);
            } else {
              debugLogs.refs.measureFailed('points'); // Ajout du log
              debugLogs.positions.pointsDefaulted(); // Ajout du log
              resolve({ x: 0, y: 0 });
            }
          });
        }),
        getLifePosition: () =>
          new Promise((resolve) => {
            debugLogs.positions.livesRequested(); // Log correct pour les vies
            
            if (!livesRef.current) {
              debugLogs.refs.livesRefMissing(); // Log correct pour les vies
              debugLogs.positions.livesDefaulted(); // Log correct pour les vies
              resolve({ x: 0, y: 0 });
              return;
            }
        
            livesRef.current.measure((x, y, width, height, pageX, pageY) => {
              if (typeof pageX === 'number' && typeof pageY === 'number') {
                const position = { 
                  x: pageX + (width || 0) / 2, 
                  y: pageY + (height || 0) / 2 
                };
                debugLogs.positions.livesCalculated(position); // Log correct pour les vies
                resolve(position);
              } else {
                debugLogs.refs.measureFailed('lives'); // Mention 'lives' au lieu de 'points'
                debugLogs.positions.livesDefaulted(); // Log correct pour les vies
                resolve({ x: 0, y: 0 });
              }
            });
          }),
    }));

    /**
     * AI: Calcul des couleurs
     * Attribution des couleurs selon le type de bonus
     */
    const getBonusColor = (type: BonusType) => {
      switch (type) {
        case BonusType.TIME:
          return colors.timerNormal;
        case BonusType.STREAK:
          return colors.warningYellow;
        case BonusType.PERIOD:
          return colors.primary;
        case BonusType.MASTERY:
          return colors.accent;
        case BonusType.COMBO:
          return colors.correctGreen;
        default:
          return colors.primary;
      }
    };

    /**
     * AI: Calcul des icônes
     * Attribution des icônes selon le type de bonus
     */
    const getBonusIcon = (type: BonusType): string => {
      switch (type) {
        case BonusType.TIME:
          return 'timer-outline';
        case BonusType.STREAK:
          return 'flame-outline';
        case BonusType.PERIOD:
          return 'calendar-outline';
        case BonusType.MASTERY:
          return 'star-outline';
        case BonusType.COMBO:
          return 'flash-outline';
        default:
          return 'star-outline';
      }
    };

    /**
     * AI: Rendu des bonus actifs
     * Affichage des multiplicateurs et de leur progression
     */
    const renderBonusIndicators = () => {
      const currentTime = Date.now();
      const activeMultipliers = activeBonus.filter(
        (bonus) => bonus.expiresAt > currentTime
      );

      if (activeMultipliers.length === 0) return null;

      return (
        <View style={styles.bonusContainer}>
          {activeMultipliers.map((bonus, index) => (
            <View key={index} style={styles.bonusItem}>
              <View style={styles.bonusIconContainer}>
                <Ionicons
                  name={getBonusIcon(bonus.type)}
                  size={16}
                  color={getBonusColor(bonus.type)}
                />
                <Text style={[styles.bonusMultiplier, { color: getBonusColor(bonus.type) }]}>
                  x{bonus.multiplier.toFixed(1)}
                </Text>
              </View>
              <View style={styles.bonusProgressContainer}>
                <View
                  style={[
                    styles.bonusProgress,
                    {
                      width: `${((bonus.expiresAt - currentTime) / bonus.duration) * 100}%`,
                      backgroundColor: getBonusColor(bonus.type),
                    },
                  ]}
                />
              </View>
            </View>
          ))}
        </View>
      );
    };

    /**
     * AI: Rendu des vies
     * Affichage animé des cœurs représentant les vies
     */
    const renderLives = () => (
      <View ref={livesRef} style={styles.livesContainer}>
        {Array(MAX_LIVES)
          .fill(0)
          .map((_, i) => (
            <Animated.View
              key={i}
              style={[
                styles.heartContainer,
                i < lives && {
                  transform: [{ scale: bounceAnim }],
                },
              ]}
            >
              <Ionicons
                name={i < lives ? 'heart' : 'heart-outline'}
                size={18}
                color={i < lives ? colors.incorrectRed : colors.lightText}
                style={styles.heart}
              />
            </Animated.View>
          ))}
      </View>
    );

    /**
     * AI: Couleur du niveau
     * Calcul de la couleur selon la progression
     */
    const getLevelColor = (level: number): string => {
      if (level <= 5) return colors.primary;
      if (level <= 10) return colors.accent;
      if (level <= 15) return colors.warningYellow;
      return colors.incorrectRed;
    };

    return (
      <View style={styles.container}>
        <View style={styles.mainSection}>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{name}</Text>
            <View ref={pointsRef}>
              <Text style={styles.score}>{points}</Text>
            </View>
          </View>
          <View style={styles.statsContainer}>
            {renderLives()}
            <View style={[styles.levelBadge, { backgroundColor: getLevelColor(level) }]}>
              <Text style={styles.levelText}>{level}</Text>
            </View>
            {renderBonusIndicators()}
          </View>
        </View>
      </View>
    );
  }
);

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    backgroundColor: 'transparent',
    flex: 1,
  },
  mainSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 'auto',
    gap: 8,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 8,
  },
  userName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.darkText,
    marginRight: 6,
  },
  score: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '600',
  },
  livesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  levelBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  levelText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
});

// Après les styles et avant l'export
const debugLogs = {
  positions: {
    pointsRequested: () => {
      console.log('[UserInfo] Points position requested');
    },
    pointsCalculated: (position: { x: number; y: number }) => {
      console.log('[UserInfo] Points position calculated:', position);
    },
    pointsDefaulted: () => {
      console.warn('[UserInfo] Points position defaulted to center');
    },
    livesRequested: () => {
      console.log('[UserInfo] Lives position requested');
    },
    livesCalculated: (position: { x: number; y: number }) => {
      console.log('[UserInfo] Lives position calculated:', position);
    },
    livesDefaulted: () => {
      console.warn('[UserInfo] Lives position defaulted to center');
    },
  },
  refs: {
    pointsRefMissing: () => {
      console.warn('[UserInfo] Points ref not available');
    },
    livesRefMissing: () => {
      console.warn('[UserInfo] Lives ref not available');
    },
    measureFailed: (context: string) => {
      console.error(`[UserInfo] Measure failed for ${context}`);
    }
  }
};

export default UserInfo;


