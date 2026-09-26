import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const RecoveryPlansList = ({ studentId }) => {
  const { user } = useAuth();
  const activeStudentId = studentId || user?.id || 1;
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    setLoading(true);
    api.get(`/students/${activeStudentId}/recovery-plan`)
      .then(res => {
        setPlans(res.data);
        if (res.data.length > 0) {
          setExpandedId(res.data[0].weakConceptId);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error("Error loading recovery plans", err);
        setLoading(false);
      });
  }, [activeStudentId]);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
        Loading Recovery Plans...
      </div>
    );
  }

  if (plans.length === 0) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: '2.5rem', backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0' }}>
        <span style={{ fontSize: '2.5rem' }}>🎉</span>
        <h3 style={{ color: '#166534', margin: '0.5rem 0' }}>All Attempted Concepts Mastered!</h3>
        <p style={{ color: '#15803d', margin: 0 }}>Every concept is at or above the 75% threshold. No recovery plans currently active.</p>
        <Link to="/assessment" className="btn btn-success" style={{ marginTop: '1rem', display: 'inline-block' }}>Take New Assessment</Link>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '1.4rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span>🛠️</span> Active Learning Recovery Plans ({plans.length})
          </h2>
          <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Root cause analysis, prerequisite gap diagnosis, and structured recovery steps to reach ≥75% mastery.
          </p>
        </div>
      </div>

      {plans.map(plan => {
        const isExpanded = expandedId === plan.weakConceptId;
        const isCritical = plan.severity === 'CRITICAL';

        return (
          <div key={plan.weakConceptId} className="card" style={{
            padding: '1.5rem',
            border: isExpanded ? '2px solid var(--primary)' : '1px solid var(--border-color)',
            transition: 'all 0.2s',
            boxShadow: isExpanded ? '0 6px 16px rgba(0,0,0,0.08)' : 'none'
          }}>
            {/* Header */}
            <div
              onClick={() => setExpandedId(isExpanded ? null : plan.weakConceptId)}
              style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', flexWrap: 'wrap', gap: '1rem' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <span style={{
                  width: '42px', height: '42px', borderRadius: '50%',
                  backgroundColor: isCritical ? '#fee2e2' : '#fef3c7',
                  color: isCritical ? '#dc2626' : '#d97706',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 'bold', fontSize: '1.1rem'
                }}>
                  {isCritical ? '⚠️' : '🎯'}
                </span>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <h3 style={{ margin: 0, fontSize: '1.15rem', color: 'var(--text-main)' }}>{plan.weakConceptName}</h3>
                    <span className={`badge ${isCritical ? 'badge-danger' : 'badge-warning'}`}>
                      {plan.currentMastery.toFixed(0)}% Mastery
                    </span>
                    <span className="badge" style={{ backgroundColor: '#f1f5f9', color: '#475569' }}>
                      {plan.subjectName}
                    </span>
                  </div>
                  <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    Severity: <strong>{plan.severity}</strong> | Target: <strong>75%</strong>
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--primary)', fontWeight: '600' }}>
                  {isExpanded ? 'Hide Details ▲' : 'View Recovery Plan ▼'}
                </span>
              </div>
            </div>

            {/* Expanded Body */}
            {isExpanded && (
              <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {/* Root Cause Diagnosis */}
                <div style={{ padding: '1rem 1.25rem', backgroundColor: '#f8fafc', borderLeft: '4px solid var(--primary)', borderRadius: 'var(--radius-sm)' }}>
                  <div style={{ fontWeight: '700', fontSize: '0.9rem', color: 'var(--text-main)', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span>🔍</span> Root Cause & Prerequisite Diagnosis
                  </div>
                  <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-main)', lineHeight: '1.5' }}>
                    {plan.rootCauseSummary}
                  </p>
                </div>

                {/* Prerequisite List */}
                {plan.prerequisiteDiagnosis && plan.prerequisiteDiagnosis.length > 0 && (
                  <div>
                    <h4 style={{ margin: '0 0 0.75rem 0', fontSize: '0.95rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      Prerequisite Breakdown
                    </h4>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '0.75rem' }}>
                      {plan.prerequisiteDiagnosis.map(prereq => (
                        <div key={prereq.conceptId} style={{
                          padding: '0.75rem 1rem',
                          borderRadius: 'var(--radius-md)',
                          border: `1px solid ${prereq.isGap ? '#fca5a5' : '#86efac'}`,
                          backgroundColor: prereq.isGap ? '#fef2f2' : '#f0fdf4',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center'
                        }}>
                          <div>
                            <div style={{ fontWeight: '600', fontSize: '0.9rem', color: prereq.isGap ? '#991b1b' : '#166534' }}>
                              {prereq.isGap ? '⚠ ' : '✓ '} {prereq.conceptName}
                            </div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                              Mastery: {prereq.mastery.toFixed(0)}% (Requires 75%)
                            </div>
                          </div>
                          <span style={{
                            fontSize: '0.7rem',
                            fontWeight: '700',
                            padding: '0.2rem 0.6rem',
                            borderRadius: '1rem',
                            backgroundColor: prereq.isGap ? '#ef4444' : '#22c55e',
                            color: 'white'
                          }}>
                            {prereq.isGap ? 'GAP' : 'PASSED'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Sequential Recovery Steps */}
                <div>
                  <h4 style={{ margin: '0 0 0.75rem 0', fontSize: '0.95rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Personalized Recovery Path (Sequential Order)
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {plan.recoverySteps.map((step, idx) => (
                      <div key={idx} style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '1rem',
                        backgroundColor: '#ffffff',
                        border: '1px solid var(--border-color)',
                        borderRadius: 'var(--radius-md)',
                        flexWrap: 'wrap',
                        gap: '1rem'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                          <span style={{
                            width: '28px', height: '28px', borderRadius: '50%',
                            backgroundColor: 'var(--primary)', color: 'white',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '0.8rem', fontWeight: 'bold'
                          }}>
                            {step.stepNumber}
                          </span>
                          <div>
                            <div style={{ fontWeight: '600', color: 'var(--text-main)' }}>
                              {step.action}
                            </div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                              Concept: <strong>{step.conceptName}</strong> • {step.reason}
                            </div>
                          </div>
                        </div>

                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <Link
                            to={step.actionUrl}
                            className={`btn ${step.actionType === 'REASSESS' ? 'btn-success' : 'btn-outline'}`}
                            style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}
                          >
                            {step.actionType === 'LEARN' ? 'Review Theory' :
                             step.actionType === 'PRACTICE' ? 'Practice' :
                             step.actionType === 'ADAPTIVE' ? 'Adaptive Quiz' : 'Reassess (75%)'}
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Quick AI Trigger */}
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <button
                    onClick={() => window.dispatchEvent(new CustomEvent('open-ai-assistant', {
                      detail: {
                        conceptId: plan.weakConceptId,
                        prompt: `I am currently struggling with ${plan.weakConceptName} (${plan.currentMastery.toFixed(0)}% mastery). ${plan.rootCauseSummary} Can you explain this concept and connect it with its prerequisites?`
                      }
                    }))}
                    className="btn btn-outline"
                    style={{ fontSize: '0.85rem' }}
                  >
                    ✨ Ask AI Tutor to Explain Recovery Plan
                  </button>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default RecoveryPlansList;
