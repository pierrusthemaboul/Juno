import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Dimensions } from 'react-native';

interface ChoiceButtonsProps {
  onChoice: (choice: 'avant' | 'après') => void;
  disabled?: boolean;
}

const { width } = Dimensions.get('window');

const ChoiceButtons: React.FC<ChoiceButtonsProps> = ({ onChoice, disabled = false }) => {
  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={[styles.button, styles.beforeButton, disabled && styles.disabledButton]}
        onPress={() => onChoice('avant')}
        disabled={disabled}
      >
        <Text style={[styles.buttonText, disabled && styles.disabledText]}>
          Avant
        </Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={[styles.button, styles.afterButton, disabled && styles.disabledButton]}
        onPress={() => onChoice('après')}
        disabled={disabled}
      >
        <Text style={[styles.buttonText, disabled && styles.disabledText]}>
          Après
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: width * 0.9,
    paddingHorizontal: 20,
  },
  button: {
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 25,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    width: width * 0.35,
  },
  beforeButton: {
    backgroundColor: '#FF6B6B',
    transform: [{ rotate: '-3deg' }],
  },
  afterButton: {
    backgroundColor: '#4ECDC4',
    transform: [{ rotate: '3deg' }],
  },
  disabledButton: {
    backgroundColor: '#CCCCCC',
    elevation: 0,
    transform: [{ rotate: '0deg' }],
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  disabledText: {
    color: '#999999',
  },
});

export default ChoiceButtons;