import React, { useState, useEffect } from 'react';
import { 
  View, Text, StyleSheet, TouchableOpacity, SafeAreaView,
  ActivityIndicator, Image, Dimensions, Platform,
  Animated
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../supabaseClients';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');
const CARD_WIDTH = width * 0.9;
const CARD_HEIGHT = height * 0.75;

export default function Vue6() {
  const [events, setEvents] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const slideAnim = React.useRef(new Animated.Value(0)).current;
  const fadeAnim = React.useRef(new Animated.Value(1)).current;

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const { data, error } = await supabase
        .from('transitoire')
        .select('*');

      if (error) throw error;

      const formattedData = data.map(event => ({
        ...event,
        formatted_date: formatDate(event.date)
      }));

      console.log('Données reçues:', formattedData);
      setEvents(formattedData);

    } catch (error) {
      console.error('Erreur:', error);
      alert('Impossible de charger les événements');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const [year, month, day] = dateString.split('-');
    if (month === '01' && day === '01') {
      return year;
    }
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const navigateToEvent = (direction) => {
    if (direction === 'next' && currentIndex < events.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else if (direction === 'prev' && currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#fff" />
      </View>
    );
  }

  if (!events || events.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <LinearGradient
          colors={['#191970', '#000033']} 
          style={styles.gradient}
        >
          <View style={styles.header}>
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <Ionicons name="arrow-back-circle" size={32} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.title}>Événements Historiques</Text>
          </View>
          <Text style={styles.noEventText}>Aucun événement disponible</Text>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  const currentEvent = events[currentIndex];

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#191970', '#000033']}
        style={styles.gradient}
      >
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back-circle" size={32} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.title}>Événements Historiques</Text>
        </View>

        <Text style={styles.counter}>
          Événement {currentIndex + 1} sur {events.length}
        </Text>

        <View style={styles.cardWrapper}>
          <View style={styles.card}>
            <Image
              source={{ uri: currentEvent?.illustration_url }}
              style={styles.image}
              resizeMode="cover"
            />
            
            <View style={styles.contentContainer}>
              <Text style={styles.eventDate}>
                {currentEvent?.formatted_date}
              </Text>
              
              <Text style={styles.eventTitle}>
                {currentEvent?.titre}
              </Text>
              
              <View style={[
                styles.difficultyBadge,
                { backgroundColor: getDifficultyColor(currentEvent?.difficulte) }
              ]}>
                <Text style={styles.difficultyText}>
                  {getDifficultyLabel(currentEvent?.difficulte)}
                </Text>
                <Text style={styles.difficultyNumber}>
                  {currentEvent?.difficulte}
                </Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.navigationContainer}>
          <TouchableOpacity 
            style={[styles.navButton, currentIndex === 0 && styles.disabledButton]}
            onPress={() => navigateToEvent('prev')}
            disabled={currentIndex === 0}
          >
            <LinearGradient
              colors={['#4169E1', '#0000CD']}
              style={styles.navButtonGradient}
            >
              <Ionicons name="chevron-back" size={34} color="#fff" />
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[
              styles.navButton,
              currentIndex === events.length - 1 && styles.disabledButton
            ]}
            onPress={() => navigateToEvent('next')}
            disabled={currentIndex === events.length - 1}
          >
            <LinearGradient
              colors={['#4169E1', '#0000CD']}
              style={styles.navButtonGradient}
            >
              <Ionicons name="chevron-forward" size={34} color="#fff" />
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
}

const getDifficultyLabel = (niveau) => {
  const labels = {
    1: 'Très Facile',
    2: 'Facile',
    3: 'Modéré',
    4: 'Intermédiaire', 
    5: 'Difficile',
    6: 'Très Difficile',
    7: 'Expert',
    8: 'Légende'
  };
  return labels[niveau] || 'Non défini';
};

const getDifficultyColor = (niveau) => {
  const colors = {
    1: '#27ae60',
    2: '#2ecc71',
    3: '#f1c40f', 
    4: '#e67e22',
    5: '#d35400',
    6: '#c0392b',
    7: '#e74c3c',
    8: '#c0392b'
  };
  return colors[niveau] || '#95a5a6';
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
    padding: 15,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Platform.OS === 'ios' ? 40 : 20,
    marginBottom: 15,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginLeft: 15,
  },
  counter: {
    fontSize: 18,
    color: '#fff',
    textAlign: 'center',
    marginBottom: 15,
  },
  cardWrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  card: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    backgroundColor: '#fff',
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  image: {
    width: '100%',
    height: '60%',
  },
  contentContainer: {
    flex: 1,
    padding: 15,
    justifyContent: 'space-between',
  },
  eventDate: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#191970',
    textAlign: 'center',
    marginBottom: 10,
  },
  eventTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#2c3e50',
    textAlign: 'center',
    marginBottom: 15,
  },
  difficultyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
  },
  difficultyText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  difficultyNumber: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    backgroundColor: 'rgba(255,255,255,0.2)',
    width: 35,
    height: 35,
    borderRadius: 18,
    textAlign: 'center',
    lineHeight: 35,
  },
  navigationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 10,
  },
  navButton: {
    borderRadius: 25,
    overflow: 'hidden',
  },
  navButtonGradient: {
    padding: 12,
    borderRadius: 25,
    alignItems: 'center',
  },
  disabledButton: {
    opacity: 0.5,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#191970',
  },
  noEventText: {
    fontSize: 18,
    color: '#fff',
    textAlign: 'center',
    marginTop: 50,
  },
});