// 1. Interfaces Principales du Jeu
// =============================
// Cette section définit les types de base nécessaires au fonctionnement du jeu

// 1.A. Interface Utilisateur
// -------------------------
// Définit les propriétés de base d'un utilisateur dans le jeu
export interface User {
    name: string;
    points: number;
    lives: number;
    level: number;
    streak: number;
    maxStreak: number;
    eventsCompletedInLevel: number;
    totalEventsCompleted: number;
    performanceStats: PerformanceStats;
  }
  // Fin de 1.A. Interface Utilisateur
  
  // 1.B. Interface Événement
  // -----------------------
  // Définit la structure d'un événement historique dans le jeu
  export interface Event {
    id: string;
    date: string;
    titre: string;
    illustration_url: string;
    date_formatee?: string;
    universel: boolean;
    niveau_difficulte: number;
    types_evenement: string[];
    description?: string;
    period: HistoricalPeriod;
  }
  // Fin de 1.B. Interface Événement
  
  // 1.C. Interface Statistiques de Performance
  // ----------------------------------------
  // Définit les métriques de performance du joueur
  export interface PerformanceStats {
    typeSuccess: Record<string, number>;
    periodSuccess: Record<string, number>;
    overallAccuracy: number;
    averageResponseTime: number;
  }
  // Fin de 1.C. Interface Statistiques de Performance
  
  // 1.D. Interface resume evenements
  // ------------------------------
  // Définit la structure du résumé des événements d'un niveau
  export interface LevelEventSummary {
    id: string;
    titre: string;
    date: string;
    date_formatee: string;
    illustration_url: string;
    wasCorrect: boolean;
    responseTime?: number;
  }
  // Fin de 1.D. Interface resume evenements
  
  // 2. Systèmes de Jeu
  // ==================
  
  // 2.A. Périodes Historiques
  // ------------------------
  export enum HistoricalPeriod {
    ANTIQUITY = "Antiquité",
    MIDDLE_AGES = "Moyen Âge",
    RENAISSANCE = "Renaissance",
    NINETEENTH = "XIX",
    TWENTIETH = "XX",
    TWENTYFIRST = "XXI"
  }
  // Fin de 2.A. Périodes Historiques
  
  // 2.B. Système de Récompenses
  // --------------------------
  export enum RewardType {
    POINTS = "POINTS",
    EXTRA_LIFE = "EXTRA_LIFE",
    STREAK_BONUS = "STREAK_BONUS",
    LEVEL_UP_BONUS = "LEVEL_UP_BONUS"
  }
  
  export interface Reward {
    type: RewardType;
    amount: number;
    reason: string;
  }
  // Fin de 2.B. Système de Récompenses
  
  // 2.C. Système de Niveaux
  // ----------------------
  export enum SpecialRules {
    ADAPTIVE_DIFFICULTY = "ADAPTIVE_DIFFICULTY",
    FLEX_TIME_GAP = "FLEX_TIME_GAP",
    BONUS_MULTIPLIER = "BONUS_MULTIPLIER",
    STREAK_FOCUS = "STREAK_FOCUS"
  }
  
  // Définition de la config d'un niveau
  export interface LevelConfig {
    level: number;
    name: string;
    description: string;
    eventsNeeded: number;
    timeGap: {
      base: number;         // Écart temporel de base en années
      variance: number;     // Variation permise autour de la base
      minimum: number;      // Écart minimum absolu
      minGap?: number;      // Pour la rétrocompatibilité
    };
    eventSelection: {
      minDifficulty: number;    
      maxDifficulty: number;    
      universalOnly: boolean;   
      specialEventChance: number; 
      relaxationFactor?: number;  
    };
    scoring: {
      basePoints: number;       
      streakMultiplier: number; 
      timeMultiplier: number;   
      comboThreshold: number;   
    };
    specialRules?: SpecialRules[];
    pointsReward?: number;
    eventsSummary?: LevelEventSummary[];
  }
  
  // Configuration par défaut (optionnelle si besoin)
  export const DEFAULT_LEVEL_CONFIG: Partial<LevelConfig> = {
    timeGap: {
      base: 400,
      variance: 100,
      minimum: 300,
      minGap: 300
    },
    eventSelection: {
      minDifficulty: 1,
      maxDifficulty: 10,
      universalOnly: false,
      specialEventChance: 0,
      relaxationFactor: 0.5
    },
    scoring: {
      basePoints: 100,
      streakMultiplier: 1.0,
      timeMultiplier: 1.0,
      comboThreshold: 2
    }
  };
  // Fin de 2.C. Système de Niveaux
  // Fin de 2. Systèmes de Jeu
  
  // 3. Constantes et Configurations
  // ==============================
  export const MAX_LIVES = 3;
  export const BASE_POINTS = 100;
  export const MIN_TIME_BONUS = 0.8;
  export const MAX_TIME_BONUS = 1.5;
  export const MAX_STREAK_BONUS = 2.0;
  
  // 4. Interfaces Utilitaires
  // ========================
  export interface LevelPerformance {
    accuracy: number;
    averageTime: number;
    streakLength: number;
    perfectRounds: number;
    specialEventsCompleted: number;
  }
  
  export interface DifficultyModifiers {
    timeGapModifier: number;
    eventDifficultyModifier: number;
    scoringModifier: number;
  }
  
  // Pour la sélection d'événements (si besoin)
  export interface TimeGapCalculator {
    getMinGap: (level: number, performance: number) => number;
    getMaxGap: (level: number, performance: number) => number;
  }
  
  export interface DifficultyCalculator {
    getRange: (level: number, performance: number) => {
      min: number;
      max: number;
    };
  }
  
  export interface EventSelector {
    filterEligibleEvents: (
      events: Event[],
      currentEvent: Event,
      criteria: {
        minGap: number;
        maxGap: number;
        difficultyRange: { min: number; max: number };
      }
    ) => Event[];
  }
  
  // 4.C. Types Utilitaires
  export type LevelConfigType = typeof import("./levelConfigs").LEVEL_CONFIGS[keyof typeof import("./levelConfigs").LEVEL_CONFIGS];
  export type SpecialRuleType = keyof typeof SpecialRules;
  // Fin de 4. Interfaces Utilitaires
  