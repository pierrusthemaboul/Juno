/************************************************************************************
 * 4. COMPOSANT : GameContentA
 *
 * ... (Description, Props - inchangés)
 ************************************************************************************/

// 4.C. Imports (inchangés)
import React, { useState, useRef, useEffect } from 'react';
import { View, Text, ActivityIndicator, Animated, StyleSheet, Platform, StatusBar, SafeAreaView, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import UserInfo, { UserInfoHandle } from './UserInfo';
import Countdown from './Countdown';
import EventLayoutA from './EventLayoutA';
import LevelUpModalBis from './LevelUpModalBis';
import ScoreboardModal from './ScoreboardModal';
import RewardAnimation from './RewardAnimation';
import { colors } from '../styles/colors';
import { User, Event, ExtendedLevelConfig, RewardType, LevelEventSummary } from '../hooks/types';
import { gameLogger } from '../utils/gameLogger';

// 4.C.1. Dimensions de l'écran
const { width, height } = Dimensions.get('window');

/**
 * 4.D. Composant principal GameContentA
 * @function GameContentA
 * @param {GameContentAProps} props
 * @returns {JSX.Element}
 */
const GameContentA: React.FC<GameContentAProps> = ({
  user,
  timeLeft,
  loading,
  error,
  previousEvent,
  newEvent,
  isGameOver,
  showDates,
  isCorrect,
  isImageLoaded,
  handleChoice,
  handleImageLoad,
  handleRestart,
  streak,
  highScore,
  level,
  fadeAnim,
  showLevelModal,
  isLevelPaused,
  startLevel,
  currentLevelConfig,
  currentReward,
  completeRewardAnimation,
  updateRewardPosition,
  leaderboards,
  levelCompletedEvents
}) => {
  console.log('[GameContentA] Rendu du composant GameContentA', { currentReward });

  // 4.D.1. Hooks et Refs
  const router = useRouter();
  const userInfoRef = useRef<UserInfoHandle>(null);
  const contentOpacity = useRef(new Animated.Value(1)).current;
  const [isRewardPositionSet, setIsRewardPositionSet] = useState(false);

  // 4.D.2. Effet : gestion de la position de la récompense
  useEffect(() => {
    let mounted = true;

    console.log('[GameContentA] useEffect déclenché pour currentReward:', currentReward);

    const updateRewardPositionSafely = async () => {
      if (!currentReward || !userInfoRef.current || !mounted) return;

      try {
        console.log("[GameContentA] updateRewardPositionSafely appelé pour:", currentReward.type);
      
        // Obtention de la position une seule fois
        const position = await (currentReward.type === RewardType.EXTRA_LIFE 
          ? userInfoRef.current.getLifePosition()
          : userInfoRef.current.getPointsPosition());

        if (!mounted) return;

        if (position && typeof position.x === 'number' && typeof position.y === 'number') {
          // Mise à jour une seule fois si la position a changé
          if (!currentReward.targetPosition || 
              currentReward.targetPosition.x !== position.x || 
              currentReward.targetPosition.y !== position.y) {
            console.log("[GameContentA] Position mise à jour:", position);
            updateRewardPosition(position);
            setIsRewardPositionSet(true);
          }
        }
      } catch (error) {
        console.error('[GameContentA] Erreur position:', error);
        // Ne pas mettre de position par défaut en cas d'erreur
        setIsRewardPositionSet(false);
      }
    };

    updateRewardPositionSafely();

    return () => {
      mounted = false;
    };
  }, [currentReward?.type]); // Ne dépend que du type de récompense

  // 4.D.3. Effet : animation quand le level modal apparaît
  useEffect(() => {
    if (showLevelModal) {
      console.log("[GameContentA] showLevelModal est true. Lancement de l'animation.");
      Animated.sequence([
        Animated.timing(contentOpacity, {
          toValue: 0.3,
          duration: 300,
          useNativeDriver: true
        }),
        Animated.timing(contentOpacity, {
          toValue: 1,
          duration: 300,
          delay: 1000,
          useNativeDriver: true
        })
      ]).start(() => console.log("[GameContentA] Animation de showLevelModal terminée."));
    }
  }, [showLevelModal, contentOpacity]);

  // 4.D.4. Rendu conditionnel
  const renderContent = () => {
    console.log("[GameContentA] renderContent appelé.");

    if (loading) {
      console.log("[GameContentA] Affichage de l'indicateur de chargement.");
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Chargement des événements...</Text>
        </View>
      );
    }

    if (error) {
      console.log("[GameContentA] Affichage de l'erreur:", error);
      return (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      );
    }

    if (!previousEvent || !newEvent) {
      console.log("[GameContentA] previousEvent or newEvent est null. Affichage de 'Préparation des événements...'");
      return (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Préparation des événements...</Text>
        </View>
      );
    }

    console.log("[GameContentA] Affichage des composants du jeu.");
    return (
      <>
        <EventLayoutA
          previousEvent={previousEvent}
          newEvent={newEvent}
          onImageLoad={handleImageLoad}
          onChoice={handleChoice}
          showDate={showDates}
          isCorrect={isCorrect}
          isImageLoaded={isImageLoaded}
          streak={streak}
          level={level}
          isLevelPaused={isLevelPaused}
        />

        <LevelUpModalBis
          visible={showLevelModal}
          level={level}
          onStart={startLevel}
          name={currentLevelConfig.name}
          description={currentLevelConfig.description}
          requiredEvents={currentLevelConfig.eventsNeeded}
          specialRules={currentLevelConfig.specialRules}
          previousLevel={level > 1 ? level - 1 : undefined}
          isNewLevel={level > 1}
          eventsSummary={levelCompletedEvents}
        />

        <ScoreboardModal
          isVisible={isGameOver}
          currentScore={user.points}
          personalBest={highScore}
          dailyScores={leaderboards?.daily || []}
          monthlyScores={leaderboards?.monthly || []}
          allTimeScores={leaderboards?.allTime || []}
          onRestart={handleRestart}
          onMenuPress={() => router.replace('/')}
          playerName={user.name}
        />
      </>
    );
  };

  console.log("[GameContentA] Rendu de GameContentA. isRewardPositionSet:", isRewardPositionSet, "currentReward:", currentReward);

  // 4.D.5. Rendu principal
  return (
    <SafeAreaView style={styles.safeArea}>
      <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
        <View style={styles.header}>
          <UserInfo
            ref={userInfoRef}
            name={user.name}
            points={user.points}
            lives={user.lives}
            level={level}
            streak={streak}
          />
          <View style={styles.countdownContainer}>
            <Countdown
              timeLeft={timeLeft}
              isActive={!isLevelPaused && isImageLoaded}
            />
          </View>

          {currentReward && currentReward.targetPosition && isRewardPositionSet && (
            <RewardAnimation
              type={currentReward.type}
              amount={currentReward.amount}
              targetPosition={currentReward.targetPosition}
              onComplete={completeRewardAnimation}
            />
          )}
        </View>

        <Animated.View style={[styles.content, { opacity: contentOpacity }]}>
          {renderContent()}
        </Animated.View>
      </Animated.View>
    </SafeAreaView>
  );
};

// 4.E. Styles
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: 'transparent',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  header: {
    position: 'relative',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    zIndex: 1000,
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  countdownContainer: {
    marginLeft: 15,
  },
  content: {
    flex: 1,
    position: 'relative',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: colors.text,
    textAlign: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  errorText: {
    color: colors.incorrectRed,
    fontSize: 18,
    textAlign: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    padding: 20,
    borderRadius: 10,
  }
});

export default GameContentA;