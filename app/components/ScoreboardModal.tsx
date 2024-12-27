// 1. Configuration et Imports
// ==========================
// 1.A. Imports de Base
// -------------------
// 1.A.a. Imports React et React Native
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  Animated,
  Dimensions,
} from 'react-native';

// 1.A.b. Imports des dépendances externes
import { Ionicons } from '@expo/vector-icons';

// 1.A.c. Imports des ressources locales
import { colors } from '../styles/colors';
// Fin de la section 1.A. Imports de Base

// 1.B. Configuration initiale
// -------------------------
// 1.B.a. Constantes de dimensions
const { width } = Dimensions.get('window');
// Fin de la section 1.B. Configuration initiale
// Fin de la section 1. Configuration et Imports

// 2. Types et Interfaces
// =====================
// 2.A. Props du composant modal
// ---------------------------
// 2.A.a. Interface principale
interface ScoreboardModalProps {
  isVisible: boolean;
  currentScore: number;
  personalBest: number;
  onRestart: () => void;
  onMenuPress: () => void;
  playerName: string;
  dailyScores?: Array<{name: string, score: number, rank?: number}>;
  monthlyScores?: Array<{name: string, score: number, rank?: number}>;
  allTimeScores?: Array<{name: string, score: number, rank?: number}>;
}
// Fin de la section 2.A. Props du composant modal
// Fin de la section 2. Types et Interfaces

// 3. Composant ScoreboardModal
// ===========================
// 3.A. Définition du composant
// ---------------------------
const ScoreboardModal: React.FC<ScoreboardModalProps> = ({
  isVisible,
  currentScore,
  personalBest,
  onRestart,
  onMenuPress,
  playerName,
  dailyScores = [],
  monthlyScores = [],
  allTimeScores = []
}) => {
  // 3.B. États locaux
  // ---------------
  // 3.B.a. Gestion de l'onglet actif
  const [activeTab, setActiveTab] = useState<'daily' | 'monthly' | 'allTime'>('daily');
  
  // 3.B.b. Animation d'échelle
  const scaleAnim = React.useRef(new Animated.Value(0)).current;
  
  // 3.B.c. État dérivé pour le score
  const isNewHighScore = currentScore > personalBest;

  // 3.C. Effets
  // ----------
  // 3.C.a. Animation d'affichage
  useEffect(() => {
    if (isVisible) {
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 50,
        friction: 7,
      }).start();
    } else {
      scaleAnim.setValue(0);
    }
  }, [isVisible]);

  // 3.D. Fonctions de rendu
  // ---------------------
  // 3.D.a. Rendu d'une ligne de score
  const renderScore = (score: { name: string; score: number; rank?: number }, index: number) => {
    const isCurrentPlayer = score.name === playerName;
    
    return (
      <View 
        key={`${score.name}-${index}`} 
        style={[
          styles.scoreRow,
          isCurrentPlayer && styles.currentPlayerRow
        ]}
      >
        <View style={styles.rankContainer}>
          <Text style={styles.rankText}>#{score.rank || index + 1}</Text>
        </View>
        <Text 
          style={[
            styles.playerName,
            isCurrentPlayer && styles.currentPlayerText
          ]} 
          numberOfLines={1}
        >
          {score.name}
        </Text>
        <Text 
          style={[
            styles.scoreValue,
            isCurrentPlayer && styles.currentPlayerText
          ]}
        >
          {score.score.toLocaleString()}
        </Text>
      </View>
    );
  };

 // 3.D.b. Sélection des scores à afficher
