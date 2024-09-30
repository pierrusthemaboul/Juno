import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const Countdown = ({ timeLeft }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>{timeLeft}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
    container: {
      backgroundColor: '#FF4081',
      width: 40,
      height: 40,
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: 20,
    },
    text: {
      color: 'white',
      fontSize: 20,
      fontWeight: 'bold',
    },
  });

export default Countdown;