import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const ThemeToggle = ({ className = '' }) => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className={`flex h-8 w-8 items-center justify-center rounded-lg text-[var(--app-text-muted)] transition hover:bg-[var(--app-bg-subtle)] hover:text-[var(--app-primary)] ${className}`}
      aria-label="Toggle theme"
      title={theme === 'light' ? 'Activar modo oscuro' : 'Activar modo claro'}
    >
      {theme === 'light' ? (
        <Moon size={16} />
      ) : (
        <Sun size={16} />
      )}
    </button>
  );
};

export default ThemeToggle;
