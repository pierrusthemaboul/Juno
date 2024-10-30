// PreviousEvent.tsx
import React from 'react';
import { View, Text, StyleSheet, Image, Dimensions } from 'react-native';
import { colors } from '../styles/colors';

const { width, height } = Dimensions.get('window');
const CARD_WIDTH = width * 0.85;
const CARD_HEIGHT = CARD_WIDTH * 1.5; // Réduit un peu la hauteur de la carte

const PreviousEvent = ({ event }) => {
  const year = event?.date_formatee?.split(' ').pop() || '';
  
  return (
    <>
      <View style={styles.cardWrapper}>
        <View style={styles.container}>
          <View style={styles.cardBorder}>
            <Image
              source={{ uri: event?.illustration_url || 'https://via.placeholder.com/100' }}
              style={styles.image}
              resizeMode="cover"
            />
          </View>
        </View>
      </View>
      <View style={styles.eventInfoContainer}>
        <View style={styles.referenceLabel}>
          <Text style={styles.referenceLabelText}>ÉVÉNEMENT DE RÉFÉRENCE</Text>
        </View>
        <View style={styles.dateTitleContainer}>
          <Text style={styles.referenceDate}>{year}</Text>
          <Text style={styles.referenceTitle} numberOfLines={2}>{event?.titre}</Text>
        </View>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  cardWrapper: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    position: 'absolute',
    right: width * 0.55,
    top: 0,
    zIndex: 1,
    transform: [
      { rotate: '-3deg' }
    ],
  },
  container: {
    width: '100%',
    height: '100%',
    backgroundColor: colors.cardBackground,
    borderRadius: 15,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
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
    height: '100%',
    borderRadius: 8,
  },
  eventInfoContainer: {
    position: 'absolute',
    left: width * 0.02,
    bottom: -height * 0.15, // Positionné en bas du conteneur des cartes
    zIndex: 3,
    width: width * 0.85,
  },
  referenceLabel: {
    backgroundColor: colors.primary,
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    alignSelf: 'flex-start',
  },
  referenceLabelText: {
    color: colors.cardBackground,
    fontSize: 12,
    fontWeight: 'bold',
  },
  dateTitleContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    padding: 12,
    borderRadius: 12,
    borderTopLeftRadius: 0,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  referenceDate: {
    color: colors.cardBackground,
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 12,
    minWidth: 50,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  referenceTitle: {
    flex: 1,
    color: colors.cardBackground,
    fontSize: 16,
    opacity: 0.9,
  },
});

export default PreviousEvent;