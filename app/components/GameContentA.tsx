/************************************************************************************
 * 4. COMPOSANT : GameContentA
 *
 * 4.A. Description
 *     Enveloppe générale de l’interface de jeu :
 *       - Header (UserInfo, Countdown)
 *       - Zone centrale (EventLayoutA)
 *       - Modales (LevelUpModalBis, ScoreboardModal)
 *       - Gestion des récompenses (RewardAnimation)
 *
 * 4.B. Props
 *     @interface GameContentAProps
 *     ...
 ************************************************************************************/

import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  Animated,
  StyleSheet,
  Platform,
  StatusBar,
  SafeAreaView,
  Dimensions
} from 'react-native';
import { useRouter } from 'expo-router';
import UserInfo, { UserInfoHandle } from './UserInfo';
import Countdown from './Countdown';
import EventLayoutA from './EventLayoutA';
import LevelUpModalBis from './LevelUpModalBis';
import ScoreboardModal from './ScoreboardModal';
import RewardAnimation from './RewardAnimation';
import { colors } from '../styles/colors';
import {
  User,
  Event,
  ExtendedLevelConfig,
  RewardType,
  LevelEventSummary
} from '../hooks/types';

const { width, height } = Dimensions.get('window');

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
  // 4.D.1. Hooks & states
  const router = useRouter();
  const userInfoRef = useRef<UserInfoHandle>(null);

  const contentOpacity = useRef(new Animated.Value(1)).current;
  const [isRewardPositionSet, setIsRewardPositionSet] = useState(false);

  // 4.D.2. Position de la reward
  useEffect(() => {
    let mounted = true;

    const updateRewardPositionSafely = async () => {
      if (!currentReward || !userInfoRef.current || !mounted) {
        return;
      }

      try {
        const position = await (currentReward.type === RewardType.EXTRA_LIFE 
          ? userInfoRef.current.getLifePosition()
          : userInfoRef.current.getPointsPosition()
        );

        if (!mounted) return;

        if (position && typeof position.x === 'number' && typeof position.y === 'number') {
          if (
            !currentReward.targetPosition ||
            currentReward.targetPosition.x !== position.x ||
            currentReward.targetPosition.y !== position.y
          ) {
            updateRewardPosition(position);
            setIsRewardPositionSet(true);
          }
        }
      } catch (err) {
        setIsRewardPositionSet(false);
      }
    };

    updateRewardPositionSafely();

    return () => {
      mounted = false;
    };
  }, [currentReward?.type]);

  // 4.D.3. Fade du contenu quand le LevelUpModal apparaît
  useEffect(() => {
    if (showLevelModal) {
      Animated.sequence([
        Animated.timing(contentOpacity, {
          toValue: 0.3,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(contentOpacity, {
          toValue: 1,
          duration: 300,
          delay: 1000,
          useNativeDriver: true,
        }),
      ]).start(() => {
        // Fin de l’animation contentOpacity => 1
      });
    }
  }, [showLevelModal]);

  // 4.D.4. handleChoice (si vous avez envie de loguer aussi ici)
  const onChoiceWrapper = (choice: string) => {
    handleChoice(choice);
  };

  // 4.D.5. Rendu conditionnel
  const renderContent = () => {
    if (loading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Chargement des événements...</Text>
        </View>
      );
    }

    if (error) {
      return (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      );
    }

    if (!previousEvent || !newEvent) {
      return (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Préparation des événements...</Text>
        </View>
      );
    }

    return (
      <>
        <EventLayoutA
          previousEvent={previousEvent}
          newEvent={newEvent}
          onImageLoad={handleImageLoad}
          onChoice={onChoiceWrapper}
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

  // 4.D.6. Rendu principal
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
    shadowOffset: { width: 0, height: 2 },
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
  },
});

export default GameContentA;
