import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Switch } from 'react-native';
import { supabase } from '../../supabaseClients';
import { useRouter } from 'expo-router';
import styles from '../styles/loginStyles';

const LoginScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [stayConnected, setStayConnected] = useState(false);
  const router = useRouter();

  const handleLogin = async () => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      });

      if (error) {
        console.error('Erreur lors de handleLogin:', error.message);
        setErrorMessage(error.message);
      } else {
        console.log('Utilisateur connecté:', data);
        if (stayConnected) {
          await supabase.auth.setSession(data.session);
        }
        router.replace('/');
      }
    } catch (err) {
      console.error('Erreur lors de handleLogin:', err);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Se connecter</Text>
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        style={styles.input}
        placeholder="Mot de passe"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      <View style={styles.stayConnectedContainer}>
        <Switch
          value={stayConnected}
          onValueChange={setStayConnected}
        />
        <Text style={styles.stayConnectedText}>Rester connecté</Text>
      </View>
      {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}
      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Se connecter</Text>
      </TouchableOpacity>
    </View>
  );
};

export default LoginScreen;