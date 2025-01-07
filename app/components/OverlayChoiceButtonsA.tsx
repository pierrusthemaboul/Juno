/************************************************************************************
 * 5. COMPOSANT : OverlayChoiceButtonsA
 *
 * 5.A. Description
 *     Affiche deux boutons "avant"/"après" superposés. Gère leur opacité en fonction
 *     du statut "disabled" ou "isLevelPaused".
 *
 * 5.B. Props
 *     @interface OverlayChoiceButtonsAProps
 *     @property {(choice: string) => void} onChoice
 *     @property {boolean} disabled
 *     @property {boolean} isLevelPaused
 ************************************************************************************/

import React, { useEffect, useRef } from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Animated } from 'react-native';

/**
 * 5.C. Composant principal OverlayChoiceButtonsA
 * @function OverlayChoiceButtonsA
 * @param {OverlayChoiceButtonsAProps} props
 * @returns {JSX.Element}
 */
const OverlayChoiceButtonsA: React.FC<OverlayChoiceButtonsAProps> = ({
  onChoice,
  disabled,
  isLevelPaused
}) => {
  const fadeAnim = useRef(new Animated.Value(1)).current;

  // 5.C.1. useEffect => Animation d’opacité
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

  // 5.C.2. handlePress
  const handlePress = (choice: string) => {
    if (!disabled && !isLevelPaused) {
      console.log('Choix:', choice);
      onChoice(choice);
    }
  };

  // 5.C.3. Rendu
  return (
    <Animated.View
      style={[styles.container, { opacity: fadeAnim }]}
      pointerEvents={!disabled && !isLevelPaused ? 'auto' : 'none'}
    >
      <TouchableOpacity
        style={[styles.button, styles.buttonLeft]}
        onPress={() => handlePress('avant')}
        disabled={disabled || isLevelPaused}
        activeOpacity={0.7}
        hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
      >
        <View style={styles.buttonInner}>
          <Text style={styles.buttonText}>AVANT</Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, styles.buttonRight]}
        onPress={() => handlePress('après')}
        disabled={disabled || isLevelPaused}
        activeOpacity={0.7}
        hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
      >
        <View style={styles.buttonInner}>
          <Text style={styles.buttonText}>APRÈS</Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

// 5.D. Styles
const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    width: '100%',
  },
  button: {
    width: '45%',
    maxWidth: 180,
  },
  buttonInner: {
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  buttonLeft: {
    transform: [{ rotate: '-1deg' }],
  },
  buttonRight: {
    transform: [{ rotate: '1deg' }],
  },
  buttonText: {
    color: 'rgba(255, 255, 255, 0.95)',
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },
});

export default OverlayChoiceButtonsA;
