export type Language = 'en' | 'fr';

export interface Translations {
  // Menu
  visualTraining: string;
  exercises: string;
  exploration: string;
  play: string;
  statistics: string;
  settings: string;
  profiles: string;

  // Game
  back: string;
  validate: string;
  enter: string;
  next: string;

  // Settings
  settingsTitle: string;
  appearance: string;
  darkMode: string;
  pointSize: string;
  px: string;
  game: string;
  enableTimer: string;
  exerciseDuration: string;
  seconds: string;
  maxAngleDelta: string;
  degree: string;
  screenMargin: string;
  percent: string;
  adaptiveLearning: string;
  sigmaPosition: string;
  sigmaRatio: string;
  sigmaAngle: string;
  learningRate: string;
  resetSettings: string;
  resetLearning: string;
  clearHistory: string;
  resetSettingsConfirm: string;
  resetGradientsConfirm: string;
  clearHistoryConfirm: string;
  language: string;

  // Profiles
  profilesTitle: string;
  activeProfile: string;
  export: string;
  allProfiles: string;
  active: string;
  rename: string;
  delete: string;
  newProfile: string;
  profileNamePlaceholder: string;
  create: string;
  importSection: string;
  importProfile: string;
  importError: string;
  minProfileError: string;
  deleteProfileConfirm: string;

  // Statistics
  statisticsTitle: string;
  summary: string;
  positions: string;
  ratios: string;
  angles: string;
  rotation: string;
  posRot: string;
  evolution: string;
  noDataYet: string;
  completeExercises: string;

  // Global Stats
  exercisesLabel: string;
  averageScore: string;
  last10Average: string;
  bestScore: string;

  // Position by Rotation
  rotationRanges: string[];
  exerciseCount: string;
  averageScoreLabel: string;
  noDataForRotation: string;

  // Timeline Evolution
  pause: string;
  playButton: string;
  goToEnd: string;
  moveSlider: string;

  // Scoring feedback
  excellent: string;
  veryGood: string;
  good: string;
  notBad: string;
  canDoBetter: string;
  keepPracticing: string;

  // How to Play
  howToPlay: string;
  howToPlayIntro: string;
  howToPlayRule: string;
  howToPlayExample1Caption: string;
  howToPlayExample2Caption: string;
  howToPlayTip: string;
  howToPlayGotIt: string;
}

export const en: Translations = {
  // Menu
  visualTraining: 'Visual Training',
  exercises: 'exercises',
  exploration: 'Exploration:',
  play: 'Play',
  statistics: 'Statistics',
  settings: 'Settings',
  profiles: 'Profiles',

  // Game
  back: 'Back',
  validate: 'Validate',
  enter: '(Enter)',
  next: 'Next',

  // Settings
  settingsTitle: 'Settings',
  appearance: 'Appearance',
  darkMode: 'Dark mode',
  pointSize: 'Point size',
  px: 'px',
  game: 'Game',
  enableTimer: 'Enable timer',
  exerciseDuration: 'Exercise duration',
  seconds: 'seconds',
  maxAngleDelta: 'Max angle delta',
  degree: '°',
  screenMargin: 'Screen margin',
  percent: '%',
  adaptiveLearning: 'Adaptive Learning',
  sigmaPosition: 'Sigma Position (F1)',
  sigmaRatio: 'Sigma Ratio (F2)',
  sigmaAngle: 'Sigma Angle (F3)',
  learningRate: 'Learning rate',
  resetSettings: 'Reset settings',
  resetLearning: 'Reset learning',
  clearHistory: 'Clear history',
  resetSettingsConfirm: 'Reset all settings to default values?',
  resetGradientsConfirm: 'Reset learning gradients? Adaptation will be lost.',
  clearHistoryConfirm: 'Clear all exercise history? This action is irreversible.',
  language: 'Language',

  // Profiles
  profilesTitle: 'Profiles',
  activeProfile: 'Active profile',
  export: 'Export',
  allProfiles: 'All profiles',
  active: 'active',
  rename: 'Rename',
  delete: 'Delete',
  newProfile: 'New profile',
  profileNamePlaceholder: 'Profile name',
  create: 'Create',
  importSection: 'Import',
  importProfile: 'Import a profile',
  importError: 'Error importing profile. Check the file format.',
  minProfileError: 'You must keep at least one profile.',
  deleteProfileConfirm: 'Delete profile "{name}"? This action is irreversible.',

  // Statistics
  statisticsTitle: 'Statistics',
  summary: 'Summary',
  positions: 'Positions',
  ratios: 'Ratios',
  angles: 'Angles',
  rotation: 'Rotation',
  posRot: 'Pos/Rot',
  evolution: 'Evolution',
  noDataYet: 'No data yet',
  completeExercises: 'Complete some exercises to see your statistics.',

  // Global Stats
  exercisesLabel: 'Exercises',
  averageScore: 'Average score',
  last10Average: 'Average (last 10)',
  bestScore: 'Best score',

  // Position by Rotation
  rotationRanges: ['0-30°', '30-60°', '60-90°', '90-120°', '120-150°', '150-180°'],
  exerciseCount: 'exercise(s)',
  averageScoreLabel: 'Average score:',
  noDataForRotation: 'No data for this rotation range',

  // Timeline Evolution
  pause: 'Pause',
  playButton: 'Play',
  goToEnd: 'Go to end',
  moveSlider: 'Move the slider to see the evolution',

  // Scoring feedback
  excellent: 'Excellent!',
  veryGood: 'Very good!',
  good: 'Good!',
  notBad: 'Not bad!',
  canDoBetter: 'Can do better',
  keepPracticing: 'Keep practicing',

  // How to Play
  howToPlay: 'How to Play',
  howToPlayIntro: 'Eye Gym is a visual training app to improve your ability to reproduce proportions, regardless of rotation or scale changes.',
  howToPlayRule: 'Look at the model triangle (light colors), then place the green point to complete the dark triangle with exactly the same shape and proportions as the model.',
  howToPlayExample1Caption: 'Where should the green point go?',
  howToPlayExample2Caption: 'The green point completes the triangle with the same proportions',
  howToPlayTip: 'The triangle can be moved, scaled, or rotated, but never flipped.',
  howToPlayGotIt: 'Got it!',
};

