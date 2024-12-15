// OverlayChoiceButtonsA.tsx
import React, { useEffect, useRef } from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Animated } from 'react-native';

interface OverlayChoiceButtonsAProps {
  onChoice: (choice: string) => void;
  disabled: boolean;
  isLevelPaused: boolean;
}

const OverlayChoiceButtonsA: React.FC<OverlayChoiceButtonsAProps> = ({ 
  onChoice, 
  disabled,
  isLevelPaused 
}) => {
  const fadeAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (disabled || isLevelPaused) {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      fadeAnim.setValue(1);
    }
  }, [disabled, isLevelPaused]);

  const handlePress = (choice: string) => {
    if (!disabled && !isLevelPaused) {
      onChoice(choice);
    }
  };

  const buttonEnabled = !disabled && !isLevelPaused;

  return (
    <Animated.View 
      style={[styles.container, { opacity: fadeAnim }]}
      pointerEvents={buttonEnabled ? 'auto' : 'none'}
    >
      <TouchableOpacity
        style={[styles.button, styles.buttonLeft]}
        onPress={() => handlePress('avant')}
        disabled={!buttonEnabled}
        hitSlop={{top: 20, bottom: 20, left: 20, right: 20}}
      >
        <View style={styles.buttonInner}>
          <Text style={styles.buttonText}>AVANT</Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, styles.buttonRight]}
        onPress={() => handlePress('après')}
        disabled={!buttonEnabled}
        hitSlop={{top: 20, bottom: 20, left: 20, right: 20}}
      >
        <View style={styles.buttonInner}>
          <Text style={styles.buttonText}>APRÈS</Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  button: {
    width: '45%',  // Réduit de 100px à une valeur relative
  },
  buttonInner: {
    backgroundColor: 'rgba(0, 0, 0, 0.6)',  // Rendu plus transparent (0.7 -> 0.6)
    paddingVertical: 8,  // Réduit de 10 à 8
    paddingHorizontal: 15,
    borderRadius: 20,
    alignItems: 'center',
    borderWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  buttonLeft: {
    transform: [{ rotate: '-1deg' }],  // Inclinaison réduite (-2deg -> -1deg)
  },
  buttonRight: {
    transform: [{ rotate: '1deg' }],  // Inclinaison réduite (2deg -> 1deg)
  },
  buttonText: {
    color: 'rgba(255, 255, 255, 0.9)',  // Légèrement plus transparent
    fontSize: 15,  // Réduit de 16 à 15
    fontWeight: '600',  // Réduit de 'bold' à '600'
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
});

export default OverlayChoiceButtonsA;