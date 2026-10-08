import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { 
  IconSparkles, 
  IconRefresh, 
  IconCircleCheck, 
  IconAlertTriangle, 
  IconTarget, 
  IconArrowRight 
} from '@tabler/icons-react';

const DailyFeedbackCard = ({ studentId = 1 }) => {
  const [feedback, setFeedback] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const fetchFeedback = async (force = false) => {
    try {
      if (force) setRefreshing(true);
      else setLoading(true);
      setError(null);

      const url = `/students/${studentId}/daily-feedback${force ? '?force=true' : ''}`;
      const res = await api.get(url);
      setFeedback(res.data);
    } catch (err) {
      console.error("Error fetching daily feedback:", err);
      setError("Unable to load daily feedback at this time.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (studentId) {
      fetchFeedback();
    }
  }, [studentId]);

  if (loading) {
    return (
      <div style={{
        backgroundColor: 'var(--card-bg)',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border-color)',
        padding: '1.5rem',
        marginBottom: '1.5rem',
        boxShadow: 'var(--shadow-sm)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            backgroundColor: 'var(--border-color)',
            animation: 'pulse 1.5s infinite'
          }} />
          <div style={{ flex: 1 }}>
            <div style={{ width: '40%', height: '16px', backgroundColor: 'var(--border-color)', marginBottom: '0.5rem', borderRadius: '4px' }} />
            <div style={{ width: '70%', height: '12px', backgroundColor: 'var(--border-color)', borderRadius: '4px' }} />
          </div>
        </div>
      </div>
    );
  }

  if (error || !feedback) {
    return null;
  }

  const isAi = feedback.isFallback === false;
  const whatImprovedText = typeof feedback.whatImproved === 'string' ? feedback.whatImproved : feedback.whatImproved?.join(' • ');
  const needsAttentionText = typeof feedback.needsAttention === 'string' ? feedback.needsAttention : feedback.needsAttention?.join(' • ');
  const nextStep = feedback.recommendedNextStep || feedback.nextAction;

  return (
    <div className="card" style={{
      backgroundColor: 'var(--card-bg)',
      borderRadius: 'var(--radius-lg)',
      border: '1px solid var(--border-color)',
      padding: '1.5rem 1.75rem',
      boxShadow: 'var(--shadow-sm)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Subtle top indicator bar */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '3px',
        backgroundColor: 'var(--primary)'
      }} />

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            width: '38px',
            height: '38px',
            borderRadius: 'var(--radius-sm)',
            backgroundColor: 'var(--primary-light)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--primary)',
            border: '1px solid var(--border-color)'
          }}>
            <IconSparkles size={20} stroke={1.75} />
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              Daily learning summary
              <span style={{
                fontSize: '0.7rem',
                padding: '0.15rem 0.5rem',
                borderRadius: 'var(--radius-full)',
                backgroundColor: isAi ? 'var(--primary-light)' : 'var(--bg-main)',
                color: isAi ? 'var(--primary)' : 'var(--text-muted)',
                fontWeight: 600,
                border: '1px solid var(--border-color)'
              }}>
                {isAi ? 'AI analysis' : 'Smart analytics'}
              </span>
            </h3>
            <p style={{ margin: '0.15rem 0 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Feedback for {feedback.feedbackDate || 'Today'} • {feedback.studentName || 'Student'}
            </p>
          </div>
        </div>

        <button
          onClick={() => fetchFeedback(true)}
          disabled={refreshing}
          title="Refresh today's summary"
          className="btn btn-secondary"
          style={{
            padding: '0.35rem 0.75rem',
            fontSize: '0.8rem',
            fontWeight: 600,
            cursor: refreshing ? 'not-allowed' : 'pointer'
          }}
        >
          <IconRefresh size={14} stroke={2} className={refreshing ? 'spin' : ''} />
          <span>{refreshing ? 'Updating...' : 'Refresh'}</span>
        </button>
      </div>

      {/* Today's Progress */}
      {feedback.todaysProgress && (
        <div style={{
          fontSize: '0.92rem',
          lineHeight: 1.6,
          color: 'var(--text-main)',
          marginBottom: '1.25rem',
          padding: '0.85rem 1rem',
          borderRadius: 'var(--radius-md)',
          backgroundColor: 'var(--bg-main)',
          borderLeft: '3px solid var(--primary)'
        }}>
          <strong style={{ color: 'var(--primary)' }}>Today's progress: </strong>
          {feedback.todaysProgress}
        </div>
      )}

      {/* Highlights & Attention Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem', marginBottom: '1.25rem' }}>
        {/* What Improved */}
        <div style={{
          backgroundColor: 'var(--bg-main)',
          borderRadius: 'var(--radius-md)',
          padding: '1rem',
          border: '1px solid var(--border-color)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginBottom: '0.5rem', color: 'var(--success)', fontWeight: 600, fontSize: '0.82rem', letterSpacing: '0.02em', textTransform: 'uppercase' }}>
            <IconCircleCheck size={16} stroke={2} />
            <span>What improved</span>
          </div>
          <p style={{ margin: 0, fontSize: '0.88rem', color: 'var(--text-main)', lineHeight: 1.55 }}>
            {whatImprovedText || 'Complete an assessment today to record improvements.'}
          </p>
        </div>

        {/* Needs Attention */}
        <div style={{
          backgroundColor: 'var(--bg-main)',
          borderRadius: 'var(--radius-md)',
          padding: '1rem',
          border: '1px solid var(--border-color)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginBottom: '0.5rem', color: 'var(--warning)', fontWeight: 600, fontSize: '0.82rem', letterSpacing: '0.02em', textTransform: 'uppercase' }}>
            <IconAlertTriangle size={16} stroke={2} />
            <span>Needs attention</span>
          </div>
          <p style={{ margin: 0, fontSize: '0.88rem', color: 'var(--text-main)', lineHeight: 1.55 }}>
            {needsAttentionText || 'No urgent knowledge gaps detected.'}
          </p>
        </div>
      </div>

      {/* Recommended Next Action Banner */}
      {nextStep && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0.85rem 1.15rem',
          borderRadius: 'var(--radius-md)',
          backgroundColor: 'var(--surface-secondary, var(--card-bg))',
          border: '1px solid var(--border-color)',
          flexWrap: 'wrap',
          gap: '0.75rem',
          marginBottom: feedback.encouragingSummary ? '0.75rem' : 0
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flex: 1, minWidth: '220px' }}>
            <IconTarget size={18} stroke={1.75} style={{ color: 'var(--primary)' }} />
            <div style={{ fontSize: '0.88rem', color: 'var(--text-main)' }}>
              <strong>Recommended action:</strong> {nextStep}
            </div>
          </div>
          <button
            onClick={() => navigate('/learning-path')}
            className="btn btn-primary"
            style={{
              padding: '0.45rem 0.9rem',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.82rem',
              fontWeight: 600
            }}
          >
            Start action
            <IconArrowRight size={14} stroke={2} />
          </button>
        </div>
      )}

      {/* Encouraging Summary */}
      {feedback.encouragingSummary && (
        <div style={{
          fontSize: '0.82rem',
          fontStyle: 'italic',
          color: 'var(--text-muted)',
          textAlign: 'center',
          paddingTop: '0.5rem'
        }}>
          "{feedback.encouragingSummary}"
        </div>
      )}
    </div>
  );
};

export default DailyFeedbackCard;
