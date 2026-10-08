import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  IconTarget, 
  IconSchool, 
  IconBook, 
  IconBook2, 
  IconFileText, 
  IconChevronDown, 
  IconArrowRight 
} from '@tabler/icons-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const YEAR_SEMESTER_MAP = {
  '1st Year': [1, 2],
  '2nd Year': [3, 4],
  '3rd Year': [5, 6],
  '4th Year': [7, 8]
};

const DEFAULT_BRANCHES = [
  'Computer Engineering',
  'Information Technology',
  'Artificial Intelligence & Data Science',
  'Electronics & Telecommunication (EXTC)',
  'Mechanical Engineering',
  'Civil Engineering',
  'Electrical Engineering'
];

function AssessmentSelection() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [academicStructure, setAcademicStructure] = useState(null);
  const [selectedBranch, setSelectedBranch] = useState(user?.branch || user?.department || 'Computer Engineering');
  const [selectedYear, setSelectedYear] = useState(user?.academicYear || '2nd Year');
  const [selectedSemester, setSelectedSemester] = useState(user?.semester || 4);

  const [curriculum, setCurriculum] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedSubjectId, setExpandedSubjectId] = useState(null);
  const [expandedChapterId, setExpandedChapterId] = useState(null);

  // Fetch academic structure on mount
  useEffect(() => {
    api.get('/academic-structure')
      .then(res => {
        if (res.data) {
          setAcademicStructure(res.data);
        }
      })
      .catch(err => console.error('Error fetching academic structure', err));
  }, []);

  // Fetch curriculum when branch or semester filter changes
  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (selectedBranch && selectedBranch !== 'All Branches') {
      params.append('branch', selectedBranch);
    }
    if (selectedSemester) {
      params.append('semester', selectedSemester);
    }

    api.get(`/curriculum?${params.toString()}`)
      .then(res => {
        setCurriculum(res.data || []);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching curriculum', err);
        setCurriculum([]);
        setLoading(false);
      });
  }, [selectedBranch, selectedSemester]);

  const handleYearChange = (yr) => {
    setSelectedYear(yr);
    const sems = (academicStructure?.yearSemesterMap?.[yr]) || YEAR_SEMESTER_MAP[yr] || [1, 2];
    setSelectedSemester(sems[0]);
  };

  const toggleSubject = (id) => {
    setExpandedSubjectId(prev => (prev === id ? null : id));
    setExpandedChapterId(null);
  };

  const toggleChapter = (id, e) => {
    e.stopPropagation();
    setExpandedChapterId(prev => (prev === id ? null : id));
  };

  const branches = academicStructure?.branches || DEFAULT_BRANCHES;
  const availableSems = (academicStructure?.yearSemesterMap?.[selectedYear]) || YEAR_SEMESTER_MAP[selectedYear] || [1, 2];

  return (
    <div className="assessment-selection" style={{ maxWidth: '1050px', margin: '0 auto', padding: '1rem' }}>
      <div className="page-header" style={{ marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 700, color: 'var(--text-main)', margin: '0 0 0.4rem' }}>
            Diagnostic & curriculum assessments
          </h1>
          <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Ground your learning profile in University of Mumbai (Rev-2019 'C' Scheme / NEP-2020) syllabus benchmarks.
          </p>
        </div>
      </div>

      {/* Global Diagnostic Assessment Card (Recommended First Step) */}
      <div style={{ marginBottom: '2rem' }}>
        <div className="card" style={{ borderLeft: '4px solid var(--primary)', display: 'flex', flexDirection: 'column', padding: '1.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
            <div style={{
              width: '44px',
              height: '44px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--primary-light)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--primary)',
              border: '1px solid var(--border-color)',
              flexShrink: 0
            }}>
              <IconTarget size={24} stroke={2} />
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: '1.3rem', fontWeight: 700, color: 'var(--text-main)' }}>
                Comprehensive diagnostic assessment
              </h2>
              <span className="badge badge-primary" style={{ marginTop: '0.35rem', display: 'inline-block', fontSize: '0.72rem' }}>
                Recommended baseline evaluation
              </span>
            </div>
          </div>
          <p style={{ flex: '1', color: 'var(--text-muted)', fontSize: '0.92rem', margin: '0.5rem 0 1.25rem', lineHeight: 1.55 }}>
            Test your baseline knowledge across foundational engineering subjects to identify prerequisite gaps, calibrate your cognitive profile, and unlock tailored remediation plans.
          </p>
          <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
            <button
              onClick={() => navigate('/assessment?type=DIAGNOSTIC')}
              className="btn btn-primary"
              style={{ padding: '0.65rem 1.75rem', fontWeight: 600, fontSize: '0.92rem' }}
            >
              Start full diagnostic assessment
              <IconArrowRight size={16} stroke={2} />
            </button>
          </div>
        </div>
      </div>

      {/* Curriculum Filter Bar (MU Hierarchy: Branch -> Academic Year -> Semester) */}
      <div style={{
        backgroundColor: 'var(--card-bg)',
        border: '1px solid var(--border-color)',
        borderRadius: 'var(--radius-lg)',
        padding: '1.25rem 1.5rem',
        marginBottom: '2rem',
        boxShadow: 'var(--shadow-sm)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <IconSchool size={20} stroke={1.75} style={{ color: 'var(--primary)' }} />
            <span style={{ fontWeight: 700, color: 'var(--text-main)', fontSize: '0.95rem' }}>
              University of Mumbai curriculum filter
            </span>
          </div>
          {user?.role === 'ADMIN' ? (
            <span className="badge badge-danger" style={{ fontSize: '0.72rem', padding: '0.2rem 0.55rem' }}>
              Admin access: All-branch view
            </span>
          ) : (
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Enrolled: <strong style={{ color: 'var(--text-main)' }}>{user?.branch || 'Computer Engineering'}</strong> • Semester {user?.semester || 4}
            </span>
          )}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.35rem', letterSpacing: '0.5px' }}>
              Engineering branch
            </label>
            <select
              value={selectedBranch}
              onChange={(e) => setSelectedBranch(e.target.value)}
              style={{
                width: '100%',
                padding: '0.6rem 0.8rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-color)',
                backgroundColor: 'var(--bg-main)',
                color: 'var(--text-main)',
                fontSize: '0.88rem',
                outline: 'none'
              }}
            >
              {branches.map(b => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.35rem', letterSpacing: '0.5px' }}>
              Academic level
            </label>
            <select
              value={selectedYear}
              onChange={(e) => handleYearChange(e.target.value)}
              style={{
                width: '100%',
                padding: '0.6rem 0.8rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-color)',
                backgroundColor: 'var(--bg-main)',
                color: 'var(--text-main)',
                fontSize: '0.88rem',
                outline: 'none'
              }}
            >
              <option value="1st Year">1st Year (FE)</option>
              <option value="2nd Year">2nd Year (SE)</option>
              <option value="3rd Year">3rd Year (TE)</option>
              <option value="4th Year">4th Year (BE)</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.35rem', letterSpacing: '0.5px' }}>
              Semester
            </label>
            <select
              value={selectedSemester}
              onChange={(e) => setSelectedSemester(parseInt(e.target.value, 10))}
              style={{
                width: '100%',
                padding: '0.6rem 0.8rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-color)',
                backgroundColor: 'var(--bg-main)',
                color: 'var(--text-main)',
                fontSize: '0.88rem',
                outline: 'none'
              }}
            >
              {availableSems.map(s => (
                <option key={s} value={s}>Semester {s}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.5rem' }}>
        <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-main)' }}>
          Curriculum subject modules ({curriculum.length})
        </h2>
        <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
          Select any subject or drill down to assess specific unit concepts
        </span>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: '3px solid var(--border-color)',
            borderTopColor: 'var(--primary)',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 1rem'
          }} />
          Loading University of Mumbai curriculum...
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      ) : curriculum.length === 0 ? (
        <div style={{
          backgroundColor: 'var(--card-bg)',
          borderRadius: 'var(--radius-lg)',
          border: '1px dashed var(--border-color)',
          padding: '3rem 2rem',
          textAlign: 'center'
        }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
            <IconBook size={38} stroke={1.5} style={{ color: 'var(--text-muted)' }} />
          </div>
          <h3 style={{ margin: '0 0 0.5rem', color: 'var(--text-main)' }}>No subjects found for this selection</h3>
          <p style={{ margin: '0 0 1.5rem', color: 'var(--text-muted)', fontSize: '0.88rem' }}>
            Try choosing a different branch or semester, or take the diagnostic assessment.
          </p>
          <button
            onClick={() => { setSelectedBranch('Computer Engineering'); setSelectedYear('2nd Year'); setSelectedSemester(4); }}
            className="btn btn-secondary"
            style={{ padding: '0.55rem 1.25rem', fontSize: '0.88rem' }}
          >
            Reset to Computer Engineering (Semester 4)
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {curriculum.map(sub => (
            <div key={sub.id} className="card" style={{ padding: 0, overflow: 'hidden' }}>
              <div
                onClick={() => toggleSubject(sub.id)}
                style={{
                  padding: '1.25rem 1.5rem',
                  cursor: 'pointer',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  backgroundColor: expandedSubjectId === sub.id ? 'var(--bg-main)' : 'var(--card-bg)',
                  transition: 'background-color 0.15s ease',
                  flexWrap: 'wrap',
                  gap: '1rem'
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.35rem', flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                      <IconBook2 size={18} stroke={1.75} style={{ color: 'var(--primary)' }} />
                      <h3 style={{ margin: 0, fontSize: '1.15rem', color: 'var(--text-main)', fontWeight: 600 }}>
                        {sub.name}
                      </h3>
                    </div>
                    {sub.subjectCode && (
                      <span style={{
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        fontFamily: 'JetBrains Mono, monospace',
                        backgroundColor: 'var(--primary-light)',
                        color: 'var(--primary)',
                        padding: '0.15rem 0.5rem',
                        borderRadius: '4px',
                        border: '1px solid var(--border-color)'
                      }}>
                        {sub.subjectCode}
                      </span>
                    )}
                    <span style={{
                      fontSize: '0.72rem',
                      fontWeight: 600,
                      backgroundColor: 'var(--bg-main)',
                      color: 'var(--text-muted)',
                      padding: '0.15rem 0.5rem',
                      borderRadius: '4px',
                      border: '1px solid var(--border-color)'
                    }}>
                      Sem {sub.semester || selectedSemester}
                    </span>
                  </div>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    {sub.description || 'Comprehensive University of Mumbai curriculum module.'}
                  </p>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/assessment?type=SUBJECT&subjectId=${sub.id}`);
                    }}
                    className="btn btn-secondary"
                    style={{ padding: '0.45rem 0.9rem', fontSize: '0.82rem' }}
                  >
                    Take subject quiz
                  </button>
                  <span style={{
                    color: 'var(--text-muted)',
                    display: 'flex',
                    alignItems: 'center',
                    transform: expandedSubjectId === sub.id ? 'rotate(180deg)' : 'rotate(0deg)',
                    transition: 'transform 0.2s ease'
                  }}>
                    <IconChevronDown size={18} stroke={2} />
                  </span>
                </div>
              </div>

              {/* Units / Chapters drilldown */}
              {expandedSubjectId === sub.id && (
                <div style={{ borderTop: '1px solid var(--border-color)', backgroundColor: 'var(--card-bg)' }}>
                  {(sub.chapters || []).length > 0 ? (
                    sub.chapters.map(chapter => (
                      <div key={chapter.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                        <div
                          onClick={(e) => toggleChapter(chapter.id, e)}
                          style={{
                            padding: '0.85rem 1.5rem',
                            cursor: 'pointer',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            backgroundColor: 'var(--bg-main)'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--primary)' }}>
                              Unit {chapter.unitNumber || 1}:
                            </span>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                              <IconFileText size={15} stroke={1.75} style={{ color: 'var(--text-muted)' }} />
                              <h4 style={{ margin: 0, fontSize: '0.92rem', color: 'var(--text-main)', fontWeight: 600 }}>
                                {chapter.name}
                              </h4>
                            </div>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                              {(chapter.concepts || []).length} concepts
                            </span>
                            <span style={{
                              color: 'var(--text-muted)',
                              display: 'flex',
                              alignItems: 'center',
                              transform: expandedChapterId === chapter.id ? 'rotate(180deg)' : 'rotate(0deg)',
                              transition: 'transform 0.2s ease'
                            }}>
                              <IconChevronDown size={16} stroke={2} />
                            </span>
                          </div>
                        </div>

                        {/* Concepts drilldown */}
                        {expandedChapterId === chapter.id && (
                          <div style={{ padding: '0.85rem 1.25rem', backgroundColor: 'var(--card-bg)' }}>
                            {(chapter.concepts || []).length > 0 ? (
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                {chapter.concepts.map(concept => (
                                  <div
                                    key={concept.id}
                                    style={{
                                      display: 'flex',
                                      justifyContent: 'space-between',
                                      alignItems: 'center',
                                      padding: '0.65rem 0.85rem',
                                      border: '1px solid var(--border-color)',
                                      borderRadius: 'var(--radius-sm)',
                                      backgroundColor: 'var(--bg-main)',
                                      flexWrap: 'wrap',
                                      gap: '0.5rem'
                                    }}
                                  >
                                    <div>
                                      <div style={{ color: 'var(--text-main)', fontWeight: 600, fontSize: '0.88rem' }}>
                                        {concept.name}
                                      </div>
                                      {concept.topicName && concept.topicName !== concept.name && (
                                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.1rem' }}>
                                          Topic: {concept.topicName}
                                        </div>
                                      )}
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                                      <Link
                                        to={`/learning/${concept.id}`}
                                        className="btn btn-outline"
                                        style={{ padding: '0.3rem 0.65rem', fontSize: '0.78rem' }}
                                      >
                                        Study
                                      </Link>
                                      <button
                                        onClick={() => navigate(`/assessment?type=CONCEPT&conceptId=${concept.id}`)}
                                        className="btn btn-primary"
                                        style={{ padding: '0.3rem 0.65rem', fontSize: '0.78rem' }}
                                      >
                                        Assess
                                      </button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                                No concepts enrolled in this unit yet.
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <div style={{ padding: '1.25rem 2rem', color: 'var(--text-muted)', fontSize: '0.88rem' }}>
                      No units listed for this subject yet.
                    </div>
                  )}
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
