import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { colors } from '../styles/colors';

const ChoiceButtons = ({ onChoice }) => {
  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.button} onPress={() => onChoice('avant')}>
        <Text style={styles.buttonText}>Avant</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.button} onPress={() => onChoice('après')}>
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
    backgroundColor: colors.lightPink,
    padding: 15,
    borderRadius: 25,
    width: '40%',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  buttonText: {
    color: colors.softGray,
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default ChoiceButtons;