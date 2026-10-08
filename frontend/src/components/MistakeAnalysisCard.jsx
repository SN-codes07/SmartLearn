import { useState } from 'react';
import { IconAlertTriangle, IconSparkles, IconRefresh } from '@tabler/icons-react';

const MistakeAnalysisCard = ({ analysis, onTrySimilar }) => {
  const [expanded, setExpanded] = useState(false);

  if (!analysis || analysis.correct) return null;

  return (
    <div style={{
      marginTop: '1.5rem',
      padding: '1.5rem',
      backgroundColor: 'var(--danger-bg)',
      border: '1px solid var(--danger)',
      borderRadius: 'var(--radius-md)',
      display: 'flex',
      flexDirection: 'column',
      gap: '1rem',
      boxShadow: 'var(--shadow-sm)'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--danger-text)', fontWeight: '700', fontSize: '1rem' }}>
          <IconAlertTriangle size={20} stroke={2} />
          Intelligent Misconception & Mistake Analysis
        </div>
        <span style={{
          fontSize: '0.75rem',
          fontWeight: '700',
          padding: '0.2rem 0.6rem',
          borderRadius: '1rem',
          backgroundColor: 'var(--danger)',
          color: '#ffffff'
        }}>
          Incorrect Option ({analysis.selectedOption})
        </span>
      </div>

      {/* Answer comparison */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '0.75rem', fontSize: '0.9rem' }}>
        <div style={{ padding: '0.75rem 1rem', backgroundColor: 'var(--card-bg)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', borderLeft: '4px solid var(--danger)' }}>
          <span style={{ fontWeight: '600', color: 'var(--danger-text)' }}>Your Answer ({analysis.selectedOption}):</span>
          <div style={{ color: 'var(--text-main)', marginTop: '0.25rem' }}>{analysis.selectedOptionText || `Option ${analysis.selectedOption}`}</div>
        </div>

        <div style={{ padding: '0.75rem 1rem', backgroundColor: 'var(--card-bg)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', borderLeft: '4px solid var(--success)' }}>
          <span style={{ fontWeight: '600', color: 'var(--success-text)' }}>Correct Answer ({analysis.correctOption}):</span>
          <div style={{ color: 'var(--text-main)', marginTop: '0.25rem' }}>{analysis.correctOptionText || `Option ${analysis.correctOption}`}</div>
        </div>
      </div>

      {/* Diagnosed Misconception */}
      <div style={{ padding: '0.85rem 1rem', backgroundColor: 'var(--card-bg)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
        <strong style={{ color: 'var(--danger-text)' }}>Root Misconception:</strong>
        <p style={{ margin: '0.25rem 0 0 0', color: 'var(--text-main)', fontSize: '0.9rem', lineHeight: '1.5' }}>
          {analysis.possibleMisconception}
        </p>
      </div>

      {/* Simple Explanation */}
      <div style={{ fontSize: '0.9rem', color: 'var(--text-main)', lineHeight: '1.5' }}>
        <strong style={{ color: 'var(--text-main)' }}>Simple Explanation:</strong> {analysis.simpleExplanation}
      </div>

      {/* Technical Detail (Expandable) */}
      {expanded && (
        <div style={{
          padding: '0.75rem 1rem',
          backgroundColor: 'var(--bg-color)',
          borderRadius: 'var(--radius-sm)',
          border: '1px solid var(--border-color)',
          borderLeft: '3px solid var(--text-muted)',
          fontSize: '0.85rem',
          color: 'var(--text-main)',
          lineHeight: '1.5'
        }}>
          <strong style={{ color: 'var(--text-main)' }}>Technical Rationale:</strong> {analysis.technicalExplanation}
        </div>
      )}

      {/* Actions */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem', paddingTop: '0.5rem', borderTop: '1px solid var(--border-color)' }}>
        <button
          onClick={() => setExpanded(!expanded)}
          style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '0.85rem', cursor: 'pointer', textDecoration: 'underline' }}
        >
          {expanded ? 'Hide Technical Details' : 'Show Technical Details'}
        </button>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {analysis.similarQuestionId && onTrySimilar && (
            <button
              onClick={() => onTrySimilar(analysis.similarQuestionId)}
              className="btn btn-secondary"
              style={{ fontSize: '0.85rem', padding: '0.4rem 0.8rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
            >
              <IconRefresh size={15} stroke={2} />
              Try Similar Question
            </button>
          )}

          <button
            onClick={() => window.dispatchEvent(new CustomEvent('open-ai-assistant', {
              detail: {
                conceptId: analysis.conceptId,
                conceptName: analysis.conceptName,
                prompt: analysis.aiPrompt
              }
            }))}
            className="btn btn-primary"
            style={{ fontSize: '0.85rem', padding: '0.4rem 0.8rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
          >
            <IconSparkles size={15} stroke={2} />
            Explain My Mistake with AI
          </button>
        </div>
      </div>
    </div>
  );
};

export default MistakeAnalysisCard;
