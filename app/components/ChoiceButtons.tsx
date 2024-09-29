import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';

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
  },
  button: {
    backgroundColor: '#4a90e2',
    padding: 15,
    borderRadius: 5,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default ChoiceButtons;