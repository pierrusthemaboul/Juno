const useLevelSystem = () => {
    const getEventsNeededForLevel = (level: number): number => {
      if (level === 1) return 5; // Plus facile pour commencer
      if (level === 25) return Infinity;
      return 8 + Math.floor((level - 1) * 1.5);
    };
  
    const getDifficultyRangeForLevel = (level: number): [number, number] => {
      if (level === 1) return [1, 1]; // Niveau 1 : uniquement les événements les plus faciles
      if (level === 2) return [1, 2];
      if (level <= 5) return [1, 3];
      if (level <= 10) return [2, 4];
      if (level <= 15) return [3, 6];
      if (level <= 20) return [4, 8];
      if (level === 25) return [1, 10];
      return [Math.max(1, level - 4), Math.min(10, level + 1)];
    };
  
    const getTemporalRangeForLevel = (level: number, baseRange: number): number => {
      if (level === 1) return 200; // Grand écart temporel pour le niveau 1
      if (level === 25) return baseRange;
      return Math.max(10, baseRange - Math.floor((level - 1) * 5));
    };
  
    const getLevelMessage = (level: number, eventsNeeded: number): string => {
      if (level === 1) {
        return `Bienvenue au Niveau 1 ! Commençons avec ${eventsNeeded} événements très connus.`;
      }
      if (level === 25) {
        return "Mode infini débloqué ! Testez vos connaissances sur toutes les périodes !";
      }
      const [minDiff, maxDiff] = getDifficultyRangeForLevel(level);
      return `Niveau ${level} débloqué ! Objectif : ${eventsNeeded} événements (difficulté ${minDiff}-${maxDiff})`;
    };
  
    return {
      getEventsNeededForLevel,
      getDifficultyRangeForLevel,
      getTemporalRangeForLevel,
      getLevelMessage
    };
  };

  export default useLevelSystem;