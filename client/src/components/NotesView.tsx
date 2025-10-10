import React, { useState } from 'react';

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
}

const NotesView: React.FC<NotesViewProps> = ({ notes }) => {
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

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
                className={`topic-item ${selectedTopic === note.topic ? 'active' : ''}`}
                onClick={() => setSelectedTopic(note.topic)}
              >
                <div className="topic-name">{note.topic}</div>
                <div className="topic-meta">
                  {note.problemCount} problem{note.problemCount !== 1 ? 's' : ''} • 
                  Updated {formatDate(note.lastUpdated)}
                </div>
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
