import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ImageBackground, StatusBar, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '../../supabaseClients';
import styles from '../styles/indexStyles';
import { LinearGradient } from 'expo-linear-gradient';
import { Session, User } from '@supabase/supabase-js';

export default function HomeScreen() {
  const [user, setUser] = useState<User | null>(null);
  const [displayName, setDisplayName] = useState('');
  const router = useRouter();

  useEffect(() => {
    checkUser();
    
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("Auth state changed:", event, session?.user?.email);
      if (event === 'SIGNED_IN') {
        setUser(session?.user ?? null);
        if (session?.user) {
          fetchUserProfile(session.user.id);
        }
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setDisplayName('');
      }
    });

    return () => {
      if (authListener && authListener.subscription) {
        authListener.subscription.unsubscribe();
      }
    };
  }, []);

  async function checkUser() {
    const { data: { session } } = await supabase.auth.getSession();
    console.log("Checking user session:", session?.user?.email);
    if (session) {
      setUser(session.user);
      fetchUserProfile(session.user.id);
    } else {
      console.log("No active session found");
    }
  }

  async function fetchUserProfile(userId: string) {
    const { data, error } = await supabase
      .from('profiles')
      .select('display_name')
      .eq('id', userId)
      .single();
    if (data) setDisplayName(data.display_name);
    if (error) console.error('Error fetching user profile:', error);
  }

  async function handleLogout() {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Error during logout:', error);
      Alert.alert('Erreur', 'Impossible de se déconnecter');
    }
  }

  async function testSession() {
    const { data, error } = await supabase.auth.getSession();
    if (error) {
      console.error('Error testing session:', error);
      Alert.alert('Erreur', 'Impossible de vérifier la session');
    } else if (data.session) {
      Alert.alert('Session active', `Utilisateur connecté: ${data.session.user.email}`);
    } else {
      Alert.alert('Pas de session', 'Aucun utilisateur connecté');
    }
  }

  return (
    <ImageBackground 
      source={require('../../assets/images/quipasse.webp')} 
      style={styles.backgroundImage}
    >
      <StatusBar translucent backgroundColor="transparent" />
      <LinearGradient
        colors={['rgba(255,255,255,0.8)', 'rgba(255,255,255,0.6)']}
        style={styles.gradientOverlay}
      >
        <View style={styles.container}>
          {user ? (
            <>
              <Text style={styles.title}>Bonjour {displayName}</Text>
              <TouchableOpacity style={styles.button} onPress={() => router.push('/vue1')}>
                <Text style={styles.buttonText}>Start</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                <Text style={styles.logoutButtonText}>Se déconnecter</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <Text style={styles.title}>Bienvenue sur Horo</Text>
              <TouchableOpacity style={styles.button} onPress={() => router.push('/auth/Login')}>
                <Text style={styles.buttonText}>Se connecter</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.button} onPress={() => router.push('/auth/signup')}>
                <Text style={styles.buttonText}>S'inscrire avec email</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.socialButton} onPress={() => console.log('Google Sign In')}>
                <Text style={styles.socialButtonText}>Se connecter avec Google</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.socialButton} onPress={() => console.log('Apple Sign In')}>
                <Text style={styles.socialButtonText}>Se connecter avec Apple</Text>
              </TouchableOpacity>
            </>
          )}
          <TouchableOpacity style={styles.testButton} onPress={testSession}>
            <Text style={styles.testButtonText}>Tester la session</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </ImageBackground>
  );
}