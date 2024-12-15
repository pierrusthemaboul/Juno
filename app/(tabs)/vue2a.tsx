// Vue2a.tsx

import React, { useState, useEffect } from 'react';
import { 
  SafeAreaView, 
  ImageBackground, 
  StyleSheet, 
  Animated, 
  StatusBar,
  BackHandler,
  Alert
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useGameLogicA } from '../hooks/useGameLogicA';
import GameContentA from '../components/GameContentA';
import { Event } from '../types';
import { gameLogger } from '../utils/gameLogger';

export default function Vue2a() {
  // Initialisation des animations et de l'état
  const [fadeAnim] = useState(new Animated.Value(1));
  const [isExiting, setIsExiting] = useState(false);
  const router = useRouter();

  // Récupération et parsing sécurisé des paramètres
  const params = useLocalSearchParams();
  const initialEvent = typeof params.initialEvent === 'string' 
    ? params.initialEvent 
    : JSON.stringify({} as Event);

  // Initialisation de la logique du jeu
  const {
    user,
    previousEvent,
    newEvent,
    timeLeft,
    loading,
    error,
    isGameOver,
    showDates,
    isCorrect,
    isImageLoaded,
    streak,
    highScore,
    showLevelModal,
    isLevelPaused,
    currentLevelConfig,
    leaderboards,
    performanceStats,
    categoryMastery,
    periodStats,
    activeBonus,
    currentReward,
    completeRewardAnimation,
    updateRewardPosition,
    handleChoice,
    handleImageLoad,
    startLevel,
    restartGame
  } = useGameLogicA(initialEvent);

  // Gestion du bouton retour Android
  useEffect(() => {
    const backAction = () => {
      if (isExiting) return true;

      Alert.alert(
        "Quitter la partie",
        "Voulez-vous vraiment quitter ? Votre progression sera perdue.",
        [
          {
            text: "Annuler",
            onPress: () => null,
            style: "cancel"
          },
          { 
            text: "Quitter", 
            onPress: () => {
              setIsExiting(true);
              handleExit();
            }
          }
        ]
      );
      return true;
    };

    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      backAction
    );

    return () => backHandler.remove();
  }, [isExiting]);

  // Animation de sortie
  const handleExit = () => {
    gameLogger.info('Exiting game view');
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true
    }).start(() => {
      router.push('/vue1');
    });
  };

  // Animation d'entrée au montage
  useEffect(() => {
    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 0,
        useNativeDriver: true
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true
      })
    ]).start();

    return () => {
      gameLogger.info('Cleaning up game view');
    };
  }, []);

  return (
    <ImageBackground 
      source={require('../../assets/images/bgvue2.webp')} 
      style={styles.backgroundImage}
      resizeMode="cover"
    >
      <StatusBar 
        translucent 
        backgroundColor="transparent" 
        barStyle="light-content" 
      />
      
      <SafeAreaView style={styles.container}>
        <GameContentA
          user={user}
          timeLeft={timeLeft}
          loading={loading}
          error={error}
          previousEvent={previousEvent}
          newEvent={newEvent}
          isGameOver={isGameOver}
          showDates={showDates}
          isCorrect={isCorrect}
          isImageLoaded={isImageLoaded}
          handleChoice={handleChoice}
          handleImageLoad={handleImageLoad}
          handleRestart={restartGame}
          streak={streak}
          highScore={highScore}
          level={user.level}
          fadeAnim={fadeAnim}
          showLevelModal={showLevelModal}
          isLevelPaused={isLevelPaused}
          startLevel={startLevel}
          currentLevelConfig={currentLevelConfig}
          currentReward={currentReward}
          completeRewardAnimation={completeRewardAnimation}
          updateRewardPosition={updateRewardPosition}
          performanceStats={performanceStats}
          categoryMastery={categoryMastery}
          periodStats={periodStats}
          activeBonus={activeBonus}
          leaderboards={leaderboards}
        />
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  container: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
  }
});