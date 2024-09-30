import React from 'react';
import { View, Image, Text, StyleSheet } from 'react-native';
import { colors } from '../styles/colors';

const NewEvent = ({ event }) => {
  return (
    <View style={styles.container}>
      <Image
        source={{ uri: event?.illustration_url || 'https://via.placeholder.com/300' }}
        style={styles.image}
        resizeMode="cover"
      />
      <View style={styles.textContainer}>
        <Text style={styles.promptText}>l'événement</Text>
        <Text style={styles.titleText}>{event?.titre || 'Titre de l\'événement'}</Text>
        <Text style={styles.promptText}>est</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: 250,
    borderRadius: 10,
  },
  textContainer: {
    alignItems: 'center',
    marginTop: 10,
  },
  promptText: {
    fontSize: 18,
    color: colors.darkText,
    marginVertical: 5,
  },
  titleText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.accentColor,
    textAlign: 'center',
    marginVertical: 5,
  },
});

export default NewEvent;