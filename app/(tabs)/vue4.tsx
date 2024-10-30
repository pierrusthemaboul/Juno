import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ActivityIndicator, 
  Image, 
  TouchableOpacity,
  SafeAreaView,
  Dimensions 
} from 'react-native';
import { supabase } from '../../supabaseClients';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.8;
const CARD_HEIGHT = CARD_WIDTH * 1.7;

export default function Vue4() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const router = useRouter();

  useEffect(() => {
    fetchIllustratedEvents();
  }, []);

  async function fetchIllustratedEvents() {
    try {
      setLoading(true);
      let { data, error } = await supabase
        .from('transitoire2')
        .select('*')
        .neq('illustration_url', '')
        .order('code', { ascending: true });

      if (error) throw error;

      const validEvents = data.filter(event => 
        event.illustration_url &&
        event.illustration_url.startsWith('http')
      );

      setEvents(validEvents);
    } catch (error) {
      console.error('Erreur lors de la récupération des événements:', error);
      setEvents([]);
    } finally {
      setLoading(false);
    }
  }

  const nextPage = () => {
    if (currentPage < events.length - 1) setCurrentPage(currentPage + 1);
  };

  const previousPage = () => {
    if (currentPage > 0) setCurrentPage(currentPage - 1);
  };

  const DateDisplay = ({ date }) => {
    // Si la date est juste une année (4 chiffres), on applique le style 3D
    const isYearOnly = /^\d{4}$/.test(date);
    
    if (isYearOnly) {
      return (
        <Text style={styles.yearText3D}>
          {date}
        </Text>
      );
    }
    
    return <Text style={styles.dateText}>{date}</Text>;
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6b4423" />
      </View>
    );
  }

  if (events.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#6b4423" />
        </TouchableOpacity>
        <Text style={styles.noEventText}>Aucun événement illustré disponible</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity 
        style={styles.backButton}
        onPress={() => router.back()}
      >
        <Ionicons name="arrow-back" size={24} color="#6b4423" />
      </TouchableOpacity>

      <Text style={styles.pageIndicator}>
        {`Événement illustré ${currentPage + 1} sur ${events.length}`}
      </Text>

      <View style={styles.cardContainer}>
        {events.length > 0 && (
          <View style={styles.tarotCard}>
            <View style={styles.cardBorder}>
              <Image
                source={{ uri: events[currentPage].illustration_url }}
                style={styles.image}
                resizeMode="cover"
              />
              <View style={styles.textContainer}>
                <DateDisplay date={events[currentPage].date_formatee} />
                <Text style={styles.titleText}>
                  {events[currentPage].titre}
                </Text>
              </View>
            </View>
          </View>
        )}
      </View>

      <View style={styles.navigationContainer}>
        <TouchableOpacity 
          style={[styles.navButton, currentPage === 0 && styles.disabledButton]}
          onPress={previousPage}
          disabled={currentPage === 0}
        >
          <Ionicons name="chevron-back" size={30} color={currentPage === 0 ? "#ccc" : "#6b4423"} />
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.navButton, currentPage === events.length - 1 && styles.disabledButton]}
          onPress={nextPage}
          disabled={currentPage === events.length - 1}
        >
          <Ionicons name="chevron-forward" size={30} color={currentPage === events.length - 1 ? "#ccc" : "#6b4423"} />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4e4bc',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f4e4bc',
  },
  backButton: {
    position: 'absolute',
    top: 40,
    left: 20,
    zIndex: 1,
    padding: 10,
  },
  pageIndicator: {
    position: 'absolute',
    top: 45,
    width: '100%',
    textAlign: 'center',
    fontSize: 16,
    color: '#6b4423',
    fontWeight: '500',
  },
  cardContainer: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tarotCard: {
    width: '100%',
    height: '100%',
    backgroundColor: '#fff',
    borderRadius: 15,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    padding: 10,
  },
  cardBorder: {
    flex: 1,
    borderWidth: 2,
    borderColor: '#6b4423',
    borderRadius: 10,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '75%',
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  textContainer: {
    height: '25%',
    padding: 10,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  dateText: {
    fontSize: 16,
    color: '#6b4423',
    fontWeight: 'bold',
    marginBottom: 5,
    textAlign: 'center',
  },
  yearText3D: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#6b4423',
    textShadowColor: 'rgba(107, 68, 35, 0.4)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 3,
    marginBottom: 5,
    textAlign: 'center',
    letterSpacing: 2,
  },
  titleText: {
    fontSize: 14,
    color: '#000',
    textAlign: 'center',
  },
  navigationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 20,
    position: 'absolute',
    bottom: 40,
  },
  navButton: {
    padding: 15,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
  },
  disabledButton: {
    opacity: 0.5,
  },
  noEventText: {
    fontSize: 18,
    color: '#6b4423',
    textAlign: 'center',
  },
});