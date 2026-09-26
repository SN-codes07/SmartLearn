import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../services/api';

function ReassessmentResult() {
  const { attemptId } = useParams();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

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
    <div style={{ textAlign: 'center', padding: '5rem' }}>
      <div style={{ width: '50px', height: '50px', border: '4px solid var(--border-color)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 1.5rem' }}></div>
      <h3 style={{ color: 'var(--text-muted)' }}>Calculating results...</h3>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
  if (!result) return (
    <div className="empty-state" style={{ marginTop: '3rem' }}>
      <div className="empty-state-icon">⚠️</div>
      <h2>Result Not Found</h2>
      <p>Could not retrieve the result.</p>
      <Link to="/" className="btn" style={{ marginTop: '1rem' }}>Return to Dashboard</Link>
    </div>
  );

  return (
    <div className="assessment-result" style={{ maxWidth: '600px', margin: '0 auto' }}>
      <div className="page-header" style={{ textAlign: 'center', justifyContent: 'center' }}>
        <div>
          <h1>Session Complete</h1>
          <p>Here is your performance for this concept.</p>
        </div>
      </div>
      
      <div className="card" style={{ textAlign: 'center', padding: '3rem 2rem' }}>
        <div style={{ 
          width: '150px', height: '150px', 
          borderRadius: '50%', 
          border: `8px solid ${result.passed ? 'var(--success)' : 'var(--warning)'}`,
          display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
          margin: '0 auto 1.5rem'
        }}>
          <h2 style={{ fontSize: '3rem', margin: '0', color: 'var(--text-main)' }}>
            {result.scorePercentage.toFixed(0)}%
          </h2>
        </div>
        
        <div style={{ marginBottom: '2rem' }}>
          {result.passed ? (
            <span className="badge badge-success" style={{ fontSize: '1rem', padding: '0.5rem 1rem' }}>
              ✓ MASTERED
            </span>
          ) : (
            <span className="badge badge-warning" style={{ fontSize: '1rem', padding: '0.5rem 1rem' }}>
              ⚠ NEEDS PRACTICE
            </span>
          )}
        </div>

        <p style={{ fontSize: '1.1rem', marginBottom: '2.5rem', color: 'var(--text-muted)' }}>
          {result.passed 
            ? "Concept mastered! You successfully crossed the 75% threshold." 
            : "You haven't reached the 75% mastery threshold yet. Continue practicing."}
        </p>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap', borderTop: '1px solid var(--border-color)', paddingTop: '2rem' }}>
          {result.passed ? (
            <Link to="/" className="btn btn-success" style={{ padding: '0.75rem 2rem' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '0.5rem' }}><polyline points="9 11 12 14 22 4"></polyline><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path></svg>
              Continue to Dashboard
            </Link>
          ) : (
            <>
              <button onClick={() => navigate(-1)} className="btn btn-secondary" style={{ flex: 1 }}>Study Again</button>
              <button onClick={() => window.location.reload()} className="btn btn-outline" style={{ flex: 1 }}>Retry Questions</button>
              <Link to="/" className="btn" style={{ width: '100%' }}>Return to Dashboard</Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default ReassessmentResult;
