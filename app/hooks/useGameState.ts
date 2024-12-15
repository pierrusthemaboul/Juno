// useGameState.ts
import { useState, useCallback } from 'react';
import { User, Event, LevelInfo } from '../types';

const INITIAL_LIVES = 3;
const BASE_POINTS = 100;
const STREAK_BONUS_MULTIPLIER = 0.2;

const useGameState = (initialEvent: string) => {
  const [user, setUser] = useState<User>({
    name: '',
    points: 0,
    lives: INITIAL_LIVES,
    level: 1,
    currentStreak: 0,
    maxStreak: 0,
    eventsCompletedInLevel: 0,
    totalEventsCompleted: 0
  });

  const [levelUpInfo, setLevelUpInfo] = useState<LevelInfo>({
    show: false,
    prevLevel: 1,
    newLevel: 1,
    eventsNeeded: 8,
    totalEvents: 0,
    message: ''
  });

  const [previousEvent, setPreviousEvent] = useState<Event | null>(null);
  const [newEvent, setNewEvent] = useState<Event | null>(null);
  const [timeLeft, setTimeLeft] = useState(10);
  const [isCountdownActive, setIsCountdownActive] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const [showDates, setShowDates] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | undefined>(undefined);

  const calculatePoints = useCallback((timeLeft: number, level: number, streak: number): number => {
    const basePoints = Math.max(0, timeLeft * BASE_POINTS * (1 + (level - 1) * 0.15));
    const streakBonus = Math.floor(streak * basePoints * STREAK_BONUS_MULTIPLIER);
    return basePoints + streakBonus;
  }, []);

  const setUserAsync = useCallback(async (value: React.SetStateAction<User>): Promise<void> => {
    return new Promise((resolve) => {
      setUser(value);
      resolve();
    });
  }, []);

  const setPreviousEventAsync = useCallback(async (event: Event | null): Promise<void> => {
    return new Promise((resolve) => {
      setPreviousEvent(event);
      resolve();
    });
  }, []);

  const setNewEventAsync = useCallback(async (event: Event | null): Promise<void> => {
    return new Promise((resolve) => {
      setNewEvent(event);
      resolve();
    });
  }, []);

  return {
    user,
    setUser: setUserAsync,
    levelUpInfo,
    setLevelUpInfo,
    previousEvent,
    setPreviousEvent: setPreviousEventAsync,
    newEvent,
    setNewEvent: setNewEventAsync,
    timeLeft,
    setTimeLeft,
    isCountdownActive,
    setIsCountdownActive,
    isGameOver,
    setIsGameOver,
    isImageLoaded,
    setIsImageLoaded,
    showDates,
    setShowDates,
    isCorrect,
    setIsCorrect,
    calculatePoints
  };
}

export default useGameState;