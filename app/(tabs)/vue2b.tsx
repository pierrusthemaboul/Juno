import React from 'react';
import { SafeAreaView, ImageBackground, StyleSheet, StatusBar } from 'react-native';
import GameContentB from '../components/GameContentB';
import { useGameLogicB } from '../hooks/useGameLogicB';

export default function Vue2B() {
  const gameLogic = useGameLogicB();
  
  return (
    <ImageBackground 
      source={require('../../assets/images/bgvue2.webp')} 
      style={styles.backgroundImage}
    >
      <StatusBar translucent backgroundColor="transparent" />
      <SafeAreaView style={styles.container}>
        <GameContentB 
          user={gameLogic.user}
          timeLeft={gameLogic.timeLeft}
          loading={gameLogic.loading}
          error={gameLogic.error}
          event1={gameLogic.currentEvents?.event1}
          event2={gameLogic.currentEvents?.event2}
          isGameOver={gameLogic.isGameOver}
          showDates={gameLogic.showDates}
          isCorrect={gameLogic.isCorrect}
          isImageLoaded={gameLogic.isImageLoaded}
          handleChoice={gameLogic.handleChoice}
          handleImageLoad={gameLogic.handleImageLoad}
          handleRestart={gameLogic.restartGame}
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
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
  },
});