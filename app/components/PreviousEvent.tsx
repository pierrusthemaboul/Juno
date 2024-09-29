import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const PreviousEvent = ({ event }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{event?.titre || 'Titre de l\'événement précédent'}</Text>
      <Text style={styles.date}>{event?.date || 'Date de l\'événement précédent'}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 10,
    backgroundColor: '#e0e0e0',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  date: {
    fontSize: 16,
  },
});

export default PreviousEvent;