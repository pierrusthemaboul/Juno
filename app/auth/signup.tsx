import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Platform
} from 'react-native';
import { supabase } from '../../supabaseClients';
import { router } from 'expo-router';

const THEME = {
  primary: '#050B1F',
  secondary: '#0A173D',
  accent: '#FFCC00',
  text: '#FFFFFF',
  background: {
    dark: '#020817',
    medium: '#050B1F',
    light: '#0A173D'
  },
  button: {
    primary: ['#1D5F9E', '#0A173D'],
    secondary: ['#FFBF00', '#CC9900'],
    tertiary: ['#0A173D', '#1D5F9E']
  }
};

export default function SignUp() {
  const [nickname, setNickname] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isSigningUp, setIsSigningUp] = useState(false);

  const handleSignUp = async () => {
    setIsSigningUp(true);
    setErrorMessage('');
    setSuccessMessage('');

    if (!nickname.trim()) {
      setErrorMessage('Le pseudonyme est obligatoire.');
      setIsSigningUp(false);
      return;
    }

    try {
      // 1. Inscription de l'utilisateur
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: email.trim(),
        password: password,
        options: {
          data: {
            display_name: nickname.trim(),
          },
        },
      });

      if (signUpError) {
        setErrorMessage(signUpError.message);
        return;
      }

      if (!data.user) {
        setErrorMessage('Erreur lors de la création du compte.');
        return;
      }

      // 2. Création du profil
      const { error: profileError } = await supabase
        .from('profiles')
        .insert([
          {
            id: data.user.id,
            display_name: nickname.trim(),
            created_at: new Date().toISOString(),
          }
        ]);

      if (profileError) {
        setErrorMessage('Erreur lors de la création du profil.');
        return;
      }

      // 3. Succès
      setSuccessMessage('Compte créé avec succès!');

      // 4. Redirection après un court délai
      setTimeout(() => {
        router.replace('/(tabs)');
      }, 1500);

    } catch (error) {
      setErrorMessage('Une erreur inattendue est survenue.');
    } finally {
      setIsSigningUp(false);
    }
  };

  return (
    <ScrollView 
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={styles.title}>Inscription</Text>

      <TextInput
        style={styles.input}
        placeholder="Pseudonyme"
        placeholderTextColor={`${THEME.text}66`}
        value={nickname}
        onChangeText={setNickname}
        autoCapitalize="none"
        autoComplete="username"
      />

      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor={`${THEME.text}66`}
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        autoComplete="email"
      />

      <TextInput
        style={styles.input}
        placeholder="Mot de passe"
        placeholderTextColor={`${THEME.text}66`}
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        autoComplete="password-new"
      />

      {errorMessage ? (
        <Text style={styles.error}>{errorMessage}</Text>
      ) : null}

      {successMessage ? (
        <Text style={styles.success}>{successMessage}</Text>
      ) : null}

      <TouchableOpacity
        style={[styles.button, isSigningUp && { opacity: 0.7 }]}
        onPress={handleSignUp}
        disabled={isSigningUp}
      >
        <Text style={styles.buttonText}>
          {isSigningUp ? "Création du compte..." : "S'inscrire"}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: THEME.background.dark,
    padding: 20,
    justifyContent: 'center',
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
  },
  title: {
    fontSize: 28,
    color: THEME.accent,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 30,
  },
  input: {
    backgroundColor: THEME.secondary,
    color: THEME.text,
    fontSize: 16,
    padding: 12,
    marginBottom: 15,
    borderRadius: 8,
    width: '100%',
  },
  button: {
    backgroundColor: THEME.button.secondary[0],
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 15,
    width: '100%',
  },
  buttonText: {
    color: THEME.text,
    fontSize: 16,
    fontWeight: 'bold',
  },
  error: {
    color: 'red',
    marginVertical: 10,
    textAlign: 'center',
  },
  success: {
    color: '#4CAF50',
    marginVertical: 10,
    textAlign: 'center',
    fontWeight: 'bold',
  },
});
