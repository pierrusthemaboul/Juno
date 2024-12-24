// 1. Configuration et imports
// =========================
// Cette section définit les dépendances et la configuration de base du composant

// 1.A. Imports React et Native
// --------------------------
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  Animated,
  Dimensions,
} from 'react-native';
// Fin 1.A. Imports React et Native

// 1.B. Imports navigation et UI
// ---------------------------
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../styles/colors';
// Fin 1.B. Imports navigation et UI

// 1.C. Configuration dimensions
// --------------------------
const { width } = Dimensions.get('window');
// Fin 1.C. Configuration dimensions
// Fin 1. Configuration et imports

// 2. Types et interfaces
// ====================
// 2.A. Interface principale
// ----------------------
interface GameOverModalProps {
  isVisible: boolean;
  score: number;
  highScore: number;
  onRestart: () => void;
  level: number;
  totalEvents?: number;
  maxStreak?: number;
  leaderboards?: {
    daily: Array<{ name: string; score: number; rank: number }>;
    monthly: Array<{ name: string; score: number; rank: number }>;
    allTime: Array<{ name: string; score: number; rank: number }>;
  };
}
// Fin 2.A. Interface principale
// Fin 2. Types et interfaces

// 3. Composant Modal
// ================
// 3.A. Définition du composant
// --------------------------
const GameOverModal: React.FC<GameOverModalProps> = ({
  isVisible,
  score,
  highScore,
  onRestart,
  level,
  leaderboards,
}) => {
  // 3.A.a. Hooks et états
  const router = useRouter();
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const [activeTab, setActiveTab] = useState<'daily' | 'monthly' | 'allTime'>('daily');
  const isNewHighScore = score > highScore;
  // Fin 3.A.a. Hooks et états

  // 3.B. Effets et animations
  // -----------------------
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
  // Fin 3.B. Effets et animations

  // 3.C. Fonctions de rendu
  // ---------------------
  // 3.C.a. Rendu score individuel
  const renderScore = (score: number, name: string, rank: number) => (
    <View key={rank} style={styles.scoreRow}>
      <View style={styles.rankContainer}>
        <Text style={styles.rankText}>#{rank}</Text>
      </View>
      <Text style={styles.playerName} numberOfLines={1}>
        {name}
      </Text>
      <Text style={styles.scoreValue}>{score.toLocaleString()}</Text>
    </View>
  );
  // Fin 3.C.a. Rendu score individuel

  // 3.C.b. Rendu liste des scores
  const renderScores = () => {
    if (!leaderboards) {
      return (
        <View style={styles.noScoresContainer}>
          <Text style={styles.noScoresText}>Chargement des scores...</Text>
        </View>
      );
    }

    const currentScores = leaderboards[activeTab];
    if (!currentScores || currentScores.length === 0) {
      return (
        <View style={styles.noScoresContainer}>
          <Text style={styles.noScoresText}>Aucun score disponible</Text>
        </View>
      );
    }

    return currentScores.map((score) =>
      renderScore(score.score, score.name, score.rank)
    );
  };
  // Fin 3.C.b. Rendu liste des scores
  // Fin 3.C. Fonctions de rendu

  // 3.D. Rendu principal
  // ------------------
  return (
    <Modal animationType="none" transparent={true} visible={isVisible}>
      <View style={styles.overlay}>
        <Animated.View
          style={[
            styles.container,
            {
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          <Text style={styles.title}>Partie terminée !</Text>

          <View style={styles.scoreContainer}>
            <Text style={styles.score}>{score}</Text>
            {isNewHighScore && (
              <View style={styles.newHighScoreContainer}>
                <Ionicons name="star" size={20} color={colors.warningYellow} />
                <Text style={styles.newHighScoreText}>Nouveau record !</Text>
              </View>
            )}
          </View>

          <View style={styles.tabsContainer}>
            {['daily', 'monthly', 'allTime'].map((tab) => (
              <TouchableOpacity
                key={tab}
                style={[
                  styles.tab,
                  activeTab === tab && styles.activeTab,
                ]}
                onPress={() => setActiveTab(tab as 'daily' | 'monthly' | 'allTime')}
              >
                <Text
                  style={[
                    styles.tabText,
                    activeTab === tab && styles.activeTabText,
                  ]}
                >
                  {tab === 'daily' ? 'Jour' : tab === 'monthly' ? 'Mois' : 'Total'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.scoresList}>{renderScores()}</View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.button} onPress={onRestart}>
              <Text style={styles.buttonText}>Rejouer</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.menuButton]}
              onPress={() => router.replace('/')}
            >
              <Text style={styles.buttonText}>Menu</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};
// Fin 3.D. Rendu principal
// Fin 3. Composant Modal

// 4. Styles
// ========
// 4.A. Styles de base
// -----------------
const styles = StyleSheet.create({
  // 4.A.a. Styles conteneur
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
  // Fin 4.A.a. Styles conteneur

  // 4.A.b. Styles titre et score
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
  score: {
    fontSize: 40,
    fontWeight: 'bold',
    color: colors.primary,
  },
  // Fin 4.A.b. Styles titre et score

  // 4.A.c. Styles nouveau record
  newHighScoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
    backgroundColor: colors.transparencies.light,
    padding: 8,
    borderRadius: 12,
  },
  newHighScoreText: {
    color: colors.warningYellow,
    fontWeight: 'bold',
    fontSize: 14,
    marginLeft: 5,
  },
  // Fin 4.A.c. Styles nouveau record

  // 4.A.d. Styles onglets
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: colors.transparencies.light,
    padding: 4,
    borderRadius: 15,
    marginBottom: 15,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  activeTab: {
    backgroundColor: 'white',
  },
  tabText: {
    textAlign: 'center',
    fontSize: 14,
    color: colors.text,
  },
  activeTabText: {
    color: colors.primary,
    fontWeight: 'bold',
  },
  // Fin 4.A.d. Styles onglets

  // 4.A.e. Styles liste des scores
  scoresList: {
    width: '100%',
    marginBottom: 20,
  },
  noScoresContainer: {
    padding: 20,
    alignItems: 'center',
  },
  noScoresText: {
    color: colors.lightText,
    fontSize: 16,
  },
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
  scoreValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.accent,
    marginLeft: 10,
  },
  // Fin 4.A.e. Styles liste des scores

  // 4.A.f. Styles boutons
  buttonContainer: {
    flexDirection: 'row',
    gap: 15,
  },
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
  // Fin 4.A.f. Styles boutons
});
// Fin 4.A. Styles de base
// Fin 4. Styles

export default GameOverModal;