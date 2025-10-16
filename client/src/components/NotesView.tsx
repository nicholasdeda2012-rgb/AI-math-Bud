import React, { useState, useRef, useEffect } from 'react';

interface TopicNote {
  topic: string;
  concepts: string[];
  examples: string[];
  keyFormulas: string[];
  lastUpdated: Date;
  problemCount: number;
}

interface NotesViewProps {
  notes: TopicNote[];
  onRenameTopic?: (oldTopic: string, newTopic: string) => void;
}

const NotesView: React.FC<NotesViewProps> = ({ notes, onRenameTopic }) => {
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingTopic, setEditingTopic] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [showRenameMenu, setShowRenameMenu] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const filteredNotes = notes.filter(note => 
    note.topic.toLowerCase().includes(searchTerm.toLowerCase()) ||
    note.concepts.some(concept => concept.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(date);
  };

  const selectedNote = selectedTopic ? notes.find(note => note.topic === selectedTopic) : null;

  // Handle clicking outside to close rename menu
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowRenameMenu(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Focus input when editing starts
  useEffect(() => {
    if (editingTopic && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editingTopic]);

  const handleStartRename = (topic: string, event: React.MouseEvent) => {
    event.stopPropagation();
    setEditingTopic(topic);
    setEditValue(topic);
    setShowRenameMenu(null);
  };

  const handleRenameSubmit = () => {
    if (editingTopic && editValue.trim() && editValue.trim() !== editingTopic) {
      const trimmedValue = editValue.trim();
      
      // Check if the new name already exists
      const existingTopic = notes.find(note => 
        note.topic.toLowerCase() === trimmedValue.toLowerCase() && note.topic !== editingTopic
      );
      
      if (existingTopic) {
        alert('A topic with this name already exists. Please choose a different name.');
        return;
      }
      
      if (onRenameTopic) {
        onRenameTopic(editingTopic, trimmedValue);
      }
    }
    setEditingTopic(null);
    setEditValue('');
  };

  const handleRenameCancel = () => {
    setEditingTopic(null);
    setEditValue('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleRenameSubmit();
    } else if (e.key === 'Escape') {
      handleRenameCancel();
    }
  };

  const handleTopicClick = (topic: string) => {
    if (editingTopic !== topic) {
      setSelectedTopic(topic);
    }
  };

  const handleContextMenu = (topic: string, event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    setShowRenameMenu(topic);
  };

  if (notes.length === 0) {
    return (
      <div className="notes-container">
        <div className="empty-notes">
          <div className="empty-icon">📝</div>
          <h2>No Notes Yet</h2>
          <p>Start solving math problems to build your personalized notes!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="notes-container">
      <div className="notes-header">
        <h2>📝 Your Math Notes</h2>
        <p>Knowledge accumulated from your solved problems</p>
      </div>

      <div className="notes-search">
        <input
          type="text"
          placeholder="Search topics or concepts..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
      </div>

      <div className="notes-stats">
        <div className="stat-item">
          <span className="stat-number">{notes.length}</span>
          <span className="stat-label">Topics Studied</span>
        </div>
        <div className="stat-item">
          <span className="stat-number">{notes.reduce((sum, note) => sum + note.problemCount, 0)}</span>
          <span className="stat-label">Problems Solved</span>
        </div>
        <div className="stat-item">
          <span className="stat-number">{notes.reduce((sum, note) => sum + note.concepts.length, 0)}</span>
          <span className="stat-label">Concepts Learned</span>
        </div>
      </div>

      <div className="notes-layout">
        <div className="topics-sidebar">
          <h3>📚 Topics</h3>
          <div className="topics-list">
            {filteredNotes.map((note) => (
              <div
                key={note.topic}
                className={`topic-item ${selectedTopic === note.topic ? 'active' : ''} ${editingTopic === note.topic ? 'editing' : ''}`}
                onClick={() => handleTopicClick(note.topic)}
                onContextMenu={(e) => handleContextMenu(note.topic, e)}
              >
                {editingTopic === note.topic ? (
                  <div className="topic-edit">
                    <input
                      ref={inputRef}
                      type="text"
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      onKeyDown={handleKeyPress}
                      onBlur={handleRenameSubmit}
                      className="topic-edit-input"
                      maxLength={50}
                    />
                    <div className="topic-edit-actions">
                      <button
                        className="edit-action-btn save"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRenameSubmit();
                        }}
                        title="Save"
                      >
                        ✓
                      </button>
                      <button
                        className="edit-action-btn cancel"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRenameCancel();
                        }}
                        title="Cancel"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="topic-name">{note.topic}</div>
                    <div className="topic-meta">
                      {note.problemCount} problem{note.problemCount !== 1 ? 's' : ''} • 
                      Updated {formatDate(note.lastUpdated)}
                    </div>
                    {showRenameMenu === note.topic && (
                      <div ref={menuRef} className="topic-context-menu">
                        <button
                          className="context-menu-item"
                          onClick={(e) => handleStartRename(note.topic, e)}
                        >
                          ✏️ Rename Topic
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="notes-content">
          {selectedNote ? (
            <div className="topic-detail">
              <div className="topic-header">
                <h2>{selectedNote.topic}</h2>
                <div className="topic-stats">
                  <span className="problem-count">{selectedNote.problemCount} problems solved</span>
                  <span className="last-updated">Last updated: {formatDate(selectedNote.lastUpdated)}</span>
                </div>
              </div>

              <div className="notes-sections">
                <div className="notes-section">
                  <h3>🧠 Key Concepts</h3>
                  <div className="concepts-list">
                    {selectedNote.concepts.map((concept, index) => (
                      <div key={index} className="concept-item">
                        {concept}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="notes-section">
                  <h3>📊 Key Formulas & Equations</h3>
                  <div className="formulas-list">
                    {selectedNote.keyFormulas.map((formula, index) => (
                      <div key={index} className="formula-item">
                        {formula}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="notes-section">
                  <h3>💡 Example Problems</h3>
                  <div className="examples-list">
                    {selectedNote.examples.map((example, index) => (
                      <div key={index} className="example-item">
                        {example}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="select-topic">
              <div className="select-icon">📖</div>
              <h3>Select a Topic</h3>
              <p>Choose a topic from the sidebar to view your accumulated knowledge</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotesView;
