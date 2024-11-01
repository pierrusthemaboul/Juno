import React, { useState } from 'react';
import { SafeAreaView, ImageBackground, StyleSheet, Animated } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useGameLogic } from '../hooks/useGameLogic';
import GameContent from '../components/GameContent';
import GameOverModal from '../components/GameOverModal';

export default function Vue2() {
  const { initialEvent } = useLocalSearchParams();
  const [fadeAnim] = useState(new Animated.Value(1));
  const gameLogic = useGameLogic(initialEvent);

  return (
    <ImageBackground 
      source={require('../../assets/images/bgvue2.webp')} 
      style={styles.backgroundImage}
    >
      <SafeAreaView style={styles.container}>
        <GameContent 
          {...gameLogic} 
          fadeAnim={fadeAnim}
        />
        <GameOverModal
          isVisible={gameLogic.isGameOver}
          score={gameLogic.user.points}
          onRestart={gameLogic.restartGame}
        />
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    resizeMode: 'cover',
  },
  container: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.9)', // Légèrement plus opaque pour mieux faire ressortir les cartes
  },
});