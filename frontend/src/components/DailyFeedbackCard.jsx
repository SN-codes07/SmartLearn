import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

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
        marginBottom: '2rem',
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
    <div style={{
      backgroundColor: 'var(--card-bg)',
      borderRadius: 'var(--radius-lg)',
      border: '1px solid var(--border-color)',
      padding: '1.75rem',
      marginBottom: '2rem',
      boxShadow: 'var(--shadow-sm)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Decorative gradient bar on top */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '4px',
        background: 'linear-gradient(90deg, #6366f1, #8b5cf6, #ec4899)'
      }} />

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.2rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #6366f1 0%, #4338ca 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontSize: '1.25rem',
            boxShadow: '0 4px 10px rgba(99, 102, 241, 0.3)'
          }}>
            🤖
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              Daily Learning Summary
              <span style={{
                fontSize: '0.7rem',
                padding: '0.15rem 0.5rem',
                borderRadius: '1rem',
                backgroundColor: isAi ? '#dbeafe' : '#f1f5f9',
                color: isAi ? '#1d4ed8' : '#475569',
                fontWeight: 600
              }}>
                {isAi ? '✨ AI Analysis' : '⚡ Smart Analytics'}
              </span>
            </h3>
            <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Feedback for {feedback.feedbackDate || 'Today'} • {feedback.studentName || 'Student'}
            </p>
          </div>
        </div>

        <button
          onClick={() => fetchFeedback(true)}
          disabled={refreshing}
          title="Refresh today's summary"
          style={{
            background: 'none',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-sm)',
            padding: '0.35rem 0.75rem',
            fontSize: '0.8rem',
            fontWeight: 600,
            cursor: refreshing ? 'not-allowed' : 'pointer',
            color: 'var(--text-muted)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            backgroundColor: 'var(--bg-main)'
          }}
        >
          <span>🔄</span>
          <span>{refreshing ? 'Updating...' : 'Refresh'}</span>
        </button>
      </div>

      {/* Today's Progress */}
      {feedback.todaysProgress && (
        <div style={{
          fontSize: '0.95rem',
          lineHeight: 1.6,
          color: 'var(--text-main)',
          marginBottom: '1.25rem',
          padding: '0.85rem 1rem',
          borderRadius: 'var(--radius-md)',
          backgroundColor: 'var(--bg-main)',
          borderLeft: '4px solid var(--primary)'
        }}>
          <strong>Today's Progress: </strong>{feedback.todaysProgress}
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.6rem', color: '#16a34a', fontWeight: 700, fontSize: '0.85rem' }}>
            <span>✅</span> WHAT IMPROVED
          </div>
          <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-main)', lineHeight: 1.5 }}>
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.6rem', color: '#d97706', fontWeight: 700, fontSize: '0.85rem' }}>
            <span>⚠️</span> NEEDS ATTENTION
          </div>
          <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-main)', lineHeight: 1.5 }}>
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
          padding: '0.85rem 1.25rem',
          borderRadius: 'var(--radius-md)',
          backgroundColor: 'rgba(99, 102, 241, 0.08)',
          border: '1px solid rgba(99, 102, 241, 0.2)',
          flexWrap: 'wrap',
          gap: '0.75rem',
          marginBottom: feedback.encouragingSummary ? '1rem' : 0
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flex: 1 }}>
            <span style={{ fontSize: '1.1rem' }}>🎯</span>
            <div style={{ fontSize: '0.9rem', color: 'var(--text-main)' }}>
              <strong>Recommended Action:</strong> {nextStep}
            </div>
          </div>
          <button
            onClick={() => navigate('/learning-path')}
            style={{
              padding: '0.45rem 1rem',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'var(--primary)',
              color: 'white',
              border: 'none',
              fontWeight: 600,
              fontSize: '0.85rem',
              cursor: 'pointer'
            }}
          >
            Start Action →
          </button>
        </div>
      )}

      {/* Encouraging Summary */}
      {feedback.encouragingSummary && (
        <div style={{
          fontSize: '0.85rem',
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
