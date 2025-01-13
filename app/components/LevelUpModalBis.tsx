/************************************************************************************
 * 4. COMPOSANT : LevelUpModalBis
 *
 * 4.A. Description
 *     Modal de transition et présentation des niveaux avec récapitulatif des événements.
 *
 * 4.B. Props
 *     @interface LevelModalProps
 *     @property {boolean} visible - Contrôle la visibilité du modal.
 *     @property {number} level - Niveau actuel (qui vient d'être débloqué).
 *     @property {() => void} onStart - Fonction appelée pour démarrer le niveau.
 *     @property {string} name - Nom du niveau (non affiché désormais).
 *     @property {string} description - Description du niveau (non affichée désormais).
 *     @property {number} requiredEvents - Nombre d'événements requis pour le niveau en cours.
 *     @property {SpecialRules[]} [specialRules] - Règles spéciales du niveau.
 *     @property {number} [previousLevel] - Niveau précédent (si applicable).
 *     @property {boolean} isNewLevel - Indique si c'est un nouveau niveau.
 *     @property {LevelEventSummary[] | undefined} eventsSummary - Récapitulatif des événements du niveau.
 ************************************************************************************/

// 4.C. Imports
import React, { useEffect, useRef, useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  Animated,
  Easing,
  Dimensions,
  TouchableOpacity,
  ScrollView,
  Image
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../styles/colors';
import { LevelEventSummary } from '../hooks/types'; // Importez le type LevelEventSummary

// 4.D. Configuration dimensions
const { width, height } = Dimensions.get('window');

// ******* AJOUT DE L'INTERFACE LevelModalProps *******
interface LevelModalProps {
  visible: boolean;
  level: number;
  onStart: () => void;
  name: string;           // On ne l'affiche plus
  description: string;    // On ne l'affiche plus
  requiredEvents: number;
  specialRules?: any[]; 
  previousLevel?: number;
  isNewLevel: boolean;
  eventsSummary: LevelEventSummary[] | undefined;
}

/**
 * Petite fonction utilitaire pour n'afficher que l'année
 * depuis la string date_formatee (ex: "01 October 2022" -> "2022")
 */
function extractYearFromDateString(dateString: string | undefined): string {
  if (!dateString) return '';
  // On part du principe que la date est au format "DD MMMM YYYY"
  // On découpe par espace et on prend le troisième bloc.
  const parts = dateString.split(' ');
  return parts[2] ?? dateString; // Si jamais le split ne se passe pas bien, on renvoie la string brute
}

/************************************************************************************
 * 4.F. Composant Principal LevelUpModalBis
 ************************************************************************************/
const LevelUpModalBis: React.FC<LevelModalProps> = ({
  visible,
  level,
  onStart,
  name,
  description,
  requiredEvents,
  specialRules,
  previousLevel,
  isNewLevel,
  eventsSummary
}) => {

  // 4.F.1. Références d'animation
  const scaleAnimBis = useRef(new Animated.Value(0.3)).current;
  const opacityAnimBis = useRef(new Animated.Value(0)).current;
  const buttonScaleAnimBis = useRef(new Animated.Value(1)).current;
  const backgroundOpacityAnimBis = useRef(new Animated.Value(0)).current;
  const levelNumberAnimBis = useRef(new Animated.Value(0)).current;
  const contentTranslateYBis = useRef(new Animated.Value(50)).current;
  const statsProgressAnimBis = useRef(new Animated.Value(0)).current;

  // State pour gérer l'affichage du pop-up et l'événement sélectionné
  const [selectedEvent, setSelectedEvent] = useState<LevelEventSummary | null>(null);

  // Fonction pour fermer le pop-up
  const handleCloseEventDetails = () => {
    setSelectedEvent(null);
  };

  // 4.F.2. Effets d'animation lors de l'apparition du modal
  useEffect(() => {
    let isMounted = true;

    if (visible) {
      // Réinitialisation des animations
      const resetAnimations = () => {
        scaleAnimBis.setValue(0.3);
        opacityAnimBis.setValue(0);
        backgroundOpacityAnimBis.setValue(0);
        levelNumberAnimBis.setValue(0);
        contentTranslateYBis.setValue(50);
        buttonScaleAnimBis.setValue(1);
        statsProgressAnimBis.setValue(0);
      };

      resetAnimations();

      // Séquence d'animations
      Animated.sequence([
        Animated.timing(backgroundOpacityAnimBis, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
          easing: Easing.ease
        }),
        Animated.parallel([
          Animated.spring(scaleAnimBis, {
            toValue: 1,
            friction: 8,
            tension: 40,
            useNativeDriver: true
          }),
          Animated.timing(opacityAnimBis, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
            easing: Easing.ease
          }),
          Animated.spring(contentTranslateYBis, {
            toValue: 0,
            friction: 8,
            tension: 40,
            useNativeDriver: true
          }),
          Animated.spring(levelNumberAnimBis, {
            toValue: 1,
            friction: 8,
            tension: 40,
            useNativeDriver: true
          })
        ])
      ]).start(() => {
        if (isMounted) {
          startButtonAnimation();
        }
      });
    }

    return () => {
      isMounted = false;
    };
  }, [visible]);

  // 4.F.3. Animation du bouton de démarrage
  const startButtonAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(buttonScaleAnimBis, {
          toValue: 1.1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(buttonScaleAnimBis, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        })
      ])
    ).start();
  };

  // 4.F.4. Gestionnaire d'événement pour démarrer le niveau
  const handleStart = () => {
    onStart();
  };

  // 4.F.5. Rendu du bandeau de fin de niveau (modifié pour afficher "Bravo ! Niveau X terminé")
  const renderLevelUpBannerBis = () => {
    if (!previousLevel || !isNewLevel) {
      return null;
    }

    return (
      <Animated.View
        style={[
          styles.levelUpBanner,
          {
            transform: [
              { scale: levelNumberAnimBis },
              { translateY: contentTranslateYBis }
            ]
          }
        ]}
      >
        <LinearGradient
          colors={[colors.warningYellow, colors.primary]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.bannerGradient}
        >
          <Ionicons name="trophy" size={32} color="white" />
          <Text style={styles.levelUpText}>
            Bravo ! Niveau {previousLevel} terminé
          </Text>
        </LinearGradient>
      </Animated.View>
    );
  };

  // 4.F.6. Rendu du récapitulatif des événements
  const renderEventsSummaryBis = () => {
    if (!eventsSummary || eventsSummary.length === 0) {
      return null;
    }

    return (
      <View style={styles.eventsSummaryContainer}>
        <Text style={styles.sectionTitle}>Événements du niveau</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {eventsSummary.map((event, index) => {
            return (
              <TouchableOpacity
                key={event.id ?? index}
                onPress={() => {
                  setSelectedEvent(event);
                }}
                activeOpacity={0.7}
              >
                <View style={styles.eventCard}>
                  <Image
                    source={{ uri: event.illustration_url }}
                    style={styles.eventImage}
                    resizeMode="cover"
                  />
                  <LinearGradient
                    colors={['transparent', 'rgba(0,0,0,0.8)']}
                    style={styles.eventGradient}
                  >
                    <Text style={styles.eventDate}>
                      {extractYearFromDateString(event.date_formatee)}
                    </Text>
                    <Text style={styles.eventTitle} numberOfLines={2}>
                      {event.titre}
                    </Text>
                    <View
                      style={[
                        styles.responseIndicator,
                        {
                          backgroundColor: event.wasCorrect
                            ? colors.correctGreen
                            : colors.incorrectRed,
                        },
                      ]}
                    >
                      <Ionicons
                        name={event.wasCorrect ? 'checkmark' : 'close'}
                        size={20}
                        color="white"
                      />
                    </View>
                  </LinearGradient>
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>
    );
  };

  // Rendu du pop-up de détails d'événement
  const renderEventDetailsModal = () => {
    if (!selectedEvent) {
      return null;
    }

    return (
      <Modal
        transparent={true}
        visible={!!selectedEvent}
        onRequestClose={handleCloseEventDetails}
        animationType="fade"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.eventDetailsModal}>
            <ScrollView>
              <Text style={styles.eventDetailsTitle}>
                {selectedEvent.titre}
              </Text>
              <Text style={styles.eventDetailsDate}>
                {extractYearFromDateString(selectedEvent.date_formatee)}
              </Text>
              <Text style={styles.eventDetailsDescription}>
                {selectedEvent.description_detaillee
                  ? selectedEvent.description_detaillee
                  : '[Aucune description détaillée]'}
              </Text>
            </ScrollView>

            <TouchableOpacity
              style={styles.closeButton}
              onPress={handleCloseEventDetails}
            >
              <Text style={styles.closeButtonText}>Fermer</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  };

  // 4.F.7. Rendu conditionnel du contenu du modal
  const renderModalContentBis = () => {
    return (
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        
        {renderLevelUpBannerBis()}

        {/** 
         * On enlève l'affichage du niveau en clair ("NIVEAU 3", "Initié", etc.).
         * Le code suivant est commenté/supprimé pour répondre au besoin :
         *
         * <View style={styles.levelContainer}>
         *   <Animated.Text
         *     style={[
         *       styles.levelLabel,
         *       {
         *         transform: [{ scale: levelNumberAnimBis }]
         *       }
         *     ]}
         *   >
         *     NIVEAU {level}
         *   </Animated.Text>
         *   <Text style={styles.levelName}>{name}</Text>
         * </View>
         */}

        {renderEventsSummaryBis()}

        {/**
         * À la place du "Objectif : 7 événements",
         * on annonce le niveau suivant dans la même police :
         * "Niveau {level} : objectif {requiredEvents} événements"
         */}
        <Text style={styles.eventsInfo}>
          Niveau {level} : objectif {requiredEvents} événements
        </Text>

        <Animated.View
          style={[
            styles.startButtonContainer,
            { transform: [{ scale: buttonScaleAnimBis }] }
          ]}
        >
          <TouchableOpacity
            style={styles.startButton}
            onPress={handleStart}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={[colors.primary, colors.accent]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.buttonGradient}
            >
              <Ionicons name="play" size={30} color="white" />
              <Text style={styles.startButtonText}>GO !</Text>
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>
    );
  };

  // 4.F.8. Rendu principal du composant
  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      statusBarTranslucent
    >
      <Animated.View
        style={[
          styles.modalOverlay,
          { opacity: backgroundOpacityAnimBis }
        ]}
      >
        <Animated.View
          style={[
            styles.modalContent,
            {
              opacity: opacityAnimBis,
              transform: [
                { scale: scaleAnimBis },
                { translateY: contentTranslateYBis }
              ]
            }
          ]}
        >
          {renderModalContentBis()}
          {renderEventDetailsModal()}
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};

/************************************************************************************
 * 5. Styles
 ************************************************************************************/
const styles = StyleSheet.create({
  // 5.A. Base du modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: width * 0.85,
    maxHeight: height * 0.85,
    backgroundColor: 'white',
    borderRadius: 20,
    paddingVertical: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    borderWidth: 2,
    borderColor: colors.primary,
  },
  scrollView: {
    paddingHorizontal: 20,
  },

  // 5.B. Bannière de niveau
  levelUpBanner: {
    width: '100%',
    marginBottom: 20,
    borderRadius: 10,
    overflow: 'hidden',
    minHeight: 60,
  },
  bannerGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    paddingHorizontal: 20,
    minHeight: 60,
  },
  levelUpText: {
    color: 'white',
    fontSize: 22,
    fontWeight: 'bold',
    marginHorizontal: 10,
    textAlign: 'center',
    flexShrink: 1,
  },
  previousLevel: {
    color: 'white',
    fontSize: 20,
    fontWeight: '600',
  },

  // 5.C. Container de niveau (non utilisé désormais)
  levelContainer: {
    alignItems: 'center',
    marginBottom: 20,
    width: '100%',
  },
  levelLabel: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 10,
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  levelName: {
    fontSize: 24,
    fontWeight: '600',
    color: colors.accent,
    textAlign: 'center',
  },

  // 5.D. Informations sur les événements
  eventsInfo: {
    fontSize: 16,
    color: colors.lightText,
    textAlign: 'center',
    marginVertical: 15,
  },

  // 5.E. Bouton de démarrage
  startButtonContainer: {
    width: '100%',
    alignItems: 'center',
    marginTop: 15,
  },
  startButton: {
    width: '80%',
    maxWidth: 250,
  },
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 25,
  },
  startButtonText: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    marginLeft: 10,
    letterSpacing: 2,
  },

  // 5.F. Sections communes
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 15,
    textAlign: 'center',
  },

  // 5.G. Conteneur des événements
  eventsSummaryContainer: {
    marginVertical: 20,
    width: '100%',
  },
  eventCard: {
    width: 200,
    height: 150,
    marginRight: 10,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: colors.cardBackground,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  eventImage: {
    width: '100%',
    height: '100%',
  },
  eventGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 10,
    height: '60%',
  },
  eventDate: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 4,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  eventTitle: {
    color: 'white',
    fontSize: 12,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  responseIndicator: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },

  // 5.H. Styles pour le modal de détails d'événement
  eventDetailsModal: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    width: '80%',
    maxWidth: 400,
    maxHeight: '70%',
  },
  eventDetailsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  eventDetailsDate: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  eventDetailsDescription: {
    fontSize: 14,
    marginBottom: 20,
  },
  closeButton: {
    backgroundColor: colors.primary,
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  closeButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

/************************************************************************************
 * 6. Exportation
 ************************************************************************************/
export default LevelUpModalBis;
