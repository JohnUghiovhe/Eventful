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
          <path
            fillRule="evenodd"
            d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.536a1 1 0 11-.707-1.707 2 2 0 010 2.828 1 1 0 01-.707-1.121zM4.464 8.464a1 1 0 111.414-1.414 2 2 0 010 2.828 1 1 0 01-1.414-1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1zm12 0a1 1 0 100-2h-1a1 1 0 000 2h1zM4.464 4.464a1 1 0 011.414-1.414 2 2 0 010 2.828 1 1 0 01-1.414-1.414zM14.464 14.464a1 1 0 01-1.414 1.414 2 2 0 010-2.828 1 1 0 011.414 1.414zM10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1z"
            clipRule="evenodd"
          ></path>
        </svg>
      )}
    </button>
  );
};
