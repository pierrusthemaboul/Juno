// ====================================
// INTERFACES DE BASE DU JEU
// ====================================
export interface User {
    name: string;
    points: number;
    lives: number;
    level: number;
    streak: number;
    maxStreak: number;
    eventsCompletedInLevel: number;
    totalEventsCompleted: number;
    consecutiveCorrectAnswers: number;
    performanceStats: PerformanceStats;
}

export interface PerformanceStats {
    typeSuccess: Record<string, number>;
    periodSuccess: Record<string, number>;
    overallAccuracy: number;
    averageResponseTime: number;
}

export interface CategoryMastery {
    categoryId: string;
    masteryLevel: number;
    correctAnswers: number;
    totalAttempts: number;
    lastPlayed: Date;
}

export interface HistoricalPeriodStats {
    period: HistoricalPeriod;
    accuracy: number;
    totalAttempts: number;
    averageResponseTime: number;
    masteryLevel: number;
}

export enum HistoricalPeriod {
    PREHISTORY = "PREHISTORY",        // Avant -3300
    ANCIENT = "ANCIENT",              // -3300 à 476
    MEDIEVAL = "MEDIEVAL",            // 476 à 1492
    RENAISSANCE = "RENAISSANCE",       // 1492 à 1789
    MODERN = "MODERN",                // 1789 à 1945
    CONTEMPORARY = "CONTEMPORARY",     // 1945 à 2000
    PRESENT = "PRESENT"               // 2000 à aujourd'hui
}

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
    keywords: string[];
}

// ====================================
// SYSTÈME DE RÉCOMPENSES
// ====================================
export enum RewardType {
    POINTS = "POINTS",
    EXTRA_LIFE = "EXTRA_LIFE",
    STREAK_BONUS = "STREAK_BONUS",
    LEVEL_UP_BONUS = "LEVEL_UP_BONUS",
    MASTERY_BONUS = "MASTERY_BONUS",
    PERIOD_BONUS = "PERIOD_BONUS",
    COMBO_BONUS = "COMBO_BONUS"
}

export interface ActiveBonus {
    type: BonusType;
    multiplier: number;
    duration: number;
    expiresAt: number;
    stackable: boolean;
}

export interface BonusStack {
    currentMultiplier: number;
    activeStacks: ActiveBonus[];
    maxStacks: number;
}

export enum BonusType {
    TIME = "TIME",
    STREAK = "STREAK",
    PERIOD = "PERIOD",
    MASTERY = "MASTERY",
    COMBO = "COMBO"
}

export interface Reward {
    type: RewardType;
    amount: number;
    reason: string;
    animation?: RewardAnimation;
    bonusMultipliers?: BonusMultipliers;
}

export interface BonusMultipliers {
    time: number;
    streak: number;
    period: number;
    mastery: number;
    combo: number;
    total: number;
}


// ====================================
// SYSTÈME DE NIVEAUX
// ====================================

export enum SpecialRules {
    STRICT_TIMING = "STRICT_TIMING",       // Temps plus court pour répondre
    STREAK_FOCUS = "STREAK_FOCUS",         // Bonus de série augmentés
    TIME_PRESSURE = "TIME_PRESSURE",       // Le temps influe plus sur les points
    CATEGORY_MASTERY = "CATEGORY_MASTERY", // Focus sur certaines catégories
    PRECISION_BONUS = "PRECISION_BONUS",   // Bonus pour précision historique
    INFINITE_MODE = "INFINITE_MODE"        // Mode sans fin
}

export interface LevelConfig {
    level: number;
    name: string;
    description: string;
    eventsNeeded: number;
    specialRules?: SpecialRules[];
    timeGap: {
        min: number;
        max: number;
        fallbackIncrement: number;
    };
    difficulty: {
        min: number;
        max: number;
    };
    universalOnly: boolean;
    pointsReward: number;
    streakMultiplier?: number;
    timeMultiplier?: number;
    bonusLifeChance?: number;
}

// ====================================
// CONSTANTES GLOBALES DU JEU
// ====================================

