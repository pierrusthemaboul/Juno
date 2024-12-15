import React, { useEffect } from 'react';
import { Animated, StyleSheet, Text, View, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../styles/colors';

const { width, height } = Dimensions.get('window');

interface LevelTransitionProps {
 level: number;
 show: boolean;
 onFinish?: () => void;
 difficultyDescription?: string;
 previousLevel?: number;
}

export const LevelTransition: React.FC<LevelTransitionProps> = ({
 level,
 show,
 onFinish,
 difficultyDescription,
 previousLevel
}) => {
 // Ne pas afficher au niveau 1 au démarrage
 if (level === 1 && !previousLevel) {
   if (onFinish) {
     onFinish();
   }
   return null;
 }

 const scaleAnim = React.useRef(new Animated.Value(0)).current;
 const opacityAnim = React.useRef(new Animated.Value(0)).current;
 const backgroundOpacityAnim = React.useRef(new Animated.Value(0)).current;

 const getLevelTheme = (level: number) => {
   if (level === 1) return "Les Grands Événements de l'Histoire";
   if (level === 2) return "Les Moments Clés"; 
   if (level <= 5) return "Les Époques Charnières";
   if (level <= 10) return "La Précision Historique";
   if (level <= 15) return "Les Détails qui Comptent";
   if (level <= 20) return "La Finesse Chronologique";
   return "La Maîtrise Absolue";
 };

 const getDefaultDescription = (level: number) => {
   if (level === 1) return "Des événements marquants très espacés dans le temps";
   if (level === 2) return "Des événements célèbres à plusieurs siècles d'écart";
   if (level <= 5) return "La difficulté augmente progressivement";
   return "Les événements se rapprochent dans le temps";
 };

 useEffect(() => {
   if (show) {
     // Reset animations
     scaleAnim.setValue(0);
     opacityAnim.setValue(0);
     backgroundOpacityAnim.setValue(0);

     Animated.sequence([
       // Fade in background
       Animated.timing(backgroundOpacityAnim, {
         toValue: 1,
         duration: 400,
         useNativeDriver: true,
       }),
       // Scale and fade in content
       Animated.parallel([
         Animated.spring(scaleAnim, {
           toValue: 1,
           friction: 4,
           tension: 40,
           useNativeDriver: true,
         }),
         Animated.timing(opacityAnim, {
           toValue: 1,
           duration: 400,
           useNativeDriver: true,
         }),
       ]),
       // Hold
       Animated.delay(2000),
       // Fade out everything
       Animated.parallel([
         Animated.timing(opacityAnim, {
           toValue: 0,
           duration: 400,
           useNativeDriver: true,
         }),
         Animated.timing(backgroundOpacityAnim, {
           toValue: 0,
           duration: 400,
           useNativeDriver: true,
         }),
       ]),
     ]).start(() => {
       if (onFinish) {
         onFinish();
       }
     });
   }
 }, [show]);

 const description = difficultyDescription || getDefaultDescription(level);
 const theme = getLevelTheme(level);

 return (
   <Animated.View 
     style={[
       styles.container,
       {
         opacity: backgroundOpacityAnim,
         pointerEvents: show ? 'auto' : 'none'
       }
     ]}
   >
     <Animated.View
       style={[
         styles.content,
         {
           opacity: opacityAnim,
           transform: [{ scale: scaleAnim }]
         }
       ]}
     >
       {previousLevel && level > previousLevel ? (
         <View style={styles.levelUpContainer}>
           <Ionicons name="arrow-up-circle" size={40} color="#FFD700" />
           <Text style={styles.levelUpText}>NIVEAU SUPÉRIEUR !</Text>
         </View>
       ) : null}
       
       <Text style={styles.levelNumber}>NIVEAU {level}</Text>
       <Text style={styles.theme}>{theme}</Text>
       <Text style={styles.description}>{description}</Text>
       
       {level === 1 && (
         <View style={styles.tutorialHint}>
           <Text style={styles.tutorialText}>
             Placez les événements dans l'ordre chronologique
           </Text>
         </View>
       )}
     </Animated.View>
   </Animated.View>
 );
};

const styles = StyleSheet.create({
 container: {
   position: 'absolute',
   top: 0,
   left: 0,
   right: 0,
   bottom: 0,
   backgroundColor: 'rgba(0,0,0,0.85)',
   justifyContent: 'center',
   alignItems: 'center',
   zIndex: 1000,
 },
 content: {
   padding: 20,
   alignItems: 'center',
 },
 levelUpContainer: {
   alignItems: 'center',
   marginBottom: 20,
 },
 levelUpText: {
   color: '#FFD700',
   fontSize: 24,
   fontWeight: 'bold',
   marginTop: 10,
   textShadowColor: 'rgba(0,0,0,0.75)',
   textShadowOffset: { width: 1, height: 1 },
   textShadowRadius: 3,
 },
 levelNumber: {
   fontSize: 72,
   fontWeight: 'bold',
   color: 'white',
   textShadowColor: 'rgba(0,0,0,0.75)',
   textShadowOffset: { width: 2, height: 2 },
   textShadowRadius: 3,
 },
 theme: {
   fontSize: 24,
   color: '#FFD700',
   marginTop: 20,
   textAlign: 'center',
   textShadowColor: 'rgba(0,0,0,0.75)',
   textShadowOffset: { width: 1, height: 1 },
   textShadowRadius: 2,
 },
 description: {
   fontSize: 18,
   color: 'white',
   marginTop: 10,
   textAlign: 'center',
   opacity: 0.9,
   maxWidth: width * 0.8,
 },
 tutorialHint: {
   marginTop: 30,
   padding: 15,
   backgroundColor: 'rgba(255,255,255,0.1)',
   borderRadius: 10,
 },
 tutorialText: {
   color: '#FFD700',
   fontSize: 16,
   textAlign: 'center',
 },
});

export default LevelTransition;