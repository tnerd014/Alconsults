/**
 * Shared Carbon-Inspired Design Language Tokens
 * Portable across Web (React/Tailwind) and Native (Kotlin / Compose Multiplatform ColorScheme & Spacing)
 */

export const CarbonTokens = {
  colors: {
    // Carbon Layer Model (Dark Progression: Canvas -> Layer 01 -> Layer 02 -> Layer 03)
    bgCanvas: '#090D16',
    layer01: '#0F1624',
    layer02: '#162032',
    layer03: '#1E293B',
    layerSelected: '#172554',

    // Structural Hairline Borders (1px solid)
    borderSubtle: '#1E293B',
    borderStrong: '#334155',
    borderInteractive: '#3B82F6',

    // Typography Hierarchy
    textPrimary: '#F8FAFC',
    textSecondary: '#94A3B8',
    textMuted: '#64748B',
    textOnColor: '#FFFFFF',

    // Interactive & Brand Accents
    interactivePrimary: '#2563EB',
    interactiveHover: '#1D4ED8',
    interactiveAccent: '#3B82F6',

    // Semantic Status Tokens
    statusSuccess: '#10B981',
    statusWarning: '#F59E0B',
    statusDanger: '#F43F5E',
    statusInfo: '#38BDF8',
  },
  spacing: {
    // 8px Spatial Grid Foundation
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
  },
  typography: {
    fontSans: "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif",
    fontMono: "'JetBrains Mono', monospace",
  },
} as const;