export const MAX_LIVES = 3;
export const LIFE_BONUS_THRESHOLD = 10;
export const MAX_TIME_MULTIPLIER = 2;
export const MAX_STREAK_MULTIPLIER = 3;
export const MAX_PERIOD_MULTIPLIER = 2;
export const MAX_MASTERY_MULTIPLIER = 2.5;
export const MAX_COMBO_MULTIPLIER = 4;
export const STREAK_BONUS_BASE = 500;
export const LEVEL_UP_LIFE_BONUS = 1;
export const BASE_POINTS = 100;
export const FALLBACK_ATTEMPTS = 3;
export const BONUS_DURATION = 10000; // 10 secondes en millisecondes
export const MAX_BONUS_STACKS = 3;
export const MIN_RESPONSE_TIME = 1000; // 1 seconde
export const PERFECT_RESPONSE_THRESHOLD = 3000; // 3 secondes

export enum BonusType {
    TIME = "TIME",
    STREAK = "STREAK",
    PERIOD = "PERIOD",
    MASTERY = "MASTERY",
    COMBO = "COMBO"
}

export interface ActiveBonus {
    type: BonusType;
    multiplier: number;
    duration: number;
    expiresAt: number;
    stackable: boolean;
}

export interface BonusStack {
    currentMultiplier: number;
    activeStacks: ActiveBonus[];
    maxStacks: number;
}

// ====================================
// CONFIGURATION DES ANIMATIONS
// ====================================

export const REWARD_ANIMATIONS = {
    POINTS: {
        duration: 1000,
        scale: 1.2,
        color: '#FFD700',
        particleEffect: 'sparkle',
        soundEffect: 'points'
    },
    EXTRA_LIFE: {
        duration: 1500,
        scale: 1.5,
        color: '#FF4444',
        particleEffect: 'heartbeat',
        soundEffect: 'life'
    },
    STREAK_BONUS: {
        duration: 1200,
        scale: 1.3,
        color: '#4CAF50',
        particleEffect: 'flame',
        soundEffect: 'streak'
    },
    LEVEL_UP_BONUS: {
        duration: 2000,
        scale: 1.8,
        color: '#2196F3',
        particleEffect: 'explosion',
        soundEffect: 'levelup'
    },
    THEMATIC_BONUS: {
        duration: 1600,
        scale: 1.4,
        color: '#9C27B0',
        particleEffect: 'spiral',
        soundEffect: 'theme'
    },
    PERIOD_MASTERY: {
        duration: 2500,
        scale: 2.0,
        color: '#FF9800',
        particleEffect: 'timewave',
        soundEffect: 'mastery'
    }
} as const;

export const COMBO_ANIMATIONS = {
    QUICK_ANSWER: {
        duration: 800,
        scale: 1.1,
        color: '#00BCD4',
        effect: 'flash'
    },
    PERFECT_STREAK: {
        duration: 1500,
        scale: 1.6,
        color: '#FFC107',
        effect: 'pulse'
    },
    PERIOD_EXPERT: {
        duration: 1800,
        scale: 1.7,
        color: '#E91E63',
        effect: 'wave'
    }
} as const;

export const FEEDBACK_ANIMATIONS = {
    SUCCESS: {
        duration: 500,
        scale: 1.2,
        color: '#4CAF50',
        effect: 'fade'
    },
    ERROR: {
        duration: 700,
        scale: 1.1,
        color: '#F44336',
        effect: 'shake'
    },
    NEUTRAL: {
        duration: 300,
        scale: 1.0,
        color: '#9E9E9E',
        effect: 'none'
    }
} as const;

export const PARTICLE_SYSTEMS = {
    SPARKLE: {
        particleCount: 20,
        duration: 1000,
        spread: 45,
        velocity: 2
    },
    EXPLOSION: {
        particleCount: 50,
        duration: 1500,
        spread: 360,
        velocity: 3
    },
    SPIRAL: {
        particleCount: 30,
        duration: 1200,
        spread: 180,
        velocity: 1.5
    }
} as const;

// ====================================
// INTERFACES DES PROVIDERS
// ====================================

export interface PositionProvider {
    getPointsPosition: () => Promise<{ x: number; y: number }>;
    getLifePosition: () => Promise<{ x: number; y: number }>;
}

export interface AnimationProvider {
    animate: (options: RewardAnimation) => Promise<void>;
    stop: () => void;
}