const getCurrentScores = () => {
  switch (activeTab) {
    case 'daily':
      // Limite à 5 scores pour les scores journaliers
      return dailyScores.slice(0, 5);
    case 'monthly':
      // Limite à 5 scores pour les scores mensuels
      return monthlyScores.slice(0, 5);
    case 'allTime':
      // Limite à 5 scores pour les scores de tous les temps
      return allTimeScores.slice(0, 5);
    default:
      return [];
  }
};

  // 3.E. Rendu principal
  // ------------------
  return (
    <Modal
      transparent
      visible={isVisible}
      animationType="none"
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        <Animated.View
          style={[
            styles.container,
            {
              transform: [{ scale: scaleAnim }]
            }
          ]}
        >
          <Text style={styles.title}>Partie terminée !</Text>

          <View style={styles.scoreContainer}>
            <Text style={styles.scoreText}>{currentScore.toLocaleString()}</Text>
            {isNewHighScore && (
              <View style={styles.newHighScoreContainer}>
                <Ionicons name="trophy" size={24} color={colors.warningYellow} />
                <Text style={styles.newHighScoreText}>Nouveau record !</Text>
              </View>
            )}
          </View>

          <View style={styles.tabsContainer}>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'daily' && styles.activeTab]}
              onPress={() => setActiveTab('daily')}
            >
              <Ionicons 
                name="today" 
                size={24} 
                color={activeTab === 'daily' ? colors.primary : colors.text} 
              />
              <Text 
                style={[
                  styles.tabText,
                  activeTab === 'daily' && styles.activeTabText
                ]}
              >
                Jour
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tab, activeTab === 'monthly' && styles.activeTab]}
              onPress={() => setActiveTab('monthly')}
            >
              <Ionicons 
                name="calendar" 
                size={24} 
                color={activeTab === 'monthly' ? colors.primary : colors.text}
              />
              <Text 
                style={[
                  styles.tabText,
                  activeTab === 'monthly' && styles.activeTabText
                ]}
              >
                Mois
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tab, activeTab === 'allTime' && styles.activeTab]}
              onPress={() => setActiveTab('allTime')}
            >
              <Ionicons 
                name="trophy" 
                size={24} 
                color={activeTab === 'allTime' ? colors.primary : colors.text}
              />
              <Text 
                style={[
                  styles.tabText,
                  activeTab === 'allTime' && styles.activeTabText
                ]}
              >
                Total
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.scoresListContainer}>
            {getCurrentScores().map((score, index) => renderScore(score, index))}
            {getCurrentScores().length === 0 && (
              <View style={styles.noScoresContainer}>
                <Text style={styles.noScoresText}>
                  Aucun score disponible
                </Text>
              </View>
            )}
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity 
              style={styles.button} 
              onPress={onRestart}
            >
              <Text style={styles.buttonText}>Rejouer</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.button, styles.menuButton]} 
              onPress={onMenuPress}
            >
              <Text style={styles.buttonText}>Menu</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};
// Fin de la section 3.E. Rendu principal
// Fin de la section 3. Composant ScoreboardModal

// 4. Styles
// =========
// 4.A. Styles de base
// -----------------
// 4.A.a. Styles de l'overlay et du conteneur
const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    width: width * 0.85,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
  },

  // 4.A.b. Styles du titre et du score
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 10,
  },
  scoreContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  scoreText: {
    fontSize: 40,
    fontWeight: 'bold',
    color: colors.primary,
  },

  // 4.B. Styles des éléments de score
  // -------------------------------
  // 4.B.a. Styles du nouveau record
  newHighScoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    backgroundColor: colors.transparencies.light,
    padding: 10,
    borderRadius: 12,
  },
  newHighScoreText: {
    color: colors.warningYellow,
    fontWeight: 'bold',
    fontSize: 16,
    marginLeft: 8,
  },

  // 4.C. Styles des onglets
  // ---------------------
  // 4.C.a. Conteneur des onglets
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: colors.transparencies.light,
    padding: 4,
    borderRadius: 15,
    marginBottom: 15,
    width: '100%',
  },
  
  // 4.C.b. Styles individuels des onglets
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    gap: 8,
  },
  activeTab: {
    backgroundColor: 'white',
  },
  tabText: {
    fontSize: 14,
    color: colors.text,
  },
  activeTabText: {
    color: colors.primary,
    fontWeight: 'bold',
  },

  // 4.D. Styles de la liste des scores
  // -------------------------------
  // 4.D.a. Conteneur principal
  scoresListContainer: {
    width: '100%',
    marginBottom: 20,
    maxHeight: 300,
  },
  noScoresContainer: {
    padding: 20,
    alignItems: 'center',
  },
  noScoresText: {
    color: colors.lightText,
    fontSize: 16,
  },

  // 4.D.b. Styles des lignes de score
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 10,
    backgroundColor: colors.transparencies.light,
    marginBottom: 8,
  },
  currentPlayerRow: {
    backgroundColor: colors.primary + '20',
    borderWidth: 1,
    borderColor: colors.primary,
  },
  rankContainer: {
    width: 40,
    alignItems: 'center',
  },
  rankText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.primary,
  },
  playerName: {
    flex: 1,
    fontSize: 16,
    color: colors.text,
    marginLeft: 10,
  },
  currentPlayerText: {
    color: colors.primary,
    fontWeight: 'bold',
  },
  scoreValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.accent,
    marginLeft: 10,
  },

  // 4.E. Styles des boutons
  // ---------------------
  // 4.E.a. Conteneur des boutons
  buttonContainer: {
    flexDirection: 'row',
    gap: 15,
  },

  // 4.E.b. Styles des boutons individuels
  button: {
    backgroundColor: colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
    minWidth: 120,
    alignItems: 'center',
  },
  menuButton: {
    backgroundColor: colors.accent,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  }
});
// Fin de la section 4.E. Styles des boutons
// Fin de la section 4. Styles

export default ScoreboardModal;