import React, { useState, useEffect } from 'react';
import './App.css';
import ImageUpload from './components/ImageUpload';
import SolutionDisplay from './components/SolutionDisplay';
import Header from './components/Header';
import HistoryView from './components/HistoryView';
import NotesView from './components/NotesView';
import Chat from './components/Chat';
import { ThemeProvider } from './contexts/ThemeContext';

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

interface TopicNote {
  topic: string;
  concepts: string[];
  examples: string[];
  keyFormulas: string[];
  lastUpdated: Date;
  problemCount: number;
}

function App() {
  const [solution, setSolution] = useState<Solution | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [showNotes, setShowNotes] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [notes, setNotes] = useState<Map<string, TopicNote>>(new Map());

  // Load history and notes from localStorage on component mount
  useEffect(() => {
    const savedHistory = localStorage.getItem('mathBudHistory');
    if (savedHistory) {
      try {
        const parsedHistory = JSON.parse(savedHistory).map((item: any) => ({
          ...item,
          timestamp: new Date(item.timestamp)
        }));
        setHistory(parsedHistory);
      } catch (error) {
        console.error('Error loading history:', error);
      }
    }

    const savedNotes = localStorage.getItem('mathBudNotes');
    if (savedNotes) {
      try {
        const parsedNotes = new Map<string, TopicNote>(JSON.parse(savedNotes).map(([key, value]: [string, any]) => [
          key, 
          { ...value, lastUpdated: new Date(value.lastUpdated) }
        ]));
        setNotes(parsedNotes);
      } catch (error) {
        console.error('Error loading notes:', error);
      }
    }
  }, []);

  // Save history and notes to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('mathBudHistory', JSON.stringify(history));
  }, [history]);

  useEffect(() => {
    const notesArray = Array.from(notes.entries());
    localStorage.setItem('mathBudNotes', JSON.stringify(notesArray));
  }, [notes]);

  const detectTopics = (solution: Solution): string[] => {
    const topics: string[] = [];
    const explanation = solution.explanation.toLowerCase();
    const steps = solution.steps.join(' ').toLowerCase();

    // Topic detection based on keywords
    if (explanation.includes('quadratic') || steps.includes('quadratic')) {
      topics.push('Quadratic Equations');
    }
    if (explanation.includes('linear') || steps.includes('linear')) {
      topics.push('Linear Equations');
    }
    if (explanation.includes('factoring') || steps.includes('factor')) {
      topics.push('Factoring');
    }
    if (explanation.includes('polynomial') || steps.includes('polynomial')) {
      topics.push('Polynomials');
    }
    if (explanation.includes('algebra') || steps.includes('algebra')) {
      topics.push('Algebra');
    }
    if (explanation.includes('geometry') || steps.includes('geometry')) {
      topics.push('Geometry');
    }
    if (explanation.includes('trigonometry') || steps.includes('trig')) {
      topics.push('Trigonometry');
    }
    if (explanation.includes('calculus') || steps.includes('derivative') || steps.includes('integral')) {
      topics.push('Calculus');
    }
    if (explanation.includes('fraction') || steps.includes('fraction')) {
      topics.push('Fractions');
    }
    if (explanation.includes('percentage') || steps.includes('percent')) {
      topics.push('Percentages');
    }
    if (explanation.includes('probability') || steps.includes('probability')) {
      topics.push('Probability');
    }
    if (explanation.includes('statistics') || steps.includes('statistics')) {
      topics.push('Statistics');
    }

    // If no specific topics detected, add general math
    if (topics.length === 0) {
      topics.push('General Math');
    }

    return topics;
  };

  const updateNotes = (solution: Solution, topics: string[]) => {
    setNotes(prevNotes => {
      const newNotes = new Map(prevNotes);
      
      topics.forEach(topic => {
        const existingNote = newNotes.get(topic) || {
          topic,
          concepts: [],
          examples: [],
          keyFormulas: [],
          lastUpdated: new Date(),
          problemCount: 0
        };

        // Extract concepts from explanation
        const concepts = solution.explanation.split('.').map(s => s.trim()).filter(s => s.length > 10);
        
        // Extract examples from steps
        const examples = solution.steps.filter(step => 
          typeof step === 'string' && step.length > 20
        );

        // Extract formulas (look for mathematical expressions)
        const formulas = solution.steps.filter(step => 
          typeof step === 'string' && (
            step.includes('=') || 
            step.includes('^') || 
            step.includes('√') ||
            step.includes('±') ||
            step.match(/[a-zA-Z]\s*[+\-*/]\s*[a-zA-Z]/)
          )
        );

        // Update the note
        const updatedNote: TopicNote = {
          topic,
          concepts: Array.from(new Set([...existingNote.concepts, ...concepts])).slice(0, 10), // Keep top 10 concepts
          examples: Array.from(new Set([...existingNote.examples, ...examples])).slice(0, 5), // Keep top 5 examples
          keyFormulas: Array.from(new Set([...existingNote.keyFormulas, ...formulas])).slice(0, 8), // Keep top 8 formulas
          lastUpdated: new Date(),
          problemCount: existingNote.problemCount + 1
        };

        newNotes.set(topic, updatedNote);
      });

      return newNotes;
    });
  };

  const handleImageSubmit = async (imageFile: File) => {
    setLoading(true);
    setError(null);
    setSolution(null);

    try {
      const formData = new FormData();
      formData.append('image', imageFile);

      const response = await fetch('http://localhost:5000/api/solve', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to solve the math problem');
      }

      const data = await response.json();
      setSolution(data);

      // Detect topics and update notes
      const topics = detectTopics(data);
      updateNotes(data, topics);

      // Add to history
      const historyItem: HistoryItem = {
        id: Date.now().toString(),
        timestamp: new Date(),
        solution: data,
        problemType: topics[0] // Use first topic as primary type
      };
      
      setHistory(prev => [historyItem, ...prev.slice(0, 49)]); // Keep last 50 items
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setSolution(null);
    setError(null);
  };

  const handleViewHistory = () => {
    setShowHistory(true);
    setShowNotes(false);
    setSolution(null);
    setError(null);
  };

  const handleViewNotes = () => {
    setShowNotes(true);
    setShowHistory(false);
    setShowChat(false);
    setSolution(null);
    setError(null);
  };

  const handleRenameTopic = (oldTopic: string, newTopic: string) => {
    setNotes(prevNotes => {
      const newNotes = new Map(prevNotes);
      const note = newNotes.get(oldTopic);
      
      if (note) {
        // Create updated note with new topic name
        const updatedNote = { ...note, topic: newTopic };
        newNotes.delete(oldTopic);
        newNotes.set(newTopic, updatedNote);
        
        // Note: selectedTopic is managed within NotesView component
      }
      
      return newNotes;
    });
  };

  const handleViewChat = () => {
    setShowChat(true);
    setShowHistory(false);
    setShowNotes(false);
    setSolution(null);
    setError(null);
  };

  const handleBackToSolve = () => {
    setShowHistory(false);
    setShowNotes(false);
    setShowChat(false);
  };

  const handleLoadFromHistory = (historyItem: HistoryItem) => {
    setSolution(historyItem.solution);
    setShowHistory(false);
    setShowNotes(false);
  };

  return (
    <ThemeProvider>
      <div className="App">
        <Header 
          onViewHistory={handleViewHistory} 
          onViewNotes={handleViewNotes}
          onViewChat={handleViewChat}
          showBackButton={showHistory || showNotes || showChat} 
          onBack={handleBackToSolve} 
        />
        <main className="main-content">
          {showHistory ? (
            <HistoryView 
              history={history} 
              onLoadProblem={handleLoadFromHistory}
            />
          ) : showNotes ? (
            <NotesView 
              notes={Array.from(notes.values())}
              onRenameTopic={handleRenameTopic}
            />
          ) : showChat ? (
            <Chat 
              onClose={handleBackToSolve}
            />
          ) : !solution ? (
            <ImageUpload 
              onSubmit={handleImageSubmit} 
              loading={loading}
              error={error}
            />
          ) : (
            <SolutionDisplay 
              solution={solution} 
              onReset={handleReset}
            />
          )}
        </main>
      </div>
    </ThemeProvider>
  );
}

export default App;