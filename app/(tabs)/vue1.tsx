import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Image, TouchableOpacity, SafeAreaView, StatusBar } from 'react-native';
import { supabase } from '../../supabaseClients';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../styles/colors';
import { useAdminStatus } from '../hooks/useAdminStatus';

export default function Vue1() {
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [allEvents, setAllEvents] = useState([]);
  const router = useRouter();
  const { isAdmin } = useAdminStatus();
  const [selectedStyle, setSelectedStyle] = useState(null);

  useEffect(() => {
    console.log("Vue1: Component mounted");
    fetchAllEvents();
  }, []);

  async function fetchAllEvents() {
    console.log("Vue1: Fetching all events");
    try {
      setLoading(true);
      let { data: events, error } = await supabase
        .from('evenements')
        .select('*')
        .order('id', { ascending: false });

      if (error) {
        console.error("Vue1: Supabase error:", error);
        throw error;
      }

      if (events && events.length > 0) {
        setAllEvents(events);
        await findValidEvent(events);
      } else {
        console.log("Vue1: No events received or empty events array");
        setEvent(null);
      }
    } catch (error) {
      console.error('Vue1: Error fetching events:', error);
      setEvent(null);
    } finally {
      setLoading(false);
    }
  }

  async function findValidEvent(events) {
    for (let i = 0; i < events.length; i++) {
      const randomIndex = Math.floor(Math.random() * events.length);
      const randomEvent = events[randomIndex];
      if (randomEvent.illustration_url) {
        const isValid = await checkImageValidity(randomEvent.illustration_url);
        if (isValid) {
          setEvent(randomEvent);
          return;
        }
      }
    }
    setEvent(null);
  }

  function checkImageValidity(url) {
    return new Promise((resolve) => {
      Image.prefetch(url)
        .then(() => resolve(true))
        .catch(() => resolve(false));
    });
  }

  const AdminButtons = () => {
    if (!isAdmin) return null;

    return (
      <View style={styles.adminContainer}>
        <TouchableOpacity 
          style={styles.adminButton} 
          onPress={() => router.push('/vue4')}
        >
          <Ionicons name="images-outline" size={24} color={colors.accent} />
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.adminButton} 
          onPress={() => router.push('/vue5')}
        >
          <Ionicons name="grid-outline" size={24} color={colors.accent} />
        </TouchableOpacity>
      </View>
    );
  };

  const handleStyleSelect = (style) => {
    setSelectedStyle(style);
  };

  const handleStartGame = () => {
    if (event && selectedStyle) {
      router.push({
        pathname: selectedStyle === 'style1' ? '/vue2a' : '/vue2b',
        params: { initialEvent: JSON.stringify(event) }
      });
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" />
      <AdminButtons />
      
      <Text style={styles.title}>Choisissez votre style de jeu</Text>

      <View style={styles.gameStylesContainer}>
        <TouchableOpacity
          style={[
            styles.styleCard,
            selectedStyle === 'style1' && styles.selectedCard
          ]}
          onPress={() => handleStyleSelect('style1')}
        >
          <Text style={styles.styleTitle}>Style Classique</Text>
          <Text style={styles.styleDescription}>
            Devinez si l'événement s'est passé avant ou après l'événement de référence
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.styleCard,
            selectedStyle === 'style2' && styles.selectedCard
          ]}
          onPress={() => handleStyleSelect('style2')}
        >
          <Text style={styles.styleTitle}>Style Duo</Text>
          <Text style={styles.styleDescription}>
            Entre deux événements, sélectionnez le plus récent
          </Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={[
          styles.startButton,
          !selectedStyle && styles.disabledButton
        ]}
        onPress={handleStartGame}
        disabled={!selectedStyle}
      >
        <Text style={styles.startButtonText}>Commencer</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4e4bc',
    padding: 20,
  },
  adminContainer: {
    position: 'absolute',
    top: 40,
    right: 20,
    flexDirection: 'row',
    gap: 10,
    zIndex: 1000,
  },
  adminButton: {
    padding: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 60,
    marginBottom: 30,
    color: '#6b4423',
  },
  gameStylesContainer: {
    flex: 1,
    justifyContent: 'center',
    gap: 20,
  },
  styleCard: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  selectedCard: {
    backgroundColor: '#ffd700',
    transform: [{ scale: 1.02 }],
  },
  styleTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#6b4423',
  },
  styleDescription: {
    fontSize: 16,
    color: '#666',
    lineHeight: 22,
  },
  startButton: {
    backgroundColor: '#6b4423',
    paddingVertical: 15,
    borderRadius: 30,
    marginTop: 20,
    marginBottom: 30,
  },
  startButtonText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 18,
    fontWeight: 'bold',
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
});