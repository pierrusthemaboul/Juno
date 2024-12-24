// 1. Introduction
// ==============
// 1.A. Présentation
// ----------------
// Modal de transition et présentation des niveaux

// 1.B. Notes pour l'IA
// -------------------
// FORMAT_COMMENT: Les commentaires commençant par "AI:" sont des points d'attention 
// spécifiques pour les futures modifications avec Claude AI

// 1.C. Points clés de maintenance
// -----------------------------
// 1.C.a. Animations
// Gestion critique des transitions visuelles
// 1.C.b. Statistiques 
// Robustesse face aux données manquantes
// 1.C.c. Récompenses
// Synchronisation des animations de gains
// 1.C.d. Performance
// Maintien de la fluidité de l'interface
// 1.C.e. Données
// Clarté de la présentation des performances
// Fin de la section Introduction

// 2. Imports et Configuration
// =========================
// 2.A. Imports React Native
// -----------------------
import React, { useEffect, useRef } from 'react';
import { 
  Modal, 
  View, 
  Text, 
  StyleSheet, 
  Animated,
  Easing,
  Dimensions, 
  TouchableOpacity,
  ScrollView 
} from 'react-native';

// 2.B. Imports externes
// -------------------
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

// 2.C. Imports internes
// -------------------
import { colors } from '../styles/colors';
import { 
  LevelConfig, 
  SpecialRules, 
  RewardType
} from '../hooks/types';

// 2.D. Configuration dimensions
// --------------------------
const { width, height } = Dimensions.get('window');
// Fin de la section Imports et Configuration

// 3. Interfaces et Constantes
// =========================
// 3.A. Interface Props
// ------------------
// 3.A.a. Définition des props du composant
interface LevelModalProps {
  visible: boolean;
  level: number;
  onStart: () => void;
  name: string;
  description: string;
  requiredEvents: number;
  specialRules?: SpecialRules[];
  previousLevel?: number;
  isNewLevel: boolean;
  transitionReward?: {
    type: RewardType;
    value: number;
  };
  performanceStats?: {
    typeSuccess: Record<string, number>;
    periodSuccess: Record<string, number>;
    overallAccuracy: number;
    averageResponseTime: number;
  };
  categoryMastery?: Record<string, { masteryLevel: number }>;
  periodStats?: Record<string, { accuracy: number }>;
  activeBonus?: string[];
  streakInfo?: { current: number; best: number };
}

// 3.B. Valeurs par défaut
// ----------------------
// 3.B.a. Configuration des stats par défaut
const DEFAULT_STATS = {
  performanceStats: {
    typeSuccess: {},
    periodSuccess: {},
    overallAccuracy: 0,
    averageResponseTime: 0
  },
  categoryMastery: {},
  periodStats: {},
  activeBonus: [],
  streakInfo: { current: 0, best: 0 }
};
// Fin de la section Interfaces et Constantes

