import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';

function AssessmentSelection() {
  const [curriculum, setCurriculum] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedSubjectId, setExpandedSubjectId] = useState(null);
  const [expandedChapterId, setExpandedChapterId] = useState(null);
  const navigate = useNavigate();

  const requiredSubjects = [
    "Database Management", "Data Structures", "Java", 
    "Python", "React.js", "Automata Theory"
  ];

  useEffect(() => {
    api.get('/curriculum')
      .then(res => {
        // Filter to only required subjects
        const filtered = res.data.filter(s => requiredSubjects.includes(s.name));
        setCurriculum(filtered);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching curriculum", err);
        setLoading(false);
      });
  }, []);

  const toggleSubject = (id) => {
    setExpandedSubjectId(prev => prev === id ? null : id);
    setExpandedChapterId(null);
  };

  const toggleChapter = (id, e) => {
    e.stopPropagation();
    setExpandedChapterId(prev => prev === id ? null : id);
  };

  return (
    <div className="assessment-selection" style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <div className="page-header">
        <div>
          <h1>Select Assessment</h1>
          <p>Choose an assessment to evaluate your skills and update your learning profile.</p>
        </div>
      </div>
      
      <div style={{ marginBottom: '3rem' }}>
        <div className="card card-hover" style={{ borderTop: '4px solid var(--primary)', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
            <div style={{ fontSize: '2.5rem' }}>🎯</div>
            <div>
              <h2 style={{ margin: 0 }}>Diagnostic Assessment</h2>
              <span className="badge badge-primary" style={{ marginTop: '0.25rem' }}>Recommended for New Students</span>
            </div>
          </div>
          <p style={{ flex: '1' }}>Test your baseline knowledge across all core subjects to build your initial learning profile and uncover knowledge gaps.</p>
          <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-start' }}>
            <button onClick={() => navigate('/assessment?type=DIAGNOSTIC')} className="btn" style={{ padding: '0.75rem 2rem' }}>
              Start Full Diagnostic
            </button>
          </div>
        </div>
      </div>

      <h2 style={{ marginBottom: '1.5rem' }}>Curriculum Assessments</h2>
      
      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem' }}>
          <div style={{ width: '40px', height: '40px', border: '3px solid var(--border-color)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 1rem' }}></div>
          Loading curriculum...
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {curriculum.map(sub => (
            <div key={sub.id} className="card" style={{ padding: '0', overflow: 'hidden' }}>
              <div 
                onClick={() => toggleSubject(sub.id)}
                style={{ padding: '1.5rem', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: expandedSubjectId === sub.id ? 'var(--bg-color)' : 'white' }}
              >
                <div>
                  <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.2rem', color: 'var(--text-main)' }}>📚 {sub.name}</h3>
                  <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-muted)' }}>{sub.description}</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <button 
                    onClick={(e) => { e.stopPropagation(); navigate(`/assessment?type=SUBJECT&subjectId=${sub.id}`); }}
                    className="btn btn-secondary" style={{ padding: '0.5rem 1rem' }}>
                    Take Subject Quiz
                  </button>
                  <span style={{ fontSize: '1.5rem', transform: expandedSubjectId === sub.id ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s' }}>
                    ▼
                  </span>
                </div>
              </div>
              
              {expandedSubjectId === sub.id && (
                <div style={{ borderTop: '1px solid var(--border-color)', backgroundColor: 'white' }}>
                  {sub.chapters.map(chapter => (
                    <div key={chapter.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                      <div 
                        onClick={(e) => toggleChapter(chapter.id, e)}
                        style={{ padding: '1rem 1.5rem 1rem 3rem', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f8fafc' }}
                      >
                        <h4 style={{ margin: 0, color: 'var(--text-main)' }}>📖 {chapter.name}</h4>
                        <span style={{ fontSize: '1rem', transform: expandedChapterId === chapter.id ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s' }}>
                          ▼
                        </span>
                      </div>
                      
                      {expandedChapterId === chapter.id && (
                        <div style={{ padding: '1rem 1.5rem 1rem 4.5rem', backgroundColor: '#fff' }}>
                          {chapter.concepts.length > 0 ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                              {chapter.concepts.map(concept => (
                                <div key={concept.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)' }}>
                                  <span style={{ color: 'var(--text-main)', fontWeight: '500' }}>{concept.name}</span>
                                  <button 
                                    onClick={() => navigate(`/assessment?type=CONCEPT&conceptId=${concept.id}`)}
                                    className="btn btn-outline" style={{ padding: '0.25rem 0.75rem', fontSize: '0.85rem' }}>
                                    Assess Concept
                                  </button>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>No concepts available.</div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default AssessmentSelection;
