import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../styles/colors';

const UserInfo = ({ user }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>{user.name}</Text>
      <Text style={styles.text}>Points: {user.points}</Text>
      <Text style={styles.text}>Vies: {user.lives}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '70%',
  },
  text: {
    color: colors.accent,
    fontSize: 14,
    fontWeight: 'bold',
  },
});

export default UserInfo;