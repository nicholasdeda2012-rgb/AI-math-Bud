import React from 'react';

interface Solution {
  steps: string[];
  explanation: string;
}

interface SolutionDisplayProps {
  solution: Solution;
  onReset: () => void;
}

const SolutionDisplay: React.FC<SolutionDisplayProps> = ({ solution, onReset }) => {
  return (
    <div className="solution-container">
      <div className="solution-header">
        <h2 className="solution-title">🎯 Solution Found!</h2>
        <button 
          className="btn btn-secondary"
          onClick={onReset}
        >
          🔄 Solve Another Problem
        </button>
      </div>

      {solution.explanation && (
        <div className="solution-explanation">
          <strong>📚 Understanding the Problem:</strong><br />
          {solution.explanation}
        </div>
      )}

      <div className="steps-container">
        <h3>📝 Step-by-Step Solution:</h3>
        {solution.steps.map((step, index) => (
          <div key={index} className="step">
            <div style={{ display: 'flex', alignItems: 'flex-start' }}>
              <div className="step-number">{index + 1}</div>
              <div className="step-content">
                {step.split('\n').map((line, lineIndex) => {
                  const trimmedLine = line.trim();
                  const isReasoning = trimmedLine.toLowerCase().includes('because') || 
                                     trimmedLine.toLowerCase().includes('we do this') ||
                                     trimmedLine.toLowerCase().includes('reason') ||
                                     trimmedLine.toLowerCase().includes('why') ||
                                     trimmedLine.startsWith('💡');
                  const isCalculation = trimmedLine.startsWith('📊');
                  
                  return (
                    <div 
                      key={lineIndex} 
                      className={isReasoning ? 'reasoning-text' : isCalculation ? 'calculation-text' : 'step-text'}
                      style={{ 
                        marginBottom: lineIndex < step.split('\n').length - 1 ? '0.5rem' : '0',
                        fontWeight: isCalculation ? '600' : 'normal'
                      }}
                    >
                      {trimmedLine}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ textAlign: 'center', marginTop: '2rem' }}>
        <div style={{ 
          background: 'rgba(102, 126, 234, 0.1)', 
          padding: '1rem', 
          borderRadius: '10px',
          marginBottom: '1rem'
        }}>
          <h4 style={{ color: '#667eea', margin: '0 0 0.5rem 0' }}>🎓 Learning Tips</h4>
          <p style={{ color: '#555', margin: '0', fontSize: '0.9rem' }}>
            Pay attention to the reasoning behind each step - understanding WHY we do each calculation 
            will help you solve similar problems independently!
          </p>
        </div>
        <p style={{ color: '#666', fontStyle: 'italic' }}>
          💡 Remember: Understanding each step helps you solve similar problems in the future!
        </p>
      </div>
    </div>
  );
};

export default SolutionDisplay;
