import React, { useState } from 'react';

interface Solution {
  steps: string[];
  explanation: string;
}

interface HistoryItem {
  id: string;
  timestamp: Date;
  solution: Solution;
  problemType?: string;
}

interface HistoryViewProps {
  history: HistoryItem[];
  onLoadProblem: (item: HistoryItem) => void;
}

const HistoryView: React.FC<HistoryViewProps> = ({ history, onLoadProblem }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');

  const filteredHistory = history.filter(item => {
    const matchesSearch = item.solution.explanation.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.solution.steps.some(step => step.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesFilter = filterType === 'all' || item.problemType === filterType;
    return matchesSearch && matchesFilter;
  });

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const getProblemTypes = () => {
    const types = Array.from(new Set(history.map(item => item.problemType).filter(Boolean)));
    return types;
  };

  if (history.length === 0) {
    return (
      <div className="history-container">
        <div className="empty-history">
          <div className="empty-icon">📚</div>
          <h2>No Problems Solved Yet</h2>
          <p>Start solving math problems to build your learning history!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="history-container">
      <div className="history-header">
        <h2>📚 Your Math Learning History</h2>
        <p>Review and revisit problems you've solved</p>
      </div>

      <div className="history-controls">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search problems..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        
        <div className="filter-box">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Types</option>
            {getProblemTypes().map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="history-stats">
        <div className="stat-item">
          <span className="stat-number">{history.length}</span>
          <span className="stat-label">Problems Solved</span>
        </div>
        <div className="stat-item">
          <span className="stat-number">{getProblemTypes().length}</span>
          <span className="stat-label">Problem Types</span>
        </div>
      </div>

      <div className="history-list">
        {filteredHistory.map((item) => (
          <div key={item.id} className="history-item" onClick={() => onLoadProblem(item)}>
            <div className="history-item-header">
              <div className="problem-type-badge">
                {item.problemType || 'Math Problem'}
              </div>
              <div className="history-date">
                {formatDate(item.timestamp)}
              </div>
            </div>
            
            <div className="history-item-content">
              <div className="problem-preview">
                {item.solution.explanation.length > 150 
                  ? `${item.solution.explanation.substring(0, 150)}...`
                  : item.solution.explanation
                }
              </div>
              
              <div className="steps-preview">
                <strong>Steps:</strong> {item.solution.steps.length} step{item.solution.steps.length !== 1 ? 's' : ''}
              </div>
            </div>
            
            <div className="history-item-footer">
              <button className="btn btn-primary btn-small">
                View Solution
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredHistory.length === 0 && (
        <div className="no-results">
          <p>No problems found matching your search criteria.</p>
        </div>
      )}
    </div>
  );
};

export default HistoryView;
