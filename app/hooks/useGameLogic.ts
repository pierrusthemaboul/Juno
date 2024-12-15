import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../supabaseClients';

const useGameLogic = (initialEvent) => {
  const [user, setUser] = useState({ name: '', points: 0, lives: 3 });
  const [previousEvent, setPreviousEvent] = useState(JSON.parse(initialEvent));
  const [newEvent, setNewEvent] = useState(null);
  const [allEvents, setAllEvents] = useState([]);
  const [timeLeft, setTimeLeft] = useState(10);
  const [isCountdownActive, setIsCountdownActive] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [feedbackColor, setFeedbackColor] = useState('transparent');
  const [isGameOver, setIsGameOver] = useState(false);
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const [showDate, setShowDate] = useState(false);
  const [isCorrect, setIsCorrect] = useState(null);

  useEffect(() => {
    fetchUserData();
    fetchAllEvents();
  }, []);

  useEffect(() => {
    let timer;
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
      Math.abs(new Date(event.date).getTime() - new Date(prevEvent.date).getTime()) > 365 * 24 * 60 * 60 * 1000
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

    setIsCorrect(isCorrect);
    setShowDate(true);

    if (isCorrect) {
      const pointsEarned = Math.max(0, timeLeft * 100);
      setUser(prevUser => ({...prevUser, points: prevUser.points + pointsEarned}));
      setFeedbackColor('#90EE90');
    } else {
      setUser(prevUser => ({...prevUser, lives: prevUser.lives - 1}));
      setFeedbackColor('#FFB6C1');
    }

    setTimeout(() => {
      if (user.lives <= 1 && !isCorrect) {
        endGame();
      } else {
        setPreviousEvent(newEvent);
        fetchNewEvent(allEvents, newEvent);
        setShowDate(false);
        setIsCorrect(null);
        setFeedbackColor('transparent');
      }
    }, 2000);
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

  return {
    user,
    previousEvent,
    newEvent,
    timeLeft,
    loading,
    error,
    feedbackColor,
    isGameOver,
    isImageLoaded,
    showDate,
    isCorrect,
    handleChoice,
    handleImageLoad,
    restartGame
  };
};

export default useGameLogic;