export interface LeaderboardScore {
    name: string;
    score: number;
    rank?: number;
  }
  
  export interface Leaderboards {
    daily: LeaderboardScore[];
    monthly: LeaderboardScore[];
    allTime: LeaderboardScore[];
  }

// ====================================
// CONFIGURATION DES NIVEAUX
// ====================================

export const LEVEL_CONFIGS: Record<number, LevelConfig> = {
    1: {
        level: 1,
        name: "Les Grands Événements",
        description: "Découvrez les moments qui ont marqué l'Histoire",
        eventsNeeded: 5,
        specialRules: [],
        timeGap: {
            min: 1000,
            max: 3000,
            fallbackIncrement: 100
        },
        difficulty: {
            min: 1,
            max: 2
        },
        universalOnly: true,
        pointsReward: 500,
        streakMultiplier: 1,
        timeMultiplier: 1,
        bonusLifeChance: 1
    },
    2: {
        level: 2,
        name: "Grands Écarts Historiques",
        description: "Parcourez les siècles avec précision",
        eventsNeeded: 5,
        specialRules: [SpecialRules.STREAK_FOCUS],
        timeGap: {
            min: 900,
            max: 1000,
            fallbackIncrement: 100
        },
        difficulty: {
            min: 1,
            max: 3
        },
        universalOnly: true,
        pointsReward: 600,
        streakMultiplier: 1.1,
        timeMultiplier: 1.1
    },
    3: {
        level: 3,
        name: "Ères Lointaines",
        description: "Explorez les époques anciennes",
        eventsNeeded: 6,
        specialRules: [SpecialRules.STREAK_FOCUS],
        timeGap: {
            min: 800,
            max: 900,
            fallbackIncrement: 100
        },
        difficulty: {
            min: 1,
            max: 3
        },
        universalOnly: false,
        pointsReward: 700,
        streakMultiplier: 1.2,
        timeMultiplier: 1.2
    },
    4: {
        level: 4,
        name: "Périodes Anciennes",
        description: "Plongez dans l'histoire antique",
        eventsNeeded: 6,
        specialRules: [SpecialRules.STREAK_FOCUS, SpecialRules.TIME_PRESSURE],
        timeGap: {
            min: 700,
            max: 800,
            fallbackIncrement: 100
        },
        difficulty: {
            min: 2,
            max: 4
        },
        universalOnly: false,
        pointsReward: 800,
        streakMultiplier: 1.3,
        timeMultiplier: 1.3
    },
    5: {
        level: 5,
        name: "Chroniqueur du Temps",
        description: "Maîtrisez les événements historiques majeurs",
        eventsNeeded: 7,
        specialRules: [SpecialRules.STREAK_FOCUS, SpecialRules.TIME_PRESSURE],
        timeGap: {
            min: 600,
            max: 700,
            fallbackIncrement: 100
        },
        difficulty: {
            min: 2,
            max: 4
        },
        universalOnly: false,
        pointsReward: 900,
        streakMultiplier: 1.4,
        timeMultiplier: 1.4
    },
    6: {
        level: 6,
        name: "Explorateur du Passé",
        description: "Naviguez à travers les époques avec précision",
        eventsNeeded: 7,
        specialRules: [SpecialRules.STREAK_FOCUS, SpecialRules.TIME_PRESSURE, SpecialRules.PRECISION_BONUS],
        timeGap: {
            min: 500,
            max: 600,
            fallbackIncrement: 100
        },
        difficulty: {
            min: 3,
            max: 5
        },
        universalOnly: false,
        pointsReward: 1000,
        streakMultiplier: 1.5,
        timeMultiplier: 1.5
    },
    7: {
        level: 7,
        name: "Maître du Temps",
        description: "Défiez les siècles avec expertise",
        eventsNeeded: 8,
        specialRules: [SpecialRules.STREAK_FOCUS, SpecialRules.TIME_PRESSURE, SpecialRules.PRECISION_BONUS],
        timeGap: {
            min: 400,
            max: 500,
            fallbackIncrement: 100
        },
        difficulty: {
            min: 3,
            max: 5
        },
        universalOnly: false,
        pointsReward: 1100,
        streakMultiplier: 1.6,
        timeMultiplier: 1.6
    },
    8: {
        level: 8,
        name: "Sage de l'Histoire",
        description: "Prouvez votre expertise historique",
        eventsNeeded: 8,
        specialRules: [SpecialRules.STRICT_TIMING, SpecialRules.STREAK_FOCUS, SpecialRules.PRECISION_BONUS],
        timeGap: {
            min: 300,
            max: 400,
            fallbackIncrement: 75
        },
        difficulty: {
            min: 4,
            max: 6
        },
        universalOnly: false,
        pointsReward: 1200,
        streakMultiplier: 1.7,
        timeMultiplier: 1.7
    },
    9: {
        level: 9,
        name: "Archiviste Émérite",
        description: "Plongez dans les archives historiques",
        eventsNeeded: 9,
        specialRules: [SpecialRules.STRICT_TIMING, SpecialRules.STREAK_FOCUS, SpecialRules.PRECISION_BONUS],
        timeGap: {
            min: 250,
            max: 350,
            fallbackIncrement: 75
        },
        difficulty: {
            min: 4,
            max: 6
        },
        universalOnly: false,
        pointsReward: 1300,
        streakMultiplier: 1.8,
        timeMultiplier: 1.8
    },
    10: {
        level: 10,
        name: "Gardien des Époques",
        description: "Gardez les époques sous votre protection",
        eventsNeeded: 9,
        specialRules: [SpecialRules.STRICT_TIMING, SpecialRules.STREAK_FOCUS, SpecialRules.PRECISION_BONUS, SpecialRules.CATEGORY_MASTERY],
        timeGap: {
            min: 200,
            max: 300,
            fallbackIncrement: 50
        },
        difficulty: {
            min: 5,
            max: 7
        },
        universalOnly: false,
        pointsReward: 1500,
        streakMultiplier: 1.9,
        timeMultiplier: 1.9
    },
    11: {
        level: 11,
        name: "Chronologiste Expert",
        description: "Maîtrisez la complexité du temps",
        eventsNeeded: 10,
        specialRules: [SpecialRules.STRICT_TIMING, SpecialRules.STREAK_FOCUS, SpecialRules.PRECISION_BONUS, SpecialRules.CATEGORY_MASTERY],
        timeGap: {
            min: 150,
            max: 250,
            fallbackIncrement: 50
        },
        difficulty: {
            min: 5,
            max: 7
        },
        universalOnly: false,
        pointsReward: 1700,
        streakMultiplier: 2.0,
        timeMultiplier: 2.0
    },
    12: {
        level: 12,
        name: "Historien Suprême",
        description: "Démontrez votre maîtrise absolue",
        eventsNeeded: 10,
        specialRules: [SpecialRules.STRICT_TIMING, SpecialRules.STREAK_FOCUS, SpecialRules.PRECISION_BONUS, SpecialRules.CATEGORY_MASTERY],
        timeGap: {
            min: 100,
            max: 200,
            fallbackIncrement: 50
        },
        difficulty: {
            min: 6,
            max: 7
        },
        universalOnly: false,
        pointsReward: 2000,
        streakMultiplier: 2.1,
        timeMultiplier: 2.1
    },
    13: {
        level: 13,
        name: "Maître des Chroniques",
        description: "L'histoire n'a plus de secrets pour vous",
        eventsNeeded: 11,
        specialRules: [SpecialRules.STRICT_TIMING, SpecialRules.STREAK_FOCUS, SpecialRules.PRECISION_BONUS, SpecialRules.CATEGORY_MASTERY],
        timeGap: {
            min: 75,
            max: 150,
            fallbackIncrement: 25
        },
        difficulty: {
            min: 6,
            max: 8
        },
        universalOnly: false,
        pointsReward: 2300,
        streakMultiplier: 2.2,
        timeMultiplier: 2.2
    },
    14: {
        level: 14,
        name: "Légende Temporelle",
        description: "Votre sagesse traverse les âges",
        eventsNeeded: 11,
        specialRules: [SpecialRules.STRICT_TIMING, SpecialRules.STREAK_FOCUS, SpecialRules.PRECISION_BONUS, SpecialRules.CATEGORY_MASTERY],
        timeGap: {
            min: 50,
            max: 100,
            fallbackIncrement: 25
        },
        difficulty: {
            min: 7,
            max: 8
        },
        universalOnly: false,
        pointsReward: 2600,
        streakMultiplier: 2.3,
        timeMultiplier: 2.3
    },
    15: {
        level: 15,
        name: "Oracle du Temps",
        description: "Voyez au-delà des époques",
        eventsNeeded: 12,
        specialRules: [SpecialRules.STRICT_TIMING, SpecialRules.STREAK_FOCUS, SpecialRules.PRECISION_BONUS, SpecialRules.CATEGORY_MASTERY, SpecialRules.TIME_PRESSURE],
        timeGap: {
            min: 25,
            max: 75,
            fallbackIncrement: 25
        },
        difficulty: {
            min: 7,
            max: 8
        },
        universalOnly: false,
        pointsReward: 3000,
        streakMultiplier: 2.4,
        timeMultiplier: 2.4
    },
    16: {
        level: 16,
        name: "Chrononaute Ultime",
        description: "Le temps est votre domaine",
        eventsNeeded: 12,
        specialRules: [SpecialRules.STRICT_TIMING, SpecialRules.STREAK_FOCUS, SpecialRules.PRECISION_BONUS, SpecialRules.CATEGORY_MASTERY, SpecialRules.TIME_PRESSURE],
        timeGap: {
            min: 10,
            max: 50,
            fallbackIncrement: 10
        },
        difficulty: {
            min: 7,
            max: 8
        },
        universalOnly: false,
        pointsReward: 3500,
        streakMultiplier: 2.5,
        timeMultiplier: 2.5
    },
    17: {
        level: 17,
        name: "Immortel du Temps",
        description: "Transcendez les limites temporelles",
        eventsNeeded: 13,
        specialRules: [SpecialRules.STRICT_TIMING, SpecialRules.STREAK_FOCUS, SpecialRules.PRECISION_BONUS, SpecialRules.CATEGORY_MASTERY, SpecialRules.TIME_PRESSURE],
        timeGap: {
            min: 5,
            max: 25,
            fallbackIncrement: 5
        },
        difficulty: {
            min: 8,
            max: 8
        },
        universalOnly: false,
        pointsReward: 4000,
        streakMultiplier: 2.6,
        timeMultiplier: 2.6
    },
    18: {
        level: 18,
        name: "Maître Absolu",
        description: "Au sommet de la connaissance historique",
        eventsNeeded: 13,
        specialRules: [SpecialRules.STRICT_TIMING, SpecialRules.STREAK_FOCUS, SpecialRules.PRECISION_BONUS, SpecialRules.CATEGORY_MASTERY, SpecialRules.TIME_PRESSURE],
        timeGap: {
            min: 1,
            max: 15,
            fallbackIncrement: 5
        },
        difficulty: {
            min: 8,
            max: 8
        },
        universalOnly: false,
        pointsReward: 4500,
        streakMultiplier: 2.8,
        timeMultiplier: 2.8
    },
    
    19: {
        level: 19,
        name: "Mode Légende",
        description: "Le défi ultime pour les maîtres de l'Histoire",
        eventsNeeded: Infinity,
        specialRules: [
            SpecialRules.INFINITE_MODE,
            SpecialRules.PRECISION_BONUS,
            SpecialRules.STRICT_TIMING,
            SpecialRules.STREAK_FOCUS,
            SpecialRules.TIME_PRESSURE
        ],
        timeGap: {
            min: 0,
            max: 10,
            fallbackIncrement: 5
        },
        difficulty: {
            min: 8,
            max: 8
        },
        universalOnly: false,
        pointsReward: 5000,
        streakMultiplier: 2,
        timeMultiplier: 2,
        bonusLifeChance: 0.1
    }
} as const;

// ====================================
// TYPES UTILITAIRES
// ====================================

export type LevelConfigType = typeof LEVEL_CONFIGS[keyof typeof LEVEL_CONFIGS];
export type RewardAnimationType = typeof REWARD_ANIMATIONS[keyof typeof REWARD_ANIMATIONS];
export type SpecialRuleType = keyof typeof SpecialRules;

export default LEVEL_CONFIGS;