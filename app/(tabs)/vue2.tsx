import React, { useState, useEffect } from 'react';
import { View, Text, SafeAreaView, ActivityIndicator, TouchableOpacity, Animated, ImageBackground } from 'react-native';
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
  const [allEvents, setAllEvents] = useState([]);
  const [timeLeft, setTimeLeft] = useState(7);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [fadeAnim] = useState(new Animated.Value(1));
  const [feedbackColor, setFeedbackColor] = useState('transparent');

  useEffect(() => {
    fetchAllEvents();
  }, []);

  async function fetchAllEvents() {
    try {
      setLoading(true);
      setError(null);
      
      let { data: events, error } = await supabase
        .from('evenements')
        .select('*');

      if (error) throw error;

      if (events && events.length > 0) {
        setAllEvents(events);
        fetchNewEvent(events, JSON.parse(initialEvent));
      } else {
        setError('Aucun événement disponible');
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des événements:', error);
      setError('Impossible de charger les événements. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  }

  function fetchNewEvent(events = allEvents, prevEvent = previousEvent) {
    const availableEvents = events.filter(event => 
      event.id !== prevEvent.id && 
      event.titre !== prevEvent.titre &&
      Math.abs(new Date(event.date).getTime() - new Date(prevEvent.date).getTime()) > 365 * 24 * 60 * 60 * 1000 // Plus d'un an d'écart
    );
    
    if (availableEvents.length > 0) {
      const randomEvent = availableEvents[Math.floor(Math.random() * availableEvents.length)];
      setNewEvent(randomEvent);
    } else {
      setError('Plus d\'événements disponibles correspondant aux critères');
    }
  }

  function handleChoice(choice) {
    const previousDate = new Date(previousEvent.date);
    const newDate = new Date(newEvent.date);
    const isCorrect = (choice === 'avant' && newDate < previousDate) || 
                      (choice === 'après' && newDate > previousDate);

    if (isCorrect) {
      setUser(prevUser => ({...prevUser, points: prevUser.points + 10}));
      setFeedbackColor('#90EE90'); // Vert clair
    } else {
      setUser(prevUser => ({...prevUser, lives: prevUser.lives - 1}));
      setFeedbackColor('#FFB6C1'); // Rose clair (rouge doux)
    }

    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      })
    ]).start();

    setTimeout(() => {
      setPreviousEvent(newEvent);
      fetchNewEvent(allEvents, newEvent);
      setTimeLeft(7);
      setFeedbackColor('transparent'); // Réinitialiser la couleur
    }, 1000);
  }

  return (
    <ImageBackground 
      source={require('../../assets/images/bgvue2.webp')} 
      style={styles.backgroundImage}
    >
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <UserInfo user={user} />
          <Countdown timeLeft={timeLeft} />
        </View>
        <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
          <Text style={styles.referenceText}>Par rapport à l'événement :</Text>
          <PreviousEvent event={previousEvent} />
          {loading ? (
            <ActivityIndicator size="large" color="#0000ff" />
          ) : error ? (
            <Text style={styles.errorText}>{error}</Text>
          ) : (
            <View style={[styles.newEventContainer, { borderColor: feedbackColor, borderWidth: 2 }]}>
              <NewEvent event={newEvent} />
            </View>
          )}
          <ChoiceButtons onChoice={handleChoice} />
        </Animated.View>
      </SafeAreaView>
    </ImageBackground>
  );
}