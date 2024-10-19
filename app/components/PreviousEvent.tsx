import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { colors } from '../styles/colors';

const PreviousEvent = ({ event }) => {
  return (
    <View style={styles.container}>
      <View style={styles.textContainer}>
        <Text style={styles.title}>{event?.titre || 'Titre de l\'événement précédent'}</Text>
        <Text style={styles.date}>{event?.date_formatee || 'Date de l\'événement précédent'}</Text>
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
    padding: 15,
    backgroundColor: colors.lightPink,
    borderRadius: 10,
    alignItems: 'center',
  },
  textContainer: {
    flex: 1,
    marginRight: 15,
  },
  title: {
    fontSize: 20, // Augmenté pour un titre plus gros
    fontWeight: 'bold',
    color: colors.veryDarkText,
    marginBottom: 8,
  },
  date: {
    fontSize: 16, // Augmenté pour une date plus grande
    color: colors.darkText,
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: 8,
  },
});

export default PreviousEvent;