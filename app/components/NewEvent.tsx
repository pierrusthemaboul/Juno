import React from 'react';
import { View, Image, Text, StyleSheet } from 'react-native';
import { colors } from '../styles/colors';

const NewEvent = ({ event, onImageLoad }) => {
  return (
    <View style={styles.container}>
      <Image
        source={{ uri: event?.illustration_url || 'https://via.placeholder.com/300' }}
        style={styles.image}
        resizeMode="cover"
        onLoad={onImageLoad}
      />
      <Text style={styles.title}>{event?.titre}</Text>
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
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.veryDarkText,
    marginTop: 10,
    textAlign: 'center',
  },
});

export default NewEvent;