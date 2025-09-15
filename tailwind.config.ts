import type { Config } from "tailwindcss"

const config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        // BunDefi Design System - Primary Colors (Blue)
        primary: {
          50: '#eff6ff',   // Very light blue
          100: '#dbeafe',  // Light blue
          200: '#bfdbfe',  // Lighter blue
          300: '#93c5fd',  // Light blue
          400: '#60a5fa',  // Medium light blue
          500: '#3b82f6',  // Base blue (main primary)
          600: '#2563eb',  // Medium blue
          700: '#1d4ed8',  // Medium dark blue
          800: '#1e40af',  // Dark blue
          900: '#1e3a8a',  // Darker blue
          950: '#172554',  // Very dark blue
        },
        // BunDefi Design System - Secondary Colors (Slate)
        secondary: {
          50: '#f8fafc',   // Very light slate
          100: '#f1f5f9',  // Light slate
          200: '#e2e8f0',  // Lighter slate
          300: '#cbd5e1',  // Light slate
          400: '#94a3b8',  // Medium light slate
          500: '#64748b',  // Base slate
          600: '#475569',  // Medium slate
          700: '#334155',  // Medium dark slate
          800: '#1e293b',  // Dark slate
          900: '#0f172a',  // Darker slate
          950: '#020617',  // Very dark slate
        },
        // BunDefi Design System - Accent Colors (Emerald for success/positive actions)
        accent: {
          50: '#ecfdf5',   // Very light emerald
          100: '#d1fae5',  // Light emerald
          200: '#a7f3d0',  // Lighter emerald
          300: '#6ee7b7',  // Light emerald
          400: '#34d399',  // Medium light emerald
          500: '#10b981',  // Base emerald (main accent)
          600: '#059669',  // Medium emerald
          700: '#047857',  // Medium dark emerald
          800: '#065f46',  // Dark emerald
          900: '#064e3b',  // Darker emerald
          950: '#022c22',  // Very dark emerald
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "float-up": {
          "0%": { transform: "translateY(0)", opacity: "0.5" },
          "80%": { opacity: "0.7" },
          "100%": { transform: "translateY(-100px)", opacity: "0" }
        },
        "spring-in": {
          "0%": { 
            transform: "scale(0.8) translateY(-8px)", 
            opacity: "0" 
          },
          "100%": { 
            transform: "scale(1) translateY(0)", 
            opacity: "1" 
          },
        },
        "spring-out": {
          "0%": { 
            transform: "scale(1) translateY(0)", 
            opacity: "1" 
          },
          "100%": { 
            transform: "scale(0.8) translateY(-8px)", 
            opacity: "0" 
          },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "float-up": "float-up 3s ease-in-out infinite",
        "spring-in": "spring-in 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
        "spring-out": "spring-out 0.2s cubic-bezier(0.4, 0, 1, 1)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config

export default config

