import { useState, useEffect } from 'react';
import { FaSun, FaMoon } from 'react-icons/fa';

export function ThemeToggle() {
  const [theme, setTheme] = useState('light');

  useEffect(() => {
    // Get theme from localStorage or default to light
    const savedTheme = localStorage.getItem('theme') || 'light';
    setTheme(savedTheme);
    document.documentElement.setAttribute('data-theme', savedTheme);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
  };

  return (
    <label className="swap swap-rotate">
      <input 
        type="checkbox" 
        className="theme-controller" 
        value={theme}
        checked={theme === 'dark'}
        onChange={toggleTheme}
      />
      <FaSun className="swap-off fill-current w-6 h-6" />
      <FaMoon className="swap-on fill-current w-6 h-6" />
    </label>
  );
}