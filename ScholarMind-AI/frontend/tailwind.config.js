/** @type {import('tailwindcss').Config} */
export default {
  // ── Content paths (for purging unused styles) ──────────────────────────────
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],

  // ── Dark mode via class strategy ───────────────────────────────────────────
  darkMode: 'class',

  theme: {
    extend: {
      // ── ScholarMind Color Palette ─────────────────────────────────────────
      colors: {
        // Background layers
        bgMain:       '#0f1117',
        bgSidebar:    '#161b27',
        bgCard:       '#1e2433',
        bgCardHover:  '#252d3d',
        bgInput:      '#1a2133',

        // Border
        border:       '#2a3347',
        borderFocus:  '#6366f1',

        // Text
        textPrimary:   '#f1f5f9',
        textSecondary: '#94a3b8',
        textMuted:     '#475569',

        // Accent
        accent:     '#6366f1',
        accentHover:'#818cf8',
        accentMuted:'rgba(99, 102, 241, 0.15)',
        secondary:  '#8b5cf6',
        success:    '#10b981',
        warning:    '#f59e0b',
        danger:     '#ef4444',
        info:       '#06b6d4',

        // Semantic aliases
        primary: {
          50:  '#eef2ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#6366f1',   // Main accent
          600: '#4f46e5',
          700: '#4338ca',
          800: '#3730a3',
          900: '#312e81',
          950: '#1e1b4b',
        },
      },

      // ── Typography ────────────────────────────────────────────────────────
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'Consolas', 'monospace'],
      },

      fontWeight: {
        thin:       '100',
        extralight: '200',
        light:      '300',
        normal:     '400',
        medium:     '500',
        semibold:   '600',
        bold:       '700',
        extrabold:  '800',
        black:      '900',
      },

      // ── Spacing / Sizing ──────────────────────────────────────────────────
      spacing: {
        18: '4.5rem',
        72: '18rem',
        84: '21rem',
        96: '24rem',
      },

      // ── Border Radius ─────────────────────────────────────────────────────
      borderRadius: {
        '4xl': '2rem',
      },

      // ── Box Shadows ───────────────────────────────────────────────────────
      boxShadow: {
        'card':      '0 4px 6px -1px rgba(0,0,0,0.4), 0 2px 4px -1px rgba(0,0,0,0.3)',
        'card-lg':   '0 10px 25px -3px rgba(0,0,0,0.5), 0 4px 6px -2px rgba(0,0,0,0.3)',
        'glow':      '0 0 20px rgba(99,102,241,0.3)',
        'glow-lg':   '0 0 40px rgba(99,102,241,0.4)',
        'inner-glow':'inset 0 0 20px rgba(99,102,241,0.1)',
        'none':      'none',
      },

      // ── Animations ────────────────────────────────────────────────────────
      animation: {
        'fade-in':    'fadeIn 0.3s ease-out',
        'slide-in':   'slideIn 0.3s ease-out',
        'slide-up':   'slideUp 0.3s ease-out',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
        'float':      'float 3s ease-in-out infinite',
        'shimmer':    'shimmer 1.5s infinite',
      },

      keyframes: {
        fadeIn: {
          '0%':   { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideIn: {
          '0%':   { opacity: '0', transform: 'translateX(-16px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        slideUp: {
          '0%':   { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 5px rgba(99,102,241,0.3)' },
          '50%':       { boxShadow: '0 0 25px rgba(99,102,241,0.7)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%':       { transform: 'translateY(-8px)' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },

      // ── Backdrop Blur ─────────────────────────────────────────────────────
      backdropBlur: {
        xs: '2px',
      },

      // ── Width/Height for sidebar ──────────────────────────────────────────
      width: {
        sidebar:           '256px',
        'sidebar-collapsed': '64px',
      },

      // ── Min/Max Height ────────────────────────────────────────────────────
      minHeight: {
        screen: '100vh',
      },

      // ── Transition durations ──────────────────────────────────────────────
      transitionDuration: {
        250: '250ms',
      },
    },
  },

  plugins: [
    // Add tailwind-scrollbar if installed:
    // require('tailwind-scrollbar'),
  ],
};
