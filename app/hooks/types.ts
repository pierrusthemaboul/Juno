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


// Fin de 1. Interfaces Principales du Jeu

// 2. Systèmes de Jeu
// ==================
// Cette section définit les différents systèmes qui composent le jeu

// 2.A. Périodes Historiques
// ------------------------
// Définit les différentes époques historiques du jeu
// 2.A.a Périodes Historiques
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
// Définit les types de récompenses disponibles
export enum RewardType {
    POINTS = "POINTS",
    EXTRA_LIFE = "EXTRA_LIFE",
    STREAK_BONUS = "STREAK_BONUS",
    LEVEL_UP_BONUS = "LEVEL_UP_BONUS"
}

// 2.B.a. Interface de Récompense
export interface Reward {
    type: RewardType;
    amount: number;
    reason: string;
}
// Fin de 2.B. Système de Récompenses

// 2.C. Système de Niveaux
// ----------------------
// 2.C.a. Règles Spéciales
export enum SpecialRules {
    ADAPTIVE_DIFFICULTY = "ADAPTIVE_DIFFICULTY",  // Difficulté s'adapte aux performances
    FLEX_TIME_GAP = "FLEX_TIME_GAP",            // Écart temporel flexible
    BONUS_MULTIPLIER = "BONUS_MULTIPLIER",       // Multiplicateur de points bonus
    STREAK_FOCUS = "STREAK_FOCUS"                // Focus sur les séries
}
// 2.C. Système de Niveaux 
// --------------------------
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
      minDifficulty: number;    // Difficulté minimale des événements
      maxDifficulty: number;    // Difficulté maximale des événements
      universalOnly: boolean;   // Limiter aux événements universels
      specialEventChance: number; // Probabilité d'événements spéciaux
      relaxationFactor?: number;  // Facteur de relâchement des contraintes
    };
    scoring: {
      basePoints: number;       // Points de base par réponse correcte
      streakMultiplier: number; // Multiplicateur de série
      timeMultiplier: number;   // Multiplicateur de temps
      comboThreshold: number;   // Seuil pour les combos
    };
    specialRules?: SpecialRules[];
    pointsReward?: number;
    eventsSummary?: LevelEventSummary[];
}

// Mise à jour des configurations par défaut
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
// Cette section définit toutes les constantes du jeu

// 3.A. Constantes de Base
// ----------------------
export const MAX_LIVES = 3;
export const BASE_POINTS = 100;
export const MIN_TIME_BONUS = 0.8;
export const MAX_TIME_BONUS = 1.5;
export const MAX_STREAK_BONUS = 2.0;
// Fin de 3.A. Constantes de Base


// =====================================
// 3.B. Configuration des Niveaux
// =====================================

