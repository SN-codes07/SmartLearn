import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  IconMap, 
  IconTools, 
  IconBolt, 
  IconTarget, 
  IconAlertTriangle, 
  IconBook, 
  IconCheck, 
  IconCircleCheck, 
  IconBrain, 
  IconSparkles, 
  IconCompass, 
  IconArrowRight 
} from '@tabler/icons-react';
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
  }, [studentId, user, navigate]);

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
        <div style={{ width: '48px', height: '48px', border: '3px solid var(--border-color)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
        <h3 style={{ marginTop: '1.25rem', color: 'var(--text-muted)', fontSize: '1rem', fontWeight: 500 }}>Loading your learning profile...</h3>
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
      
      {/* 1. Header & Overall Mastery */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
        {/* Concise Greeting */}
        <div className="card" style={{ 
          backgroundColor: 'var(--card-bg)', 
          color: 'var(--text-main)', 
          border: '1px solid var(--border-color)', 
          borderLeft: '4px solid var(--primary)', 
          display: 'flex', 
          flexDirection: 'column', 
          justifyContent: 'center',
          padding: '1.75rem'
        }}>
          <h1 style={{ margin: '0 0 0.35rem 0', fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-main)', letterSpacing: '-0.01em' }}>
            Welcome back, {profile?.studentName || user?.name || 'Student'}
          </h1>
          <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.88rem' }}>
            {user?.branch || 'Computer Engineering'} • {user?.academicYear || '2nd Year'} (Semester {user?.semester || 4}) • University of Mumbai
          </p>
          <div style={{ marginTop: '1.5rem', display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <Link to="/assessment" className="btn btn-primary" style={{ fontSize: '0.88rem', padding: '0.55rem 1.1rem' }}>
              <IconTarget size={16} stroke={2} />
              Diagnostic assessment
            </Link>
            <Link to="/learning-path" className="btn btn-secondary" style={{ fontSize: '0.88rem', padding: '0.55rem 1.1rem' }}>
              <IconCompass size={16} stroke={1.75} />
              Full learning path
            </Link>
          </div>
        </div>

        {/* Overall Knowledge Mastery Gauge */}
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', padding: '1.75rem' }}>
          <div style={{ position: 'relative', width: '110px', height: '110px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <svg viewBox="0 0 36 36" style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }}>
              <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="var(--border-color)" strokeWidth="3" />
              <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke={masteryPercentage >= 75 ? "var(--success)" : "var(--primary)"} strokeWidth="3" strokeDasharray={`${masteryPercentage}, 100`} />
            </svg>
            <div style={{ position: 'absolute', textAlign: 'center' }}>
              <div style={{ fontSize: '1.7rem', fontWeight: 700, fontFamily: 'JetBrains Mono, monospace', color: 'var(--text-main)', lineHeight: '1' }}>
                {masteryPercentage}%
              </div>
              <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginTop: '0.2rem' }}>
                Mastery
              </div>
            </div>
          </div>
          <div>
            <h3 style={{ margin: '0 0 0.35rem 0', fontSize: '1.1rem', fontWeight: 700 }}>Overall knowledge mastery</h3>
            <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.85rem', lineHeight: 1.5 }}>
              {masteredConcepts} of {totalConcepts} concepts mastered (≥75% threshold standard).
            </p>
            <div style={{ marginTop: '0.75rem', display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
              <span className="badge badge-success" style={{ fontSize: '0.72rem', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                <IconCheck size={12} stroke={2.5} />
                {strongConcepts.length} Mastered (≥75%)
              </span>
              <span className="badge badge-danger" style={{ fontSize: '0.72rem', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                <IconAlertTriangle size={12} stroke={2} />
                {weakConcepts.length} Gaps (&lt;75%)
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. CORE FOCUS: WHAT SHOULD I DO NEXT? */}
      <NextActionCard studentId={studentId} />

      {/* 3. Daily AI Learning Summary Card */}
      <DailyFeedbackCard studentId={studentId} />

      {/* 4. Navigation Tabs for Map vs Recovery vs Future Recommendations */}
      <div style={{ display: 'flex', gap: '0.75rem', borderBottom: '2px solid var(--border-color)', paddingBottom: '0.5rem', flexWrap: 'wrap' }}>
        <button
          onClick={() => setActiveTab('KNOWLEDGE_MAP')}
          style={{
            background: 'none',
            border: 'none',
            fontSize: '1rem',
            fontWeight: activeTab === 'KNOWLEDGE_MAP' ? '700' : '500',
            color: activeTab === 'KNOWLEDGE_MAP' ? 'var(--primary)' : 'var(--text-muted)',
            borderBottom: activeTab === 'KNOWLEDGE_MAP' ? '3px solid var(--primary)' : 'none',
            paddingBottom: '0.5rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.45rem',
            transition: 'color 0.15s'
          }}
        >
          <IconMap size={18} stroke={1.75} /> Visual knowledge map
        </button>

        <button
          onClick={() => setActiveTab('RECOVERY')}
          style={{
            background: 'none',
            border: 'none',
            fontSize: '1rem',
            fontWeight: activeTab === 'RECOVERY' ? '700' : '500',
            color: activeTab === 'RECOVERY' ? 'var(--primary)' : 'var(--text-muted)',
            borderBottom: activeTab === 'RECOVERY' ? '3px solid var(--primary)' : 'none',
            paddingBottom: '0.5rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.45rem',
            transition: 'color 0.15s'
          }}
        >
          <IconTools size={18} stroke={1.75} /> Learning recovery plans
          {weakConcepts.length > 0 && (
            <span style={{ 
              backgroundColor: 'var(--danger-bg)', 
              color: 'var(--danger-text)', 
              border: '1px solid var(--danger)',
              borderRadius: 'var(--radius-full)', 
              padding: '0.1rem 0.5rem', 
              fontSize: '0.72rem',
              fontWeight: 700 
            }}>
              {weakConcepts.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('RECOMMENDATIONS')}
          style={{
            background: 'none',
            border: 'none',
            fontSize: '1rem',
            fontWeight: activeTab === 'RECOMMENDATIONS' ? '700' : '500',
            color: activeTab === 'RECOMMENDATIONS' ? 'var(--primary)' : 'var(--text-muted)',
            borderBottom: activeTab === 'RECOMMENDATIONS' ? '3px solid var(--primary)' : 'none',
            paddingBottom: '0.5rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.45rem',
            transition: 'color 0.15s'
          }}
        >
          <IconBolt size={18} stroke={1.75} /> Prioritized recommendations ({recommendations.length})
        </button>
      </div>

      {/* 5. Tab Content */}
      {activeTab === 'KNOWLEDGE_MAP' && <VisualKnowledgeMap studentId={studentId} />}
      {activeTab === 'RECOVERY' && <RecoveryPlansList studentId={studentId} />}
      {activeTab === 'RECOMMENDATIONS' && (
        <div className="card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.15rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700 }}>
              <IconTarget size={20} stroke={1.75} style={{ color: 'var(--primary)' }} /> Prioritized next learning recommendations
            </h3>
            <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Continuously calculated from actual assessment scores, weak prerequisites, and mastery progression.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {recommendations.map((rec, idx) => (
              <div key={idx} style={{
                padding: '1rem 1.25rem',
                backgroundColor: idx === 0 ? 'var(--primary-light)' : 'var(--card-bg)',
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
                    backgroundColor: idx === 0 ? 'var(--primary)' : 'var(--bg-color)',
                    color: idx === 0 ? 'white' : 'var(--text-muted)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: 'bold', fontSize: '0.9rem',
                    border: idx === 0 ? 'none' : '1px solid var(--border-color)'
                  }}>
                    {idx + 1}
                  </span>
                  <div style={{ flex: 1 }}>
                    {(() => {
                      let badgeText = rec.badge || 'Recommended Step';
                      let badgeBg = 'var(--primary-light)';
                      let badgeColor = 'var(--primary)';
                      if (badgeText.includes('GAP') || badgeText.includes('FIRST')) {
                        badgeText = 'Recommended First Step';
                        badgeBg = 'var(--primary-light)';
                        badgeColor = 'var(--primary)';
                      } else if (badgeText.includes('REASSESS') || badgeText.includes('QUIZ')) {
                        badgeText = 'Quiz Ready';
                        badgeBg = 'var(--success-bg)';
                        badgeColor = 'var(--success-text)';
                      } else if (badgeText.includes('PRACTICE')) {
                        badgeText = 'Practice Next';
                        badgeBg = 'var(--warning-bg)';
                        badgeColor = 'var(--warning-text)';
                      }

                      let cleanDesc = rec.description || '';
                      cleanDesc = cleanDesc.replace(/(?:Navigate to\s*)?\/(?:learning|practice|reassessment|adaptive-quiz)\/\d+/gi, '').trim();

                      return (
                        <>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                            <strong style={{ fontSize: '1rem', color: 'var(--text-main)' }}>{rec.title}</strong>
                            <span className="badge" style={{
                              backgroundColor: badgeBg,
                              color: badgeColor,
                              fontSize: '0.7rem'
                            }}>
                              {badgeText}
                            </span>
                          </div>
                          <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.88rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
                            {cleanDesc}
                          </p>
                        </>
                      );
                    })()}
                  </div>
                </div>

                <Link
                  to={rec.actionUrl}
                  className={`btn ${rec.actionType === 'REASSESS' ? 'btn-success' : idx === 0 ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ padding: '0.5rem 1rem', fontSize: '0.85rem', whiteSpace: 'nowrap' }}
                >
                  {rec.actionButtonText || 'Start Learning'}
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 6. Subject Performance & Knowledge Profile Breakdown */}
      <div className="grid-2" style={{ alignItems: 'start' }}>
        
        {/* Left Column: Subjects */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="card">
            <h2 style={{ fontSize: '1.25rem', marginBottom: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontWeight: 700 }}>
              <span>Engineering subject mastery</span>
              <Link to="/assessment" style={{ fontSize: '0.82rem', color: 'var(--primary)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                Assessments <IconArrowRight size={14} />
              </Link>
            </h2>
            {profile?.subjects?.length === 0 ? (
               <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>No subjects assessed yet.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {profile?.subjects?.map(sub => (
                  <div key={sub.subjectName}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem', fontSize: '0.88rem' }}>
                      <span style={{ fontWeight: 600 }}>{sub.subjectName}</span>
                      <span style={{ 
                        fontWeight: 700, 
                        fontFamily: 'JetBrains Mono, monospace',
                        color: sub.score >= 75 ? 'var(--success)' : 'var(--warning)', 
                        display: 'inline-flex', 
                        alignItems: 'center', 
                        gap: '0.25rem' 
                      }}>
                        {sub.score.toFixed(0)}% {sub.score >= 75 ? <><IconCheck size={14} stroke={2} /> Mastered</> : <><IconAlertTriangle size={14} stroke={1.75} /> Weak (&lt;75%)</>}
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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700 }}>
                <IconAlertTriangle size={18} stroke={1.75} style={{ color: 'var(--danger)' }} /> Identified knowledge gaps ({profile?.knowledgeGaps?.length || 0})
              </h3>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'JetBrains Mono, monospace' }}>Threshold: 75%</span>
            </div>

            {profile?.knowledgeGaps?.length === 0 ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--success)', padding: '0.75rem 0' }}>
                <IconCircleCheck size={20} stroke={2} />
                <p style={{ margin: 0, fontSize: '0.9rem' }}>No critical knowledge gaps detected! All attempted concepts are mastered.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem', maxHeight: '520px', overflowY: 'auto' }}>
                {profile?.knowledgeGaps?.map((gap, i) => {
                  const conceptObj = profile.concepts?.find(c => c.conceptName === gap.concept);
                  const conceptId = gap.conceptId || conceptObj?.conceptId;

                  return (
                    <div key={i} style={{
                      backgroundColor: 'var(--danger-bg)',
                      padding: '1rem',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--danger)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.75rem'
                    }}>
                      {/* Gap Header */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <strong style={{ color: 'var(--danger-text)', fontSize: '0.95rem' }}>
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
                          fontWeight: 700,
                          fontFamily: 'JetBrains Mono, monospace',
                          padding: '0.2rem 0.6rem',
                          borderRadius: '1rem',
                          backgroundColor: 'var(--danger)',
                          color: 'white'
                        }}>
                          {gap.score.toFixed(0)}%
                        </span>
                      </div>

                      {/* Reason Description */}
                      <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-main)', lineHeight: '1.45' }}>
                        <strong>Diagnosis:</strong> {gap.reason || gap.recommendation}
                      </p>

                      {/* Actionable Prerequisite Gap Buttons */}
                      {gap.prerequisiteDetails && gap.prerequisiteDetails.filter(p => p.gap).length > 0 && (
                        <div style={{
                          padding: '0.6rem 0.75rem',
                          backgroundColor: 'var(--warning-bg)',
                          borderRadius: 'var(--radius-sm)',
                          border: '1px solid var(--warning)',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '0.4rem'
                        }}>
                          <span style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--warning-text)', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                            <IconAlertTriangle size={14} stroke={1.75} /> Unmastered prerequisite foundations:
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
                                  backgroundColor: 'var(--warning)',
                                  color: 'white',
                                  fontWeight: '600',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '0.35rem'
                                }}
                              >
                                <IconBook size={14} stroke={1.75} /> Learn prerequisite: {prereq.name} ({prereq.score.toFixed(0)}%)
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
                              backgroundColor: 'var(--danger)',
                              color: 'white',
                              fontWeight: '600',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.35rem'
                            }}
                          >
                            <IconBook size={14} stroke={1.75} /> Learn {gap.concept}
                          </Link>

                          <Link
                            to={`/practice/${conceptId}`}
                            className="btn btn-secondary"
                            style={{
                              padding: '0.35rem 0.75rem',
                              fontSize: '0.8rem',
                              fontWeight: '600',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.35rem'
                            }}
                          >
                            <IconTarget size={14} stroke={1.75} /> Practice
                          </Link>

                          {/* Direct Adaptive Quiz Entry */}
                          <Link
                            to={`/adaptive-quiz/${conceptId}`}
                            className="btn btn-outline"
                            style={{
                              padding: '0.35rem 0.75rem',
                              fontSize: '0.8rem',
                              fontWeight: '600',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.35rem'
                            }}
                          >
                            <IconBrain size={14} stroke={1.75} /> Adaptive quiz
                          </Link>

                          {/* Contextual AI Tutor Entry */}
                          <button
                            onClick={() => window.dispatchEvent(new CustomEvent('open-ai-assistant', {
                              detail: {
                                conceptId: conceptId,
                                prompt: `Why am I struggling with "${gap.concept}"? Here is my diagnosis: ${gap.reason || gap.recommendation}. How do I master this?`
                              }
                            }))}
                            className="btn btn-secondary"
                            style={{
                              padding: '0.35rem 0.75rem',
                              fontSize: '0.8rem',
                              fontWeight: '600',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.35rem'
                            }}
                          >
                            <IconSparkles size={14} stroke={1.75} style={{ color: 'var(--primary)' }} /> Why am I struggling?
                          </button>
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
