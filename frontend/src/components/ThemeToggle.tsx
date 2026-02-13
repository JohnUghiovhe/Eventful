import React from 'react';
import { useTheme } from '../contexts/ThemeContext';

export const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
      aria-label="Toggle theme"
      title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
    >
      {theme === 'light' ? (
        <svg
          className="w-5 h-5 text-gray-800"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z"></path>
        </svg>
      ) : (
        <svg
          className="w-5 h-5 text-yellow-400"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M10 14a4 4 0 100-8 4 4 0 000 8z"></path>
          <path d="M10 0.75a.75.75 0 01.75.75v1.5a.75.75 0 01-1.5 0V1.5A.75.75 0 0110 .75zM10 16.25a.75.75 0 01.75.75v1.5a.75.75 0 01-1.5 0V17a.75.75 0 01.75-.75zM3.636 3.636a.75.75 0 011.06 0l1.06 1.06a.75.75 0 11-1.06 1.06l-1.06-1.06a.75.75 0 010-1.06zM14.244 14.244a.75.75 0 011.06 0l1.06 1.06a.75.75 0 11-1.06 1.06l-1.06-1.06a.75.75 0 010-1.06zM0.75 10a.75.75 0 01.75-.75H3a.75.75 0 010 1.5H1.5A.75.75 0 01.75 10zM16.25 10a.75.75 0 01.75-.75h1.5a.75.75 0 010 1.5H17a.75.75 0 01-.75-.75zM3.636 16.364a.75.75 0 010-1.06l1.06-1.06a.75.75 0 111.06 1.06l-1.06 1.06a.75.75 0 01-1.06 0zM14.244 5.756a.75.75 0 010-1.06l1.06-1.06a.75.75 0 111.06 1.06l-1.06 1.06a.75.75 0 01-1.06 0z"></path>
        </svg>
      )}
    </button>
  );
};
