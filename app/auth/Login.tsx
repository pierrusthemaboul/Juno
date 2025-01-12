import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Switch,
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

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [stayConnected, setStayConnected] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const handleLogin = async () => {
    console.log('--- handleLogin START ---');
    setIsLoggingIn(true);
    setErrorMessage('');

    try {
      const { data: { user, session }, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password,
      });

      if (error) {
        console.error('Erreur lors de handleLogin :', error.message);
        if (error.message.toLowerCase().includes('invalid login credentials')) {
          setErrorMessage(
            "Identifiants incorrects ou compte inexistant.\nVeuillez vérifier vos informations ou créer un compte."
          );
        } else {
          setErrorMessage(error.message);
        }
        return;
      }

      if (session) {
        console.log('Session créée avec succès');
        if (stayConnected) {
          await supabase.auth.setSession(session);
        }
        // Redirection vers l'index avec reset complet de la navigation
        router.replace('/(tabs)');
      } else {
        console.log('Pas de session créée');
        setErrorMessage("Erreur lors de la connexion. Veuillez réessayer.");
      }
    } catch (err) {
      console.error('Erreur attrapée lors de handleLogin :', err);
      setErrorMessage('Une erreur est survenue. Veuillez réessayer.');
    } finally {
      setIsLoggingIn(false);
      console.log('--- handleLogin END ---');
    }
  };

  const handleGoToSignUp = () => {
    router.push('/auth/signup');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Connexion</Text>

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
        autoComplete="password"
      />

      <View style={styles.stayConnectedContainer}>
        <Switch
          trackColor={{ false: '#767577', true: THEME.accent }}
          thumbColor={stayConnected ? THEME.secondary : '#f4f3f4'}
          ios_backgroundColor="#3e3e3e"
          value={stayConnected}
          onValueChange={setStayConnected}
        />
        <Text style={styles.stayConnectedText}>Rester connecté</Text>
      </View>

      {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}

      <TouchableOpacity
        style={[styles.button, isLoggingIn && { opacity: 0.7 }]}
        onPress={handleLogin}
        disabled={isLoggingIn}
      >
        <Text style={styles.buttonText}>
          {isLoggingIn ? 'Connexion...' : 'Se connecter'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.createAccountButton}
        onPress={handleGoToSignUp}
      >
        <Text style={styles.createAccountText}>Créer un compte</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  stayConnectedContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  stayConnectedText: {
    color: THEME.text,
    marginLeft: 8,
    fontSize: 16,
  },
  errorText: {
    color: 'red',
    marginVertical: 10,
    textAlign: 'center',
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
  createAccountButton: {
    marginTop: 20,
    alignItems: 'center',
  },
  createAccountText: {
    color: THEME.accent,
    fontSize: 16,
    textDecorationLine: 'underline',
  },
});