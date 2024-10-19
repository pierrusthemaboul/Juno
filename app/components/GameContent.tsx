import React from 'react';
import { View, Text, ActivityIndicator, Animated, StyleSheet } from 'react-native';
import UserInfo from './UserInfo';
import Countdown from './Countdown';
import EventContainer from './EventContainer';
import { colors } from '../styles/colors';

const GameContent = ({ 
  user, 
  timeLeft, 
  loading, 
  error, 
  previousEvent, 
  newEvent, 
  feedbackColor, 
  isImageLoaded, 
  handleChoice, 
  handleImageLoad, 
  fadeAnim,
  showDate,
  isCorrect
}) => {
  return (
    <>
      <View style={styles.topBar}>
        <UserInfo user={user} />
        <Countdown timeLeft={timeLeft} />
      </View>
      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        {loading ? (
          <ActivityIndicator size="large" color="#0000ff" />
        ) : error ? (
          <Text style={styles.errorText}>{error}</Text>
        ) : (
          <EventContainer
            previousEvent={previousEvent}
            newEvent={newEvent}
            onImageLoad={handleImageLoad}
            onChoice={handleChoice}
            feedbackColor={feedbackColor}
            isImageLoaded={isImageLoaded}
            showDate={showDate}
            isCorrect={isCorrect}
          />
        )}
      </Animated.View>
    </>
  );
};

const styles = StyleSheet.create({
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingTop: 40,
    paddingBottom: 10,
  },
  content: {
    flex: 1,
    padding: 15,
  },
  errorText: {
    color: '#F44336',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20,
  },
});

export default GameContent;