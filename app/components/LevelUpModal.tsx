/**
 * @fileoverview Modal de transition et présentation des niveaux
 * 
 * --- Note pour les interactions avec Claude AI ---
 * FORMAT_COMMENT: Les commentaires commençant par "AI:" sont des points d'attention 
 * spécifiques pour les futures modifications avec Claude AI
 * 
 * AI: Points clés pour la maintenance:
 * 1. Les animations de transition sont critiques pour l'expérience utilisateur
 * 2. Le système de stats doit être robuste face aux valeurs manquantes
 * 3. Les animations de récompenses doivent être synchronisées
 * 4. L'interface doit rester réactive et fluide
 * 5. Les données de performance doivent être clairement présentées
 */

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
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../styles/colors';
import { 
  LevelConfig, 
  SpecialRules, 
  RewardType
} from '../hooks/types';

const { width, height } = Dimensions.get('window');

/**
 * AI: Interface des Props
 * Définition claire des propriétés attendues par le composant
 */
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

/**
 * AI: Configuration par défaut
 * Valeurs de secours pour les données manquantes
 */
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

/**
 * AI: Composant Modal de niveau
 * Gère l'affichage des transitions et statistiques de niveau
 */
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
  /**
   * AI: Références d'animation
   * Gestion des états d'animation du modal
   */
  const scaleAnim = useRef(new Animated.Value(0.3)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const buttonScaleAnim = useRef(new Animated.Value(1)).current;
  const backgroundOpacityAnim = useRef(new Animated.Value(0)).current;
  const levelNumberAnim = useRef(new Animated.Value(0)).current;
  const contentTranslateY = useRef(new Animated.Value(50)).current;
  const statsProgressAnim = useRef(new Animated.Value(0)).current;

  /**
   * AI: Effet d'animation principal
   * Gère la séquence complète d'animation à l'apparition
   */
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
        // 1. Fade in du background
        Animated.timing(backgroundOpacityAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
          easing: Easing.ease
        }),
        // 2. Animations parallèles du contenu
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

  /**
   * AI: Animation du bouton
   * Effet de pulsation continue sur le bouton de démarrage
   */
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

  /**
   * AI: Utilitaires de rendu
   * Fonctions auxiliaires pour le calcul des couleurs et styles
   */
  const getMasteryColor = (level: number) => {
    if (level >= 5) return colors.warningYellow;
    if (level >= 4) return colors.primary;
    if (level >= 3) return colors.accent;
    return colors.lightText;
  };

  const getMasteryIcon = (level: number) => {
    if (level >= 5) return 'trophy';
    if (level >= 4) return 'star';
    if (level >= 3) return 'medal';
    return 'ribbon';
  };

  const getAccuracyColor = (accuracy: number) => {
    if (accuracy >= 0.8) return colors.correctGreen;
    if (accuracy >= 0.6) return colors.warningYellow;
    return colors.incorrectRed;
  };

  /**
   * AI: Composants de rendu
   * Sections de l'interface utilisateur
   */
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

/**
 * AI: Styles
 * Organisation des styles par section logique
 */
const styles = StyleSheet.create({
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

export default LevelUpModal;