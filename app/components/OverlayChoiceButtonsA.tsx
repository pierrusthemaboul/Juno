/************************************************************************************
 * 5. COMPOSANT : OverlayChoiceButtonsA
 *
 * 5.A. Description
 *     Affiche deux boutons "avant"/"après" superposés. Gère leur opacité en fonction
 *     du statut "isLevelPaused", de l'état "buttonClicked" et de "isWaitingForCountdown"
 *
 * 5.B. Props
 *     @interface OverlayChoiceButtonsAProps
 *     @property {(choice: string) => void} onChoice
 *     @property {boolean} isLevelPaused
 *     @property {boolean} isWaitingForCountdown
 ************************************************************************************/

import React, { useEffect, useRef, useState } from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

/**
 * 5.C. Composant principal OverlayChoiceButtonsA
 * @function OverlayChoiceButtonsA
 * @param {OverlayChoiceButtonsAProps} props
 * @returns {JSX.Element}
 */
const OverlayChoiceButtonsA: React.FC<OverlayChoiceButtonsAProps> = ({
  onChoice,
  isLevelPaused,
  isWaitingForCountdown,
}) => {
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const [buttonClicked, setButtonClicked] = useState(false);

  // Animation d'opacité (Correction de l'ordre des conditions)
  useEffect(() => {
    if (isWaitingForCountdown || isLevelPaused || buttonClicked) {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [isLevelPaused, buttonClicked, isWaitingForCountdown]);

  // Réinitialiser buttonClicked après un certain délai
  useEffect(() => {
    if (buttonClicked) {
      const timer = setTimeout(() => {
        setButtonClicked(false);
      }, 500); // Réinitialise buttonClicked après 500ms

      return () => clearTimeout(timer);
    }
  }, [buttonClicked]);

  const handlePress = (choice: string) => {
    if (!isLevelPaused) {
      setButtonClicked(true); // Déclenche l'animation de disparition
      onChoice(choice);
    }
  };

  return (
    <Animated.View
      style={[styles.container, { opacity: fadeAnim }]}
      pointerEvents={
        !isLevelPaused && !buttonClicked && !isWaitingForCountdown
          ? 'auto'
          : 'none'
      }
    >
      <TouchableOpacity
        onPress={() => handlePress('avant')}
        activeOpacity={0.8}
        style={styles.button}
      >
        <LinearGradient
          colors={['#4c669f', '#3b5998', '#192f6a']}
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
          colors={['#4c669f', '#3b5998', '#192f6a']}
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

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 15,
    width: '100%',
    marginBottom: 20, // Ajout d'un espacement en bas des boutons
    marginTop: 30, // Marge ajoutée au-dessus des boutons
  },
  button: {
    borderRadius: 25,
    overflow: 'hidden', // Assure que le dégradé ne dépasse pas du border radius
    width: '40%', // Ajustement de la largeur des boutons
  },
  buttonGradient: {
    padding: 12, // Réduction du padding pour un aspect moins large
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
    backgroundColor: 'transparent', // Fond transparent pour le texte
  },
});

export default OverlayChoiceButtonsA;