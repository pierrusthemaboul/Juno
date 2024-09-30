import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { colors } from '../styles/colors';

const PreviousEvent = ({ event }) => {
  return (
    <View style={styles.container}>
      <View style={styles.textContainer}>
        <Text style={styles.title}>{event?.titre || 'Titre de l\'événement précédent'}</Text>
        <Text style={styles.date}>{event?.date || 'Date de l\'événement précédent'}</Text>
      </View>
      <Image
        source={{ uri: event?.illustration_url || 'https://via.placeholder.com/100' }}
        style={styles.image}
        resizeMode="cover"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: 10,
    backgroundColor: colors.lightPink,
    borderRadius: 10,
    alignItems: 'center',
  },
  textContainer: {
    flex: 1,
    marginRight: 10,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'black',
    marginBottom: 5,
  },
  date: {
    fontSize: 14,
    color: 'black',
  },
  image: {
    width: 80,  // Augmenté de 60 à 80
    height: 80, // Augmenté de 60 à 80
    borderRadius: 5,
  },
});

export default PreviousEvent;