import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { colors } from '../styles/colors';

const ChoiceButtons = ({ onChoice, disabled }) => {
  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={[styles.button, styles.beforeButton, disabled && styles.disabledButton]} 
        onPress={() => onChoice('avant')}
        disabled={disabled}
      >
        <Text style={styles.buttonText}>Avant</Text>
      </TouchableOpacity>
      <TouchableOpacity 
        style={[styles.button, styles.afterButton, disabled && styles.disabledButton]} 
        onPress={() => onChoice('après')}
        disabled={disabled}
      >
        <Text style={styles.buttonText}>Après</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 10,
    marginTop: 15,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  beforeButton: {
    backgroundColor: colors.beforeButton,
    transform: [{ rotate: '-3deg' }],
  },
  afterButton: {
    backgroundColor: colors.afterButton,
    transform: [{ rotate: '3deg' }],
  },
  disabledButton: {
    backgroundColor: colors.disabledButton,
    elevation: 0,
    shadowOpacity: 0,
    transform: [{ rotate: '0deg' }],
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default ChoiceButtons;