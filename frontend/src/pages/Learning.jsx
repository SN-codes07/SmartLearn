import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

function Learning() {
  const { conceptId } = useParams();
  const { user } = useAuth();
  const studentId = user?.id || 1;
  const [resource, setResource] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.get(`/students/${studentId}/learning/${conceptId}`)
      .then(res => {
        setResource(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching learning resource", err);
        setLoading(false);
      });
  }, [conceptId, studentId]);

  if (loading) return (
    <div style={{ textAlign: 'center', padding: '5rem' }}>
      <div style={{ width: '50px', height: '50px', border: '4px solid var(--border-color)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 1.5rem' }}></div>
      <h3 style={{ color: 'var(--text-muted)' }}>Loading learning module...</h3>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
  if (!resource) return (
    <div className="empty-state" style={{ marginTop: '3rem' }}>
      <div className="empty-state-icon">⚠️</div>
      <h2>Module Not Found</h2>
      <p>We could not locate this learning resource.</p>
      <Link to="/" className="btn" style={{ marginTop: '1rem' }}>Return to Dashboard</Link>
    </div>
  );

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', gap: '2rem', alignItems: 'flex-start' }}>
      
      {/* Sidebar Navigation */}
      <div className="card" style={{ flex: '0 0 280px', position: 'sticky', top: '2rem', padding: '1.5rem', maxHeight: 'calc(100vh - 4rem)', overflowY: 'auto' }}>
        <h3 style={{ fontSize: '1.1rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>
          Curriculum
        </h3>
        {/* We would fetch the curriculum here, for now keeping it simple as a placeholder to meet instructions without adding massive logic overhead in this limited time. Instead of a full tree, we'll provide a Back to Dashboard and a "Curriculum Browser coming soon" or quick links. But wait, I'll fetch it! */}
        <CurriculumSidebar currentConceptId={parseInt(conceptId)} />
      </div>

      <div className="learning-page" style={{ flex: '1', minWidth: 0 }}>
        <div className="page-header" style={{ marginBottom: '1.5rem' }}>
          <div>
            <Link to="/" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.25rem', marginBottom: '1rem' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
              Back to Dashboard
            </Link>
            <h1 style={{ marginBottom: '0.5rem' }}>{resource.title}</h1>
            <span className="badge badge-primary">Concept: {resource.conceptName}</span>
          </div>
        </div>
        
        <div className="card" style={{ padding: '2.5rem' }}>
          
          {/* Simple Definition */}
          <div style={{ marginBottom: '2.5rem' }}>
            <h4 style={{ color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '1px', fontSize: '0.85rem', marginBottom: '0.5rem' }}>What is it?</h4>
            <p style={{ fontSize: '1.2rem', color: 'var(--text-main)', lineHeight: '1.6', fontWeight: '500' }}>
              {resource.shortExplanation}
            </p>
          </div>

          {/* Detailed Explanation */}
          {resource.detailedExplanation && (
            <div style={{ marginBottom: '2.5rem' }}>
              <h4 style={{ color: 'var(--text-main)', fontSize: '1rem', marginBottom: '0.75rem' }}>Detailed Theory</h4>
              <p style={{ color: 'var(--text-muted)', lineHeight: '1.7' }}>{resource.detailedExplanation}</p>
            </div>
          )}

          {/* Key Points & Mistakes Grid */}
          <div className="grid-2" style={{ marginBottom: '2.5rem' }}>
            {resource.keyPoints && (
              <div style={{ padding: '1.5rem', backgroundColor: '#f8fafc', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                <h4 style={{ color: 'var(--primary)', fontSize: '0.9rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                  Key Points
                </h4>
                <ul style={{ paddingLeft: '1.2rem', color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: '1.6' }}>
                  {resource.keyPoints.split('\\n').map((pt, i) => <li key={i}>{pt}</li>)}
                </ul>
              </div>
            )}
            
            {resource.commonMistakes && (
              <div style={{ padding: '1.5rem', backgroundColor: 'var(--danger-bg)', borderRadius: 'var(--radius-md)' }}>
                <h4 style={{ color: 'var(--danger-text)', fontSize: '0.9rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                  Common Mistakes
                </h4>
                <ul style={{ paddingLeft: '1.2rem', color: 'var(--danger-text)', fontSize: '0.9rem', lineHeight: '1.6' }}>
                  {resource.commonMistakes.split('\\n').map((pt, i) => <li key={i}>{pt.replace('-', '')}</li>)}
                </ul>
              </div>
            )}
          </div>

          {/* Syntax & Examples */}
          {resource.syntaxOrStructure && (
            <div style={{ marginBottom: '2.5rem' }}>
              <h4 style={{ color: 'var(--text-main)', fontSize: '1rem', marginBottom: '0.75rem' }}>Syntax / Structure</h4>
              <pre style={{ display: 'block', padding: '1.25rem', background: '#1e293b', color: '#e2e8f0', borderRadius: 'var(--radius-sm)', fontSize: '0.95rem', fontFamily: 'monospace', overflowX: 'auto', lineHeight: '1.5' }}>
                {resource.syntaxOrStructure.replace(/\\n/g, '\n')}
              </pre>
            </div>
          )}

          {resource.workedExample && (
            <div style={{ marginBottom: '2.5rem', padding: '1.5rem', backgroundColor: '#f1f5f9', borderLeft: '4px solid var(--primary)', borderRadius: '0 var(--radius-md) var(--radius-md) 0' }}>
              <h4 style={{ color: 'var(--text-main)', fontSize: '0.9rem', marginBottom: '0.75rem' }}>Worked Example</h4>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: '1.7' }}>
                {resource.workedExample.split('\\n').map((line, i) => <div key={i}>{line}</div>)}
              </div>
            </div>
          )}

          {/* Exam Points */}
          {resource.examPoints && (
            <div style={{ marginBottom: '2.5rem', padding: '1.5rem', backgroundColor: '#fcf8e3', border: '1px solid #faebcc', borderRadius: 'var(--radius-md)' }}>
              <h4 style={{ color: '#8a6d3b', fontSize: '1rem', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 10v6M2 10l10-5 10 5-10 5z"></path><path d="M6 12v5c3 3 9 3 12 0v-5"></path></svg>
                Important for Exams
              </h4>
              <div style={{ color: '#8a6d3b', fontSize: '0.95rem', lineHeight: '1.6' }}>
                {resource.examPoints.split('\\n').map((line, i) => <div key={i}>{line}</div>)}
              </div>
            </div>
          )}

          
          {/* Ask AI Section */}
          <div style={{ marginBottom: '2.5rem', padding: '1.5rem', backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 'var(--radius-md)' }}>
            <h4 style={{ color: '#1e40af', fontSize: '1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '1.2rem' }}>✨</span>
              Ask AI about this concept
            </h4>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
              {["Explain this in simple terms", "Give me an example", "Test me", "What are common mistakes?", "Explain this for my exam"].map(prompt => (
                <button 
                  key={prompt}
                  className="btn btn-outline"
                  onClick={() => window.dispatchEvent(new CustomEvent('open-ai-assistant', { detail: { conceptId: Number(conceptId), prompt } }))}
                  style={{ backgroundColor: 'white', color: '#1d4ed8', borderColor: '#93c5fd', fontSize: '0.85rem' }}
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem', borderTop: '1px solid var(--border-color)', paddingTop: '2rem' }}>
            <Link to={`/practice/${conceptId}`} className="btn" style={{ flex: 1 }}>
              Practice This Concept
            </Link>
            <Link to={`/reassessment/${conceptId}`} className="btn btn-outline" style={{ flex: 1 }}>
              Take Re-assessment
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function CurriculumSidebar({ currentConceptId }) {
  const [curriculum, setCurriculum] = useState([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState(null);
  const [loadingSubjectId, setLoadingSubjectId] = useState(null);

  useEffect(() => {
    api.get('/curriculum')
      .then(res => {
        setCurriculum(res.data);
        // Find which subject contains the current concept to open by default
        const activeSub = res.data.find(sub => 
          sub.chapters?.some(ch => ch.concepts?.some(co => co.id === currentConceptId))
        );
        if (activeSub) {
          setSelectedSubjectId(activeSub.id);
        } else if (res.data.length > 0) {
          setSelectedSubjectId(res.data[0].id);
        }
      })
      .catch(console.error);
  }, [currentConceptId]);

  const toggleSubject = async (subject) => {
    // Single-open accordion: clicking opened subject closes it; clicking another opens it
    if (selectedSubjectId === subject.id) {
      setSelectedSubjectId(null);
      return;
    }

    setSelectedSubjectId(subject.id);

    // If chapters are empty or not loaded, fetch dynamically from backend
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
        console.error("Error fetching chapters for subject:", subject.id, err);
      } finally {
        setLoadingSubjectId(null);
      }
    }
  };

  if (curriculum.length === 0) return <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Loading curriculum...</div>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
      {curriculum.map(subject => {
        const isExpanded = selectedSubjectId === subject.id;
        const isLoading = loadingSubjectId === subject.id;
        const containsActiveConcept = subject.chapters?.some(ch => ch.concepts?.some(co => co.id === currentConceptId));

        return (
          <div key={subject.id} style={{ borderRadius: 'var(--radius-sm)', overflow: 'hidden' }}>
            {/* Interactive Clickable Subject Header */}
            <button
              type="button"
              onClick={() => toggleSubject(subject)}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.65rem 0.75rem',
                backgroundColor: isExpanded ? 'rgba(99, 102, 241, 0.1)' : 'transparent',
                border: isExpanded ? '1px solid var(--primary)' : '1px solid transparent',
                borderRadius: 'var(--radius-sm)',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.15s ease',
                color: isExpanded ? 'var(--primary)' : 'var(--text-main)',
                outline: 'none',
                userSelect: 'none'
              }}
              onMouseEnter={(e) => {
                if (!isExpanded) {
                  e.currentTarget.style.backgroundColor = 'var(--bg-main)';
                  e.currentTarget.style.borderColor = 'var(--border-color)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isExpanded) {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.borderColor = 'transparent';
                }
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: isExpanded ? '700' : '600', fontSize: '0.9rem' }}>
                <span style={{
                  fontSize: '0.75rem',
                  color: isExpanded ? 'var(--primary)' : 'var(--text-muted)',
                  display: 'inline-block',
                  transition: 'transform 0.2s'
                }}>
                  {isExpanded ? '▼' : '▶'}
                </span>
                <span>{subject.name}</span>
                {containsActiveConcept && (
                  <span
                    style={{
                      width: '6px',
                      height: '6px',
                      borderRadius: '50%',
                      backgroundColor: 'var(--primary)',
                      display: 'inline-block'
                    }}
                    title="Currently viewing a concept in this subject"
                  />
                )}
              </div>
              <span style={{
                fontSize: '0.7rem',
                padding: '0.15rem 0.5rem',
                borderRadius: '1rem',
                backgroundColor: isExpanded ? 'var(--primary)' : 'var(--bg-main)',
                color: isExpanded ? 'white' : 'var(--text-muted)',
                fontWeight: '600'
              }}>
                {subject.chapters?.length || 0} ch
              </span>
            </button>

            {/* Expanded Chapters and Concepts */}
            {isExpanded && (
              <div style={{
                paddingLeft: '0.75rem',
                paddingRight: '0.25rem',
                paddingTop: '0.5rem',
                paddingBottom: '0.5rem',
                borderLeft: '2px solid var(--primary)',
                marginLeft: '0.75rem',
                marginTop: '0.25rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.6rem'
              }}>
                {isLoading ? (
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', padding: '0.5rem', fontStyle: 'italic' }}>
                    Loading chapters...
                  </div>
                ) : (!subject.chapters || subject.chapters.length === 0) ? (
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontStyle: 'italic', padding: '0.5rem' }}>
                    No chapters available.
                  </div>
                ) : (
                  subject.chapters.map(chapter => (
                    <div key={chapter.id} style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                      <div style={{
                        fontSize: '0.75rem',
                        fontWeight: '700',
                        color: 'var(--text-muted)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                        padding: '0.2rem 0.4rem'
                      }}>
                        📁 {chapter.name}
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                        {chapter.concepts?.map(concept => {
                          const isCurrent = concept.id === currentConceptId;
                          return (
                            <Link
                              key={concept.id}
                              to={`/learning/${concept.id}`}
                              style={{
                                fontSize: '0.85rem',
                                padding: '0.35rem 0.6rem',
                                borderRadius: 'var(--radius-sm)',
                                textDecoration: 'none',
                                color: isCurrent ? 'var(--primary)' : 'var(--text-main)',
                                backgroundColor: isCurrent ? 'rgba(99, 102, 241, 0.12)' : 'transparent',
                                fontWeight: isCurrent ? '700' : '500',
                                borderLeft: isCurrent ? '3px solid var(--primary)' : '3px solid transparent',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.4rem',
                                transition: 'all 0.15s ease'
                              }}
                              onMouseEnter={(e) => {
                                if (!isCurrent) e.currentTarget.style.backgroundColor = 'var(--bg-main)';
                              }}
                              onMouseLeave={(e) => {
                                if (!isCurrent) e.currentTarget.style.backgroundColor = 'transparent';
                              }}
                            >
                              <span>📄</span>
                              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {concept.name}
                              </span>
                            </Link>
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
  );
}

export default Learning;
