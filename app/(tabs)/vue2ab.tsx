import React, { useState } from 'react';
import { SafeAreaView, ImageBackground, StyleSheet, Animated, View, Text, TouchableOpacity } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useGameLogic } from '../hooks/useGameLogic';
import GameOverModal from '../components/GameOverModal';

export default function Vue2ab() {
  const { initialEvent } = useLocalSearchParams();
  const [fadeAnim] = useState(new Animated.Value(1));
  const gameLogic = useGameLogic(initialEvent);

  const renderEvent = (event, isPrevious) => (
    <View style={[styles.eventContainer, isPrevious ? styles.previousEvent : styles.newEvent]}>
      <Text style={styles.diagonalDate}>{event.date}</Text>
      <ImageBackground 
        source={{ uri: event.illustration_url }} 
        style={styles.eventImage}
        resizeMode="cover"
      >
        <View style={styles.eventOverlay}>
          <Text style={styles.eventTitle}>{event.titre}</Text>
        </View>
      </ImageBackground>
    </View>
  );

  return (
    <ImageBackground 
      source={require('../../assets/images/bgvue2.webp')} 
      style={styles.backgroundImage}
    >
      <SafeAreaView style={styles.container}>
        <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
          <View style={styles.eventsContainer}>
            {renderEvent(gameLogic.previousEvent, true)}
            {renderEvent(gameLogic.newEvent, false)}
          </View>
          <View style={styles.buttonsContainer}>
            <TouchableOpacity style={styles.button} onPress={() => gameLogic.handleChoice('avant')}>
              <Text style={styles.buttonText}>Avant</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button} onPress={() => gameLogic.handleChoice('après')}>
              <Text style={styles.buttonText}>Après</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
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
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
    padding: 10,
  },
  eventsContainer: {
    flex: 1,
    flexDirection: 'row',
  },
  eventContainer: {
    flex: 1,
    margin: 5,
    borderRadius: 10,
    overflow: 'hidden',
  },
  previousEvent: {
    backgroundColor: 'rgba(200, 200, 200, 0.8)',
  },
  newEvent: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
  },
  eventImage: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  eventOverlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 10,
  },
  eventTitle: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  diagonalDate: {
    position: 'absolute',
    top: 10,
    left: 10,
    transform: [{ rotate: '-45deg' }],
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    padding: 5,
    zIndex: 1,
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 10,
  },
  button: {
    backgroundColor: '#4a90e2',
    padding: 10,
    borderRadius: 5,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});