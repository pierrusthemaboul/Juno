import React from 'react';
import { View, Image, Text, StyleSheet } from 'react-native';
import { colors } from '../styles/colors';

const NewEvent = ({ event, onImageLoad, showDate, isCorrect }) => {
  return (
    <View style={styles.container}>
      <Image
        source={{ uri: event?.illustration_url || 'https://via.placeholder.com/300' }}
        style={styles.image}
        resizeMode="cover"
        onLoad={onImageLoad}
      />
      <Text style={styles.title}>{event?.titre}</Text>
      {showDate && (
        <Text style={[
          styles.date,
          isCorrect ? styles.correctDate : styles.incorrectDate
        ]}>
          {event?.date_formatee}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    width: '100%',
    height: '80%',
    borderRadius: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.veryDarkText,
    marginTop: 10,
    textAlign: 'center',
  },
  date: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 5,
    textAlign: 'center',
  },
  correctDate: {
    color: colors.correctGreen,
  },
  incorrectDate: {
    color: colors.incorrectRed,
  },
});

export default NewEvent;