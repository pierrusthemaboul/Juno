// 1. Introduction
// ==============
// 1.A. Description générale
// ------------------------
// Composant d'affichage des informations utilisateur dans le jeu de chronologie historique

// 1.B. Configuration IA
// --------------------
// FORMAT_COMMENT: Les commentaires commençant par "AI:" sont des points d'attention 
// spécifiques pour les futures modifications avec Claude AI

// 1.C. Points clés de maintenance
// -----------------------------
// - La mesure des positions est critique pour les animations de récompense
// - Le système de bonus doit rester modulaire et extensible
// - Les animations des vies et points sont synchronisées
// - Le rendu est optimisé pour les performances
// Fin de la section "1.C. Points clés de maintenance"

// 2. Imports et Types
// ==================
// 2.A. Imports de base
// ------------------
import React, { forwardRef, useImperativeHandle, useEffect } from 'react';
import { View, Text, StyleSheet, Platform, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../styles/colors';
import { MAX_LIVES, ActiveBonus, BonusType } from '../hooks/types';
// Fin de la section "2.A. Imports de base"

// 2.B. Définition des interfaces
// ---------------------------
// 2.B.a. Interface des props
interface UserInfoProps {
  name: string;
  points: number;
  lives: number;
  level: number;
  streak: number;
  activeBonus?: ActiveBonus[];
}
// Fin de la section "2.B.a. Interface des props"

// 2.B.b. Interface des méthodes exposées
export interface UserInfoHandle {
  getPointsPosition: () => Promise<{ x: number; y: number }>;
  getLifePosition: () => Promise<{ x: number; y: number }>;
}
// Fin de la section "2.B.b. Interface des méthodes exposées"
// Fin de la section "2.B. Définition des interfaces"
// Fin de la section "2. Imports et Types"

// 3. Implémentation du composant
// ============================
// 3.A. Définition du composant
// --------------------------
const UserInfo = forwardRef<UserInfoHandle, UserInfoProps>(
  ({ name, points, lives, level, streak, activeBonus = [] }, ref) => {
    // 3.B. Gestion des refs
    // -------------------
    // 3.B.a. Refs pour les éléments UI
    const pointsRef = React.useRef<View>(null);
    const livesRef = React.useRef<View>(null);
    const bounceAnim = React.useRef(new Animated.Value(1)).current;
    // Fin de la section "3.B.a. Refs pour les éléments UI"

    // 3.B.b. Animation des points
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
    // Fin de la section "3.B.b. Animation des points"
    // Fin de la section "3.B. Gestion des refs"

    // 3.C. Gestion des positions
    // ------------------------
    // 3.C.a. Mesure des positions pour les animations
    useImperativeHandle(ref, () => ({
      getPointsPosition: () =>
        new Promise((resolve) => {
          debugLogs.positions.pointsRequested();
          
          if (!pointsRef.current) {
            debugLogs.refs.pointsRefMissing();
            debugLogs.positions.pointsDefaulted();
            resolve({ x: 0, y: 0 });
            return;
          }
    
          pointsRef.current.measure((x, y, width, height, pageX, pageY) => {
            if (typeof pageX === 'number' && typeof pageY === 'number') {
              const position = { 
                x: pageX + (width || 0) / 2, 
                y: pageY + (height || 0) / 2 
              };
              debugLogs.positions.pointsCalculated(position);
              resolve(position);
            } else {
              debugLogs.refs.measureFailed('points');
              debugLogs.positions.pointsDefaulted();
              resolve({ x: 0, y: 0 });
            }
          });
        }),
      getLifePosition: () =>
        new Promise((resolve) => {
          debugLogs.positions.livesRequested();
          
          if (!livesRef.current) {
            debugLogs.refs.livesRefMissing();
            debugLogs.positions.livesDefaulted();
            resolve({ x: 0, y: 0 });
            return;
          }
      
          livesRef.current.measure((x, y, width, height, pageX, pageY) => {
            if (typeof pageX === 'number' && typeof pageY === 'number') {
              const position = { 
                x: pageX + (width || 0) / 2, 
                y: pageY + (height || 0) / 2 
              };
              debugLogs.positions.livesCalculated(position);
              resolve(position);
            } else {
              debugLogs.refs.measureFailed('lives');
              debugLogs.positions.livesDefaulted();
              resolve({ x: 0, y: 0 });
            }
          });
        }),
    }));
    // Fin de la section "3.C.a. Mesure des positions pour les animations"
    // Fin de la section "3.C. Gestion des positions"

    // 3.D. Utilitaires de rendu
    // ------------------------
    // 3.D.a. Gestion des couleurs de bonus
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
    // Fin de la section "3.D.a. Gestion des couleurs de bonus"

    // 3.D.b. Gestion des icônes de bonus
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
    // Fin de la section "3.D.b. Gestion des icônes de bonus"
    // Fin de la section "3.D. Utilitaires de rendu"

    // 3.E. Composants de rendu
    // ----------------------
    // 3.E.a. Rendu des indicateurs de bonus
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
    // Fin de la section "3.E.a. Rendu des indicateurs de bonus"

    // 3.E.b. Rendu des vies
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
    // Fin de la section "3.E.b. Rendu des vies"

    // 3.E.c. Gestion du streak
    <View style={styles.streakContainer}>
      <Text style={[
        styles.streakText,
        streak >= 20 ? styles.streakUltra :
        streak >= 15 ? styles.streakMaster : 
        streak >= 10 ? styles.streakExpert :
        streak >= 5 ? styles.streakPro : null
      ]}>
        {streak > 0 ? `×${streak}` : ''}
      </Text>
    </View>
    // Fin de la section "3.E.c. Gestion du streak"

    // 3.E.d. Gestion des couleurs de niveau
    const getLevelColor = (level: number): string => {
      if (level <= 5) return colors.primary;
      if (level <= 10) return colors.accent;
      if (level <= 15) return colors.warningYellow;
      return colors.incorrectRed;
    };
    // Fin de la section "3.E.d. Gestion des couleurs de niveau"

    // 3.E.e. Rendu principal
    return (
      <View style={styles.container}>
        <View style={styles.mainSection}>
         
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{name || ''}</Text>
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
    
    // Fin de la section "3.E.e. Rendu principal"
    // Fin de la section "3.E. Composants de rendu"
  }
);
// Fin de la section "3.A. Définition du composant"
// Fin de la section "3. Implémentation du composant"

// 4. Styles et Configuration
// ========================
// 4.A. Styles du composant
// ----------------------
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
    // Ajout de log pour les dimensions
    onLayout: ({ nativeEvent }) => {
      
    }
  },
  userName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.darkText,
    marginRight: 6,
    // Ajout de log pour vérifier le style
    onLayout: ({ nativeEvent }) => {
      
    }
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
// Fin de la section "4.A. Styles du composant"

// 4.B. Configuration des logs de débogage
// -----------------------------------
const debugLogs = {
  positions: {
    pointsRequested: () => {
    
    },
    pointsCalculated: (position: { x: number; y: number }) => {
      
    },
    pointsDefaulted: () => {
      
    },
    livesRequested: () => {
      
    },
    livesCalculated: (position: { x: number; y: number }) => {
    
    },
    livesDefaulted: () => {
      
    },
  },
  refs: {
    pointsRefMissing: () => {
      
    },
    livesRefMissing: () => {
     
    },
    measureFailed: (context: string) => {
     
    }
  }
};
// Fin de la section "4.B. Configuration des logs de débogage"

// 4.C. Styles spécifiques au streak
// ----------------------------
// 4.C.a. Conteneur du streak
const streakStyles = StyleSheet.create({
  streakContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 30,
  },
  // 4.C.b. Texte de base du streak
  streakText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.darkText,
  },
  // 4.C.c. Variations de style selon le niveau
  streakPro: {
    color: colors.primary,
    fontSize: 15,
  },
  streakExpert: {
    color: colors.accent,
    fontSize: 16,
  },
  streakMaster: {
    color: colors.warningYellow,
    fontSize: 17,
  },
  streakUltra: {
    color: colors.incorrectRed,
    fontSize: 18,
  },
});
// Fin de la section "4.C. Styles spécifiques au streak"
// Fin de la section "4. Styles et Configuration"

// 5. Export du composant
// ====================
export default UserInfo;
// Fin de la section "5. Export du composant"