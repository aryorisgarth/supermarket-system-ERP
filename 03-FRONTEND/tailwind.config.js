/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#1e40af', // Navy blue empresarial
        'primary-dark': '#1e3a8a',
        'primary-light': '#3b82f6',
        secondary: '#64748b', // Gris azulado profesional
        success: '#059669', // Verde más sobrio
        warning: '#d97706', // Amber más serio
        danger: '#dc2626', // Rojo más profesional
        surface: '#ffffff',
        'surface-dark': '#1e293b',
        background: '#f8fafc',
        'background-dark': '#0f172a',
        sidebar: '#ffffff',
        'sidebar-dark': '#1e293b',
        'border-light': '#e2e8f0',
        'border-light-dark': '#334155',
        'border-medium': '#cbd5e1',
        'border-medium-dark': '#475569',
        'text-primary': '#0f172a',
        'text-primary-dark': '#f1f5f9',
        'text-secondary': '#475569',
        'text-secondary-dark': '#94a3b8',
        'text-muted': '#94a3b8',
        'text-muted-dark': '#64748b',
      },
      fontFamily: {
        sans: ['Inter', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
      },
      boxShadow: {
        'enterprise': '0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)',
        'enterprise-lg': '0 4px 6px rgba(0, 0, 0, 0.07), 0 2px 4px rgba(0, 0, 0, 0.06)',
        'enterprise-dark': '0 1px 3px rgba(0, 0, 0, 0.3), 0 1px 2px rgba(0, 0, 0, 0.2)',
        'enterprise-lg-dark': '0 4px 6px rgba(0, 0, 0, 0.3), 0 2px 4px rgba(0, 0, 0, 0.2)',
      },
    },
  },
  plugins: [],
}
