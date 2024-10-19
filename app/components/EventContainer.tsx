import React from 'react';
import { View, StyleSheet } from 'react-native';
import PreviousEvent from './PreviousEvent';
import NewEvent from './NewEvent';
import ChoiceButtons from './ChoiceButtons';

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
    <View style={styles.container}>
      <PreviousEvent event={previousEvent} />
      <View style={[styles.newEventContainer, { borderColor: feedbackColor, borderWidth: 2 }]}>
        <NewEvent 
          event={newEvent} 
          onImageLoad={onImageLoad}
          showDate={showDate}
          isCorrect={isCorrect}
        />
      </View>
      <ChoiceButtons onChoice={onChoice} disabled={!isImageLoaded} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
  },
  newEventContainer: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 15,
    marginTop: 15,
    marginBottom: 15,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
});

export default EventContainer;