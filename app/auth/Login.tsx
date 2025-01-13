import React, { useState, useEffect, useLayoutEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Switch,
  StyleSheet,
  Platform,
  SafeAreaView,
  StatusBar,
  Dimensions
} from 'react-native';
import { supabase } from '../../supabaseClients';
import { router, useNavigation, usePathname, useSegments } from 'expo-router';

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
  const navigation = useNavigation();
  const pathname = usePathname();
  const segments = useSegments();
  const window = Dimensions.get('window');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [stayConnected, setStayConnected] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // useLayoutEffect pour la configuration de la navigation
  useLayoutEffect(() => {
    const options = {
      headerShown: false,
      title: '',
      headerTitle: '',
      header: null,
    };
    navigation.setOptions(options);
  }, [navigation]);

  // useEffect pour le cycle de vie
  useEffect(() => {
    StatusBar.setBarStyle('light-content');
    if (Platform.OS === 'android') {
      StatusBar.setBackgroundColor(THEME.background.dark);
    }

    return () => {
      // Cleanup si nécessaire
    };
  }, []);

  const handleLogin = async () => {
    setIsLoggingIn(true);
    setErrorMessage('');

    try {
      const { data: { user, session }, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password,
      });

      if (error) {
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
        if (stayConnected) {
          await supabase.auth.setSession(session);
        }
        router.replace('/(tabs)');
      } else {
        setErrorMessage("Erreur lors de la connexion. Veuillez réessayer.");
      }
    } catch (err) {
      setErrorMessage('Une erreur est survenue. Veuillez réessayer.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleGoToSignUp = () => {
    router.push('/auth/signup');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.title}>Connexion</Text>

        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor={`${THEME.text}66`}
          value={email}
          onChangeText={(text) => setEmail(text)}
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
          onChangeText={(text) => setPassword(text)}
          autoComplete="password"
        />

        <View style={styles.stayConnectedContainer}>
          <Switch
            trackColor={{ false: '#767577', true: THEME.accent }}
            thumbColor={stayConnected ? THEME.secondary : '#f4f3f4'}
            ios_backgroundColor="#3e3e3e"
            value={stayConnected}
            onValueChange={(value) => setStayConnected(value)}
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: THEME.background.dark,
  },
  container: {
    flex: 1,
    backgroundColor: THEME.background.dark,
    padding: 20,
    justifyContent: 'center',
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
