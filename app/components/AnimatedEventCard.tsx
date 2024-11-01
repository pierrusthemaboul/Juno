import React from 'react';
import { 
  View, 
  Image, 
  Text, 
  StyleSheet, 
  Animated, 
  TouchableOpacity,
  Dimensions 
} from 'react-native';
import { colors } from '../styles/colors';

interface AnimatedEventCardProps {
  event: any;
  position: 'left' | 'right';
  onSelect: () => void;
  onImageLoad?: () => void;
  showDate?: boolean;
  isCorrect?: boolean;
  isSelected?: boolean;
  isSelectable: boolean;
}

const AnimatedEventCard: React.FC<AnimatedEventCardProps> = ({
  event,
  position,
  onSelect,
  onImageLoad,
  showDate,
  isCorrect,
  isSelected,
  isSelectable,
}) => {
  const slideAnim = React.useRef(new Animated.Value(
    position === 'left' ? -Dimensions.get('window').width : Dimensions.get('window').width
  )).current;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    }).format(date);
  };

  React.useEffect(() => {
    console.log('AnimatedEventCard mounted:', {
      title: event?.titre,
      position,
      isSelected,
      isCorrect,
      showDate,
      isSelectable
    });

    Animated.spring(slideAnim, {
      toValue: 0,
      useNativeDriver: true,
      friction: 8,
      tension: 40
    }).start();
  }, [event.id, isSelected, isCorrect, showDate]);

  const getBorderColor = () => {
    if (!isSelected || !showDate) return 'transparent';
    return isCorrect ? colors.correctGreen : colors.incorrectRed;
  };

  const getOverlayStyle = () => {
    if (!showDate) return styles.overlay;
    return [
      styles.overlay,
      {
        backgroundColor: isSelected 
          ? isCorrect 
            ? 'rgba(39, 174, 96, 0.9)' 
            : 'rgba(231, 76, 60, 0.9)'
          : 'rgba(0, 0, 0, 0.7)'
      }
    ];
  };

  console.log('AnimatedEventCard render:', {
    title: event?.titre,
    showDate,
    isCorrect,
    isSelected,
    borderColor: getBorderColor()
  });

  return (
    <Animated.View
      style={[
        styles.container,
        { transform: [{ translateX: slideAnim }] }
      ]}
    >
      <TouchableOpacity
        style={[
          styles.card,
          { borderColor: getBorderColor() },
          isSelected && styles.selectedCard,
          !isSelectable && styles.disabledCard
        ]}
        onPress={() => {
          console.log('Card pressed:', {
            title: event?.titre,
            isSelectable,
            isSelected
          });
          onSelect();
        }}
        disabled={!isSelectable}
      >
        <Image
          source={{ uri: event?.illustration_url }}
          style={styles.image}
          resizeMode="cover"
          onLoad={onImageLoad}
        />
        <View style={getOverlayStyle()}>
          <Text style={styles.title} numberOfLines={2}>
            {event?.titre}
          </Text>
          {showDate && (
            <Text style={styles.date}>
              {formatDate(event?.date)}
            </Text>
          )}
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
  },
  card: {
    flex: 1,
    borderRadius: 15,
    overflow: 'hidden',
    backgroundColor: colors.cardBackground,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    borderWidth: 3,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  overlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: 10,
  },
  title: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  date: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 5,
  },
  selectedCard: {
    borderWidth: 3,
  },
  disabledCard: {
    opacity: 0.7,
  },
});

export default AnimatedEventCard;