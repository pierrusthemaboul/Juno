import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ImageBackground, StatusBar } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '../../supabaseClients';
import styles from '../styles/indexStyles';
import { LinearGradient } from 'expo-linear-gradient';

export default function HomeScreen() {
  const [user, setUser] = useState(null);
  const [displayName, setDisplayName] = useState('');
  const router = useRouter();

  useEffect(() => {
    checkUser();
  }, []);

  async function checkUser() {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
    if (user) {
      const { data, error } = await supabase
        .from('profiles')
        .select('display_name')
        .eq('id', user.id)
        .single();
      if (data) setDisplayName(data.display_name);
    }
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    setUser(null);
    setDisplayName('');
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
        </View>
      </LinearGradient>
    </ImageBackground>
  );
}