// 4. Composant Principal
// ====================
// 4.A. Définition du composant
// --------------------------
const LevelUpModal: React.FC<LevelModalProps> = ({
  visible,
  level,
  onStart,
  name,
  description,
  requiredEvents,
  specialRules,
  previousLevel,
  isNewLevel,
  transitionReward,
  performanceStats = DEFAULT_STATS.performanceStats,
  categoryMastery = DEFAULT_STATS.categoryMastery,
  periodStats = DEFAULT_STATS.periodStats,
  activeBonus = DEFAULT_STATS.activeBonus,
  streakInfo = DEFAULT_STATS.streakInfo
}) => {

  // 4.B. Références d'animation
  // -------------------------
  // 4.B.a. Initialisation des animations
  const scaleAnim = useRef(new Animated.Value(0.3)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const buttonScaleAnim = useRef(new Animated.Value(1)).current;
  const backgroundOpacityAnim = useRef(new Animated.Value(0)).current;
  const levelNumberAnim = useRef(new Animated.Value(0)).current;
  const contentTranslateY = useRef(new Animated.Value(50)).current;
  const statsProgressAnim = useRef(new Animated.Value(0)).current;

  // 4.C. Effets
  // ----------
  // 4.C.a. Animation d'entrée
  useEffect(() => {
    let isMounted = true;
  
    if (visible) {
      // Reset des animations
      const resetAnimations = () => {
        scaleAnim.setValue(0.3);
        opacityAnim.setValue(0);
        backgroundOpacityAnim.setValue(0);
        levelNumberAnim.setValue(0);
        contentTranslateY.setValue(50);
        buttonScaleAnim.setValue(1);
        statsProgressAnim.setValue(0);
      };
  
      resetAnimations();
  
      // Séquence d'animation principale
      Animated.sequence([
        Animated.timing(backgroundOpacityAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
          easing: Easing.ease
        }),
        Animated.parallel([
          Animated.spring(scaleAnim, {
            toValue: 1,
            friction: 8,
            tension: 40,
            useNativeDriver: true
          }),
          Animated.timing(opacityAnim, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
            easing: Easing.ease
          }),
          Animated.spring(contentTranslateY, {
            toValue: 0,
            friction: 8,
            tension: 40,
            useNativeDriver: true
          }),
          Animated.spring(levelNumberAnim, {
            toValue: 1,
            friction: 8,
            tension: 40,
            useNativeDriver: true
          })
        ])
      ]).start(() => {
        if (isMounted) {
          startButtonAnimation();
        }
      });
    }
  
    return () => {
      isMounted = false;
    };
  }, [visible]);

  // 4.D. Fonctions d'animation
  // ------------------------
  // 4.D.a. Animation du bouton
  const startButtonAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(buttonScaleAnim, {
          toValue: 1.1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(buttonScaleAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        })
      ])
    ).start();
  };

  // 4.E. Utilitaires
  // --------------
  // 4.E.a. Calcul des couleurs
  const getMasteryColor = (level: number) => {
    if (level >= 5) return colors.warningYellow;
    if (level >= 4) return colors.primary;
    if (level >= 3) return colors.accent;
    return colors.lightText;
  };

  // 4.E.b. Icônes de maîtrise
  const getMasteryIcon = (level: number) => {
    if (level >= 5) return 'trophy';
    if (level >= 4) return 'star';
    if (level >= 3) return 'medal';
    return 'ribbon';
  };

  // 4.E.c. Couleurs de précision
  const getAccuracyColor = (accuracy: number) => {
    if (accuracy >= 0.8) return colors.correctGreen;
    if (accuracy >= 0.6) return colors.warningYellow;
    return colors.incorrectRed;
  };

  // 4.F. Composants de rendu
  // ----------------------
  // 4.F.a. Bannière niveau supérieur
  const renderLevelUpBanner = () => {
    if (!previousLevel || !isNewLevel) return null;

    return (
      <Animated.View 
        style={[
          styles.levelUpBanner,
          {
            transform: [
              { scale: levelNumberAnim },
              { translateY: contentTranslateY }
            ]
          }
        ]}
      >
        <LinearGradient
          colors={[colors.warningYellow, colors.primary]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.bannerGradient}
        >
          <Ionicons name="trophy" size={32} color="white" />
          <Text style={styles.levelUpText}>NIVEAU SUPÉRIEUR !</Text>
          <Text style={styles.previousLevel}>
            {previousLevel} → {level}
          </Text>
        </LinearGradient>
      </Animated.View>
    );
  };

  // 4.F.b. Badges de maîtrise
  const renderMasteryBadges = () => {
    const sortedCategories = Object.entries(categoryMastery)
      .filter(([_, stats]) => stats.masteryLevel >= 3)
      .sort((a, b) => b[1].masteryLevel - a[1].masteryLevel);

    if (sortedCategories.length === 0) return null;

    return (
      <View style={styles.masteryContainer}>
        <Text style={styles.sectionTitle}>Spécialités</Text>
        <View style={styles.badgesGrid}>
          {sortedCategories.map(([category, stats]) => (
            <Animated.View 
              key={category}
              style={[
                styles.masteryBadge,
                {
                  opacity: statsProgressAnim,
                  transform: [{
                    scale: statsProgressAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.5, 1]
                    })
                  }]
                }
              ]}
            >
              <Ionicons 
                name={getMasteryIcon(stats.masteryLevel)}
                size={24}
                color={getMasteryColor(stats.masteryLevel)}
              />
              <Text style={styles.masteryCategory}>{category}</Text>
              <Text style={[
                styles.masteryLevel,
                { color: getMasteryColor(stats.masteryLevel) }
              ]}>
                Niveau {stats.masteryLevel}
              </Text>
            </Animated.View>
          ))}
        </View>
      </View>
    );
  };

  // 4.F.c. Statistiques par période
  const renderPeriodStats = () => {
    return (
      <View style={styles.periodStatsContainer}>
        <Text style={styles.sectionTitle}>Périodes Historiques</Text>
        {Object.entries(periodStats).map(([period, stats]) => (
          <Animated.View 
            key={period}
            style={[styles.periodRow, {
              opacity: statsProgressAnim,
              transform: [{
                translateX: statsProgressAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [-50, 0]
                })
              }]
            }]}
          >
            <Text style={styles.periodName}>{period}</Text>
            <View style={styles.accuracyBar}>
              <Animated.View 
                style={[
                  styles.accuracyFill,
                  { 
                    width: statsProgressAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: ['0%', `${stats.accuracy * 100}%`]
                    }),
                    backgroundColor: getAccuracyColor(stats.accuracy)
                  }
                ]} 
              />
            </View>
            <Text style={styles.accuracyText}>
              {Math.round(stats.accuracy * 100)}%
            </Text>
          </Animated.View>
        ))}
      </View>
    );
  };

  // 4.F.d. Règles spéciales
  const renderSpecialRules = () => {
    if (!specialRules?.length) return null;

    return (
      <View style={styles.rulesContainer}>
        <Text style={styles.rulesTitle}>Règles spéciales :</Text>
        {specialRules.map((rule, index) => (
          <View key={index} style={styles.ruleItem}>
            <Ionicons 
              name="star" 
              size={16} 
              color={colors.primary} 
              style={styles.ruleIcon} 
            />
            <Text style={styles.ruleText}>
              {rule}
            </Text>
          </View>
        ))}
      </View>
    );
  };

  // 4.G. Rendu principal
  // ------------------
  if (!visible) return null;

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      statusBarTranslucent
    >
      <Animated.View 
        style={[
          styles.modalOverlay,
          { opacity: backgroundOpacityAnim }
        ]}
      >
        <Animated.View
          style={[
            styles.modalContent,
            {
              opacity: opacityAnim,
              transform: [
                { scale: scaleAnim },
                { translateY: contentTranslateY }
              ]
            }
          ]}
        >
          <ScrollView
            style={styles.scrollView}
            showsVerticalScrollIndicator={false}
          >
            {renderLevelUpBanner()}
            <View style={styles.levelContainer}>
              <Animated.Text
                style={[
                  styles.levelLabel,
                  {
                    transform: [{ scale: levelNumberAnim }]
                  }
                ]}
              >
                NIVEAU {level}
              </Animated.Text>
              <Text style={styles.levelName}>{name}</Text>
            </View>
            <Text style={styles.description}>{description}</Text>
            {renderSpecialRules()}
            {renderMasteryBadges()}
            {renderPeriodStats()}
            <Text style={styles.eventsInfo}>
              Objectif : {requiredEvents} événements
            </Text>
            <Animated.View
              style={[
                styles.startButtonContainer,
                { transform: [{ scale: buttonScaleAnim }] }
              ]}
            >
              <TouchableOpacity
                style={styles.startButton}
                onPress={onStart}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={[colors.primary, colors.accent]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.buttonGradient}
                >
                  <Ionicons name="play" size={30} color="white" />
                  <Text style={styles.startButtonText}>GO !</Text>
                </LinearGradient>
              </TouchableOpacity>
            </Animated.View>
          </ScrollView>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};
