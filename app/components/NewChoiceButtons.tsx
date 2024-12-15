import React from 'react'; 
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';

interface NewChoiceButtonsProps {
  onChoice: (choice: string) => void;
  disabled: boolean;
}

const NewChoiceButtons = ({ onChoice, disabled }: NewChoiceButtonsProps) => {
  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.button, styles.leftButton, disabled && styles.disabledButton]}
        onPress={() => onChoice('avant')}
        disabled={disabled}
      >
        <Text style={styles.buttonText}>AVANT</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, styles.rightButton, disabled && styles.disabledButton]}
        onPress={() => onChoice('après')}
        disabled={disabled}
      >
        <Text style={styles.buttonText}>APRÈS</Text>  
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: '25%',
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    zIndex: 10,
  },
  button: {
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    minWidth: 100,
  },
  leftButton: {
    marginLeft: 5,
  },
  rightButton: {
    marginRight: 5,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  disabledButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  }
});

export default NewChoiceButtons;