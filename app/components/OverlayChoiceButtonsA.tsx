/************************************************************************************
 * OverlayChoiceButtonsA.tsx
 *
 *  - Affiche deux boutons "avant" / "après".
 *  - Contrôle l'animation d'opacité selon isLevelPaused, isWaitingForCountdown,
 *    transitioning, etc.
 *  - Ajout d'un état `justAnswered` pour retarder le fade-in d'un petit surplus.
 ************************************************************************************/

import React, { useEffect, useRef, useState } from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface OverlayChoiceButtonsAProps {
  onChoice: (choice: string) => void;
  isLevelPaused: boolean;
  isWaitingForCountdown?: boolean;
  transitioning?: boolean;
}

const OverlayChoiceButtonsA: React.FC<OverlayChoiceButtonsAProps> = ({
  onChoice,
  isLevelPaused,
  isWaitingForCountdown = false,
  transitioning = false,
}) => {
  const [buttonClicked, setButtonClicked] = useState(false);
  const [justAnswered, setJustAnswered] = useState(false); // ← nouveau mini-verrou
  const fadeAnim = useRef(new Animated.Value(1)).current;

  // ─────────────────────────────────────────────────────────────────
  // A. Sur clique => onChoice
  // ─────────────────────────────────────────────────────────────────
  const handlePress = (choice: string) => {
    console.log('[OverlayChoiceButtonsA] handlePress =>', choice);

    // Vérifier si c'est cliquable
    if (!isLevelPaused && !transitioning && !isWaitingForCountdown && !buttonClicked && !justAnswered) {
      console.log('[OverlayChoiceButtonsA] => OK => setButtonClicked(true) + setJustAnswered(true)');
      setButtonClicked(true);
      setJustAnswered(true);
      onChoice(choice);

      // On prolonge le mini-verrou (justAnswered) un tout petit peu plus
      // que le reset du buttonClicked. (ex. 750ms)
      setTimeout(() => {
        console.log('[OverlayChoiceButtonsA] setJustAnswered(false) après 750ms');
        setJustAnswered(false);
      }, 750);

    } else {
      console.log(
        '[OverlayChoiceButtonsA] => CLIC IGNORÉ => conditions. isLevelPaused=',
        isLevelPaused,
        'transitioning=',
        transitioning,
        'isWaitingForCountdown=',
        isWaitingForCountdown,
        'buttonClicked=',
        buttonClicked,
        'justAnswered=',
        justAnswered
      );
    }
  };

  // ─────────────────────────────────────────────────────────────────
  // B. Après un clic, on remet buttonClicked à false au bout de 500ms
  // ─────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (buttonClicked) {
      console.log('[OverlayChoiceButtonsA] => buttonClicked=true => timer 500ms');
      const timer = setTimeout(() => {
        console.log('[OverlayChoiceButtonsA] => setButtonClicked(false)');
        setButtonClicked(false);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [buttonClicked]);

  // ─────────────────────────────────────────────────────────────────
  // C. Contrôle du fade : on fade OUT si l'une des conditions est vraie
  // ─────────────────────────────────────────────────────────────────
  useEffect(() => {
    console.log(
      '[OverlayChoiceButtonsA] useEffect => Checking fadeAnim conditions',
      '| isLevelPaused=',
      isLevelPaused,
      '| isWaitingForCountdown=',
      isWaitingForCountdown,
      '| transitioning=',
      transitioning,
      '| buttonClicked=',
      buttonClicked,
      '| justAnswered=',
      justAnswered
    );

    // Condition pour "fadeOut"
    const shouldFadeOut =
      isLevelPaused ||
      isWaitingForCountdown ||
      transitioning ||
      buttonClicked ||
      justAnswered; // ← on ajoute justAnswered ici

    if (shouldFadeOut) {
      console.log('[OverlayChoiceButtonsA] => FADING OUT (0)');
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      console.log('[OverlayChoiceButtonsA] => FADING IN (1)');
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [isLevelPaused, isWaitingForCountdown, transitioning, buttonClicked, justAnswered]);

  // ─────────────────────────────────────────────────────────────────
  // D. pointerEvents
  // ─────────────────────────────────────────────────────────────────
  const pointerEvents = (!isLevelPaused && !isWaitingForCountdown && !transitioning && !buttonClicked && !justAnswered)
    ? 'auto'
    : 'none';

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]} pointerEvents={pointerEvents}>
      <TouchableOpacity
        onPress={() => handlePress('avant')}
        activeOpacity={0.8}
        style={styles.button}
      >
        <LinearGradient
          colors={['#6e6e6e', '#5a5a5a', '#4a4a4a']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.buttonGradient}
        >
          <Text style={styles.buttonText}>AVANT</Text>
        </LinearGradient>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => handlePress('après')}
        activeOpacity={0.8}
        style={styles.button}
      >
        <LinearGradient
          colors={['#6e6e6e', '#5a5a5a', '#4a4a4a']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.buttonGradient}
        >
          <Text style={styles.buttonText}>APRÈS</Text>
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
};

export default OverlayChoiceButtonsA;

// Styles
const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginVertical: 10,
    width: '100%',
  },
  button: {
    borderRadius: 25,
    overflow: 'hidden',
    width: '40%',
  },
  buttonGradient: {
    padding: 12,
    alignItems: 'center',
    borderRadius: 25,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
});
