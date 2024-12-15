import { StyleSheet, Dimensions, Platform, StatusBar } from 'react-native';

const { width, height } = Dimensions.get('window');
const CARD_WIDTH = Math.min(400, width * 0.9);
const CARD_HEIGHT = Math.min(300, height * 0.35);

export default StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFE4D6',
  },
  container: {
    flex: 1,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginTop: Platform.OS === 'android' ? 20 : 0,
    zIndex: 1,
  },
  headerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 25,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  headerButtonText: {
    marginLeft: 8,
    color: '#FF4B2B',
    fontSize: 14,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  cardsContainer: {
    alignItems: 'center',
    gap: 24,
    paddingHorizontal: 16,
    marginTop: -40,
  },
  cardContainer: {
    width: CARD_WIDTH,
    maxHeight: CARD_HEIGHT,
  },
  card: {
    borderRadius: 24,
    backgroundColor: 'white',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    overflow: 'hidden',
  },
  selectedCard: {
    borderWidth: 2,
    borderColor: '#FF4B2B',
  },
  cardGradient: {
    padding: 24,
    minHeight: CARD_HEIGHT,
    justifyContent: 'space-between',
  },
  cardTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#2D1832',
    marginBottom: 12,
    textAlign: 'center',
  },
  cardDescription: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
    textAlign: 'center',
    paddingHorizontal: 8,
  },
  selectedText: {
    color: '#FFFFFF',
  },
  modeVisual: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 60,
    gap: 20,
  },
  timelineArrow: {
    width: 100,
    height: 4,
    backgroundColor: '#FF4B2B',
  },
  timelineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#FF4B2B',
  },
  comparisonCircles: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    height: 60,
    gap: 24,
  },
  circle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 3,
    borderColor: '#FF4B2B',
    justifyContent: 'center',
    alignItems: 'center',
  },
  circleText: {
    fontSize: 20,
    color: '#FF4B2B',
    fontWeight: '600',
  },
  startButtonContainer: {
    paddingVertical: 24,
    paddingHorizontal: 20,
  },
  startButton: {
    borderRadius: 30,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
  },
  startButtonDisabled: {
    opacity: 0.7,
  },
  startButtonGradient: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 32,
  },
  startButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginRight: 12,
  },
});