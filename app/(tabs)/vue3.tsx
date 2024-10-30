import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, ActivityIndicator, SafeAreaView, TouchableOpacity, Dimensions } from 'react-native';
import { supabase } from '../../supabaseClients';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

export default function Vue3() {
  const [events, setEvents] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [imageError, setImageError] = useState(null);

  useEffect(() => {
    fetchSasEvents();
  }, []);

  async function fetchSasEvents() {
    try {
      setLoading(true);
      console.log("Vue3: Fetching SAS events...");
      let { data, error } = await supabase
        .from('sas')
        .select('*')
        .order('date', { ascending: false });

      if (error) {
        console.error("Vue3: Supabase error:", error);
        throw error;
      }

      if (data && data.length > 0) {
        console.log("Vue3: SAS events found:", data.length);
        setEvents(data);
      } else {
        console.log("Vue3: No SAS events found");
        setEvents([]);
      }
    } catch (error) {
      console.error('Vue3: Error fetching SAS events:', error);
      setEvents([]);
    } finally {
      setLoading(false);
    }
  }

  const navigateEvent = (direction) => {
    setImageError(null);
    if (direction === 'next' && currentIndex < events.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else if (direction === 'prev' && currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const onImageError = () => {
    setImageError("Error loading image");
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  if (events.length === 0) {
    return (
      <View style={styles.noEventsContainer}>
        <Text style={styles.noEventsText}>No events available</Text>
      </View>
    );
  }

  const currentEvent = events[currentIndex];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        <View style={styles.cardContainer}>
          <Text style={styles.title}>{currentEvent.titre}</Text>
          <Text style={styles.date}>{new Date(currentEvent.date).toLocaleDateString('fr-FR')}</Text>
          {currentEvent.illustration_url && !imageError ? (
            <Image
              source={{ uri: currentEvent.illustration_url }}
              style={styles.image}
              onError={onImageError}
            />
          ) : (
            <View style={styles.errorImageContainer}>
              <Ionicons name="image-outline" size={50} color="#ccc" />
              <Text style={styles.errorImageText}>{imageError ? imageError : "No image available"}</Text>
            </View>
          )}
        </View>

        <View style={styles.navigationContainer}>
          <TouchableOpacity 
            style={[styles.navButton, currentIndex === 0 && styles.disabledButton]} 
            onPress={() => navigateEvent('prev')}
            disabled={currentIndex === 0}
          >
            <Ionicons name="chevron-back-outline" size={24} color={currentIndex === 0 ? "#ccc" : "#007AFF"} />
            <Text style={[styles.navButtonText, currentIndex === 0 && styles.disabledButtonText]}>Previous</Text>
          </TouchableOpacity>
          <Text style={styles.eventCount}>{`${currentIndex + 1} / ${events.length}`}</Text>
          <TouchableOpacity 
            style={[styles.navButton, currentIndex === events.length - 1 && styles.disabledButton]} 
            onPress={() => navigateEvent('next')}
            disabled={currentIndex === events.length - 1}
          >
            <Text style={[styles.navButtonText, currentIndex === events.length - 1 && styles.disabledButtonText]}>Next</Text>
            <Ionicons name="chevron-forward-outline" size={24} color={currentIndex === events.length - 1 ? "#ccc" : "#007AFF"} />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f0f0',
  },
  scrollViewContent: {
    flexGrow: 1,
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noEventsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noEventsText: {
    fontSize: 18,
    color: '#666',
  },
  cardContainer: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  date: {
    fontSize: 16,
    color: '#666',
    marginBottom: 15,
  },
  image: {
    width: '100%',
    height: width * 0.6, // Aspect ratio 3:2
    resizeMode: 'cover',
    borderRadius: 10,
    marginBottom: 15,
  },
  errorImageContainer: {
    width: '100%',
    height: width * 0.6,
    backgroundColor: '#f9f9f9',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    marginBottom: 15,
  },
  errorImageText: {
    color: '#666',
    marginTop: 10,
  },
  navigationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 20,
  },
  navButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  navButtonText: {
    fontSize: 16,
    color: '#007AFF',
  },
  disabledButton: {
    opacity: 0.5,
  },
  disabledButtonText: {
    color: '#ccc',
  },
  eventCount: {
    fontSize: 16,
    color: '#666',
  },
});