// colors.ts
export const colors = {
  // Couleurs principales
  background: '#FFF5E6',       // Beige clair chaud pour le fond
  primary: '#FF9966',         // Orange pastel pour les éléments principaux
  secondary: '#FFB84D',       // Jaune orangé pour les accents secondaires
  accent: '#FF6B6B',         // Rouge corail pour les accents importants
  
  // Textes
  text: '#4A4A4A',           // Gris foncé pour le texte principal
  lightText: '#7A7A7A',      // Gris moyen pour le texte secondaire
  darkText: '#333333',       // Gris très foncé pour un meilleur contraste
  veryDarkText: '#000000',   // Noir pour un contraste maximal

  // Fonds
  cardBackground: '#FFFFFF',  // Blanc pour le fond des cartes
  headerBackground: 'rgba(255, 255, 255, 0.9)', // Fond semi-transparent pour le header
  overlayBackground: 'rgba(0, 0, 0, 0.7)',      // Fond semi-transparent pour les overlays

  // Boutons
  buttonBackground: '#FF9966',      // Orange pastel pour les boutons standard
  buttonText: '#FFFFFF',            // Blanc pour le texte des boutons
  disabledButton: '#95A5A6',        // Gris pour les boutons désactivés
  beforeButton: '#FF6B6B',          // Rouge corail pour le bouton "avant"
  afterButton: '#4ECDC4',           // Turquoise pour le bouton "après"

  // États et feedback
  correctGreen: '#27AE60',          // Vert vif pour les réponses correctes
  incorrectRed: '#E74C3C',          // Rouge vif pour les réponses incorrectes
  warningYellow: '#F1C40F',         // Jaune pour les avertissements
  timerNormal: '#4ECDC4',           // Turquoise pour le timer normal
  timerWarning: '#FFA726',          // Orange pour le timer en avertissement
  timerDanger: '#FF5252',           // Rouge pour le timer critique

  // Niveaux de progression
  level1: '#4CAF50',  // Vert - Niveau 1
  level2: '#8BC34A',  // Vert clair - Niveau 2
  level3: '#FFEB3B',  // Jaune - Niveau 3
  level4: '#FFC107',  // Jaune orangé - Niveau 4
  level5: '#FF9800',  // Orange - Niveau 5

  // Ombres
  shadowColor: '#000000',
  shadowOpacity: 0.25,

  // Autres
  border: '#DDDDDD',                // Couleur de bordure standard
  divider: 'rgba(0, 0, 0, 0.1)',    // Couleur pour les séparateurs
  placeholder: '#CCCCCC',           // Couleur pour les placeholders
  
  // Dégradés
  gradients: {
    primary: ['#FF9966', '#FF5E62'],
    secondary: ['#4ECDC4', '#2BAE66'],
    success: ['#2ECC71', '#27AE60'],
    error: ['#E74C3C', '#C0392B']
  },

  // États de transparence
  transparencies: {
    light: 'rgba(255, 255, 255, 0.8)',
    medium: 'rgba(255, 255, 255, 0.5)',
    dark: 'rgba(0, 0, 0, 0.5)',
    darker: 'rgba(0, 0, 0, 0.8)'
  }
};

export default colors;