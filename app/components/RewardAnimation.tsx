// Based on your issue, the main problem lies in the `RewardAnimation` component and its `targetPosition`. This position might be undefined or improperly passed. Here's an approach to fix it:

import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Add validation for RewardType to ensure correct values
import { RewardType } from '../hooks/types'; // Adjust import if necessary
import { colors } from '../styles/colors';

interface RewardAnimationProps {
  type: RewardType;
  amount: number;
  targetPosition?: { x: number; y: number }; // Make targetPosition optional
  onComplete?: () => void; // onComplete should be optional
}

const RewardAnimation: React.FC<RewardAnimationProps> = ({
  type,
  amount,
  targetPosition = { x: 0, y: 0 }, // Default to (0, 0) if not provided
  onComplete,
}) => {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!targetPosition) {
      console.warn('Target position is undefined. Using default position {x: 0, y: 0}.');
    }

    console.log('[RewardAnimation] Starting animation with:', {
      type,
      amount,
      targetPosition,
    });

    const fadeIn = Animated.timing(opacity, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    });

    const moveAndFade = Animated.parallel([
      Animated.timing(translateY, {
        toValue: -50,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]);

    Animated.sequence([fadeIn, moveAndFade]).start(() => {
      console.log('[RewardAnimation] Animation completed');
      if (onComplete) {
        onComplete();
      }
    });
  }, [targetPosition, onComplete, opacity, translateY]);

  const getConfig = () => {
    switch (type) {
      case RewardType.POINTS:
        return {
          icon: 'star',
          color: colors.warningYellow,
        };
      case RewardType.EXTRA_LIFE:
        return {
          icon: 'heart',
          color: colors.incorrectRed,
        };
      case RewardType.STREAK_BONUS:
        return {
          icon: 'flame',
          color: colors.primary,
        };
      default:
        console.warn('Unknown RewardType. Falling back to default.');
        return {
          icon: 'star',
          color: colors.primary,
        };
    }
  };

  const config = getConfig();

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ translateY }],
          opacity,
          left: targetPosition?.x - 30,
          top: targetPosition?.y - 30,
        },
      ]}
    >
      <View style={[styles.bubble, { backgroundColor: config.color }]}>
        <Ionicons name={config.icon} size={20} color="white" style={styles.icon} />
        <Text style={styles.amount}>+{amount}</Text>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  bubble: {
    width: '100%',
    height: '100%',
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  icon: {
    marginBottom: 2,
  },
  amount: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
    position: 'absolute',
    bottom: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
});

export default RewardAnimation;
