import React from 'react';
import { useTheme } from '../contexts/ThemeContext';

interface HeaderProps {
  onViewHistory?: () => void;
  onViewNotes?: () => void;
  onViewChat?: () => void;
  showBackButton?: boolean;
  onBack?: () => void;
}

const Header: React.FC<HeaderProps> = ({ onViewHistory, onViewNotes, onViewChat, showBackButton, onBack }) => {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="header">
      <div className="header-container">
        <div className="header-content">
          <div className="header-brand">
            <button 
              className="theme-toggle"
              onClick={toggleTheme}
              title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
              aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            >
              {theme === 'light' ? '🌙' : '☀️'}
            </button>
            <div className="brand-info">
              <h1 className="brand-title">
                <span className="brand-icon">🧮</span>
                AI Math Bud
              </h1>
              <p className="brand-tagline">Your personal AI math tutor - just snap a photo of any math problem!</p>
            </div>
          </div>
          
          <nav className="header-navigation">
            {showBackButton ? (
              <button 
                className="nav-btn nav-btn-primary"
                onClick={onBack}
              >
                <span className="nav-icon">←</span>
                Back to Solve
              </button>
            ) : (
              <div className="nav-buttons">
                <button 
                  className="nav-btn nav-btn-secondary"
                  onClick={onViewChat}
                  title="Chat with AI Tutor"
                >
                  <span className="nav-icon">💬</span>
                  <span className="nav-text">Chat Tutor</span>
                </button>
                <button 
                  className="nav-btn nav-btn-secondary"
                  onClick={onViewNotes}
                  title="View My Notes"
                >
                  <span className="nav-icon">📝</span>
                  <span className="nav-text">My Notes</span>
                </button>
                <button 
                  className="nav-btn nav-btn-secondary"
                  onClick={onViewHistory}
                  title="View Problem History"
                >
                  <span className="nav-icon">📚</span>
                  <span className="nav-text">History</span>
                </button>
              </div>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;
