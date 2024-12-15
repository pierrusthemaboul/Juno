// gameLogger.ts
type Color = {
  warn: string;
  error: string;
  info: string;
  debug: string;
  state: string;
};

const COLORS: Color = {
  warn: '\x1b[33m',   // Jaune
  error: '\x1b[31m',  // Rouge
  info: '\x1b[36m',   // Cyan
  debug: '\x1b[35m',  // Magenta
  state: '\x1b[32m',  // Vert
};

const RESET = '\x1b[0m';

const formatTime = () => {
  return new Date().toLocaleTimeString('fr-FR', { 
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    fractionalSecondDigits: 3 
  });
};

const formatData = (data: any): string => {
  if (typeof data === 'object' && data !== null) {
    return '\n' + JSON.stringify(data, null, 2);
  }
  return String(data);
};

export const gameLogger = {
  debug: (message: string, ...data: any[]) => {
    const time = formatTime();
    const formattedData = data.map(formatData).join(' ');
    console.log(`${COLORS.debug}[${time}][DEBUG] ${message}${formattedData}${RESET}`);
  },

  info: (message: string, ...data: any[]) => {
    const time = formatTime();
    const formattedData = data.map(formatData).join(' ');
    console.log(`${COLORS.info}[${time}][INFO] ${message}${formattedData}${RESET}`);
  },

  warn: (message: string, ...data: any[]) => {
    const time = formatTime();
    const formattedData = data.map(formatData).join(' ');
    console.warn(`${COLORS.warn}[${time}][WARN] ${message}${formattedData}${RESET}`);
  },

  error: (message: string, ...data: any[]) => {
    const time = formatTime();
    const formattedData = data.map(formatData).join(' ');
    console.error(`${COLORS.error}[${time}][ERROR] ${message}${formattedData}${RESET}`);
  },

  state: (state: object, prefix: string = '') => {
    const time = formatTime();
    console.log(`${COLORS.state}[${time}][STATE]${prefix ? ` [${prefix}]` : ''}\n${JSON.stringify(state, null, 2)}${RESET}`);
  },

  game: (message: string, ...data: any[]) => {
    const time = formatTime();
    const formattedData = data.map(formatData).join(' ');
    console.log(`${COLORS.info}[${time}][GAME] ${message}${formattedData}${RESET}`);
  },

  level: (message: string, data?: any) => {
    const time = formatTime();
    const formattedData = data ? formatData(data) : '';
    console.log(`${COLORS.debug}[${time}][LEVEL] ${message}${formattedData}${RESET}`);
  },

  user: (message: string, data?: any) => {
    const time = formatTime();
    const formattedData = data ? formatData(data) : '';
    console.log(`${COLORS.info}[${time}][USER] ${message}${formattedData}${RESET}`);
  }
};

export default gameLogger;