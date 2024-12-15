import React, { useEffect, useRef } from 'react';
import { View, Image, Text, StyleSheet, Animated, TouchableOpacity, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../styles/colors';

const { width, height } = Dimensions.get('window');
const CARD_HEIGHT = height * 0.35;

interface AnimatedEventCardAProps {
  event: any;
  position: 'top' | 'bottom';
  onImageLoad?: () => void;
  showDate?: boolean;
  isCorrect?: boolean;
  onChoice?: (choice: string) => void;
  isSelectable?: boolean;
}

const AnimatedEventCardA: React.FC<AnimatedEventCardAProps> = ({
  event,
  position,
  onImageLoad,
  showDate = false,
  isCorrect,
  onChoice,
  isSelectable,
}) => {
  const dateScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (position === 'bottom' && showDate) {
      Animated.sequence([
        Animated.timing(dateScale, {
          toValue: 1.2,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(dateScale, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        })
      ]).start();
    }
  }, [showDate]);

  const getYearFromDate = (dateString: string): string => {
    try {
      if (/^\d{4}$/.test(dateString)) return dateString;
      if (dateString.includes('-')) return dateString.split('-')[0];
      return dateString;
    } catch (error) {
      console.error('Error extracting year from date:', error);
      return dateString;
    }
  };

  const renderEventTitle = () => (
    <View style={[styles.titleWrapper, position === 'top' ? styles.topTitleWrapper : styles.bottomTitleWrapper]}>
      <Text style={[styles.title, position === 'top' ? styles.titleTop : styles.titleBottom]} numberOfLines={2}>
        {event?.titre}
      </Text>
    </View>
  );

  const renderButtons = () => {
    if (position === 'bottom' && !showDate) {
      return (
        <View style={styles.buttonsContainer}>
          <TouchableOpacity 
            style={[styles.button, styles.buttonLeft]}
            onPress={() => onChoice?.('avant')}
            disabled={!isSelectable}
          >
            <Text style={styles.buttonText}>avant</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.button, styles.buttonRight]}
            onPress={() => onChoice?.('après')}
            disabled={!isSelectable}
          >
            <Text style={styles.buttonText}>après</Text>
          </TouchableOpacity>
        </View>
      );
    }
    return null;
  };

  const renderDate = () => {
    if ((position === 'top' || showDate) && event?.date) {
      const overlayStyle = [
        styles.dateOverlay,
        position === 'top' ? styles.topOverlay : null,
        position === 'bottom' && isCorrect !== undefined && (
          isCorrect ? styles.correctOverlay : styles.incorrectOverlay
        )
      ];

      return (
        <Animated.View style={overlayStyle}>
          <Animated.Text 
            style={[
              styles.date,
              { transform: [{ scale: dateScale }] }
            ]}
          >
            {getYearFromDate(event.date)}
          </Animated.Text>
        </Animated.View>
      );
    }
    return null;
  };

  return (
    <View style={styles.container}>
      {position === 'top' && renderEventTitle()}
      <View style={[styles.cardFrame, position === 'bottom' && styles.bottomCardFrame]}>
        <View style={styles.cardContent}>
          <Image
            source={{ uri: event?.illustration_url }}
            style={styles.image}
            onLoad={onImageLoad}
            resizeMode="cover"
          />
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.8)']}
            style={styles.gradient}
          />
          {renderDate()}
        </View>
      </View>
      {position === 'bottom' && (
        <>
          {renderEventTitle()}
          {renderButtons()}
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 8,
  },
  cardFrame: {
    height: CARD_HEIGHT,
    borderRadius: 20,
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    overflow: 'hidden',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  bottomCardFrame: {
    marginBottom: 60, // Space for buttons
  },
  cardContent: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
  },
  image: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
  },
  gradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '40%',
  },
  titleWrapper: {
    width: '100%',
    padding: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 10,
  },
  topTitleWrapper: {
    marginBottom: 8,
  },
  bottomTitleWrapper: {
    marginTop: 8,
    marginBottom: 8,
  },
  title: {
    color: 'white',
    textAlign: 'center',
    fontSize: 20,
    fontWeight: 'bold',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  titleTop: {
    letterSpacing: 0.5,
  },
  titleBottom: {
    letterSpacing: 0,
  },
  dateOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  topOverlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  correctOverlay: {
    backgroundColor: 'rgba(39, 174, 96, 0.8)',
  },
  incorrectOverlay: {
    backgroundColor: 'rgba(231, 76, 60, 0.8)',
  },
  date: {
    color: 'white',
    fontSize: 48,
    fontWeight: 'bold',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    position: 'absolute',
    bottom: 10,
    left: 0,
    right: 0,
  },
  button: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
    width: '45%',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  buttonLeft: {
    transform: [{ rotate: '-2deg' }],
  },
  buttonRight: {
    transform: [{ rotate: '2deg' }],
  },
  buttonText: {
    color: '#333',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: 1,
  }
});

export default AnimatedEventCardA;