// Fin de la section Composant Principal

// 5. Styles
// =========
// 5.A. Configuration globale
// ------------------------
const styles = StyleSheet.create({
  // 5.A.a. Styles du modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: width * 0.85,
    maxHeight: height * 0.85,
    backgroundColor: 'white',
    borderRadius: 20,
    paddingVertical: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    borderWidth: 2,
    borderColor: colors.primary,
  },

  // 5.B. Styles de la bannière
  // ------------------------
  scrollView: {
    paddingHorizontal: 20,
  },
  levelUpBanner: {
    width: '100%',
    marginBottom: 20,
    borderRadius: 10,
    overflow: 'hidden',
  },
  bannerGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
  },
  levelUpText: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    marginHorizontal: 10,
  },
  previousLevel: {
    color: 'white',
    fontSize: 20,
    fontWeight: '600',
  },

  // 5.C. Styles du contenu niveau
  // ---------------------------
  levelContainer: {
    alignItems: 'center',
    marginBottom: 20,
    width: '100%',
  },
  levelLabel: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 10,
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  levelName: {
    fontSize: 24,
    fontWeight: '600',
    color: colors.accent,
    textAlign: 'center',
  },
  description: {
    fontSize: 18,
    color: colors.text,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 24,
  },

  // 5.D. Styles des règles
  // --------------------
  rulesContainer: {
    marginBottom: 20,
    padding: 15,
    backgroundColor: colors.lightBackground,
    borderRadius: 10,
  },
  rulesTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 10,
  },
  ruleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  ruleIcon: {
    marginRight: 8,
  },
  ruleText: {
    fontSize: 16,
    color: colors.text,
    flex: 1,
  },

  // 5.E. Styles de maîtrise
  // ---------------------
  masteryContainer: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 15,
    textAlign: 'center',
  },
  badgesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 10,
  },
  masteryBadge: {
    backgroundColor: colors.lightBackground,
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
    width: width * 0.25,
    aspectRatio: 0.8,
  },
  masteryCategory: {
    fontSize: 14,
    color: colors.text,
    textAlign: 'center',
    marginTop: 5,
  },
  masteryLevel: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 5,
  },

  // 5.F. Styles des statistiques
  // --------------------------
  periodStatsContainer: {
    marginBottom: 20,
  },
  periodRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    paddingHorizontal: 5,
  },
  periodName: {
    width: '30%',
    fontSize: 14,
    color: colors.text,
  },
  accuracyBar: {
    flex: 1,
    height: 8,
    backgroundColor: colors.lightBackground,
    borderRadius: 4,
    marginHorizontal: 10,
    overflow: 'hidden',
  },
  accuracyFill: {
    height: '100%',
    borderRadius: 4,
  },
  accuracyText: {
    width: '15%',
    fontSize: 14,
    color: colors.text,
    textAlign: 'right',
  },

  // 5.G. Styles du bouton
  // -------------------
  eventsInfo: {
    fontSize: 16,
    color: colors.lightText,
    textAlign: 'center',
    marginBottom: 25,
  },
  startButtonContainer: {
    width: '100%',
    alignItems: 'center',
    marginTop: 15,
  },
  startButton: {
    width: '80%',
    maxWidth: 250,
  },
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 25,
  },
  startButtonText: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    marginLeft: 10,
    letterSpacing: 2,
  },
});
// Fin de la section Styles

export default LevelUpModal;