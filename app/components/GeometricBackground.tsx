import React, { useEffect } from 'react';
import { View, StyleSheet, Animated, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');
const PATTERN_SIZE = 120;

interface PatternProps {
  top: number;
  left: number;
  delay: number;
  size?: number;
  rotationDirection?: 1 | -1;
}

const AnimatedPattern = ({ top, left, delay, size = PATTERN_SIZE, rotationDirection = 1 }: PatternProps) => {
  const scaleAnim = new Animated.Value(0.8);
  const rotateAnim = new Animated.Value(0);
  const opacityAnim = new Animated.Value(0.1);

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(scaleAnim, {
            toValue: 1,
            duration: 4000,
            delay,
            useNativeDriver: true
          }),
          Animated.timing(rotateAnim, {
            toValue: 1,
            duration: 8000,
            delay,
            useNativeDriver: true
          }),
          Animated.timing(opacityAnim, {
            toValue: 0.15,
            duration: 4000,
            delay,
            useNativeDriver: true
          })
        ]),
        Animated.parallel([
          Animated.timing(scaleAnim, {
            toValue: 0.8,
            duration: 4000,
            useNativeDriver: true
          }),
          Animated.timing(opacityAnim, {
            toValue: 0.1,
            duration: 4000,
            useNativeDriver: true
          })
        ])
      ])
    ).start();
  }, []);

  return (
    <Animated.View
      style={[
        styles.pattern,
        {
          top,
          left,
          width: size,
          height: size,
          opacity: opacityAnim,
          transform: [
            { scale: scaleAnim },
            {
              rotate: rotateAnim.interpolate({
                inputRange: [0, 1],
                outputRange: ['0deg', `${360 * rotationDirection}deg`]
              })
            }
          ]
        }
      ]}
    />
  );
};

const GeometricBackground = () => {
  const patterns = [
    { top: -PATTERN_SIZE / 2, left: -PATTERN_SIZE / 2, delay: 0, size: PATTERN_SIZE * 1.5 },
    { top: height - PATTERN_SIZE * 1.5, left: width - PATTERN_SIZE * 1.5, delay: 500, size: PATTERN_SIZE * 2 },
    { top: height / 3, left: -PATTERN_SIZE / 3, delay: 1000, rotationDirection: -1 as const },
    { top: height / 2, left: width - PATTERN_SIZE, delay: 1500, size: PATTERN_SIZE * 1.2 },
    { top: height * 0.8, left: width / 3, delay: 2000, rotationDirection: -1 as const },
  ];

  return (
    <View style={styles.container} pointerEvents="none">
      {patterns.map((pattern, index) => (
        <AnimatedPattern key={index} {...pattern} />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  pattern: {
    position: 'absolute',
    borderWidth: 2,
    borderColor: '#FF4B2B',
    borderRadius: PATTERN_SIZE / 2,
    opacity: 0.1,
  }
});

export default GeometricBackground;