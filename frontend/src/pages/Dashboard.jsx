import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import NextActionCard from '../components/NextActionCard';
import RecoveryPlansList from '../components/RecoveryPlansList';
import VisualKnowledgeMap from '../components/VisualKnowledgeMap';
import DailyFeedbackCard from '../components/DailyFeedbackCard';

function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const studentId = user?.id || 1; 

  const [profile, setProfile] = useState(null);
  const [learningResources, setLearningResources] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('KNOWLEDGE_MAP'); // 'KNOWLEDGE_MAP', 'RECOVERY', 'RECOMMENDATIONS'

  useEffect(() => {
    if (user?.role === 'ADMIN') {
      navigate('/admin');
      return;
    }

    setLoading(true);
    Promise.all([
      api.get(`/students/${studentId}/profile`),
      api.get(`/students/${studentId}/learning`),
      api.get(`/students/${studentId}/recommendations`)
    ]).then(([profileRes, learningRes, recsRes]) => {
      setProfile(profileRes.data);
      setLearningResources(learningRes.data.resources || []);
      setRecommendations(recsRes.data || []);
      setLoading(false);
    }).catch(err => {
      console.error("Error fetching dashboard data", err);
      setLoading(false);
    });
  }, [studentId, user]);

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
        <div style={{ width: '50px', height: '50px', border: '4px solid var(--border-color)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
        <h3 style={{ marginTop: '1.5rem', color: 'var(--text-muted)' }}>Loading your learning profile...</h3>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  // Calculate high-level stats (strictly 75% threshold)
  const totalConcepts = profile?.concepts?.length || 0;
  const masteredConcepts = profile?.concepts?.filter(c => c.status === 'MASTERED').length || 0;
  const masteryPercentage = totalConcepts === 0 ? 0 : Math.round((masteredConcepts / totalConcepts) * 100);
  
  const strongConcepts = profile?.concepts?.filter(c => c.status === 'MASTERED') || [];
  const weakConcepts = profile?.concepts?.filter(c => c.status === 'WEAK') || [];

  return (
    <div className="dashboard" style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* 1. Header & Quick Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
        <div className="card" style={{ background: 'linear-gradient(135deg, var(--primary) 0%, #4338ca 100%)', color: 'white', border: 'none', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <h1 style={{ margin: '0 0 0.5rem 0', fontSize: '2rem' }}>Welcome back, {profile?.studentName || 'Student'}!</h1>
          <p style={{ margin: 0, opacity: 0.9 }}>Adaptive AI-Powered Learning Platform with Learning Recovery Engine</p>
          <div style={{ marginTop: '1.5rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <Link to="/assessment" className="btn" style={{ backgroundColor: 'white', color: 'var(--primary)', fontWeight: '600' }}>Diagnostic Assessment</Link>
            <Link to="/learning-path" className="btn btn-outline" style={{ color: 'white', borderColor: 'rgba(255,255,255,0.4)' }}>Full Learning Path</Link>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
          <div style={{ position: 'relative', width: '120px', height: '120px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg viewBox="0 0 36 36" style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }}>
              <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#e2e8f0" strokeWidth="3" />
              <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke={masteryPercentage >= 75 ? "var(--success)" : "var(--primary)"} strokeWidth="3" strokeDasharray={`${masteryPercentage}, 100`} />
            </svg>
            <div style={{ position: 'absolute', textAlign: 'center' }}>
              <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: 'var(--text-main)', lineHeight: '1' }}>{masteryPercentage}%</div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>Mastery</div>
            </div>
          </div>
          <div>
            <h3 style={{ margin: '0 0 0.5rem 0' }}>Overall Knowledge Mastery</h3>
            <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              {masteredConcepts} of {totalConcepts} concepts mastered (≥75% threshold standard).
            </p>
            <div style={{ marginTop: '0.75rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <span className="badge badge-success">{strongConcepts.length} Mastered (≥75%)</span>
              <span className="badge badge-danger">{weakConcepts.length} Gaps (&lt;75%)</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Daily AI Learning Summary Card */}
      <DailyFeedbackCard studentId={studentId} />

      {/* 3. CORE FEATURE: WHAT SHOULD I DO NEXT? */}
      <NextActionCard studentId={studentId} />

      {/* 4. Navigation Tabs for Map vs Recovery vs Future Recommendations */}
      <div style={{ display: 'flex', gap: '1rem', borderBottom: '2px solid var(--border-color)', paddingBottom: '0.5rem', flexWrap: 'wrap' }}>
        <button
          onClick={() => setActiveTab('KNOWLEDGE_MAP')}
          style={{
            background: 'none',
            border: 'none',
            fontSize: '1.1rem',
            fontWeight: activeTab === 'KNOWLEDGE_MAP' ? '700' : '500',
            color: activeTab === 'KNOWLEDGE_MAP' ? 'var(--primary)' : 'var(--text-muted)',
            borderBottom: activeTab === 'KNOWLEDGE_MAP' ? '3px solid var(--primary)' : 'none',
            paddingBottom: '0.5rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >
          <span>🗺️</span> Visual Knowledge Map
        </button>

        <button
          onClick={() => setActiveTab('RECOVERY')}
          style={{
            background: 'none',
            border: 'none',
            fontSize: '1.1rem',
            fontWeight: activeTab === 'RECOVERY' ? '700' : '500',
            color: activeTab === 'RECOVERY' ? 'var(--primary)' : 'var(--text-muted)',
            borderBottom: activeTab === 'RECOVERY' ? '3px solid var(--primary)' : 'none',
            paddingBottom: '0.5rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >
          <span>🛠️</span> Learning Recovery Plans
          {weakConcepts.length > 0 && (
            <span style={{ backgroundColor: '#ef4444', color: 'white', borderRadius: '1rem', padding: '0.1rem 0.5rem', fontSize: '0.75rem' }}>
              {weakConcepts.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('RECOMMENDATIONS')}
          style={{
            background: 'none',
            border: 'none',
            fontSize: '1.1rem',
            fontWeight: activeTab === 'RECOMMENDATIONS' ? '700' : '500',
            color: activeTab === 'RECOMMENDATIONS' ? 'var(--primary)' : 'var(--text-muted)',
            borderBottom: activeTab === 'RECOMMENDATIONS' ? '3px solid var(--primary)' : 'none',
            paddingBottom: '0.5rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >
          <span>⚡</span> Personalized Future Recommendations ({recommendations.length})
        </button>
      </div>

      {/* 5. Tab Content */}
      {activeTab === 'KNOWLEDGE_MAP' && <VisualKnowledgeMap studentId={studentId} />}
      {activeTab === 'RECOVERY' && <RecoveryPlansList studentId={studentId} />}
      {activeTab === 'RECOMMENDATIONS' && (
        <div className="card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span>🎯</span> Prioritized Next Learning Recommendations
            </h3>
            <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Continuously calculated from actual assessment scores, weak prerequisites, and mastery progression.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {recommendations.map((rec, idx) => (
              <div key={idx} style={{
                padding: '1rem 1.25rem',
                backgroundColor: idx === 0 ? '#eff6ff' : '#ffffff',
                border: idx === 0 ? '2px solid var(--primary)' : '1px solid var(--border-color)',
                borderRadius: 'var(--radius-md)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '1rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <span style={{
                    width: '32px', height: '32px', borderRadius: '50%',
                    backgroundColor: idx === 0 ? 'var(--primary)' : '#f1f5f9',
                    color: idx === 0 ? 'white' : 'var(--text-muted)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: 'bold', fontSize: '0.9rem'
                  }}>
                    {idx + 1}
                  </span>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                      <strong style={{ fontSize: '1rem', color: 'var(--text-main)' }}>{rec.title}</strong>
                      <span className="badge" style={{
                        backgroundColor: rec.badge?.includes('GAP') ? '#fee2e2' : '#dbeafe',
                        color: rec.badge?.includes('GAP') ? '#991b1b' : '#1e40af',
                        fontSize: '0.7rem'
                      }}>
                        {rec.badge}
                      </span>
                    </div>
                    <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                      {rec.description}
                    </p>
                  </div>
                </div>

                <Link
                  to={rec.actionUrl}
                  className={`btn ${rec.actionType === 'REASSESS' ? 'btn-success' : idx === 0 ? 'btn-primary' : 'btn-outline'}`}
                  style={{ padding: '0.5rem 1rem', fontSize: '0.85rem', whiteSpace: 'nowrap' }}
                >
                  {rec.actionButtonText || 'Start Learning'}
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. Subject Performance & Knowledge Profile Breakdown */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '1.5rem', alignItems: 'start' }}>
        
        {/* Left Column: Subjects */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="card">
            <h2 style={{ fontSize: '1.3rem', marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>Engineering Subject Mastery</span>
              <Link to="/assessment" style={{ fontSize: '0.85rem', color: 'var(--primary)', textDecoration: 'none' }}>Assessments →</Link>
            </h2>
            {profile?.subjects?.length === 0 ? (
               <p style={{ color: 'var(--text-muted)' }}>No subjects assessed yet.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {profile?.subjects?.map(sub => (
                  <div key={sub.subjectName}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem', fontSize: '0.9rem' }}>
                      <span style={{ fontWeight: '600' }}>{sub.subjectName}</span>
                      <span style={{ fontWeight: '700', color: sub.score >= 75 ? 'var(--success)' : 'var(--warning)' }}>
                        {sub.score.toFixed(0)}% {sub.score >= 75 ? '✓ Mastered' : '⚠️ Weak (<75%)'}
                      </span>
                    </div>
                    <div className="progress-wrapper">
                      <div className="progress-fill" style={{ width: `${sub.score}%`, backgroundColor: sub.score >= 75 ? 'var(--success)' : 'var(--warning)' }}></div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Actionable Knowledge Gaps Section */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="card" style={{ borderTop: '4px solid var(--danger)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span>⚠️</span> Identified Knowledge Gaps ({profile?.knowledgeGaps?.length || 0})
              </h3>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Threshold: 75%</span>
            </div>

            {profile?.knowledgeGaps?.length === 0 ? (
              <p style={{ color: 'var(--success)', margin: 0 }}>🎉 No critical knowledge gaps detected! All attempted concepts are mastered.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem', maxHeight: '480px', overflowY: 'auto' }}>
                {profile?.knowledgeGaps?.map((gap, i) => {
                  const conceptObj = profile.concepts?.find(c => c.conceptName === gap.concept);
                  const conceptId = gap.conceptId || conceptObj?.conceptId;

                  return (
                    <div key={i} style={{
                      backgroundColor: '#fef2f2',
                      padding: '1rem',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid #fecaca',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.75rem'
                    }}>
                      {/* Gap Header */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <strong style={{ color: '#991b1b', fontSize: '0.95rem' }}>
                            {gap.concept}
                          </strong>
                          {gap.chapterName && (
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                              {gap.subjectName} • {gap.chapterName}
                            </div>
                          )}
                        </div>
                        <span style={{
                          fontSize: '0.75rem',
                          fontWeight: '700',
                          padding: '0.2rem 0.6rem',
                          borderRadius: '1rem',
                          backgroundColor: '#ef4444',
                          color: 'white'
                        }}>
                          {gap.score.toFixed(0)}%
                        </span>
                      </div>

                      {/* Reason Description */}
                      <p style={{ margin: 0, fontSize: '0.85rem', color: '#7f1d1d', lineHeight: '1.4' }}>
                        <strong>Diagnosis:</strong> {gap.reason || gap.recommendation}
                      </p>

                      {/* Actionable Prerequisite Gap Buttons */}
                      {gap.prerequisiteDetails && gap.prerequisiteDetails.filter(p => p.gap).length > 0 && (
                        <div style={{
                          padding: '0.6rem 0.75rem',
                          backgroundColor: '#fffbeb',
                          borderRadius: 'var(--radius-sm)',
                          border: '1px solid #fcd34d',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '0.4rem'
                        }}>
                          <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#92400e' }}>
                            ⚠️ Unmastered Prerequisite Foundations:
                          </span>
                          <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                            {gap.prerequisiteDetails.filter(p => p.gap).map(prereq => (
                              <Link
                                key={prereq.conceptId}
                                to={`/learning/${prereq.conceptId}`}
                                className="btn"
                                style={{
                                  padding: '0.25rem 0.6rem',
                                  fontSize: '0.75rem',
                                  backgroundColor: '#d97706',
                                  color: 'white',
                                  fontWeight: '600'
                                }}
                              >
                                📖 Learn Prerequisite: {prereq.name} ({prereq.score.toFixed(0)}%)
                              </Link>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Primary Actions for Target Concept */}
                      {conceptId && (
                        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', paddingTop: '0.25rem' }}>
                          <Link
                            to={`/learning/${conceptId}`}
                            className="btn"
                            style={{
                              padding: '0.35rem 0.75rem',
                              fontSize: '0.8rem',
                              backgroundColor: '#dc2626',
                              color: 'white',
                              fontWeight: '600'
                            }}
                          >
                            📖 Learn {gap.concept}
                          </Link>

                          <Link
                            to={`/practice/${conceptId}`}
                            className="btn btn-outline"
                            style={{
                              padding: '0.35rem 0.75rem',
                              fontSize: '0.8rem',
                              color: '#991b1b',
                              borderColor: '#fca5a5',
                              fontWeight: '600'
                            }}
                          >
                            🎯 Practice Now
                          </Link>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

export default Dashboard;