// Configurations des premiers niveaux avec écarts temporels décroissants
export const LEVEL_CONFIGS: Record<number, LevelConfig> = {
    1: {
        level: 1,
        name: "Les Débuts",
        description: "Découvrez les grands moments de l'Histoire",
        eventsNeeded: 3,
        timeGap: {
            base: 500,        // Grand écart initial pour faciliter l'apprentissage
            variance: 200,    // Grande variance pour plus de flexibilité
            minimum: 300      // Écart minimum confortable
        },
        eventSelection: {
            minDifficulty: 1,
            maxDifficulty: 10,
            universalOnly: true,     // Événements universels uniquement au début
            specialEventChance: 0
        },
        scoring: {
            basePoints: 100,
            streakMultiplier: 1.0,
            timeMultiplier: 1.0,
            comboThreshold: 2
        },
        specialRules: [SpecialRules.ADAPTIVE_DIFFICULTY],
        pointsReward: 300
    },

    2: {
        level: 2,
        name: "Premiers Pas",
        description: "Explorez les bases de la chronologie",
        eventsNeeded: 4,
        timeGap: {
            base: 400,        // Réduction de 20% par rapport au niveau 1
            variance: 150,
            minimum: 250
        },
        eventSelection: {
            minDifficulty: 1,
            maxDifficulty: 10,
            universalOnly: true,
            specialEventChance: 0.05
        },
        scoring: {
            basePoints: 120,
            streakMultiplier: 1.1,
            timeMultiplier: 1.05,
            comboThreshold: 2
        },
        specialRules: [SpecialRules.ADAPTIVE_DIFFICULTY],
        pointsReward: 400
    },

    3: {
        level: 3,
        name: "Apprenti Historien",
        description: "Affinez votre sens de la chronologie",
        eventsNeeded: 5,
        timeGap: {
            base: 300,        // Réduction continue des écarts
            variance: 120,
            minimum: 200
        },
        eventSelection: {
            minDifficulty: 1,
            maxDifficulty: 12,
            universalOnly: false,    // Introduction d'événements non universels
            specialEventChance: 0.1
        },
        scoring: {
            basePoints: 150,
            streakMultiplier: 1.2,
            timeMultiplier: 1.1,
            comboThreshold: 3
        },
        specialRules: [SpecialRules.ADAPTIVE_DIFFICULTY],
        pointsReward: 500
    },

    4: {
        level: 4,
        name: "Chronologiste en Herbe",
        description: "Mettez votre logique à l'épreuve",
        eventsNeeded: 6,
        timeGap: {
            base: 250,
            variance: 100,
            minimum: 150
        },
        eventSelection: {
            minDifficulty: 2,
            maxDifficulty: 14,
            universalOnly: false,
            specialEventChance: 0.15
        },
        scoring: {
            basePoints: 180,
            streakMultiplier: 1.3,
            timeMultiplier: 1.15,
            comboThreshold: 3
        },
        specialRules: [SpecialRules.ADAPTIVE_DIFFICULTY],
        pointsReward: 600
    },

    5: {
        level: 5,
        name: "Chronologiste Confirmé",
        description: "Maîtrisez les bases",
        eventsNeeded: 7,
        timeGap: {
            base: 200,
            variance: 80,
            minimum: 120
        },
        eventSelection: {
            minDifficulty: 3,
            maxDifficulty: 15,
            universalOnly: false,
            specialEventChance: 0.2
        },
        scoring: {
            basePoints: 210,
            streakMultiplier: 1.4,
            timeMultiplier: 1.2,
            comboThreshold: 4
        },
        specialRules: [SpecialRules.ADAPTIVE_DIFFICULTY],
        pointsReward: 700
    },

    6: {
        level: 6,
        name: "Historien Amateur",
        description: "Testez vos connaissances approfondies",
        eventsNeeded: 8,
        timeGap: {
            base: 150,
            variance: 60,
            minimum: 90
        },
        eventSelection: {
            minDifficulty: 4,
            maxDifficulty: 16,
            universalOnly: false,
            specialEventChance: 0.25,
            relaxationFactor: 0.6
        },
        scoring: {
            basePoints: 250,
            streakMultiplier: 1.5,
            timeMultiplier: 1.3,
            comboThreshold: 4
        },
        specialRules: [SpecialRules.ADAPTIVE_DIFFICULTY],
        pointsReward: 800
    },

    7: {
        level: 7,
        name: "Historien Confirmé",
        description: "Défis pour les esprits affûtés",
        eventsNeeded: 9,
        timeGap: {
            base: 120,
            variance: 50,
            minimum: 70
        },
        eventSelection: {
            minDifficulty: 5,
            maxDifficulty: 17,
            universalOnly: false,
            specialEventChance: 0.3,
            relaxationFactor: 0.7
        },
        scoring: {
            basePoints: 300,
            streakMultiplier: 1.6,
            timeMultiplier: 1.35,
            comboThreshold: 5
        },
        specialRules: [SpecialRules.FLEX_TIME_GAP],
        pointsReward: 900
    },

    8: {
        level: 8,
        name: "Expert Historien",
        description: "Pour les connaisseurs",
        eventsNeeded: 10,
        timeGap: {
            base: 100,
            variance: 45,
            minimum: 60
        },
        eventSelection: {
            minDifficulty: 6,
            maxDifficulty: 18,
            universalOnly: false,
            specialEventChance: 0.35,
            relaxationFactor: 0.75
        },
        scoring: {
            basePoints: 350,
            streakMultiplier: 1.7,
            timeMultiplier: 1.4,
            comboThreshold: 5
        },
        specialRules: [SpecialRules.FLEX_TIME_GAP],
        pointsReward: 1000
    },

    9: {
        level: 9,
        name: "Chercheur Historien",
        description: "Pour les passionnés de précision",
        eventsNeeded: 11,
        timeGap: {
            base: 80,
            variance: 40,
            minimum: 50
        },
        eventSelection: {
            minDifficulty: 7,
            maxDifficulty: 19,
            universalOnly: false,
            specialEventChance: 0.4,
            relaxationFactor: 0.8
        },
        scoring: {
            basePoints: 400,
            streakMultiplier: 1.8,
            timeMultiplier: 1.45,
            comboThreshold: 6
        },
        specialRules: [SpecialRules.FLEX_TIME_GAP],
        pointsReward: 1100
    },

    10: {
        level: 10,
        name: "Historien Accompli",
        description: "Un véritable expert",
        eventsNeeded: 12,
        timeGap: {
            base: 60,
            variance: 35,
            minimum: 40
        },
        eventSelection: {
            minDifficulty: 8,
            maxDifficulty: 20,
            universalOnly: false,
            specialEventChance: 0.45,
            relaxationFactor: 0.85
        },
        scoring: {
            basePoints: 450,
            streakMultiplier: 1.9,
            timeMultiplier: 1.5,
            comboThreshold: 6
        },
        specialRules: [SpecialRules.FLEX_TIME_GAP, SpecialRules.BONUS_MULTIPLIER],
        pointsReward: 1200
    },

    11: {
        level: 11,
        name: "Grand Historien",
        description: "Pour les légendes",
        eventsNeeded: 13,
        timeGap: {
            base: 50,
            variance: 30,
            minimum: 35
        },
        eventSelection: {
            minDifficulty: 9,
            maxDifficulty: 21,
            universalOnly: false,
            specialEventChance: 0.5,
            relaxationFactor: 0.9
        },
        scoring: {
            basePoints: 500,
            streakMultiplier: 2.0,
            timeMultiplier: 1.55,
            comboThreshold: 7
        },
        specialRules: [SpecialRules.FLEX_TIME_GAP, SpecialRules.BONUS_MULTIPLIER],
        pointsReward: 1300
    },

    12: {
        level: 12,
        name: "Historien Légendaire",
        description: "Pour les esprits brillants",
        eventsNeeded: 14,
        timeGap: {
            base: 40,
            variance: 25,
            minimum: 30
        },
        eventSelection: {
            minDifficulty: 10,
            maxDifficulty: 22,
            universalOnly: false,
            specialEventChance: 0.55,
            relaxationFactor: 0.92
        },
        scoring: {
            basePoints: 550,
            streakMultiplier: 2.1,
            timeMultiplier: 1.6,
            comboThreshold: 7
        },
        specialRules: [SpecialRules.FLEX_TIME_GAP, SpecialRules.BONUS_MULTIPLIER],
        pointsReward: 1400
    },

    13: {
        level: 13,
        name: "Génie Historien",
        description: "Dépassez les limites",
        eventsNeeded: 15,
        timeGap: {
            base: 30,
            variance: 20,
            minimum: 25
        },
        eventSelection: {
            minDifficulty: 11,
            maxDifficulty: 23,
            universalOnly: false,
            specialEventChance: 0.6,
            relaxationFactor: 0.95
        },
        scoring: {
            basePoints: 600,
            streakMultiplier: 2.2,
            timeMultiplier: 1.65,
            comboThreshold: 8
        },
        specialRules: [SpecialRules.FLEX_TIME_GAP, SpecialRules.BONUS_MULTIPLIER],
        pointsReward: 1500
    },

    14: {
        level: 14,
        name: "Virtuose Historien",
        description: "Un dernier effort",
        eventsNeeded: 16,
        timeGap: {
            base: 25,
            variance: 15,
            minimum: 20
        },
        eventSelection: {
            minDifficulty: 12,
            maxDifficulty: 24,
            universalOnly: false,
            specialEventChance: 0.65,
            relaxationFactor: 0.97
        },
        scoring: {
            basePoints: 700,
            streakMultiplier: 2.3,
            timeMultiplier: 1.7,
            comboThreshold: 8
        },
        specialRules: [SpecialRules.FLEX_TIME_GAP, SpecialRules.BONUS_MULTIPLIER],
        pointsReward: 1800
    },

    15: {
        level: 15,
        name: "Maître Historien",
        description: "Mode infini - Seuls les meilleurs relèveront ce défi",
        eventsNeeded: 10000,  // Mode "infini"
        timeGap: {
            base: 20,
            variance: 12,
            minimum: 15
        },
        eventSelection: {
            minDifficulty: 1,           // Tous les niveaux de difficulté sont possibles
            maxDifficulty: 24,
            universalOnly: false,
            specialEventChance: 0.7,
            relaxationFactor: 1.0       // Maximum de flexibilité
        },
        scoring: {
            basePoints: 800,
            streakMultiplier: 2.4,
            timeMultiplier: 1.8,
            comboThreshold: 9
        },
        specialRules: [SpecialRules.FLEX_TIME_GAP, SpecialRules.BONUS_MULTIPLIER],
        pointsReward: 2000
    }
};


