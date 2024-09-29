import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '../../supabaseClients';
import styles from '../styles/indexStyles';

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

  if (user) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Bonjour {displayName}</Text>
        <TouchableOpacity style={styles.button} onPress={() => console.log('Start')}>
          <Text style={styles.buttonText}>Start</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Bienvenue sur Horo</Text>
      <TouchableOpacity style={styles.button} onPress={() => router.push('../auth/Login')}>
        <Text style={styles.buttonText}>Se connecter</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.button} onPress={() => router.push('../auth/signup')}>
        <Text style={styles.buttonText}>S'inscrire avec email</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.button} onPress={() => console.log('Google Sign In')}>
        <Text style={styles.buttonText}>Se connecter avec Google</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.button} onPress={() => console.log('Apple Sign In')}>
        <Text style={styles.buttonText}>Se connecter avec Apple</Text>
      </TouchableOpacity>
    </View>
  );
}