import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  SafeAreaView,
  TextInput,
  ActivityIndicator,
  Image,
  Dimensions
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../supabaseClients';
import { useAdminStatus } from '../hooks/useAdminStatus';

const { width } = Dimensions.get('window');
const CARD_HEIGHT = width * 1.2;

export default function Vue5() {
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();
  const { isAdmin, loading: adminLoading } = useAdminStatus();

  useEffect(() => {
    if (!adminLoading && !isAdmin) {
      router.replace('/');
    } else {
      fetchEvents();
    }
  }, [isAdmin, adminLoading]);

  useEffect(() => {
    filterEvents();
  }, [searchQuery, events]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('evenements')
        .select('*')
        .order('date', { ascending: true });

      if (error) throw error;
      setEvents(data || []);
      setFilteredEvents(data || []);
    } catch (error) {
      console.error('Erreur:', error);
      alert('Impossible de charger les événements');
    } finally {
      setLoading(false);
    }
  };

  const filterEvents = () => {
    const filtered = events.filter(event => 
      event.titre?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.date_formatee?.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredEvents(filtered);
    setCurrentIndex(0);
  };

  const navigateToPrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const navigateToNext = () => {
    if (currentIndex < filteredEvents.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  if (loading || adminLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  const currentEvent = filteredEvents[currentIndex];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.title}>Liste des événements</Text>
      </View>

      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Rechercher par titre ou date..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery !== '' && (
          <TouchableOpacity 
            onPress={() => setSearchQuery('')}
            style={styles.clearButton}
          >
            <Ionicons name="close-circle" size={20} color="#666" />
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.counterContainer}>
        <Text style={styles.counter}>
          {filteredEvents.length > 0 
            ? `Événement ${currentIndex + 1} sur ${filteredEvents.length}` 
            : 'Aucun événement trouvé'}
        </Text>
      </View>

      {filteredEvents.length > 0 ? (
        <View style={styles.cardContainer}>
          <View style={styles.card}>
            <Image
              source={{ 
                uri: currentEvent.illustration_url || 'https://via.placeholder.com/300'
              }}
              style={styles.image}
              resizeMode="cover"
            />
            <View style={styles.eventInfo}>
              <Text style={styles.eventDate}>{currentEvent.date_formatee}</Text>
              <Text style={styles.eventTitle}>{currentEvent.titre}</Text>
            </View>
          </View>
        </View>
      ) : (
        <View style={styles.noResultsContainer}>
          <Text style={styles.noResultsText}>Aucun événement trouvé</Text>
        </View>
      )}

      <View style={styles.navigationContainer}>
        <TouchableOpacity 
          style={[styles.navButton, currentIndex === 0 && styles.disabledButton]}
          onPress={navigateToPrevious}
          disabled={currentIndex === 0}
        >
          <Ionicons 
            name="chevron-back" 
            size={30} 
            color={currentIndex === 0 ? "#ccc" : "#000"} 
          />
        </TouchableOpacity>

        <TouchableOpacity 
          style={[
            styles.navButton, 
            currentIndex === filteredEvents.length - 1 && styles.disabledButton
          ]}
          onPress={navigateToNext}
          disabled={currentIndex === filteredEvents.length - 1}
        >
          <Ionicons 
            name="chevron-forward" 
            size={30} 
            color={currentIndex === filteredEvents.length - 1 ? "#ccc" : "#000"} 
          />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    paddingTop: 50,
    backgroundColor: '#fff',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  backButton: {
    padding: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 15,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 8,
  },
  clearButton: {
    padding: 5,
  },
  counterContainer: {
    padding: 10,
    alignItems: 'center',
  },
  counter: {
    fontSize: 16,
    color: '#666',
  },
  cardContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  card: {
    width: width - 40,
    height: CARD_HEIGHT,
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
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '75%',
  },
  eventInfo: {
    padding: 15,
  },
  eventDate: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#666',
    marginBottom: 5,
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
  navigationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    paddingBottom: 40,
  },
  navButton: {
    padding: 15,
    backgroundColor: '#fff',
    borderRadius: 25,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  disabledButton: {
    backgroundColor: '#f0f0f0',
    elevation: 0,
    shadowOpacity: 0,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noResultsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noResultsText: {
    fontSize: 18,
    color: '#666',
  },
});