// Fin de 3.B. Configuration des Niveaux
// Fin de 3. Constantes et Configurations

// 4. Interfaces Utilitaires
// ========================
// Cette section définit les interfaces auxiliaires pour le fonctionnement du jeu

// 4.A. Calculs et Métriques
// ------------------------

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

// 4.A.a. Calcul des Écarts Temporels
export interface TimeGapCalculator {
    getMinGap: (level: number, performance: number) => number;
    getMaxGap: (level: number, performance: number) => number;
}

// 4.A.b. Calcul de la Difficulté
export interface DifficultyCalculator {
    getRange: (level: number, performance: number) => {
        min: number;
        max: number;
    };
}
// Fin de 4.A. Calculs et Métriques

// 4.B. Sélection d'Événements
// --------------------------
export interface EventSelector {
    filterEligibleEvents: (events: Event[], currentEvent: Event, criteria: {
        minGap: number;
        maxGap: number;
        difficultyRange: { min: number; max: number };
    }) => Event[];
}
// Fin de 4.B. Sélection d'Événements

// 4.C. Types Utilitaires
// ---------------------
export type LevelConfigType = typeof LEVEL_CONFIGS[keyof typeof LEVEL_CONFIGS];
export type SpecialRuleType = keyof typeof SpecialRules;
// Fin de 4.C. Types Utilitaires
// Fin de 4. Interfaces Utilitaires

export default LEVEL_CONFIGS;