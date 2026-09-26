import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const NextActionCard = ({ studentId }) => {
  const { user } = useAuth();
  const activeStudentId = studentId || user?.id || 1;
  const [nextAction, setNextAction] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.get(`/students/${activeStudentId}/next-action`)
      .then(res => {
        setNextAction(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error loading next action", err);
        setLoading(false);
      });
  }, [activeStudentId]);

  if (loading || !nextAction) return null;

  const isGap = nextAction.badge?.includes('GAP');
  const badgeColor = isGap ? '#ef4444' : nextAction.badge?.includes('RECOVERY') ? '#f59e0b' : '#10b981';

  return (
    <div className="card" style={{
      background: isGap ? 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)' : 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
      color: 'white',
      border: `2px solid ${badgeColor}`,
      boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      <div style={{
        position: 'absolute', top: 0, right: 0, width: '150px', height: '150px',
        background: `radial-gradient(circle, ${badgeColor}22 0%, transparent 70%)`,
        pointerEvents: 'none'
      }} />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{ fontSize: '1.4rem' }}>⚡</span>
          <span style={{ fontSize: '0.8rem', fontWeight: '800', letterSpacing: '1px', textTransform: 'uppercase', color: '#93c5fd' }}>
            LEARNING RECOVERY ENGINE — WHAT SHOULD I DO NEXT?
          </span>
        </div>
        <span style={{
          fontSize: '0.75rem',
          fontWeight: '700',
          textTransform: 'uppercase',
          padding: '0.3rem 0.8rem',
          borderRadius: '2rem',
          backgroundColor: badgeColor,
          color: 'white',
          boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
        }}>
          {nextAction.badge}
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', alignItems: 'center' }}>
        <div>
          <h2 style={{ margin: '0 0 0.5rem 0', fontSize: '1.6rem', color: 'white' }}>
            {nextAction.title}
          </h2>
          <p style={{ margin: '0 0 1rem 0', fontSize: '0.95rem', color: '#cbd5e1', lineHeight: '1.5' }}>
            {nextAction.reason}
          </p>

          {nextAction.conceptName && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '0.85rem', color: '#94a3b8' }}>
              <span>Concept: <strong style={{ color: 'white' }}>{nextAction.conceptName}</strong></span>
              {nextAction.currentMastery !== undefined && (
                <span>Current Mastery: <strong style={{ color: nextAction.currentMastery >= 75 ? '#86efac' : '#fca5a5' }}>{nextAction.currentMastery.toFixed(0)}%</strong> (Threshold: 75%)</span>
              )}
            </div>
          )}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', justifyContent: 'center' }}>
          <Link
            to={nextAction.actionUrl || '/learning-path'}
            className="btn"
            style={{
              backgroundColor: '#3b82f6',
              color: 'white',
              fontSize: '1rem',
              fontWeight: '600',
              textAlign: 'center',
              padding: '0.85rem 1.5rem',
              borderRadius: 'var(--radius-md)',
              boxShadow: '0 4px 12px rgba(59,130,246,0.4)'
            }}
          >
            {nextAction.buttonText || (
              nextAction.actionType === 'LEARN' ? 'Start Learning' : 
              nextAction.actionType === 'PRACTICE' ? 'Practice Now' :
              nextAction.actionType === 'REASSESS' ? 'Reassess' : 'Continue Learning'
            )}
          </Link>

          <button
            onClick={() => window.dispatchEvent(new CustomEvent('open-ai-assistant', { 
              detail: { 
                conceptId: nextAction.conceptId,
                prompt: `The Learning Recovery Engine recommends: "${nextAction.title}" because "${nextAction.reason}". Can you guide me through this foundation step by step?`
              }
            }))}
            className="btn btn-outline"
            style={{
              color: '#93c5fd',
              borderColor: '#60a5fa',
              fontSize: '0.85rem',
              backgroundColor: 'rgba(255,255,255,0.05)'
            }}
          >
            ✨ Ask AI Tutor About This Next Step
          </button>
        </div>
      </div>
    </div>
  );
};

export default NextActionCard;
