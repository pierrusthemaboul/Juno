import React, { useState } from 'react';
import { SafeAreaView, ImageBackground, StyleSheet, Animated, TouchableOpacity, Text } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useGameLogic } from '../hooks/useGameLogic';
import GameContent from '../components/GameContent';
import GameOverModal from '../components/GameOverModal';

export default function Vue2() {
  const { initialEvent } = useLocalSearchParams();
  const [fadeAnim] = useState(new Animated.Value(1));
  const gameLogic = useGameLogic(initialEvent);
  const router = useRouter();

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
        <TouchableOpacity 
          style={styles.switchButton}
          onPress={() => router.push({
            pathname: '/vue2ab',
            params: { initialEvent: JSON.stringify(gameLogic.previousEvent) }
          })}
        >
          <Text style={styles.switchButtonText}>Voir Vue2ab</Text>
        </TouchableOpacity>
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
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
  },
  switchButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: '#4a90e2',
    padding: 10,
    borderRadius: 5,
  },
  switchButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});