import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  SafeAreaView, 
  StatusBar,
  Animated,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import useAdminStatus from '../hooks/useAdminStatus';
import GeometricBackground from '../components/GeometricBackground';
import styles from '../styles/vue1styles';

const AnimatedVisual = ({ type, selected }) => {
  const pulseAnim = React.useRef(new Animated.Value(1)).current;
  const rotateAnim = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 3000,
          useNativeDriver: true,
        }),
        Animated.timing(rotateAnim, {
          toValue: 0,
          duration: 3000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const visualColor = selected ? '#FFFFFF' : '#FF4B2B';

  if (type === 'chronological') {
    return (
      <View style={styles.modeVisual}>
        <Animated.View style={[
          styles.timelineDot,
          { backgroundColor: visualColor },
          { transform: [{ scale: pulseAnim }] }
        ]} />
        <Animated.View style={[
          styles.timelineArrow,
          { backgroundColor: visualColor },
          {
            transform: [{
              scaleX: rotateAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [1, 1.2]
              })
            }]
          }
        ]} />
        <Animated.View style={[
          styles.timelineDot,
          { backgroundColor: visualColor },
          { transform: [{ scale: pulseAnim }] }
        ]} />
      </View>
    );
  }

  return (
    <View style={styles.comparisonCircles}>
      <Animated.View style={[
        styles.circle,
        { borderColor: visualColor },
        { transform: [{ scale: pulseAnim }] }
      ]}>
        <Text style={[styles.circleText, { color: visualColor }]}>1</Text>
      </Animated.View>
      <Animated.View style={{
        transform: [{
          rotate: rotateAnim.interpolate({
            inputRange: [0, 1],
            outputRange: ['0deg', '180deg']
          })
        }]
      }}>
        <Ionicons name="swap-horizontal" size={28} color={visualColor} />
      </Animated.View>
      <Animated.View style={[
        styles.circle,
        { borderColor: visualColor },
        { transform: [{ scale: pulseAnim }] }
      ]}>
        <Text style={[styles.circleText, { color: visualColor }]}>2</Text>
      </Animated.View>
    </View>
  );
};

const GameModeCard = ({ type, title, description, selected, onSelect, isFirst }) => {
  const scaleAnim = React.useRef(new Animated.Value(0.95)).current;
  const opacityAnim = React.useRef(new Animated.Value(0)).current;
  const rotateAnim = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.delay(isFirst ? 100 : 300),
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 20,
          friction: 7,
          useNativeDriver: true
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true
        })
      ])
    ]).start();
  }, []);

  const handlePress = () => {
    Animated.sequence([
      Animated.spring(rotateAnim, {
        toValue: 1,
        tension: 100,
        friction: 5,
        useNativeDriver: true
      }),
      Animated.spring(rotateAnim, {
        toValue: 0,
        tension: 100,
        friction: 5,
        useNativeDriver: true
      })
    ]).start();

    onSelect();
  };

  return (
    <Animated.View style={[
      styles.cardContainer,
      {
        opacity: opacityAnim,
        transform: [
          { scale: scaleAnim },
          {
            rotate: rotateAnim.interpolate({
              inputRange: [0, 1],
              outputRange: ['0deg', '3deg']
            })
          }
        ]
      }
    ]}>
      <TouchableOpacity
        style={[styles.card, selected && styles.selectedCard]}
        onPress={handlePress}
        activeOpacity={0.9}
      >
        <LinearGradient
          colors={selected ? ['#FF4B2B', '#FF416C'] : ['#FFFFFF', '#FFFFFF']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.cardGradient}
        >
          <Text style={[
            styles.cardTitle,
            selected && styles.selectedText
          ]}>{title}</Text>
          <Text style={[
            styles.cardDescription,
            selected && styles.selectedText
          ]}>{description}</Text>
          <AnimatedVisual type={type} selected={selected} />
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
};

export default function Vue1() {
  const [selectedMode, setSelectedMode] = useState(null);
  const buttonAnim = React.useRef(new Animated.Value(0)).current;
  const titleAnim = React.useRef(new Animated.Value(0)).current;
  const router = useRouter();
  const { isAdmin } = useAdminStatus();

  useEffect(() => {
    Animated.spring(titleAnim, {
      toValue: 1,
      tension: 20,
      friction: 7,
      useNativeDriver: true
    }).start();
  }, []);

  useEffect(() => {
    Animated.spring(buttonAnim, {
      toValue: selectedMode ? 1 : 0,
      tension: 50,
      friction: 7,
      useNativeDriver: true
    }).start();
  }, [selectedMode]);

  const handleStartGame = () => {
    if (!selectedMode) return;
    
    Animated.parallel([
      Animated.timing(titleAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true
      }),
      Animated.timing(buttonAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true
      })
    ]).start(() => {
      router.push(selectedMode === 'chronological' ? '/vue2a' : '/vue2b');
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar translucent backgroundColor="transparent" barStyle="dark-content" />
      <LinearGradient
        colors={['#FFE4D6', '#FFF5E6']}
        style={styles.container}
      >
        <GeometricBackground />

        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.headerButton}
            onPress={() => router.push('/vue6')}
          >
            <Ionicons name="time-outline" size={24} color="#FF4B2B" />
            <Text style={styles.headerButtonText}>Histoire</Text>
          </TouchableOpacity>

          {isAdmin && (
            <>
              <TouchableOpacity 
                style={styles.headerButton}
                onPress={() => router.push('/vue4')}
              >
                <Ionicons name="images-outline" size={24} color="#FF4B2B" />
                <Text style={styles.headerButtonText}>Images</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.headerButton}
                onPress={() => router.push('/vue5')}
              >
                <Ionicons name="settings-outline" size={24} color="#FF4B2B" />
                <Text style={styles.headerButtonText}>Admin</Text>
              </TouchableOpacity>
            </>
          )}
        </View>

        <View style={styles.content}>
          <Animated.View style={[
            styles.cardsContainer,
            {
              transform: [{
                translateY: titleAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [50, 0]
                })
              }]
            }
          ]}>
            <GameModeCard
              type="chronological"
              title="Mode Avant/Après"
              description="Voyagez dans le temps ! Un événement référence vous est donné, devinez si le nouvel événement s'est passé avant ou après."
              selected={selectedMode === 'chronological'}
              onSelect={() => setSelectedMode('chronological')}
              isFirst
            />

            <GameModeCard
              type="comparison"
              title="Mode Comparaison"
              description="Défiez votre instinct ! Entre deux événements historiques, identifiez celui qui s'est déroulé le plus récemment."
              selected={selectedMode === 'comparison'}
              onSelect={() => setSelectedMode('comparison')}
            />
          </Animated.View>

          <Animated.View style={[
            styles.startButtonContainer,
            {
              opacity: buttonAnim,
              transform: [{
                translateY: buttonAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [50, 0]
                })
              }]
            }
          ]}>
            <TouchableOpacity
              style={[styles.startButton, !selectedMode && styles.startButtonDisabled]}
              onPress={handleStartGame}
              disabled={!selectedMode}
            >
              <LinearGradient
                colors={selectedMode ? ['#FF4B2B', '#FF416C'] : ['#CCCCCC', '#BBBBBB']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.startButtonGradient}
              >
                <Text style={styles.startButtonText}>Commencer l'aventure</Text>
                <Ionicons name="arrow-forward" size={24} color="white" />
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
}