export const fr: Translations = {
  // Menu
  visualTraining: 'Entraînement visuel',
  exercises: 'exercices',
  exploration: 'Exploration:',
  play: 'Jouer',
  statistics: 'Statistiques',
  settings: 'Paramètres',
  profiles: 'Profils',

  // Game
  back: 'Retour',
  validate: 'Valider',
  enter: '(Entrée)',
  next: 'Suivant',

  // Settings
  settingsTitle: 'Paramètres',
  appearance: 'Apparence',
  darkMode: 'Mode sombre',
  pointSize: 'Taille des points',
  px: 'px',
  game: 'Jeu',
  enableTimer: 'Activer le chronomètre',
  exerciseDuration: 'Durée par exercice',
  seconds: 'secondes',
  maxAngleDelta: "Delta d'angle max",
  degree: '°',
  screenMargin: "Marge de l'écran",
  percent: '%',
  adaptiveLearning: 'Apprentissage adaptatif',
  sigmaPosition: 'Sigma Position (F1)',
  sigmaRatio: 'Sigma Ratio (F2)',
  sigmaAngle: 'Sigma Angle (F3)',
  learningRate: "Vitesse d'apprentissage",
  resetSettings: 'Réinitialiser les paramètres',
  resetLearning: "Réinitialiser l'apprentissage",
  clearHistory: "Effacer l'historique",
  resetSettingsConfirm: 'Réinitialiser tous les paramètres aux valeurs par défaut ?',
  resetGradientsConfirm: "Réinitialiser les gradients d'apprentissage ? L'adaptation sera perdue.",
  clearHistoryConfirm: "Effacer tout l'historique des exercices ? Cette action est irréversible.",
  language: 'Langue',

  // Profiles
  profilesTitle: 'Profils',
  activeProfile: 'Profil actif',
  export: 'Exporter',
  allProfiles: 'Tous les profils',
  active: 'actif',
  rename: 'Renommer',
  delete: 'Supprimer',
  newProfile: 'Nouveau profil',
  profileNamePlaceholder: 'Nom du profil',
  create: 'Créer',
  importSection: 'Importer',
  importProfile: 'Importer un profil',
  importError: 'Erreur lors de l\'importation du profil. Vérifiez le format du fichier.',
  minProfileError: 'Vous devez garder au moins un profil.',
  deleteProfileConfirm: 'Supprimer le profil "{name}" ? Cette action est irréversible.',

  // Statistics
  statisticsTitle: 'Statistiques',
  summary: 'Résumé',
  positions: 'Positions',
  ratios: 'Ratios',
  angles: 'Angles',
  rotation: 'Rotation',
  posRot: 'Pos/Rot',
  evolution: 'Évolution',
  noDataYet: 'Pas encore de données',
  completeExercises: 'Complétez quelques exercices pour voir vos statistiques.',

  // Global Stats
  exercisesLabel: 'Exercices',
  averageScore: 'Score moyen',
  last10Average: 'Moyenne (10 derniers)',
  bestScore: 'Meilleur score',

  // Position by Rotation
  rotationRanges: ['0-30°', '30-60°', '60-90°', '90-120°', '120-150°', '150-180°'],
  exerciseCount: 'exercice(s)',
  averageScoreLabel: 'Score moyen:',
  noDataForRotation: 'Pas de données pour cette plage de rotation',

  // Timeline Evolution
  pause: 'Pause',
  playButton: 'Lecture',
  goToEnd: 'Aller à la fin',
  moveSlider: "Déplacez le curseur pour voir l'évolution",

  // Scoring feedback
  excellent: 'Excellent !',
  veryGood: 'Très bien !',
  good: 'Bien !',
  notBad: 'Pas mal !',
  canDoBetter: 'Peut mieux faire',
  keepPracticing: 'Continuez à pratiquer',

  // How to Play
  howToPlay: 'Comment jouer',
  howToPlayIntro: 'Eye Gym est un entraînement visuel pour améliorer votre capacité à reproduire des proportions, indépendamment de toute rotation ou changement d\'échelle.',
  howToPlayRule: 'Regardez le triangle modèle (couleurs claires), puis placez le point vert pour compléter le triangle foncé avec exactement la même forme et les mêmes proportions que le modèle.',
  howToPlayExample1Caption: 'Où placer le point vert ?',
  howToPlayExample2Caption: 'Le point vert complète le triangle avec les mêmes proportions',
  howToPlayTip: 'Le triangle peut être déplacé, agrandi/réduit ou pivoté, mais jamais retourné.',
  howToPlayGotIt: 'Compris !',
};

export const translations: Record<Language, Translations> = {
  en,
  fr,
};
