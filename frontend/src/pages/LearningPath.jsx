import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  IconCompass, 
  IconTools, 
  IconMap, 
  IconBook, 
  IconTarget, 
  IconCircleCheck, 
  IconAlertTriangle, 
  IconLock, 
  IconChevronDown, 
  IconChevronRight, 
  IconBrain, 
  IconSparkles 
} from '@tabler/icons-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import NextActionCard from '../components/NextActionCard';
import RecoveryPlansList from '../components/RecoveryPlansList';
import VisualKnowledgeMap from '../components/VisualKnowledgeMap';

function LearningPath() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';
  const studentId = isAdmin ? 1 : (user?.id || 1);
  const [curriculum, setCurriculum] = useState([]);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('RECOVERY'); // 'RECOVERY', 'GRAPH', 'CURRICULUM'
  const [expandedSubjectId, setExpandedSubjectId] = useState(null);
  const [loadingSubjectId, setLoadingSubjectId] = useState(null);

  useEffect(() => {
    setLoading(true);
    const branchQuery = user?.branch && !isAdmin 
      ? `?branch=${encodeURIComponent(user.branch)}&semester=${user.semester || 4}`
      : '';

    Promise.all([
      api.get(`/curriculum${branchQuery}`),
      api.get(`/students/${studentId}/profile`)
    ]).then(([currRes, profRes]) => {
      setCurriculum(currRes.data || []);
      setProfile(profRes.data);
      if (currRes.data?.length > 0 && !expandedSubjectId) {
        setExpandedSubjectId(currRes.data[0].id);
      }
      setLoading(false);
    }).catch(err => {
      console.error(err);
      setLoading(false);
    });
  }, [studentId, user, isAdmin, expandedSubjectId]);

  const toggleSubject = async (subject) => {
    if (expandedSubjectId === subject.id) {
      setExpandedSubjectId(null);
      return;
    }
    setExpandedSubjectId(subject.id);

    if (!subject.chapters || subject.chapters.length === 0) {
      setLoadingSubjectId(subject.id);
      try {
        const chRes = await api.get(`/subjects/${subject.id}/chapters`);
        const chaptersWithConcepts = await Promise.all(
          chRes.data.map(async (ch) => {
            const coRes = await api.get(`/chapters/${ch.id}/concepts`);
            return { ...ch, concepts: coRes.data || [] };
          })
        );
        setCurriculum(prev => prev.map(s => 
          s.id === subject.id ? { ...s, chapters: chaptersWithConcepts } : s
        ));
      } catch (err) {
        console.error("Error loading chapters", err);
      } finally {
        setLoadingSubjectId(null);
      }
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '5rem' }}>
        <div style={{ width: '44px', height: '44px', border: '3px solid var(--border-color)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 1rem' }}></div>
        <h3 style={{ color: 'var(--text-muted)', fontSize: '1rem', fontWeight: 500 }}>Loading learning path & recovery engine...</h3>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  // Fast lookup for concept statuses (Strict 75% rule)
  const conceptStatusMap = {};
  if (profile && profile.concepts) {
    profile.concepts.forEach(c => {
      conceptStatusMap[c.conceptName] = {
        status: c.score >= 75 ? 'MASTERED' : 'WEAK',
        score: c.score
      };
    });
  }

  const getConceptState = (concept) => {
    const entry = conceptStatusMap[concept.name];
    if (entry && entry.status === 'MASTERED') {
      return { 
        label: `Mastered (${entry.score.toFixed(0)}%)`, 
        color: 'var(--success)', 
        type: 'mastered', 
        mastered: true 
      };
    }
    if (entry && entry.status === 'WEAK') {
      return { 
        label: `Weak (${entry.score.toFixed(0)}% < 75%)`, 
        color: 'var(--danger)', 
        type: 'weak', 
        weak: true 
      };
    }
    
    // Check prerequisites
    if (concept.prerequisites && concept.prerequisites.length > 0) {
      const missing = concept.prerequisites.some(p => !conceptStatusMap[p] || conceptStatusMap[p].status !== 'MASTERED');
      if (missing) return { 
        label: 'Prerequisites missing', 
        color: 'var(--text-muted)', 
        type: 'locked', 
        locked: true 
      };
    }
    
    return { 
      label: 'Ready to learn', 
      color: 'var(--primary)', 
      type: 'ready' 
    };
  };

  return (
    <div style={{ maxWidth: '1050px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* Page Header */}
      <div className="page-header" style={{ alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', margin: '0 0 0.4rem 0', fontSize: '1.85rem', fontWeight: 700 }}>
            <IconCompass size={26} stroke={1.75} style={{ color: 'var(--primary)' }} />
            My learning path & recovery engine
          </h1>
          <p style={{ margin: '0 0 0.5rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Dynamic prerequisite analysis, recovery paths for weak concepts, and complete engineering syllabus.
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            <span className="badge badge-primary" style={{ fontSize: '0.72rem' }}>
              {user?.branch || user?.department || 'Computer Engineering'}
            </span>
            <span style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-muted)', backgroundColor: 'var(--card-bg)', padding: '0.2rem 0.5rem', borderRadius: '4px', border: '1px solid var(--border-color)' }}>
              {user?.academicYear || '2nd Year'} • Semester {user?.semester || 4}
            </span>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
              University of Mumbai (Rev-2019 'C' Scheme)
            </span>
            {isAdmin && (
              <span className="badge badge-danger" style={{ fontSize: '0.72rem' }}>
                Admin Mode: Demo student trajectory
              </span>
            )}
          </div>
        </div>

        {/* View Switcher */}
        <div style={{ display: 'flex', backgroundColor: 'var(--bg-color)', padding: '0.3rem', borderRadius: 'var(--radius-md)', gap: '0.25rem', border: '1px solid var(--border-color)' }}>
          <button
            onClick={() => setViewMode('RECOVERY')}
            style={{
              padding: '0.4rem 0.85rem',
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              backgroundColor: viewMode === 'RECOVERY' ? 'var(--card-bg)' : 'transparent',
              fontWeight: viewMode === 'RECOVERY' ? '700' : '500',
              color: viewMode === 'RECOVERY' ? 'var(--primary)' : 'var(--text-muted)',
              boxShadow: viewMode === 'RECOVERY' ? 'var(--shadow-sm)' : 'none',
              cursor: 'pointer',
              fontSize: '0.85rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem'
            }}
          >
            <IconTools size={16} stroke={1.75} />
            Recovery plans
          </button>

          <button
            onClick={() => setViewMode('GRAPH')}
            style={{
              padding: '0.4rem 0.85rem',
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              backgroundColor: viewMode === 'GRAPH' ? 'var(--card-bg)' : 'transparent',
              fontWeight: viewMode === 'GRAPH' ? '700' : '500',
              color: viewMode === 'GRAPH' ? 'var(--primary)' : 'var(--text-muted)',
              boxShadow: viewMode === 'GRAPH' ? 'var(--shadow-sm)' : 'none',
              cursor: 'pointer',
              fontSize: '0.85rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem'
            }}
          >
            <IconMap size={16} stroke={1.75} />
            Knowledge map
          </button>

          <button
            onClick={() => setViewMode('CURRICULUM')}
            style={{
              padding: '0.4rem 0.85rem',
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              backgroundColor: viewMode === 'CURRICULUM' ? 'var(--card-bg)' : 'transparent',
              fontWeight: viewMode === 'CURRICULUM' ? '700' : '500',
              color: viewMode === 'CURRICULUM' ? 'var(--primary)' : 'var(--text-muted)',
              boxShadow: viewMode === 'CURRICULUM' ? 'var(--shadow-sm)' : 'none',
              cursor: 'pointer',
              fontSize: '0.85rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem'
            }}
          >
            <IconBook size={16} stroke={1.75} />
            Full curriculum
          </button>
        </div>
      </div>

      {/* Trajectory Guide: Foundation -> Current Focus -> Next Milestone */}
      <div className="card" style={{ padding: '1.25rem 1.5rem', borderLeft: '4px solid var(--primary)', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
          <h3 style={{ margin: 0, fontSize: '1.05rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700 }}>
            <IconTarget size={18} stroke={2} style={{ color: 'var(--primary)' }} />
            Adaptive learning trajectory
          </h3>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Continuous 75% mastery progression</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginTop: '0.25rem' }}>
          <div style={{ padding: '0.75rem 1rem', backgroundColor: 'var(--bg-color)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
            <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--warning-text)', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <IconAlertTriangle size={13} stroke={2} />
              Step 1 • Foundation
            </div>
            <div style={{ fontWeight: '600', color: 'var(--text-main)', marginTop: '0.35rem', fontSize: '0.92rem' }}>
              {profile?.knowledgeGaps?.[0]?.prerequisiteDetails?.find(p => p.gap)?.name || 'Prerequisite Concepts'}
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.25rem', lineHeight: 1.45 }}>
              Remediate foundational gaps first to unlock dependent engineering topics.
            </div>
          </div>

          <div style={{ padding: '0.75rem 1rem', backgroundColor: 'var(--primary-light)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--primary)' }}>
            <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--primary)', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <IconTarget size={13} stroke={2} />
              Step 2 • Current focus
            </div>
            <div style={{ fontWeight: '600', color: 'var(--text-main)', marginTop: '0.35rem', fontSize: '0.92rem' }}>
              {profile?.knowledgeGaps?.[0]?.concept || 'Target Core Concept'}
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.25rem', lineHeight: 1.45 }}>
              Active study target. Review theory, practice, and reach ≥75% mastery.
            </div>
          </div>

          <div style={{ padding: '0.75rem 1rem', backgroundColor: 'var(--bg-color)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
            <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--success-text)', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <IconCircleCheck size={13} stroke={2} />
              Step 3 • Next milestone
            </div>
            <div style={{ fontWeight: '600', color: 'var(--text-main)', marginTop: '0.35rem', fontSize: '0.92rem' }}>
              Advanced application & reassessment
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.25rem', lineHeight: 1.45 }}>
              Pass adaptive quiz and unlock subsequent chapters in the curriculum.
            </div>
          </div>
        </div>
      </div>

      {/* Prominent Next Action Card */}
      <NextActionCard studentId={studentId} />

      {/* View Mode 1: Recovery Engine */}
      {viewMode === 'RECOVERY' && (
        <RecoveryPlansList studentId={studentId} />
      )}

      {/* View Mode 2: Visual Knowledge Graph */}
      {viewMode === 'GRAPH' && (
        <VisualKnowledgeMap studentId={studentId} />
      )}

      {/* View Mode 3: Full Structured Curriculum Tree */}
      {viewMode === 'CURRICULUM' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {curriculum.map(subject => {
            const isExpanded = expandedSubjectId === subject.id;
            const isLoading = loadingSubjectId === subject.id;
            const totalConcepts = subject.chapters?.reduce((acc, ch) => acc + (ch.concepts?.length || 0), 0) || 0;

            return (
              <div
                key={subject.id}
                className="card"
                style={{
                  padding: '0',
                  overflow: 'hidden',
                  border: isExpanded ? '2px solid var(--primary)' : '1px solid var(--border-color)',
                  transition: 'border-color 0.2s, box-shadow 0.2s'
                }}
              >
                {/* Clickable Subject Accordion Header */}
                <div
                  onClick={() => toggleSubject(subject)}
                  style={{
                    padding: '1.25rem 1.5rem',
                    backgroundColor: isExpanded ? 'var(--primary-light)' : 'var(--card-bg)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '1rem',
                    borderBottom: isExpanded ? '1px solid var(--border-color)' : 'none',
                    userSelect: 'none',
                    transition: 'background-color 0.15s ease'
                  }}
                  onMouseEnter={(e) => {
                    if (!isExpanded) e.currentTarget.style.backgroundColor = 'var(--card-hover-bg, var(--bg-main))';
                  }}
                  onMouseLeave={(e) => {
                    if (!isExpanded) e.currentTarget.style.backgroundColor = 'var(--card-bg)';
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                    <span style={{
                      color: isExpanded ? 'var(--primary)' : 'var(--text-muted)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'transform 0.2s ease'
                    }}>
                      {isExpanded ? <IconChevronDown size={20} stroke={2} /> : <IconChevronRight size={20} stroke={2} />}
                    </span>
                    <div>
                      <h2 style={{
                        margin: 0,
                        color: isExpanded ? 'var(--primary)' : 'var(--text-main)',
                        fontSize: '1.2rem',
                        fontWeight: '700'
                      }}>
                        {subject.name}
                      </h2>
                      {subject.description && (
                        <p style={{ margin: '0.2rem 0 0 0', color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                          {subject.description}
                        </p>
                      )}
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{
                      fontSize: '0.72rem',
                      fontWeight: '600',
                      padding: '0.2rem 0.6rem',
                      borderRadius: '1rem',
                      backgroundColor: isExpanded ? 'var(--primary)' : 'var(--bg-main)',
                      color: isExpanded ? 'white' : 'var(--text-muted)'
                    }}>
                      {subject.chapters?.length || 0} Chapters
                    </span>
                    <span style={{
                      fontSize: '0.72rem',
                      fontWeight: '600',
                      padding: '0.2rem 0.6rem',
                      borderRadius: '1rem',
                      backgroundColor: 'var(--bg-main)',
                      color: 'var(--text-muted)'
                    }}>
                      {totalConcepts} Concepts
                    </span>
                  </div>
                </div>

                {/* Expanded Accordion Body */}
                {isExpanded && (
                  <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    {isLoading ? (
                      <div style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                        Loading chapters from backend...
                      </div>
                    ) : (!subject.chapters || subject.chapters.length === 0) ? (
                      <div style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--text-muted)', fontStyle: 'italic', fontSize: '0.9rem' }}>
                        No chapters available for this subject yet.
                      </div>
                    ) : (
                      subject.chapters.map((chapter, index) => (
                        <div key={chapter.id} style={{ position: 'relative' }}>
                          <h3 style={{ margin: '0 0 0.75rem 0', fontSize: '1rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600 }}>
                            <span style={{ width: '22px', height: '22px', borderRadius: '50%', backgroundColor: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.72rem', fontWeight: 700 }}>
                              {index + 1}
                            </span>
                            {chapter.name}
                          </h3>

                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', paddingLeft: '1rem', borderLeft: '2px solid var(--border-color)', marginLeft: '10px' }}>
                            {chapter.concepts?.map(concept => {
                              const state = getConceptState(concept);
                              return (
                                <div key={concept.id} style={{ 
                                  display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
                                  padding: '0.85rem 1rem', backgroundColor: state.locked ? 'var(--bg-main)' : 'var(--card-bg)', 
                                  border: `1px solid ${state.weak ? 'var(--danger)' : state.mastered ? 'var(--success)' : 'var(--border-color)'}`, 
                                  borderRadius: 'var(--radius-md)',
                                  transition: 'all 0.15s ease',
                                  marginLeft: '0.5rem',
                                  flexWrap: 'wrap',
                                  gap: '0.75rem'
                                }}>
                                  <div style={{ minWidth: '180px' }}>
                                    <div style={{ fontWeight: '600', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.92rem' }}>
                                      {state.type === 'mastered' && <IconCircleCheck size={16} stroke={2} style={{ color: 'var(--success)' }} />}
                                      {state.type === 'weak' && <IconAlertTriangle size={16} stroke={2} style={{ color: 'var(--danger)' }} />}
                                      {state.type === 'locked' && <IconLock size={16} stroke={2} style={{ color: 'var(--text-muted)' }} />}
                                      {state.type === 'ready' && <IconBook size={16} stroke={2} style={{ color: 'var(--primary)' }} />}
                                      <span>{concept.name}</span>
                                    </div>
                                    {concept.prerequisites?.length > 0 && (
                                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                                        Requires: <strong>{concept.prerequisites.join(', ')}</strong>
                                      </div>
                                    )}
                                  </div>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                                    <span style={{ fontSize: '0.78rem', fontWeight: '600', color: state.color, marginRight: '0.25rem', fontFamily: 'JetBrains Mono, monospace' }}>
                                      {state.label}
                                    </span>
                                    {!state.locked && (
                                      <Link to={`/learning/${concept.id}`} className="btn btn-outline" style={{ padding: '0.35rem 0.65rem', fontSize: '0.78rem' }}>
                                        Theory
                                      </Link>
                                    )}
                                    {!state.locked && (
                                      <Link to={`/practice/${concept.id}`} className="btn btn-secondary" style={{ padding: '0.35rem 0.65rem', fontSize: '0.78rem' }}>
                                        Practice
                                      </Link>
                                    )}
                                    {!state.locked && (
                                      <Link to={`/adaptive-quiz/${concept.id}`} className="btn btn-outline" style={{ padding: '0.35rem 0.65rem', fontSize: '0.78rem', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                                        <IconBrain size={13} stroke={2} />
                                        Quiz
                                      </Link>
                                    )}
                                    <button 
                                      onClick={() => window.dispatchEvent(new CustomEvent('open-ai-assistant', { 
                                        detail: { 
                                          conceptId: concept.id, 
                                          prompt: `Explain the concept "${concept.name}" in simple terms with an engineering example.` 
                                        } 
                                      }))}
                                      className="btn btn-secondary" 
                                      style={{ padding: '0.35rem 0.65rem', fontSize: '0.78rem', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}
                                      title="Ask AI Tutor about this concept"
                                    >
                                      <IconSparkles size={13} stroke={2} style={{ color: 'var(--primary)' }} />
                                      AI
                                    </button>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}

export default LearningPath;
