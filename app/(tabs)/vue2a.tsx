// =======================================
// vue2a.tsx : Vue principale du jeu
// =======================================

// 1. Configuration et initialisation
// ==================================
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
import { Event } from '../hooks/types';
import { gameLogger } from '../utils/gameLogger';

export default function Vue2a() {
  // 1.A. Hook de navigation (expo-router)
  const router = useRouter();

  // 1.B. Fonction de redirection vers vue1
  const handleRestartGame = () => {
    // On retourne sur vue1 comme si on venait d’ouvrir l’app
    router.replace('/vue1');
  };

  // 1.C. États locaux pour l’animation de sortie
  const [fadeAnim] = useState(new Animated.Value(1));
  const [isExiting, setIsExiting] = useState(false);

  // 1.D. Récupération du paramètre initialEvent (si fourni)
  const params = useLocalSearchParams();
  const initialEvent = typeof params.initialEvent === 'string'
    ? params.initialEvent
    : JSON.stringify({} as Event);

  // 1.E. Récupération de la logique de jeu via useGameLogicA
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
    onImageLoad: handleImageLoad, // (renommage s’il faut)
    startLevel,
    levelCompletedEvents
  } = useGameLogicA(initialEvent);

  // 2. Gestion des interactions utilisateur
  // =======================================
  // 2.A. Bloquer le bouton retour Android pour confirmer la sortie
  useEffect(() => {
    const backAction = () => {
      if (isExiting) return true; // Évite double-clic
      Alert.alert(
        "Quitter la partie",
        "Voulez-vous vraiment quitter ? Votre progression sera perdue.",
        [
          { text: "Annuler", onPress: () => null, style: "cancel" },
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

    const backHandler = BackHandler.addEventListener("hardwareBackPress", backAction);
    return () => backHandler.remove();
  }, [isExiting]);

  // 2.B. Animation de sortie de la vue (quand on veut quitter)
  const handleExit = () => {
    gameLogger.info('Exiting game view');
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      // Une fois l’animation de fade out terminée,
      // on revient sur vue1 (par exemple le menu)
      router.replace('/vue1');
    });
  };

  // 2.C. Animation d’entrée de la vue
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

  // 3. Rendu principal de la vue
  // ============================
  return (
    <ImageBackground
      source={require('../../assets/images/bgvue2.webp')}
      style={styles.backgroundImage}
      resizeMode="cover"
    >
      <StatusBar
        translucent
        backgroundColor="darkgray"
        barStyle="light-content"
      />

      <SafeAreaView style={styles.container}>
        <GameContentA
          // -- Props obligatoires ou usuelles
          user={user}
          previousEvent={previousEvent}
          newEvent={newEvent}
          timeLeft={timeLeft}
          loading={loading}
          error={error}
          isGameOver={isGameOver}
          showDates={showDates}
          isCorrect={isCorrect}
          isImageLoaded={isImageLoaded}
          handleChoice={handleChoice}
          handleImageLoad={handleImageLoad}
          streak={streak}
          highScore={highScore}
          level={user.level}

          // -- Animations et modales
          fadeAnim={fadeAnim}
          showLevelModal={showLevelModal}
          isLevelPaused={isLevelPaused}
          startLevel={startLevel}
          currentLevelConfig={currentLevelConfig}

          // -- Récompenses et stats
          currentReward={currentReward}
          completeRewardAnimation={completeRewardAnimation}
          updateRewardPosition={updateRewardPosition}
          performanceStats={performanceStats}
          categoryMastery={categoryMastery}
          periodStats={periodStats}
          activeBonus={activeBonus}
          leaderboards={leaderboards}

          // -- Historique
          levelCompletedEvents={levelCompletedEvents}

          // -- NOUVEAU : on passe la fonction qui renvoie sur vue1
          handleRestart={handleRestartGame}
        />
      </SafeAreaView>
    </ImageBackground>
  );
}

// 4. Styles
// =========
const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  container: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
  },
});
