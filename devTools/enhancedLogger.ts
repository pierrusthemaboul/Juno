// enhancedLogger.ts
const ENABLE_LOGS = true;  // Facile à désactiver en production

interface LogGroup {
  start: (groupName: string) => void;
  end: () => void;
  info: (message: string, data?: any) => void;
  warn: (message: string, data?: any) => void;
  error: (message: string, data?: any) => void;
}

class EnhancedLogger {
  private static instance: EnhancedLogger;
  private groups: Map<string, LogGroup>;
  private activeGroups: string[];

  private constructor() {
    this.groups = new Map();
    this.activeGroups = [];
  }

  static getInstance(): EnhancedLogger {
    if (!EnhancedLogger.instance) {
      EnhancedLogger.instance = new EnhancedLogger();
    }
    return EnhancedLogger.instance;
  }

  createGroup(name: string): LogGroup {
    const group = {
      start: (groupName: string) => this.startGroup(groupName),
      end: () => this.endGroup(),
      info: (message: string, data?: any) => this.log('INFO', name, message, data),
      warn: (message: string, data?: any) => this.log('WARN', name, message, data),
      error: (message: string, data?: any) => this.log('ERROR', name, message, data),
    };
    this.groups.set(name, group);
    return group;
  }

  private startGroup(name: string) {
    if (!ENABLE_LOGS) return;
    this.activeGroups.push(name);
    console.group(`🔍 ${name}`);
  }

  private endGroup() {
    if (!ENABLE_LOGS) return;
    this.activeGroups.pop();
    console.groupEnd();
  }

  private log(level: string, group: string, message: string, data?: any) {
    if (!ENABLE_LOGS) return;

    const timestamp = new Date().toISOString().split('T')[1].slice(0, -1);
    const prefix = `[${timestamp}][${level}][${group}]`;
    
    switch (level) {
      case 'INFO':
        console.log(`%c${prefix} ${message}`, 'color: #4CAF50', data ? data : '');
        break;
      case 'WARN':
        console.warn(`%c${prefix} ${message}`, 'color: #FFA500', data ? data : '');
        break;
      case 'ERROR':
        console.error(`%c${prefix} ${message}`, 'color: #FF0000', data ? data : '');
        break;
    }
  }

  // Méthode utilitaire pour suivre les props
  trackProps(componentName: string, props: any) {
    if (!ENABLE_LOGS) return;
    const group = this.groups.get(componentName);
    if (group) {
      group.info('Props received:', props);
    }
  }

  // Méthode utilitaire pour suivre les états
  trackState(componentName: string, stateName: string, value: any) {
    if (!ENABLE_LOGS) return;
    const group = this.groups.get(componentName);
    if (group) {
      group.info(`State '${stateName}' updated:`, value);
    }
  }
}

export const logger = EnhancedLogger.getInstance();

// Créer des groupes de logs pour chaque composant
export const rewardLogger = logger.createGroup('RewardAnimation');
export const userInfoLogger = logger.createGroup('UserInfo');
export const gameContentLogger = logger.createGroup('GameContentA');

// Exemple d'utilisation:
/*
rewardLogger.start('Animation Cycle');
rewardLogger.info('Starting animation', { target: position });
// ... code ...
rewardLogger.end();
*/