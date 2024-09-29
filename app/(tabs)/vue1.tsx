import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Image } from 'react-native';
import { supabase } from '../../supabaseClients';

export default function Vue1() {
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRandomEvent();
  }, []);

  async function fetchRandomEvent() {
    try {
      setLoading(true);
      let { data: events, error } = await supabase
        .from('evenements')
        .select('*')
        .order('id', { ascending: false })
        .limit(1);

      if (error) throw error;

      if (events && events.length > 0) {
        console.log('Event fetched:', events[0]); // Pour le débogage
        setEvent(events[0]);
      }
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'événement:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>zone infos téléphone batterie etc.</Text>
      </View>
      
      {event && (
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
      )}
      
      <View style={styles.buttonContainer}>
        <Text style={styles.buttonText}>C'est parti !</Text>
      </View>
    </View>
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
  },
  image: {
    flex: 1,
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
});