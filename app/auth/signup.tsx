import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { supabase } from '../../supabaseClients';
import { useRouter } from 'expo-router';
import styles from '../styles/signupStyles';

const SignUpScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nickname, setNickname] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const router = useRouter();

  const handleSignUp = async () => {
    if (!nickname.trim()) {
      setErrorMessage('Le pseudonyme est obligatoire.');
      return;
    }

    try {
      const { data: { user }, error } = await supabase.auth.signUp({
        email: email,
        password: password,
      });

      if (error) {
        console.error('Erreur lors de l\'inscription:', error);
        setErrorMessage(error.message);
      } else if (user) {
        console.log('Utilisateur inscrit:', user);
        
        const { data, error: profileError } = await supabase
          .from('profiles')
          .insert([
            { id: user.id, display_name: nickname }
          ]);
        
        if (profileError) {
          console.error('Erreur lors de la création du profil:', profileError);
          setErrorMessage('Erreur lors de la création du profil.');
        } else {
          console.log('Profil créé avec succès');
          router.push('/');
        }
      }
    } catch (err) {
      console.error('Erreur lors de handleSignUp:', err);
      setErrorMessage('Une erreur est survenue.');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Inscription</Text>
      <TextInput
        style={styles.input}
        placeholder="Pseudonyme"
        value={nickname}
        onChangeText={setNickname}
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder="Mot de passe"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      {errorMessage ? <Text style={styles.error}>{errorMessage}</Text> : null}
      <TouchableOpacity style={styles.button} onPress={handleSignUp}>
        <Text style={styles.buttonText}>S'inscrire</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

export default SignUpScreen;