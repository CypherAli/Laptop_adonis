import React, { useContext } from 'react'
import { ThemeContext } from '../../context/ThemeContext'
import { FiSun, FiMoon } from 'react-icons/fi'
import './ThemeToggle.css'

const ThemeToggle = () => {
  const { theme, toggleTheme } = useContext(ThemeContext)

  return (
    <button
      className="theme-toggle-btn"
      onClick={toggleTheme}
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
      title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
    >
      <div className="theme-toggle-icon-wrapper">
        {theme === 'light' ? (
          <FiMoon className="theme-toggle-icon" />
        ) : (
          <FiSun className="theme-toggle-icon" />
        )}
      </div>
    </button>
  )
}

export default ThemeToggle
