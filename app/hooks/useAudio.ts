import { useState, useCallback, useEffect } from 'react';
import { Audio } from 'expo-av';
import { gameLogger } from '../utils/gameLogger';

interface CachedSound {
  sound: Audio.Sound;
  status: Audio.PlaybackStatus;
}

export const useAudio = () => {
  const [sounds, setSounds] = useState<{ [key: string]: CachedSound | null }>({
    correct: null,
    incorrect: null,
    levelUp: null,
    countdown: null,
    gameover: null,
  });

  const [soundVolume, setSoundVolume] = useState(0.80);
  const [musicVolume, setMusicVolume] = useState(0.80);
  const [isSoundEnabled, setIsSoundEnabled] = useState(true);
  const [isMusicEnabled, setIsMusicEnabled] = useState(true);

  const soundPaths = {
    correct: require('../../assets/sounds/corectok.wav'),
    incorrect: require('../../assets/sounds/361260__japanyoshithegamer__8-bit-wrong-sound.wav'),
    levelUp: require('../../assets/sounds/423455__ohforheavensake__trumpet-brass-fanfare.wav'),
    countdown: require('../../assets/sounds/361254__japanyoshithegamer__8-bit-countdown-ready.wav'),
    gameover: require('../../assets/sounds/242208__wagna__failfare.mp3')
  };

  useEffect(() => {
    const initAudio = async () => {
      try {
        const audioConfig = {
          allowsRecordingIOS: false,
          staysActiveInBackground: true,
          playsInSilentModeIOS: true,
          shouldDuckAndroid: true,
          playThroughEarpieceAndroid: false
        };

        await Audio.setAudioModeAsync(audioConfig);

        for (const [key, path] of Object.entries(soundPaths)) {
          await loadSound(key);
        }

      } catch (error) {
        gameLogger.error('Failed to initialize audio system:', error);
      }
    };

    initAudio();

    return () => {
      Object.entries(sounds).forEach(async ([_, soundObj]) => {
        if (soundObj?.sound) {
          try {
            await soundObj.sound.unloadAsync();
          } catch (error) {
            gameLogger.error('Error unloading sound:', error);
          }
        }
      });
    };
  }, []);

  const loadSound = async (soundKey: string): Promise<Audio.Sound | null> => {
    try {
      const { sound, status } = await Audio.Sound.createAsync(
        soundPaths[soundKey],
        { volume: soundVolume * 0.1, shouldPlay: false }
      );
      
      setSounds(prev => ({
        ...prev,
        [soundKey]: { sound, status }
      }));

      sound.setOnPlaybackStatusUpdate(status => {
        if (status.didJustFinish) {
          gameLogger.info(`Sound ${soundKey} finished playing`);
        }
      });

      return sound;
    } catch (error) {
      gameLogger.error(`Error loading sound ${soundKey}:`, error);
      return null;
    }
  };

  const playSound = async (soundKey: string, volume: number = soundVolume) => {
    if (!isSoundEnabled) return;

    try {
      let sound = sounds[soundKey]?.sound;

      if (!sound) {
        sound = await loadSound(soundKey);
        if (!sound) return;
      }

      const finalVolume = Math.min(volume, 0.1);
      await sound.setVolumeAsync(finalVolume);
      await sound.setPositionAsync(0);
      await sound.playAsync();

    } catch (error) {
      gameLogger.error(`Error playing sound ${soundKey}:`, error);
    }
  };

  const playCorrectSound = useCallback(() => {
    return playSound('correct', soundVolume * 0.2);
  }, [isSoundEnabled, soundVolume]);

  const playIncorrectSound = useCallback(() => {
    return playSound('incorrect', soundVolume * 0.15);
  }, [isSoundEnabled, soundVolume]);

  const playLevelUpSound = useCallback(() => {
    return playSound('levelUp', soundVolume * 0.1);
  }, [isSoundEnabled, soundVolume]);

  const playCountdownSound = useCallback(() => {
    return playSound('countdown', soundVolume * 0.1);
  }, [isSoundEnabled, soundVolume]);

  const playGameOverSound = useCallback(() => {
    return playSound('gameover', soundVolume * 0.15);
  }, [isSoundEnabled, soundVolume]);

  const setVolume = async (volume: number, type: 'sound' | 'music') => {
    const safeVolume = Math.min(volume, 0.1);
    try {
      if (type === 'sound') {
        setSoundVolume(safeVolume);
        Object.entries(sounds).forEach(async ([_, soundObj]) => {
          if (soundObj?.sound) {
            await soundObj.sound.setVolumeAsync(safeVolume);
          }
        });
      } else {
        setMusicVolume(safeVolume);
      }
    } catch (error) {
      gameLogger.error(`Error setting ${type} volume:`, error);
    }
  };

  const toggleSound = (enabled: boolean) => {
    setIsSoundEnabled(enabled);
  };

  const toggleMusic = (enabled: boolean) => {
    setIsMusicEnabled(enabled);
  };

  return {
    playCorrectSound,
    playIncorrectSound,
    playLevelUpSound,
    playCountdownSound,
    playGameOverSound,
    setSoundVolume: (volume: number) => setVolume(volume, 'sound'),
    setMusicVolume: (volume: number) => setVolume(volume, 'music'),
    toggleSound,
    toggleMusic,
    isSoundEnabled,
    isMusicEnabled,
    soundVolume,
    musicVolume
  };
};

export default useAudio;