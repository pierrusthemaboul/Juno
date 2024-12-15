import React from 'react';
import { View, Text, StyleSheet, Image, Dimensions } from 'react-native';
import { Event } from '../types';

interface PreviousEventProps {
  event: Event;
  showDate: boolean;
}

const { width, height } = Dimensions.get('window');
const CARD_WIDTH = width * 0.85;
const CARD_HEIGHT = CARD_WIDTH * 1.5;

const PreviousEvent: React.FC<PreviousEventProps> = ({ event, showDate }) => {
  const formattedDate = event.date_formatee || new Date(event.date).toLocaleDateString('fr-FR');
  
  return (
    <>
      <View style={styles.cardWrapper}>
        <View style={styles.container}>
          <View style={styles.cardBorder}>
            <Image
              source={{ uri: event.illustration_url }}
              style={styles.image}
              resizeMode="cover"
            />
            {showDate && (
              <View style={styles.dateOverlay}>
                <Text style={styles.dateText}>{formattedDate}</Text>
              </View>
            )}
          </View>
        </View>
      </View>
      <View style={styles.eventInfoContainer}>
        <View style={styles.referenceLabel}>
          <Text style={styles.referenceLabelText}>ÉVÉNEMENT DE RÉFÉRENCE</Text>
        </View>
        <View style={styles.dateTitleContainer}>
          <Text style={styles.referenceTitle} numberOfLines={2}>
            {event.titre}
          </Text>
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
    transform: [{ rotate: '-3deg' }],
  },
  container: {
    width: '100%',
    height: '100%',
    backgroundColor: '#FFFFFF',
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
  dateOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dateText: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  eventInfoContainer: {
    position: 'absolute',
    left: width * 0.02,
    bottom: -height * 0.15,
    zIndex: 3,
    width: width * 0.85,
  },
  referenceLabel: {
    backgroundColor: '#6b4423',
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    alignSelf: 'flex-start',
  },
  referenceLabelText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  dateTitleContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    padding: 12,
    borderRadius: 12,
    borderTopLeftRadius: 0,
  },
  referenceTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    textAlign: 'center',
  },
});

export default PreviousEvent;