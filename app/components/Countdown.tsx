import React from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';

interface CountdownProps {
  timeLeft: number;
}

const Countdown: React.FC<CountdownProps> = ({ timeLeft }) => {
  const getColor = () => {
    if (timeLeft > 14) return '#4ECDC4';
    if (timeLeft > 7) return '#FFA726';
    return '#FF5252';
  };

  return (
    <View style={[styles.container, { backgroundColor: getColor() }]}>
      <Text style={styles.text}>{timeLeft}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.23,
    shadowRadius: 2.62,
  },
  text: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
  }
});

export default Countdown;