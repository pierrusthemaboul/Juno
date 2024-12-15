import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../supabaseClients';

interface User {
  name: string;
  points: number;
  lives: number;
  level: number;
}

interface Event {
  id: string;
  date: string;
  titre: string;
  illustration_url: string;
  niveau_difficulte: number;
  ecart_temps_max: number;
  ecart_temps_min: number;
  facteur_variation: number;
  dateObj?: Date;
  types_evenement?: string[];
}

interface EventPair {
  event1: Event;
  event2: Event;
}

interface ImagesLoadedState {
  image1: boolean;
  image2: boolean;
}

interface UsedEventPair {
  event1Id: string;
  event2Id: string;
}

const useGameLogicB = () =>{
  // États de base
  const [user, setUser] = useState<User>({ name: '', points: 0, lives: 3, level: 1 });
  const [currentEvents, setCurrentEvents] = useState<EventPair | null>(null);
  const [allEvents, setAllEvents] = useState<Event[]>([]);
  const [timeLeft, setTimeLeft] = useState(10);
  const [isCountdownActive, setIsCountdownActive] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const [imagesLoaded, setImagesLoaded] = useState<ImagesLoadedState>({ image1: false, image2: false });
  const [showDates, setShowDates] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | undefined>(undefined);
  const [streak, setStreak] = useState(0);
  const [usedEventPairs, setUsedEventPairs] = useState<Set<string>>(new Set());

  const DIFFICULTY_POINTS = {
    1: 100,
    2: 150,
    3: 200,
    4: 300,
    5: 400,
    6: 500,
    7: 700,
    8: 1000
  };

  useEffect(() => {
    fetchUserData();
    fetchAllEvents();
    return () => setUsedEventPairs(new Set());
  }, []);

  useEffect(() => {
    if (imagesLoaded.image1 && imagesLoaded.image2) {
      setIsImageLoaded(true);
      setIsCountdownActive(true);
    }
  }, [imagesLoaded]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isCountdownActive && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prevTime) => {
          if (prevTime <= 1) {
            handleTimeout();
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isCountdownActive]);

  useEffect(() => {
    const newLevel = Math.min(8, Math.floor(user.points / 1000) + 1);
    if (newLevel !== user.level) {
      setUser(prev => ({ ...prev, level: newLevel }));
    }
  }, [user.points]);

  const fetchUserData = async () => {
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (authUser) {
        const { data, error } = await supabase
          .from('profiles')
          .select('display_name, high_score')
          .eq('id', authUser.id)
          .single();

        if (error) throw error;
        if (data) {
          setUser(prev => ({ ...prev, name: data.display_name }));
        }
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des données utilisateur:', error);
    }
  };

  const fetchAllEvents = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data: events, error } = await supabase
        .from('evenements')
        .select('*');

      if (error) throw error;

      if (events && events.length > 0) {
        console.log(`Nombre total d'événements: ${events.length}`);
        setAllEvents(events);
        await fetchNewEvents(events);
      } else {
        setError('Aucun événement disponible');
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des événements:', error);
      setError('Impossible de charger les événements');
    } finally {
      setLoading(false);
    }
  };

  const fetchNewEvents = useCallback((events = allEvents, retryCount = 0) => {
    const MAX_RETRIES = 5;
    console.log(`\n=== Sélection d'événements (essai ${retryCount + 1}/${MAX_RETRIES}) ===`);
    
    if (retryCount >= MAX_RETRIES) {
      console.log('Reset des paires utilisées');
      setUsedEventPairs(new Set());
      fetchNewEvents(events, 0);
      return;
    }

    if (events.length < 2) {
      setError('Pas assez d\'événements disponibles');
      return;
    }

    const availableEvents = events.filter(e => {
      return ![...usedEventPairs].some(pair => {
        const [id1, id2] = pair.split('_');
        return e.id === id1 || e.id === id2;
      });
    });

    const event1 = availableEvents[Math.floor(Math.random() * availableEvents.length)];
    const event1Date = new Date(event1.date);

    const flexibility = 1 + (retryCount * 0.2);
    const minTimeDiff = event1.ecart_temps_min * 365 * 24 * 60 * 60 * 1000 / flexibility;
    const maxTimeDiff = event1.ecart_temps_max * 365 * 24 * 60 * 60 * 1000 * flexibility;

    const eligibleEvent2s = availableEvents.filter(e => {
      if (e.id === event1.id) return false;
      const timeDiff = Math.abs(new Date(e.date).getTime() - event1Date.getTime());
      return timeDiff >= minTimeDiff && timeDiff <= maxTimeDiff;
    });

    console.log(`Event 1: ${event1.titre} (${event1.date})`);
    console.log(`Événements éligibles: ${eligibleEvent2s.length}`);
    console.log(`Écart min: ${event1.ecart_temps_min} ans, max: ${event1.ecart_temps_max} ans`);

    if (eligibleEvent2s.length === 0) {
      console.log('Aucun événement éligible, élargissement des critères');
      fetchNewEvents(events, retryCount + 1);
      return;
    }

    const event2 = eligibleEvent2s.sort(() => Math.random() - 0.5)[0];
    const ecartReel = Math.abs(new Date(event2.date).getTime() - event1Date.getTime()) / (365 * 24 * 60 * 60 * 1000);
    
    console.log(`Event 2: ${event2.titre} (${event2.date})`);
    console.log(`Écart réel: ${ecartReel.toFixed(1)} ans\n`);

    const pairKey = `${event1.id}_${event2.id}`;
    setUsedEventPairs(prev => new Set([...prev, pairKey]));

    setImagesLoaded({ image1: false, image2: false });
    setIsImageLoaded(false);
    setIsCorrect(undefined);
    setShowDates(false);
    setIsCountdownActive(false);
    setTimeLeft(10);

    setCurrentEvents({
      event1: { ...event1, dateObj: new Date(event1.date) },
      event2: { ...event2, dateObj: new Date(event2.date) }
    });
  }, [allEvents, usedEventPairs]);

  const handleTimeout = useCallback(() => {
    setStreak(0);
    setUser(prevUser => {
      const newLives = prevUser.lives - 1;
      if (newLives <= 0) {
        endGame();
      } else {
        fetchNewEvents();
      }
      return { ...prevUser, lives: newLives };
    });
  }, []);

  const handleChoice = useCallback((chosenEventId: string) => {
    if (!currentEvents) return;
    
    setIsCountdownActive(false);
    const { event1, event2 } = currentEvents;
    const chosenEvent = chosenEventId === event1.id ? event1 : event2;
    const otherEvent = chosenEventId === event1.id ? event2 : event1;

    const isCorrect = new Date(chosenEvent.date) > new Date(otherEvent.date);
    setIsCorrect(isCorrect);
    setShowDates(true);

    if (isCorrect) {
      const basePoints = Math.max(0, timeLeft * DIFFICULTY_POINTS[user.level]);
      const streakBonus = Math.floor(streak * basePoints * 0.1);
      const totalPoints = basePoints + streakBonus;

      setStreak(prev => prev + 1);
      setUser(prevUser => ({
        ...prevUser,
        points: prevUser.points + totalPoints
      }));
    } else {
      setStreak(0);
      setUser(prevUser => ({
        ...prevUser,
        lives: prevUser.lives - 1
      }));
    }

    setTimeout(() => {
      if (user.lives <= 1 && !isCorrect) {
        endGame();
      } else {
        fetchNewEvents();
      }
    }, 2000);
  }, [currentEvents, timeLeft, user.level, streak]);

  const endGame = async () => {
    setIsGameOver(true);
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (authUser) {
        const { data, error } = await supabase
          .from('profiles')
          .select('high_score, games_played')
          .eq('id', authUser.id)
          .single();

        if (data && !error) {
          const newHighScore = Math.max(data.high_score, user.points);
          await supabase
            .from('profiles')
            .update({
              high_score: newHighScore,
              games_played: data.games_played + 1
            })
            .eq('id', authUser.id);
        }
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour du high score:', error);
    }
  };

  const restartGame = () => {
    setUser(prev => ({ ...prev, points: 0, lives: 3, level: 1 }));
    setStreak(0);
    setUsedEventPairs(new Set());
    setIsGameOver(false);
    fetchNewEvents();
  };

  const handleImageLoad = (imageNumber: 1 | 2) => {
    setImagesLoaded(prev => ({
      ...prev,
      [`image${imageNumber}`]: true
    }));
  };

  return {
    user,
    currentEvents,
    timeLeft,
    loading,
    error,
    isGameOver,
    showDates,
    isCorrect,
    isImageLoaded,
    streak,
    handleChoice,
    handleImageLoad,
    restartGame
  };
};

export default useGameLogicB;