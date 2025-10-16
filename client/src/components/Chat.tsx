import React, { useState, useRef, useEffect } from 'react';

interface ChatMessage {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

interface ChatProps {
  onClose: () => void;
}

const Chat: React.FC<ChatProps> = ({ onClose }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load chat history from localStorage
  useEffect(() => {
    const savedMessages = localStorage.getItem('mathBudChat');
    if (savedMessages) {
      try {
        const parsedMessages = JSON.parse(savedMessages).map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        }));
        setMessages(parsedMessages);
      } catch (error) {
        console.error('Error loading chat history:', error);
      }
    } else {
      // Add welcome message
      const welcomeMessage: ChatMessage = {
        id: Date.now().toString(),
        text: "Hi! I'm your AI Math Tutor. You can ask me any math questions, request explanations of concepts, or get help with problem-solving strategies. What would you like to learn about today?",
        isUser: false,
        timestamp: new Date()
      };
      setMessages([welcomeMessage]);
    }
  }, []);

  // Save chat history to localStorage
  useEffect(() => {
    localStorage.setItem('mathBudChat', JSON.stringify(messages));
  }, [messages]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputText.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      text: inputText.trim(),
      isUser: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:5000/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: userMessage.text }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response from AI tutor');
      }

      const data = await response.json();
      
      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        text: data.response,
        isUser: false,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        text: "I'm sorry, I'm having trouble connecting right now. Please try again in a moment.",
        isUser: false,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const clearChat = () => {
    const welcomeMessage: ChatMessage = {
      id: Date.now().toString(),
      text: "Hi! I'm your AI Math Tutor. You can ask me any math questions, request explanations of concepts, or get help with problem-solving strategies. What would you like to learn about today?",
      isUser: false,
      timestamp: new Date()
    };
    setMessages([welcomeMessage]);
  };

  return (
    <div className="chat-container">
      <div className="chat-header">
        <div className="chat-title">
          <div className="chat-avatar">
            <span className="chat-icon">🧮</span>
          </div>
          <div className="chat-title-text">
            <h3>AI Math Tutor</h3>
            <span className="chat-status">Online</span>
          </div>
        </div>
        <div className="chat-actions">
          <button className="chat-action-btn" onClick={clearChat} title="Clear Chat">
            <span className="action-icon">🗑️</span>
          </button>
          <button className="chat-action-btn" onClick={onClose} title="Close Chat">
            <span className="action-icon">✕</span>
          </button>
        </div>
      </div>

      <div className="chat-messages">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`message ${message.isUser ? 'user-message' : 'ai-message'}`}
          >
            {!message.isUser && (
              <div className="message-avatar">
                <span className="avatar-icon">🤖</span>
              </div>
            )}
            <div className="message-content">
              <div className="message-text">{message.text}</div>
              <div className="message-time">
                {message.timestamp.toLocaleTimeString([], { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </div>
            </div>
            {message.isUser && (
              <div className="message-avatar user-avatar">
                <span className="avatar-icon">👤</span>
              </div>
            )}
          </div>
        ))}
        
        {isLoading && (
          <div className="message ai-message">
            <div className="message-avatar">
              <span className="avatar-icon">🤖</span>
            </div>
            <div className="message-content">
              <div className="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      <div className="chat-input">
        <div className="input-container">
          <div className="input-wrapper">
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask me anything about math..."
              className="chat-textarea"
              rows={1}
              disabled={isLoading}
            />
            <button
              onClick={handleSendMessage}
              disabled={!inputText.trim() || isLoading}
              className="send-button"
            >
              <span className="send-icon">→</span>
            </button>
          </div>
        </div>
        <div className="chat-suggestions">
          <span className="suggestion-label">Quick questions:</span>
          <div className="suggestion-chips">
            <button 
              className="suggestion-chip"
              onClick={() => setInputText("Explain quadratic equations")}
            >
              Quadratic equations
            </button>
            <button 
              className="suggestion-chip"
              onClick={() => setInputText("How do I factor polynomials?")}
            >
              Factor polynomials
            </button>
            <button 
              className="suggestion-chip"
              onClick={() => setInputText("What's the difference between linear and quadratic functions?")}
            >
              Linear vs quadratic
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;
