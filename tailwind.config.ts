import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Base theme colors
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',

        // D&D Combat Tracker Color Palette
        primary: {
          50: 'hsl(var(--primary-50))',
          100: 'hsl(var(--primary-100))',
          200: 'hsl(var(--primary-200))',
          300: 'hsl(var(--primary-300))',
          400: 'hsl(var(--primary-400))',
          500: 'hsl(var(--primary-500))',
          600: 'hsl(var(--primary-600))',
          700: 'hsl(var(--primary-700))',
          800: 'hsl(var(--primary-800))',
          900: 'hsl(var(--primary-900))',
          950: 'hsl(var(--primary-950))',
          DEFAULT: 'hsl(var(--primary-600))',
          foreground: 'hsl(var(--primary-foreground))',
        },

        // Combat state colors
        combat: {
          active: 'hsl(var(--combat-active))',
          'active-foreground': 'hsl(var(--combat-active-foreground))',
          inactive: 'hsl(var(--combat-inactive))',
          'inactive-foreground': 'hsl(var(--combat-inactive-foreground))',
          turn: 'hsl(var(--combat-turn))',
          'turn-foreground': 'hsl(var(--combat-turn-foreground))',
        },

        // HP status colors
        hp: {
          full: 'hsl(var(--hp-full))',
          healthy: 'hsl(var(--hp-healthy))',
          wounded: 'hsl(var(--hp-wounded))',
          critical: 'hsl(var(--hp-critical))',
          unconscious: 'hsl(var(--hp-unconscious))',
        },

        // Character type colors
        character: {
          pc: 'hsl(var(--character-pc))',
          'pc-foreground': 'hsl(var(--character-pc-foreground))',
          npc: 'hsl(var(--character-npc))',
          'npc-foreground': 'hsl(var(--character-npc-foreground))',
          monster: 'hsl(var(--character-monster))',
          'monster-foreground': 'hsl(var(--character-monster-foreground))',
        },

        // UI component colors
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
      },

      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        serif: ['Crimson Text', 'serif'],
        mono: ['JetBrains Mono', 'monospace'],
        fantasy: ['Cinzel', 'serif'], // For D&D headers
      },

      fontSize: {
        xs: ['0.75rem', { lineHeight: '1rem' }],
        sm: ['0.875rem', { lineHeight: '1.25rem' }],
        base: ['1rem', { lineHeight: '1.5rem' }],
        lg: ['1.125rem', { lineHeight: '1.75rem' }],
        xl: ['1.25rem', { lineHeight: '1.75rem' }],
        '2xl': ['1.5rem', { lineHeight: '2rem' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
        '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
        '5xl': ['3rem', { lineHeight: '1' }],
        '6xl': ['3.75rem', { lineHeight: '1' }],
        '7xl': ['4.5rem', { lineHeight: '1' }],
        '8xl': ['6rem', { lineHeight: '1' }],
        '9xl': ['8rem', { lineHeight: '1' }],

        // D&D specific sizes
        stat: ['2rem', { lineHeight: '2.25rem', fontWeight: '700' }],
        modifier: ['1.5rem', { lineHeight: '1.75rem', fontWeight: '600' }],
        'hp-large': ['3rem', { lineHeight: '3.25rem', fontWeight: '800' }],
        initiative: ['1.75rem', { lineHeight: '2rem', fontWeight: '700' }],
      },

      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '92': '23rem',
        '96': '24rem',
        '128': '32rem',
      },

      borderRadius: {
        lg: '0.5rem',
        md: '0.375rem',
        sm: '0.25rem',
        xs: '0.125rem',
      },

      boxShadow: {
        'combat-card':
          '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        'active-turn':
          '0 0 0 2px hsl(var(--combat-turn)), 0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        'character-card':
          '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        'encounter-panel':
          '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      },

      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-in': 'slideIn 0.3s ease-out',
        'pulse-hp': 'pulseHp 2s infinite',
        shake: 'shake 0.5s ease-in-out',
      },

      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideIn: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        pulseHp: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '10%, 30%, 50%, 70%, 90%': { transform: 'translateX(-2px)' },
          '20%, 40%, 60%, 80%': { transform: 'translateX(2px)' },
        },
      },

      screens: {
        xs: '475px',
        '3xl': '1680px',
      },
    },
  },
  plugins: [],
};
export default config;
