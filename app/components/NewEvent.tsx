// NewEvent.tsx
import React from 'react';
import { View, Image, Text, StyleSheet, Dimensions } from 'react-native';
import { colors } from '../styles/colors';

const { width, height } = Dimensions.get('window');
const CARD_WIDTH = width * 0.85;
const CARD_HEIGHT = CARD_WIDTH * 1.7;

const NewEvent = ({ event, onImageLoad, showDate, isCorrect }) => {
  return (
    <View style={styles.cardWrapper}>
      <View style={styles.container}>
        <View style={styles.cardBorder}>
          <Image
            source={{ uri: event?.illustration_url || 'https://via.placeholder.com/300' }}
            style={styles.image}
            resizeMode="cover"
            onLoad={onImageLoad}
          />
          <View style={styles.textContainer}>
            <Text style={styles.title}>{event?.titre}</Text>
          </View>
          {showDate && (
            <View style={[
              styles.dateOverlay,
              isCorrect ? styles.correctOverlay : styles.incorrectOverlay
            ]}>
              <Text style={[
                styles.dateText,
                isCorrect ? styles.correctDate : styles.incorrectDate
              ]}>
                {event?.date_formatee}
              </Text>
            </View>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  cardWrapper: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    position: 'absolute',
    right: -width * 0.08, // Ajusté pour montrer la carte en entier
    zIndex: 2,
    transform: [
      { rotate: '3deg' }
    ],
  },
  container: {
    width: '100%',
    height: '100%',
    backgroundColor: colors.cardBackground,
    borderRadius: 15,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.35,
    shadowRadius: 5.84,
    padding: 10,
  },
  cardBorder: {
    flex: 1,
    borderWidth: 2,
    borderColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 10,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '80%',
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  textContainer: {
    height: '20%',
    padding: 10,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.cardBackground,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.veryDarkText,
    textAlign: 'center',
  },
  dateOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  dateText: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    color: colors.cardBackground,
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  correctOverlay: {
    backgroundColor: `${colors.correctGreen}CC`,
  },
  incorrectOverlay: {
    backgroundColor: `${colors.incorrectRed}CC`,
  },
  correctDate: {
    textShadowColor: `${colors.correctGreen}80`,
  },
  incorrectDate: {
    textShadowColor: `${colors.incorrectRed}80`,
  },
});

export default NewEvent;