import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  IconCircleCheck, 
  IconAlertTriangle, 
  IconTarget, 
  IconRoute, 
  IconFileText, 
  IconSparkles, 
  IconLayoutDashboard,
  IconArrowRight
} from '@tabler/icons-react';
import api from '../services/api';

function AssessmentResult() {
  const { attemptId } = useParams();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/assessments/${attemptId}/result`)
      .then(res => {
        setResult(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching result", err);
        setLoading(false);
      });
  }, [attemptId]);

  if (loading) return (
    <div style={{ textAlign: 'center', padding: '5rem 1rem' }}>
      <div style={{ width: '42px', height: '42px', border: '3px solid var(--border-color)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 1.5rem' }}></div>
      <h3 style={{ color: 'var(--text-muted)', fontSize: '0.95rem', fontWeight: 500 }}>Calculating assessment metrics...</h3>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
  if (!result) return (
    <div className="empty-state" style={{ marginTop: '3rem' }}>
      <div className="empty-state-icon" style={{ display: 'flex', justifyContent: 'center' }}>
        <IconAlertTriangle size={36} stroke={1.75} style={{ color: 'var(--warning)' }} />
      </div>
      <h2>Result not found</h2>
      <p>Could not retrieve the assessment result record.</p>
      <Link to="/" className="btn btn-secondary" style={{ marginTop: '1rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
        <IconLayoutDashboard size={16} stroke={2} />
        Return to Dashboard
      </Link>
    </div>
  );

  const passed = result.passed;
  const scorePercent = result.scorePercentage !== undefined ? result.scorePercentage.toFixed(0) : 0;

  return (
    <div className="assessment-result" style={{ maxWidth: '640px', margin: '0 auto', padding: '1rem 0' }}>
      <div className="page-header" style={{ textAlign: 'center', justifyContent: 'center', marginBottom: '1.75rem' }}>
        <div>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 700, margin: '0 0 0.35rem', color: 'var(--text-main)' }}>
            Assessment complete
          </h1>
          <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Diagnostic performance evaluated against the 75% mastery benchmark.
          </p>
        </div>
      </div>
      
      <div className="card auth-card" style={{ textAlign: 'center', padding: '2.5rem 1.75rem' }}>
        {/* Score Circular Gauge */}
        <div style={{ 
          width: '144px', height: '144px', 
          borderRadius: '50%', 
          border: `6px solid ${passed ? 'var(--success)' : 'var(--warning)'}`,
          display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
          margin: '0 auto 1.5rem',
          backgroundColor: passed ? 'var(--success-bg)' : 'var(--warning-bg)'
        }}>
          <h2 style={{ 
            fontFamily: 'var(--font-mono, monospace)', 
            fontSize: '2.75rem', 
            fontWeight: 700, 
            margin: '0', 
            letterSpacing: '-0.02em',
            color: passed ? 'var(--success-text)' : 'var(--warning-text)'
          }}>
            {scorePercent}%
          </h2>
        </div>
        
        <div style={{ marginBottom: '1.25rem' }}>
          {passed ? (
            <span className="badge badge-success" style={{ fontSize: '0.85rem', padding: '0.45rem 1rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
              <IconCircleCheck size={16} stroke={2} />
              Mastered (≥ 75%)
            </span>
          ) : (
            <span className="badge badge-warning" style={{ fontSize: '0.85rem', padding: '0.45rem 1rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
              <IconAlertTriangle size={16} stroke={2} />
              Needs practice (&lt; 75%)
            </span>
          )}
        </div>

        <p style={{ fontSize: '0.95rem', marginBottom: '2rem', color: 'var(--text-muted)', lineHeight: 1.55 }}>
          {result.message}
        </p>

        {/* Score Counters Strip */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(2, 1fr)', 
          gap: '1rem', 
          padding: '1.25rem 0', 
          borderTop: '1px solid var(--border-color)', 
          borderBottom: '1px solid var(--border-color)',
          marginBottom: '2rem'
        }}>
          <div>
            <div style={{ fontFamily: 'var(--font-mono, monospace)', fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-main)' }}>
              {result.correctAnswers}
            </div>
            <div style={{ fontSize: '0.78rem', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.06em', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
              Correct answers
            </div>
          </div>
          <div>
            <div style={{ fontFamily: 'var(--font-mono, monospace)', fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-main)' }}>
              {result.totalQuestions}
            </div>
            <div style={{ fontSize: '0.78rem', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.06em', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
              Total questions
            </div>
          </div>
        </div>

        {/* Actionable Next Steps */}
        <div style={{ textAlign: 'left' }}>
          <h4 style={{ margin: '0 0 1rem 0', fontSize: '0.92rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600 }}>
            <IconTarget size={18} stroke={2} style={{ color: 'var(--primary)' }} />
            Recommended next actions
          </h4>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {passed ? (
              <>
                <Link to="/learning-path" className="btn btn-success" style={{ justifyContent: 'center', padding: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <IconRoute size={18} stroke={2} />
                  View updated learning path & next topics
                </Link>
                <Link to="/assessment" className="btn btn-secondary" style={{ justifyContent: 'center', padding: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <IconFileText size={18} stroke={2} />
                  Take another assessment
                </Link>
              </>
            ) : (
              <>
                <Link to="/learning-path" className="btn btn-primary" style={{ justifyContent: 'center', padding: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <IconRoute size={18} stroke={2} />
                  View personalized recovery plan
                </Link>
                <button
                  onClick={() => window.dispatchEvent(new CustomEvent('open-ai-assistant', {
                    detail: {
                      conceptName: result.conceptName || 'Assessment Evaluation',
                      prompt: `I just completed an assessment and scored ${result.scorePercentage?.toFixed(0)}% (${result.correctAnswers}/${result.totalQuestions} correct). Can you help explain key concepts, diagnose where I might have gone wrong, and create a quick revision guide?`
                    }
                  }))}
                  className="btn btn-outline"
                  style={{ justifyContent: 'center', padding: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                >
                  <IconSparkles size={18} stroke={2} />
                  Ask AI tutor to explain missed concepts
                </button>
                <Link to="/assessment" className="btn btn-secondary" style={{ justifyContent: 'center', padding: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <IconTarget size={18} stroke={2} />
                  Practice similar questions
                </Link>
              </>
            )}
            <Link to="/" className="btn btn-secondary" style={{ justifyContent: 'center', padding: '0.65rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.4rem', border: 'none', background: 'transparent' }}>
              <IconLayoutDashboard size={16} stroke={1.75} />
              Return to dashboard
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AssessmentResult;
