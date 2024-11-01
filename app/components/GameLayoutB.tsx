import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, Dimensions, Animated } from 'react-native';
import AnimatedEventCard from './AnimatedEventCard';
import { colors } from '../styles/colors';

const { height, width } = Dimensions.get('window');

interface GameLayoutBProps {
  event1: any;
  event2: any;
  onImageLoad?: (imageNumber: 1 | 2) => void;
  onChoice: (chosenEventId: string) => void;
  showDates?: boolean;
  isCorrect?: boolean;
  isImageLoaded: boolean;
}

const GameLayoutB: React.FC<GameLayoutBProps> = ({
  event1,
  event2,
  onImageLoad,
  onChoice,
  showDates = false,
  isCorrect,
  isImageLoaded,
}) => {
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [previousEvents, setPreviousEvents] = useState<{ event1: any; event2: any } | null>(null);
  
  // Animations pour les cartes actuelles
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const card1TranslateX = useRef(new Animated.Value(-width)).current;
  const card2TranslateX = useRef(new Animated.Value(width)).current;
  const selectionScale = useRef(new Animated.Value(1)).current;
  
  const availableHeight = height - 100;
  const cardHeight = (availableHeight / 2) * 0.98;

  useEffect(() => {
    if (event1?.id && event2?.id) {
      if (previousEvents && (previousEvents.event1.id !== event1.id || previousEvents.event2.id !== event2.id)) {
        animateCardTransition();
      } else if (!previousEvents) {
        animateCardsEntry();
      }
      setPreviousEvents({ event1, event2 });
    }
  }, [event1?.id, event2?.id]);

  const animateCardTransition = () => {
    // Animation de sortie
    Animated.parallel([
      Animated.timing(card1TranslateX, {
        toValue: width,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(card2TranslateX, {
        toValue: -width,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      })
    ]).start(() => {
      // Reset positions
      card1TranslateX.setValue(-width);
      card2TranslateX.setValue(width);
      fadeAnim.setValue(1);
      setSelectedEventId(null);
      
      // Animation d'entrée
      animateCardsEntry();
    });
  };

  const animateCardsEntry = () => {
    Animated.parallel([
      Animated.spring(card1TranslateX, {
        toValue: 0,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.spring(card2TranslateX, {
        toValue: 0,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      })
    ]).start();
  };

  const handleSelect = (eventId: string) => {
    if (!isSelectable) return;
    setSelectedEventId(eventId);
    onChoice(eventId);

    // Animation de sélection avec effet de rebond
    Animated.sequence([
      Animated.timing(selectionScale, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.spring(selectionScale, {
        toValue: 1,
        friction: 3,
        tension: 40,
        useNativeDriver: true,
      })
    ]).start();
  };

  const isSelectable = !showDates && isImageLoaded;

  const getCardStyle = (position: 'left' | 'right', eventId: string) => {
    const isSelected = selectedEventId === eventId;
    const translateX = position === 'left' ? card1TranslateX : card2TranslateX;

    return {
      transform: [
        { translateX },
        { scale: isSelected ? selectionScale : 1 }
      ],
      opacity: fadeAnim,
    };
  };

  if (!event1 || !event2) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.cardsContainer}>
        <Animated.View style={[
          styles.cardWrapper,
          { height: cardHeight },
          getCardStyle('left', event1.id)
        ]}>
          <AnimatedEventCard
            event={event1}
            position="left"
            onSelect={() => handleSelect(event1.id)}
            onImageLoad={() => onImageLoad?.(1)}
            showDate={showDates}
            isCorrect={isCorrect}
            isSelected={selectedEventId === event1.id}
            isSelectable={isSelectable}
          />
        </Animated.View>

        <Animated.View style={[
          styles.cardWrapper,
          { height: cardHeight },
          getCardStyle('right', event2.id)
        ]}>
          <AnimatedEventCard
            event={event2}
            position="right"
            onSelect={() => handleSelect(event2.id)}
            onImageLoad={() => onImageLoad?.(2)}
            showDate={showDates}
            isCorrect={isCorrect}
            isSelected={selectedEventId === event2.id}
            isSelectable={isSelectable}
          />
        </Animated.View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
    paddingTop: 20,
  },
  cardsContainer: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  cardWrapper: {
    width: '95%',
    alignItems: 'center',
    marginVertical: 10,
  },
});

export default GameLayoutB;