import React, { useState, useEffect } from 'react';
import { View, Text, SafeAreaView, ActivityIndicator, TouchableOpacity, Alert } from 'react-native';
import { supabase } from '../../supabaseClients';
import UserInfo from '../components/UserInfo';
import Countdown from '../components/Countdown';
import PreviousEvent from '../components/PreviousEvent';
import NewEvent from '../components/NewEvent';
import ChoiceButtons from '../components/ChoiceButtons';
import styles from '../styles/vue2styles';
import { useLocalSearchParams } from 'expo-router';

export default function Vue2() {
  const { initialEvent } = useLocalSearchParams();
  const [user, setUser] = useState({ name: 'Joueur 1', points: 100, lives: 3 });
  const [previousEvent, setPreviousEvent] = useState(JSON.parse(initialEvent));
  const [newEvent, setNewEvent] = useState(null);
  const [timeLeft, setTimeLeft] = useState(7);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchNewEvent();
  }, []);

  async function fetchNewEvent() {
    try {
      setLoading(true);
      setError(null);
      let { data: events, error } = await supabase
        .from('evenements')
        .select('*')
        .order('id', { ascending: false })
        .limit(100);

      if (error) throw error;

      if (events && events.length > 0) {
        const filteredEvents = events.filter(event => event.id !== previousEvent.id);
        const randomEvent = filteredEvents[Math.floor(Math.random() * filteredEvents.length)];
        setNewEvent(randomEvent);
      }
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'événement:', error);
      setError('Impossible de charger l\'événement. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  }

  function handleChoice(choice) {
    const previousDate = new Date(previousEvent.date);
    const newDate = new Date(newEvent.date);
    const isCorrect = (choice === 'avant' && newDate < previousDate) || 
                      (choice === 'après' && newDate > previousDate);

    if (isCorrect) {
      Alert.alert("Bravo!", "Vous avez raison!");
      setUser(prevUser => ({...prevUser, points: prevUser.points + 10}));
    } else {
      Alert.alert("Dommage!", "Ce n'est pas la bonne réponse.");
      setUser(prevUser => ({...prevUser, lives: prevUser.lives - 1}));
    }

    setPreviousEvent(newEvent);
    fetchNewEvent();
    setTimeLeft(7);
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color="#0000ff" />
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <Text>{error}</Text>
        <TouchableOpacity onPress={fetchNewEvent}>
          <Text>Réessayer</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <UserInfo user={user} />
        <Countdown timeLeft={timeLeft} />
      </View>
      <PreviousEvent event={previousEvent} />
      <View style={styles.newEventContainer}>
        <Text style={styles.newEventTitle}>{newEvent?.titre}</Text>
        <NewEvent event={newEvent} />
      </View>
      <ChoiceButtons onChoice={handleChoice} />
    </SafeAreaView>
  );
}