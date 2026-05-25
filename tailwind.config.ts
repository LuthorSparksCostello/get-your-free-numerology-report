import type { Config } from "tailwindcss";
import tailwindcssAnimate from "tailwindcss-animate";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			fontFamily: {
				display: ['"Cinzel Decorative"', '"Cinzel"', 'serif'],
				heading: ['"Cinzel"', 'serif'],
				body: ['"Space Grotesk"', '"Inter"', 'system-ui', 'sans-serif'],
			},
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				sidebar: {
					DEFAULT: 'hsl(var(--sidebar-background))',
					foreground: 'hsl(var(--sidebar-foreground))',
					primary: 'hsl(var(--sidebar-primary))',
					'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
					accent: 'hsl(var(--sidebar-accent))',
					'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
					border: 'hsl(var(--sidebar-border))',
					ring: 'hsl(var(--sidebar-ring))'
				},
				deepspace: {
					50: '#eef0ff',
					100: '#c8ccf0',
					200: '#9ba2e0',
					300: '#6e78d0',
					400: '#4a50b0',
					500: '#2c2f8a',
					600: '#1e2070',
					700: '#141555',
					800: '#0e0e3a',
					900: '#0a0a1a',
					950: '#06050e',
				},
				nebula: {
					50: '#f3e8ff',
					100: '#e4ccff',
					200: '#c9a0ff',
					300: '#a77bf5',
					400: '#8b5cf6',
					500: '#7c3aed',
					600: '#6d28d9',
					700: '#5b21b6',
					800: '#4c1d95',
					900: '#3b0e80',
					950: '#2e0a66',
				},
				gold: {
					50: '#fefce8',
					100: '#fef9c3',
					200: '#fef08a',
					300: '#fde047',
					400: '#facc15',
					500: '#deae52',
					600: '#ca8a04',
					700: '#a16207',
					800: '#854d0e',
					900: '#713f12',
					950: '#422006',
				},
				aurora: {
					50: '#f0fdfa',
					100: '#ccfbf1',
					200: '#99f6e4',
					300: '#5eead4',
					400: '#2dd4bf',
					500: '#14b8a6',
					600: '#0d9488',
					700: '#0f766e',
					800: '#115e59',
					900: '#134e4a',
					950: '#042f2e',
				},
				stardust: {
					50: '#fdf2f8',
					100: '#fce7f3',
					200: '#fbcfe8',
					300: '#f9a8d4',
					400: '#f472b6',
					500: '#ec4899',
					600: '#db2777',
					700: '#be185d',
					800: '#9d174d',
					900: '#831843',
					950: '#500724',
				},
				cosmic: {
					50: '#faf7f0',
					100: '#f4eddc',
					200: '#e8d8b8',
					300: '#dbbf8e',
					400: '#d1a067',
					500: '#c6884f',
					600: '#b67043',
					700: '#975839',
					800: '#7a4732',
					900: '#633b2a',
					950: '#351d15',
				},
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			keyframes: {
				'accordion-down': {
					from: { height: '0' },
					to: { height: 'var(--radix-accordion-content-height)' }
				},
				'accordion-up': {
					from: { height: 'var(--radix-accordion-content-height)' },
					to: { height: '0' }
				},
				'fade-in-up': {
					'0%': { opacity: '0', transform: 'translateY(20px)' },
					'100%': { opacity: '1', transform: 'translateY(0)' }
				},
				'fade-in': {
					'0%': { opacity: '0' },
					'100%': { opacity: '1' }
				},
				'cosmic-float': {
					'0%, 100%': { transform: 'translateY(0px)' },
					'50%': { transform: 'translateY(-10px)' }
				},
				'pulse-glow': {
					'0%, 100%': { boxShadow: '0 0 20px rgba(222, 174, 82, 0.3)' },
					'50%': { boxShadow: '0 0 40px rgba(222, 174, 82, 0.6)' }
				},
				'shimmer': {
					'0%': { transform: 'translateX(-100%)' },
					'100%': { transform: 'translateX(100%)' }
				},
				'number-spin': {
					'0%': { transform: 'rotateY(0deg) scale(0.8)', opacity: '0' },
					'50%': { transform: 'rotateY(180deg) scale(1.1)', opacity: '0.6' },
					'100%': { transform: 'rotateY(360deg) scale(1)', opacity: '1' },
				},
				'draw-line': {
					'0%': { strokeDashoffset: '100%' },
					'100%': { strokeDashoffset: '0%' },
				},
				'glow-breathe': {
					'0%, 100%': { opacity: '0.5', filter: 'blur(20px)' },
					'50%': { opacity: '0.8', filter: 'blur(30px)' },
				},
				'slide-in-left': {
					'0%': { opacity: '0', transform: 'translateX(-30px)' },
					'100%': { opacity: '1', transform: 'translateX(0)' },
				},
				'slide-in-right': {
					'0%': { opacity: '0', transform: 'translateX(30px)' },
					'100%': { opacity: '1', transform: 'translateX(0)' },
				},
				'counter-roll': {
					'0%': { transform: 'translateY(100%)', opacity: '0' },
					'100%': { transform: 'translateY(0)', opacity: '1' },
				},
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'fade-in-up': 'fade-in-up 0.6s ease-out',
				'fade-in': 'fade-in 0.5s ease-in',
				'cosmic-float': 'cosmic-float 3s ease-in-out infinite',
				'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
				'shimmer': 'shimmer 2s infinite',
				'number-spin': 'number-spin 1.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
				'draw-line': 'draw-line 1.5s ease-out forwards',
				'glow-breathe': 'glow-breathe 4s ease-in-out infinite',
				'slide-in-left': 'slide-in-left 0.5s ease-out',
				'slide-in-right': 'slide-in-right 0.5s ease-out',
				'counter-roll': 'counter-roll 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
			},
			backgroundImage: {
				'cosmic-gradient': 'radial-gradient(circle at 30% 50%, rgba(139, 92, 246, 0.15), transparent 50%), radial-gradient(circle at 80% 20%, rgba(236, 72, 153, 0.15), transparent 50%), radial-gradient(circle at 40% 80%, rgba(20, 184, 166, 0.15), transparent 50%)',
				'gold-gradient': 'linear-gradient(135deg, #fde047 0%, #deae52 50%, #ca8a04 100%)',
				'nebula-gradient': 'linear-gradient(135deg, #7c3aed 0%, #8b5cf6 50%, #a78bfa 100%)',
				'aurora-gradient': 'linear-gradient(135deg, #14b8a6 0%, #2dd4bf 50%, #5eead4 100%)',
			}
		}
	},
	plugins: [tailwindcssAnimate],
} satisfies Config;
