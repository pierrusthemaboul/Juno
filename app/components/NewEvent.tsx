import React from 'react';
import { View, Image, Text, StyleSheet, Dimensions } from 'react-native';
import { Event } from '../types';

interface NewEventProps {
  event: Event;
  showDate: boolean;
  isCorrect?: boolean;
  onImageLoad: () => void;
}

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.85;
const CARD_HEIGHT = CARD_WIDTH * 1.7;

const NewEvent: React.FC<NewEventProps> = ({ 
  event, 
  showDate, 
  isCorrect, 
  onImageLoad 
}) => {
  const formattedDate = event.date_formatee || new Date(event.date).toLocaleDateString('fr-FR');

  return (
    <View style={styles.cardWrapper}>
      <View style={styles.container}>
        <View style={styles.cardBorder}>
          <Image
            source={{ uri: event.illustration_url }}
            style={styles.image}
            resizeMode="cover"
            onLoad={onImageLoad}
          />
          <View style={styles.textContainer}>
            <Text style={styles.title}>{event.titre}</Text>
          </View>
          {showDate && (
            <View style={[
              styles.dateOverlay,
              isCorrect !== undefined && (isCorrect ? styles.correctOverlay : styles.incorrectOverlay)
            ]}>
              <Text style={[
                styles.dateText,
                isCorrect !== undefined && (isCorrect ? styles.correctDate : styles.incorrectDate)
              ]}>
                {formattedDate}
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
    right: -width * 0.08,
    zIndex: 2,
    transform: [{ rotate: '3deg' }],
  },
  container: {
    width: '100%',
    height: '100%',
    backgroundColor: '#FFFFFF',
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
    backgroundColor: '#FFFFFF',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000000',
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
  correctOverlay: {
    backgroundColor: 'rgba(39, 174, 96, 0.9)',
  },
  incorrectOverlay: {
    backgroundColor: 'rgba(231, 76, 60, 0.9)',
  },
  dateText: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#FFFFFF',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  correctDate: {
    textShadowColor: 'rgba(39, 174, 96, 0.8)',
  },
  incorrectDate: {
    textShadowColor: 'rgba(231, 76, 60, 0.8)',
  },
});

export default NewEvent;