// EventLayoutA.tsx
import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, Dimensions, Animated } from 'react-native';
import AnimatedEventCardA from './AnimatedEventCardA';
import OverlayChoiceButtonsA from './OverlayChoiceButtonsA';

const { height } = Dimensions.get('window');
const ANIMATION_DURATION = 800;

interface EventLayoutAProps {
 previousEvent: any;
 newEvent: any;
 onImageLoad?: () => void;
 onChoice: (choice: string) => void;
 showDate?: boolean;
 isCorrect?: boolean;
 isImageLoaded: boolean;
 streak: number;
 level: number;
 isLevelPaused: boolean;
}

const EventLayoutA: React.FC<EventLayoutAProps> = ({
 previousEvent,
 newEvent,
 onImageLoad,
 onChoice,
 showDate = false,
 isCorrect,
 isImageLoaded,
 streak,
 level,
 isLevelPaused
}) => {
 const [transitioning, setTransitioning] = useState(false);
 const [currentTop, setCurrentTop] = useState(previousEvent);
 const [currentBottom, setCurrentBottom] = useState(newEvent);

 const topCardTranslateY = useRef(new Animated.Value(0)).current;
 const bottomCardTranslateY = useRef(new Animated.Value(0)).current;
 const topCardScale = useRef(new Animated.Value(1)).current;

 useEffect(() => {
   if (newEvent && (!currentBottom || newEvent.id !== currentBottom.id)) {
     startTransition();
   }
 }, [newEvent]);

 const startTransition = () => {
   if (transitioning) return;
   setTransitioning(true);

   const moveDistance = -(height * 0.42);

   Animated.parallel([
     Animated.timing(topCardTranslateY, {
       toValue: moveDistance,
       duration: ANIMATION_DURATION,
       useNativeDriver: true,
     }),
     Animated.timing(topCardScale, {
       toValue: 0.95,
       duration: ANIMATION_DURATION,
       useNativeDriver: true,
     }),
     Animated.timing(bottomCardTranslateY, {
       toValue: moveDistance,
       duration: ANIMATION_DURATION,
       useNativeDriver: true,
     })
   ]).start(() => {
     setCurrentTop(currentBottom);
     setCurrentBottom(newEvent);
     
     topCardTranslateY.setValue(0);
     bottomCardTranslateY.setValue(0);
     topCardScale.setValue(1);
     
     setTransitioning(false);
   });
 };

 const handleChoice = (choice: string) => {
   if (!transitioning) {
     onChoice(choice);
   }
 };

 return (
   <View style={styles.container}>
     <Animated.View style={[
       styles.cardContainer,
       styles.topCard,
       {
         transform: [
           { translateY: topCardTranslateY },
           { scale: topCardScale }
         ]
       }
     ]}>
       <AnimatedEventCardA
         event={currentTop}
         position="top"
         showDate={true}
         streak={streak}
         level={level}
       />
     </Animated.View>

     <Animated.View style={[
       styles.cardContainer,
       styles.bottomCard,
       {
         transform: [{ translateY: bottomCardTranslateY }]
       }
     ]}>
       <View style={styles.bottomCardContent}>
         <AnimatedEventCardA
           event={currentBottom}
           position="bottom"
           onImageLoad={onImageLoad}
           showDate={showDate}
           isCorrect={isCorrect}
           streak={streak}
           level={level}
         />
         <View style={styles.buttonsContainer}>
           <OverlayChoiceButtonsA 
             onChoice={handleChoice}
             disabled={!isImageLoaded || transitioning || showDate}
             isLevelPaused={isLevelPaused}
           />
         </View>
       </View>
     </Animated.View>
   </View>
 );
};

const styles = StyleSheet.create({
 container: {
   flex: 1,
   backgroundColor: 'transparent',
 },
 cardContainer: {
   position: 'absolute',
   left: 10,
   right: 10,
   height: height * 0.42,
   backgroundColor: 'transparent',
 },
 topCard: {
   top: 10,
   zIndex: 1,
 },
 bottomCard: {
   top: height * 0.45,
   zIndex: 2,
 },
 bottomCardContent: {
   flex: 1,
   position: 'relative',
 },
 buttonsContainer: {
   position: 'absolute',
   left: 0,
   right: 0,
   bottom: 40,  // Remonté de 25 à 40
   paddingHorizontal: 20,
   zIndex: 3,
 }
});

export default EventLayoutA;