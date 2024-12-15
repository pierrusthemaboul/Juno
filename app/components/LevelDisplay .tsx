import React from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { colors } from '../styles/colors';

interface LevelDisplayProps {
 show: boolean;
 level: number;
 prevLevel: number;
 eventsNeeded: number;
 totalEvents: number;
 message: string;
}

const LevelDisplay = ({ show, level, prevLevel, eventsNeeded, totalEvents, message }: LevelDisplayProps) => {
 const scaleAnim = React.useRef(new Animated.Value(0)).current;
 const opacityAnim = React.useRef(new Animated.Value(0)).current;

 React.useEffect(() => {
   if (show) {
     Animated.parallel([
       Animated.spring(scaleAnim, {
         toValue: 1,
         friction: 5,
         tension: 40,
         useNativeDriver: true
       }),
       Animated.timing(opacityAnim, {
         toValue: 1,
         duration: 300,
         useNativeDriver: true
       })
     ]).start();
   } else {
     Animated.parallel([
       Animated.timing(scaleAnim, {
         toValue: 0,
         duration: 200,
         useNativeDriver: true
       }),
       Animated.timing(opacityAnim, {
         toValue: 0,
         duration: 200,
         useNativeDriver: true
       })
     ]).start();
   }
 }, [show]);

 const getLevelColor = (level: number): string => {
   if (level <= 5) return colors.correctGreen;
   if (level <= 10) return '#FFD700'; // Or.
   if (level <= 15) return '#FFA500'; // Orange.
   if (level <= 20) return '#FF4500'; // Rouge-orangé.
   return '#FF0000'; // Rouge pour les niveaux difficiles.
 };

 return (
   <Animated.View
     style={[
       styles.container,
       {
         opacity: opacityAnim,
         transform: [{ scale: scaleAnim }]
       }
     ]}
   >
     <View style={[styles.levelBadge, { backgroundColor: getLevelColor(level) }]}>
       {level === prevLevel ? (
         <>
           <Text style={styles.levelText}>{`NIVEAU ${level}`}</Text>
           <Text style={styles.progressText}>
             {level < 25 ? `${totalEvents}/${eventsNeeded} événements` : 'Mode infini'}
           </Text>
         </>
       ) : (
         <>
           <Text style={styles.newLevelText}>NIVEAU SUPÉRIEUR !</Text>
           <Text style={styles.levelText}>{`${prevLevel} → ${level}`}</Text>
         </>
       )}
     </View>
     
     <View style={styles.messageContainer}>
       <Text style={styles.message}>{message}</Text>
     </View>
   </Animated.View>
 );
};

const styles = StyleSheet.create({
 container: {
   position: 'absolute',
   top: '15%',
   left: 20,
   right: 20,
   alignItems: 'center',
   zIndex: 1000,
 },
 levelBadge: {
   backgroundColor: 'rgba(0, 0, 0, 0.85)',
   paddingVertical: 15,
   paddingHorizontal: 25,
   borderRadius: 15,
   alignItems: 'center',
   elevation: 5,
   shadowColor: '#000',
   shadowOffset: {
     width: 0,
     height: 2,
   },
   shadowOpacity: 0.25,
   shadowRadius: 3.84,
 },
 levelText: {
   color: 'white',
   fontSize: 28,
   fontWeight: 'bold',
   textAlign: 'center',
   textShadowColor: 'rgba(0, 0, 0, 0.75)',
   textShadowOffset: { width: 1, height: 1 },
   textShadowRadius: 3,
 },
 newLevelText: {
   color: '#FFD700',
   fontSize: 20,
   fontWeight: 'bold',
   marginBottom: 5,
   textShadowColor: 'rgba(0, 0, 0, 0.75)',
   textShadowOffset: { width: 1, height: 1 },
   textShadowRadius: 3,
 },
 progressText: {
   color: 'white',
   fontSize: 16,
   marginTop: 5,
   opacity: 0.9,
 },
 messageContainer: {
   backgroundColor: 'rgba(255, 255, 255, 0.95)',
   marginTop: 10,
   padding: 15,
   borderRadius: 10,
   elevation: 3,
   shadowColor: '#000',
   shadowOffset: {
     width: 0,
     height: 1,
   },
   shadowOpacity: 0.22,
   shadowRadius: 2.22,
 },
 message: {
   color: '#333',
   fontSize: 16,
   textAlign: 'center',
   fontWeight: '500',
 }
});

export default LevelDisplay;