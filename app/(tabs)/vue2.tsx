import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, SafeAreaView, ActivityIndicator, TouchableOpacity, Animated, ImageBackground, Modal, StyleSheet } from 'react-native';
import { supabase } from '../../supabaseClients';
import UserInfo from '../components/UserInfo';
import Countdown from '../components/Countdown';
import PreviousEvent from '../components/PreviousEvent';
import NewEvent from '../components/NewEvent';
import ChoiceButtons from '../components/ChoiceButtons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { colors } from '../styles/colors';

export default function Vue2() {
  const router = useRouter();
  const { initialEvent } = useLocalSearchParams();
  const [user, setUser] = useState({ name: '', points: 0, lives: 3 });
  const [previousEvent, setPreviousEvent] = useState(JSON.parse(initialEvent));
  const [newEvent, setNewEvent] = useState(null);
  const [allEvents, setAllEvents] = useState([]);
  const [timeLeft, setTimeLeft] = useState(10);
  const [isCountdownActive, setIsCountdownActive] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [fadeAnim] = useState(new Animated.Value(1));
  const [feedbackColor, setFeedbackColor] = useState('transparent');
  const [isGameOver, setIsGameOver] = useState(false);
  const [isImageLoaded, setIsImageLoaded] = useState(false);

  useEffect(() => {
    fetchUserData();
    fetchAllEvents();
  }, []);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isCountdownActive && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prevTime) => {
          if (prevTime <= 1) {
            clearInterval(timer);
            handleTimeout();
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isCountdownActive]);

  const fetchUserData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data, error } = await supabase
        .from('profiles')
        .select('display_name, high_score')
        .eq('id', user.id)
        .single();

      if (data) {
        setUser(prevUser => ({ ...prevUser, name: data.display_name }));
      }
    }
  };

  const fetchAllEvents = async () => {
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
  };

  const fetchNewEvent = useCallback((events = allEvents, prevEvent = previousEvent) => {
    const availableEvents = events.filter(event => 
      event.id !== prevEvent.id && 
      event.titre !== prevEvent.titre &&
      Math.abs(new Date(event.date).getTime() - new Date(prevEvent.date).getTime()) > 365 * 24 * 60 * 60 * 1000 // Plus d'un an d'écart
    );
    
    if (availableEvents.length > 0) {
      const randomEvent = availableEvents[Math.floor(Math.random() * availableEvents.length)];
      setNewEvent(randomEvent);
      setTimeLeft(10);
      setIsImageLoaded(false);
      setIsCountdownActive(false);
    } else {
      setError('Plus d\'événements disponibles correspondant aux critères');
    }
  }, [allEvents, previousEvent]);

  const handleTimeout = () => {
    setUser(prevUser => {
      const newLives = prevUser.lives - 1;
      if (newLives <= 0) {
        endGame();
      } else {
        fetchNewEvent(allEvents, newEvent);
      }
      return { ...prevUser, lives: newLives };
    });
  };

  const handleChoice = (choice) => {
    setIsCountdownActive(false);
    const previousDate = new Date(previousEvent.date);
    const newDate = new Date(newEvent.date);
    const isCorrect = (choice === 'avant' && newDate < previousDate) || 
                      (choice === 'après' && newDate > previousDate);

    if (isCorrect) {
      const pointsEarned = Math.max(0, timeLeft * 100);
      setUser(prevUser => ({...prevUser, points: prevUser.points + pointsEarned}));
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
      if (user.lives <= 1 && !isCorrect) {
        endGame();
      } else {
        setPreviousEvent(newEvent);
        fetchNewEvent(allEvents, newEvent);
      }
    }, 1000);
  };

  const endGame = async () => {
    setIsGameOver(true);
    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (authUser) {
      const { data, error } = await supabase
        .from('profiles')
        .select('high_score, games_played')
        .eq('id', authUser.id)
        .single();

      if (data) {
        const newHighScore = Math.max(data.high_score, user.points);
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ 
            high_score: newHighScore,
            games_played: data.games_played + 1
          })
          .eq('id', authUser.id);

        if (updateError) {
          console.error('Error updating profile stats:', updateError);
        }
      }
    }
  };

  const restartGame = () => {
    setUser({ name: user.name, points: 0, lives: 3 });
    setIsGameOver(false);
    fetchNewEvent(allEvents, JSON.parse(initialEvent));
  };

  const handleImageLoad = () => {
    setIsImageLoaded(true);
    setIsCountdownActive(true);
  };

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
          <Text style={[styles.referenceText, { color: colors.veryDarkText }]}>Par rapport à l'événement :</Text>
          <PreviousEvent event={previousEvent} />
          {loading ? (
            <ActivityIndicator size="large" color="#0000ff" />
          ) : error ? (
            <Text style={styles.errorText}>{error}</Text>
          ) : (
            <View style={[styles.newEventContainer, { borderColor: feedbackColor, borderWidth: 2 }]}>
              <NewEvent event={newEvent} onImageLoad={handleImageLoad} />
            </View>
          )}
          <ChoiceButtons onChoice={handleChoice} disabled={!isImageLoaded} />
        </Animated.View>

        <Modal
          animationType="slide"
          transparent={true}
          visible={isGameOver}
          onRequestClose={() => {}}
        >
          <View style={styles.centeredView}>
            <View style={styles.modalView}>
              <Text style={styles.modalText}>Partie terminée!</Text>
              <Text style={styles.modalText}>Score final: {user.points}</Text>
              <TouchableOpacity
                style={[styles.button, styles.buttonClose]}
                onPress={restartGame}
              >
                <Text style={styles.textStyle}>Rejouer</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.buttonClose]}
                onPress={() => router.replace('/')}
              >
                <Text style={styles.textStyle}>Menu principal</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    resizeMode: 'cover',
  },
  container: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.lightBlue,
    padding: 15,
    paddingTop: 50,
  },
  content: {
    flex: 1,
    padding: 15,
  },
  referenceText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'black',
    marginBottom: 10,
  },
  newEventContainer: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 15,
    marginTop: 15,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  errorText: {
    color: '#F44336',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20,
  },
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 22
  },
  modalView: {
    margin: 20,
    backgroundColor: "white",
    borderRadius: 20,
    padding: 35,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5
  },
  button: {
    borderRadius: 20,
    padding: 10,
    elevation: 2,
    marginTop: 10,
  },
  buttonClose: {
    backgroundColor: colors.accent,
  },
  textStyle: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center"
  },
  modalText: {
    marginBottom: 15,
    textAlign: "center"
  }
});