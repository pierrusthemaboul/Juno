// useEventSelection.ts
import { Event } from '../types';
import { gameLogger } from '../utils/gameLogger';

interface EventSelectionConfig {
  level: number;
  usedEventIds: Set<string>;
  getDifficultyRange: (level: number) => [number, number];
  getTemporalRange: (level: number, baseRange: number) => number;
}

const useEventSelection = () =>{
  const selectEvent = (
    events: Event[],
    prevEvent: Event | null,
    config: EventSelectionConfig
  ): Event | null => {
    if (!events?.length) {
      gameLogger.error('Events', 'Pas d\'événements disponibles');
      return null;
    }

    const [minDifficulty, maxDifficulty] = config.getDifficultyRange(config.level);
    
    let eligibleEvents = events.filter(event => {
      if (config.usedEventIds.has(event.id)) return false;
      if (event.niveau_difficulte < minDifficulty || event.niveau_difficulte > maxDifficulty) return false;
      
      if (config.level === 1 && !event.universel) return false;
      
      if (prevEvent) {
        const timeDiff = Math.abs(new Date(event.date).getTime() - new Date(prevEvent.date).getTime());
        const minTimeDiff = config.level === 1 ? 10 : 2; // années
        return timeDiff >= (minTimeDiff * 365 * 24 * 60 * 60 * 1000);
      }
      
      return true;
    });

    if (eligibleEvents.length === 0) {
      if (config.level === 25) {
        gameLogger.info('Events', 'Mode infini: réinitialisation des événements utilisés');
        config.usedEventIds.clear();
        eligibleEvents = events.filter(e => !prevEvent || e.id !== prevEvent.id);
      } else {
        gameLogger.error('Events', 'Plus d\'événements disponibles pour ce niveau');
        return null;
      }
    }

    const selectedEvent = eligibleEvents[Math.floor(Math.random() * eligibleEvents.length)];
    config.usedEventIds.add(selectedEvent.id);
    
    gameLogger.info('Events', `Événement sélectionné: ${selectedEvent.titre}`, {
      difficulty: selectedEvent.niveau_difficulte,
      date: selectedEvent.date,
    });

    return selectedEvent;
  };

  return { selectEvent };
};

export default useEventSelection;