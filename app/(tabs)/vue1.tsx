import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Image, TouchableOpacity, SafeAreaView } from 'react-native';
import { supabase } from '../../supabaseClients';
import { useRouter } from 'expo-router';

export default function Vue1() {
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [allEvents, setAllEvents] = useState([]);
  const router = useRouter();

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

      console.log("Vue1: Received data from Supabase");
      console.log("Vue1: Number of events received:", events ? events.length : 0);

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
          console.log("Vue1: Valid event found:", randomEvent);
          setEvent(randomEvent);
          return;
        }
      }
    }
    console.log("Vue1: No valid event found");
    setEvent(null);
  }

  function checkImageValidity(url) {
    return new Promise((resolve) => {
      Image.prefetch(url)
        .then(() => {
          console.log("Vue1: Image prefetch successful");
          resolve(true);
        })
        .catch((error) => {
          console.log("Vue1: Image prefetch failed:", error);
          resolve(false);
        });
    });
  }

  function handleReloadEvent() {
    console.log("Vue1: Reloading event");
    setLoading(true);
    findValidEvent(allEvents);
  }

  if (loading) {
    console.log("Vue1: Rendering loading state");
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  console.log("Vue1: Rendering main content");
  console.log("Vue1: Current event:", event);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>zone infos téléphone batterie etc.</Text>
      </View>
      
      {event ? (
        <>
          <View style={styles.imageContainer}>
            <Image 
              source={{ uri: event.illustration_url }}
              style={styles.image} 
              resizeMode="cover"
            />
          </View>
          
          <View style={styles.titleContainer}>
            <Text style={styles.title}>{event.titre}</Text>
          </View>
          
          <View style={styles.dateContainer}>
            <Text style={styles.date}>{event.date}</Text>
          </View>
        </>
      ) : (
        <Text style={styles.noEventText}>Aucun événement disponible</Text>
      )}
      
      <TouchableOpacity 
        style={styles.buttonContainer}
        onPress={() => {
          console.log("Vue1: Navigating to Vue2");
          if (event) {
            router.push({
              pathname: '/vue2',
              params: { initialEvent: JSON.stringify(event) }
            });
          } else {
            console.log("Vue1: Cannot navigate, no event available");
          }
        }}
        disabled={!event}
      >
        <Text style={styles.buttonText}>C'est parti !</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.reloadButton}
        onPress={handleReloadEvent}
      >
        <Text style={styles.reloadButtonText}>Recharger un événement</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#e0e0e0',
  },
  headerText: {
    fontSize: 12,
  },
  imageContainer: {
    flex: 1,
    margin: 10,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#e0e0e0',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  titleContainer: {
    padding: 10,
    backgroundColor: '#e0e0e0',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  dateContainer: {
    padding: 10,
    backgroundColor: '#f0f0f0',
  },
  date: {
    fontSize: 16,
    textAlign: 'center',
  },
  noEventText: {
    fontSize: 18,
    textAlign: 'center',
    marginTop: 20,
    color: 'red',
  },
  buttonContainer: {
    margin: 10,
    padding: 15,
    backgroundColor: '#4a90e2',
    borderRadius: 5,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  reloadButton: {
    marginTop: 10,
    padding: 10,
    backgroundColor: '#e0e0e0',
    borderRadius: 5,
    alignItems: 'center',
  },
  reloadButtonText: {
    color: '#333',
    fontSize: 14,
  },
});