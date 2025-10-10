import React from 'react';

interface HeaderProps {
  onViewHistory?: () => void;
  onViewNotes?: () => void;
  onViewChat?: () => void;
  showBackButton?: boolean;
  onBack?: () => void;
}

const Header: React.FC<HeaderProps> = ({ onViewHistory, onViewNotes, onViewChat, showBackButton, onBack }) => {
  return (
    <header className="header">
      <div className="main-content">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1>🧮 AI Math Bud</h1>
            <p>Your personal AI math tutor - just snap a photo of any math problem!</p>
          </div>
          <div className="header-actions">
            {showBackButton ? (
              <button 
                className="btn btn-secondary"
                onClick={onBack}
              >
                ← Back to Solve
              </button>
            ) : (
              <>
                <button 
                  className="btn btn-secondary"
                  onClick={onViewChat}
                >
                  💬 Chat Tutor
                </button>
                <button 
                  className="btn btn-secondary"
                  onClick={onViewNotes}
                >
                  📝 My Notes
                </button>
                <button 
                  className="btn btn-secondary"
                  onClick={onViewHistory}
                >
                  📚 History
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
