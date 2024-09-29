import React from 'react';
import { View, Image, Text, StyleSheet } from 'react-native';

const NewEvent = ({ event }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{event?.titre}</Text>
      <Image
        source={{ uri: event?.illustration_url || 'https://via.placeholder.com/300' }}
        style={styles.image}
        resizeMode="cover"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    margin: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  image: {
    width: '100%',
    height: '100%',
  },
});

export default NewEvent;