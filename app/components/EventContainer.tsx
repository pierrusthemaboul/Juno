// EventContainer.tsx
import React from 'react';
import { View, StyleSheet, Dimensions, SafeAreaView } from 'react-native';
import PreviousEvent from './PreviousEvent';
import NewEvent from './NewEvent';
import ChoiceButtons from './ChoiceButtons';

const { width, height } = Dimensions.get('window');

const EventContainer = ({
  previousEvent,
  newEvent,
  onImageLoad,
  onChoice,
  feedbackColor,
  isImageLoaded,
  showDate,
  isCorrect
}) => {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.topMargin} />
        <View style={styles.cardsContainer}>
          <PreviousEvent event={previousEvent} />
          <NewEvent 
            event={newEvent} 
            onImageLoad={onImageLoad}
            showDate={showDate}
            isCorrect={isCorrect}
          />
        </View>
        <View style={styles.referenceSection} />
        <View style={styles.bottomSection}>
          <View style={styles.buttonsContainer}>
            <ChoiceButtons onChoice={onChoice} disabled={!isImageLoaded} />
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  topMargin: {
    height: height * 0.08, // Espace pour la barre de statut et la barre du haut
  },
  cardsContainer: {
    height: height * 0.5, // 50% de la hauteur pour les cartes
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  referenceSection: {
    height: height * 0.15, // Espace pour le bloc de référence
  },
  bottomSection: {
    height: height * 0.27, // Reste de l'espace pour les boutons
    justifyContent: 'center',
    paddingBottom: 20,
  },
  buttonsContainer: {
    width: '100%',
    alignItems: 'center',
  }
});

export default EventContainer;