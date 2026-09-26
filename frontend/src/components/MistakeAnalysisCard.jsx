import { useState } from 'react';

const MistakeAnalysisCard = ({ analysis, onTrySimilar }) => {
  const [expanded, setExpanded] = useState(false);

  if (!analysis || analysis.correct) return null;

  return (
    <div style={{
      marginTop: '1.5rem',
      padding: '1.5rem',
      backgroundColor: '#fef2f2',
      border: '2px solid #fecaca',
      borderRadius: 'var(--radius-md)',
      display: 'flex',
      flexDirection: 'column',
      gap: '1rem',
      boxShadow: '0 4px 12px rgba(220,38,38,0.08)'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#991b1b', fontWeight: '700', fontSize: '1rem' }}>
          <span style={{ fontSize: '1.3rem' }}>🔬</span>
          Intelligent Misconception & Mistake Analysis
        </div>
        <span style={{
          fontSize: '0.75rem',
          fontWeight: '700',
          padding: '0.2rem 0.6rem',
          borderRadius: '1rem',
          backgroundColor: '#ef4444',
          color: 'white'
        }}>
          Incorrect Option ({analysis.selectedOption})
        </span>
      </div>

      {/* Answer comparison */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '0.75rem', fontSize: '0.9rem' }}>
        <div style={{ padding: '0.75rem 1rem', backgroundColor: '#fee2e2', borderRadius: 'var(--radius-sm)', borderLeft: '4px solid #ef4444' }}>
          <span style={{ fontWeight: '600', color: '#991b1b' }}>Your Answer ({analysis.selectedOption}):</span>
          <div style={{ color: '#7f1d1d', marginTop: '0.25rem' }}>{analysis.selectedOptionText || `Option ${analysis.selectedOption}`}</div>
        </div>

        <div style={{ padding: '0.75rem 1rem', backgroundColor: '#f0fdf4', borderRadius: 'var(--radius-sm)', borderLeft: '4px solid #22c55e' }}>
          <span style={{ fontWeight: '600', color: '#166534' }}>Correct Answer ({analysis.correctOption}):</span>
          <div style={{ color: '#14532d', marginTop: '0.25rem' }}>{analysis.correctOptionText || `Option ${analysis.correctOption}`}</div>
        </div>
      </div>

      {/* Diagnosed Misconception */}
      <div style={{ padding: '0.85rem 1rem', backgroundColor: '#ffffff', borderRadius: 'var(--radius-sm)', border: '1px solid #fca5a5' }}>
        <strong style={{ color: '#991b1b' }}>Root Misconception:</strong>
        <p style={{ margin: '0.25rem 0 0 0', color: '#1e293b', fontSize: '0.9rem', lineHeight: '1.5' }}>
          {analysis.possibleMisconception}
        </p>
      </div>

      {/* Simple Explanation */}
      <div style={{ fontSize: '0.9rem', color: '#334155', lineHeight: '1.5' }}>
        <strong>Simple Explanation:</strong> {analysis.simpleExplanation}
      </div>

      {/* Technical Detail (Expandable) */}
      {expanded && (
        <div style={{
          padding: '0.75rem 1rem',
          backgroundColor: '#f8fafc',
          borderRadius: 'var(--radius-sm)',
          borderLeft: '3px solid #64748b',
          fontSize: '0.85rem',
          color: '#334155',
          lineHeight: '1.5'
        }}>
          <strong>Technical Rationale:</strong> {analysis.technicalExplanation}
        </div>
      )}

      {/* Actions */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem', paddingTop: '0.5rem', borderTop: '1px solid #fecaca' }}>
        <button
          onClick={() => setExpanded(!expanded)}
          style={{ background: 'none', border: 'none', color: '#64748b', fontSize: '0.85rem', cursor: 'pointer', textDecoration: 'underline' }}
        >
          {expanded ? 'Hide Technical Details' : 'Show Technical Details'}
        </button>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {analysis.similarQuestionId && onTrySimilar && (
            <button
              onClick={() => onTrySimilar(analysis.similarQuestionId)}
              className="btn btn-secondary"
              style={{ fontSize: '0.85rem', padding: '0.4rem 0.8rem' }}
            >
              ⚡ Try Similar Question
            </button>
          )}

          <button
            onClick={() => window.dispatchEvent(new CustomEvent('open-ai-assistant', {
              detail: {
                conceptId: analysis.conceptId,
                prompt: analysis.aiPrompt
              }
            }))}
            className="btn"
            style={{ fontSize: '0.85rem', padding: '0.4rem 0.8rem' }}
          >
            ✨ Explain My Mistake with AI
          </button>
        </div>
      </div>
    </div>
  );
};

export default MistakeAnalysisCard;
