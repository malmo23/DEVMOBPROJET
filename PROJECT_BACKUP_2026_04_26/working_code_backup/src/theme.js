// FoodRisk Design System
export const colors = {
  // Primary emerald gradient
  gradientDark: ['#0a1628', '#0d2137', '#0f3d2e'],
  gradientCard: 'rgba(255,255,255,0.97)',

  // Brand
  primary: '#10b981',
  primaryDark: '#059669',
  primaryLight: '#d1fae5',

  // Accents
  blue: '#3b82f6',
  blueDark: '#1d4ed8',
  purple: '#a855f7',
  purpleDark: '#7e22ce',
  amber: '#f59e0b',
  amberDark: '#b45309',
  red: '#ef4444',
  redDark: '#b91c1c',

  // Score
  scoreGood: '#10b981',
  scoreMid: '#f59e0b',
  scoreBad: '#ef4444',

  // Neutral
  white: '#ffffff',
  bg: '#0a1628',
  surface: 'rgba(255,255,255,0.08)',
  border: 'rgba(255,255,255,0.15)',
  text: '#1f2937',
  textMuted: '#6b7280',
  textLight: 'rgba(255,255,255,0.7)',
  textWhite: '#ffffff',
};

export const typography = {
  hero: { fontSize: 36, fontWeight: '900', letterSpacing: -0.5 },
  h1: { fontSize: 28, fontWeight: '800', letterSpacing: -0.3 },
  h2: { fontSize: 22, fontWeight: '700' },
  h3: { fontSize: 18, fontWeight: '600' },
  body: { fontSize: 15, fontWeight: '400', lineHeight: 22 },
  label: { fontSize: 13, fontWeight: '600', letterSpacing: 0.4 },
  caption: { fontSize: 12, fontWeight: '400' },
};

export const spacing = {
  xs: 4, sm: 8, md: 16, lg: 24, xl: 32, xxl: 48,
};

export const radius = {
  sm: 8, md: 16, lg: 24, xl: 32, full: 999,
};

export const shadows = {
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 12,
  },
  soft: {
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
};
