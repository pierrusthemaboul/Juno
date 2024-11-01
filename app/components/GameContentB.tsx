import React, { useEffect } from 'react';
import { View, Text, ActivityIndicator, Animated, StyleSheet } from 'react-native';
import UserInfo from './UserInfo';
import Countdown from './Countdown';
import GameLayoutB from './GameLayoutB';
import GameOverModal from './GameOverModal';
import { colors } from '../styles/colors';

interface GameContentBProps {
  user: any;
  timeLeft: number;
  loading: boolean;
  error: string | null;
  event1: any;
  event2: any;
  isGameOver: boolean;
  showDates: boolean;
  isCorrect?: boolean;
  isImageLoaded: boolean;
  handleChoice: (eventId: string) => void;
  handleImageLoad: (imageNumber: 1 | 2) => void;
  handleRestart: () => void;
}

const GameContentB: React.FC<GameContentBProps> = ({ 
  user, 
  timeLeft, 
  loading, 
  error, 
  event1,
  event2,
  isGameOver,
  showDates,
  isCorrect,
  isImageLoaded,
  handleChoice,
  handleImageLoad,
  handleRestart
}) => {
  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    console.log('GameContentB: Component mounted/updated with props:', {
      hasEvent1: !!event1,
      hasEvent2: !!event2,
      loading,
      isImageLoaded,
      showDates
    });

    if (event1 && event2) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();
    }
  }, [event1, event2]);

  // Nouvelle méthode de rendu conditionnel
  const renderContent = () => {
    if (loading) {
      console.log('GameContentB: Rendering loading state');
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Chargement des événements...</Text>
        </View>
      );
    }

    if (error) {
      console.log('GameContentB: Rendering error state:', error);
      return (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      );
    }

    if (!event1 || !event2) {
      console.log('GameContentB: Events not yet loaded');
      return (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Préparation des événements...</Text>
        </View>
      );
    }

    console.log('GameContentB: Rendering main game content');
    return (
      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        <GameLayoutB
          event1={event1}
          event2={event2}
          onImageLoad={handleImageLoad}
          onChoice={handleChoice}
          showDates={showDates}
          isCorrect={isCorrect}
          isImageLoaded={isImageLoaded}
        />
      </Animated.View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <UserInfo user={user} />
        <Countdown timeLeft={timeLeft} />
      </View>

      {renderContent()}

      <GameOverModal
        isVisible={isGameOver}
        score={user.points}
        onRestart={handleRestart}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  content: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: colors.text,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  errorText: {
    color: colors.incorrectRed,
    fontSize: 18,
    textAlign: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    padding: 20,
    borderRadius: 10,
  }
});

export default GameContentB;