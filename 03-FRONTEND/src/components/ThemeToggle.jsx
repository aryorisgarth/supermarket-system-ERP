import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const ThemeToggle = ({ className = '' }) => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`flex h-8 w-8 items-center justify-center rounded-lg border border-transparent text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100 ${className}`}
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
