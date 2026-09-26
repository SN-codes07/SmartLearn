import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import VisualKnowledgeMap from '../components/VisualKnowledgeMap';
import RecoveryPlansList from '../components/RecoveryPlansList';
import DailyFeedbackCard from '../components/DailyFeedbackCard';

const AdminStudentDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [student, setStudent] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('MAP'); // 'MAP', 'RECOVERY', 'FEEDBACK', 'OVERVIEW'

  // Edit Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    studentId: '',
    department: '',
    academicYear: ''
  });
  const [formError, setFormError] = useState('');
  const [formSubmitting, setFormSubmitting] = useState(false);

  const fetchStudentData = async () => {
    try {
      setLoading(true);
      const [studentRes, profileRes] = await Promise.all([
        api.get(`/admin/students/${id}`),
        api.get(`/admin/students/${id}/progress`)
      ]);
      setStudent(studentRes.data);
      setProfile(profileRes.data);
      setEditForm({
        name: studentRes.data.name || '',
        studentId: studentRes.data.studentId || '',
        department: studentRes.data.department || 'Computer Engineering',
        academicYear: studentRes.data.academicYear || 'TE'
      });
    } catch (err) {
      console.error("Failed to load student details", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && user.role !== 'ADMIN') {
      navigate('/');
      return;
    }
    fetchStudentData();
  }, [id, user]);

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editForm.name.trim() || !editForm.studentId.trim()) {
      setFormError('Name and Student ID are required.');
      return;
    }
    setFormSubmitting(true);
    setFormError('');
    try {
      await api.put(`/admin/students/${id}`, editForm);
      setIsEditModalOpen(false);
      fetchStudentData();
    } catch (err) {
      console.error("Error updating student", err);
      setFormError(err.response?.data || 'Failed to update student profile.');
    } finally {
      setFormSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '3rem 1rem', textAlign: 'center', color: 'var(--text-muted)' }}>
        <div style={{ width: '40px', height: '40px', border: '3px solid var(--border-color)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 1rem' }} />
        Loading student dossier & learning analytics...
      </div>
    );
  }

  if (!student) {
    return (
      <div style={{ maxWidth: '800px', margin: '3rem auto', textAlign: 'center' }}>
        <h2>Student Not Found</h2>
        <p style={{ color: 'var(--text-muted)' }}>Could not find student record with ID #{id}.</p>
        <Link to="/admin" className="btn btn-primary" style={{ marginTop: '1rem', display: 'inline-block' }}>
          ← Back to Admin Dashboard
        </Link>
      </div>
    );
  }

  const mastery = profile?.overallMastery ? Math.round(profile.overallMastery) : 0;
  const isMastered = mastery >= 75;
  const knowledgeGaps = profile?.knowledgeGaps || [];
  const concepts = profile?.concepts || [];
  const masteredConcepts = concepts.filter(c => c.status === 'MASTERED');

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '2rem 1rem' }}>
      {/* Back Navigation */}
      <div style={{ marginBottom: '1.5rem' }}>
        <Link
          to="/admin"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            color: 'var(--text-muted)',
            textDecoration: 'none',
            fontSize: '0.9rem',
            fontWeight: 600
          }}
        >
          ← Back to All Students
        </Link>
      </div>

      {/* Student Profile Dossier Banner */}
      <div style={{
        backgroundColor: 'var(--card-bg)',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border-color)',
        padding: '2rem',
        boxShadow: 'var(--shadow-sm)',
        marginBottom: '2rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1.5rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <div style={{
            width: '72px',
            height: '72px',
            borderRadius: '50%',
            backgroundColor: 'var(--primary)',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '2rem',
            fontWeight: 800
          }}>
            {student.name ? student.name.charAt(0).toUpperCase() : 'S'}
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
              <h1 style={{ margin: 0, fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-main)' }}>
                {student.name}
              </h1>
              <span className={`badge ${isMastered ? 'badge-success' : 'badge-danger'}`}>
                {isMastered ? 'Mastered (≥75%)' : 'Needs Attention'}
              </span>
            </div>
            <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <span>📧 {student.email}</span>
              <span>🎓 ID: <strong style={{ color: 'var(--text-main)' }}>{student.studentId || student.id}</strong></span>
              <span>🏛️ {student.department || 'Computer Engineering'}</span>
              <span>📅 Year: {student.academicYear || 'TE'}</span>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <div style={{
            textAlign: 'center',
            backgroundColor: 'var(--bg-main)',
            padding: '0.85rem 1.5rem',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-color)'
          }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>
              Overall Mastery
            </div>
            <div style={{ fontSize: '1.85rem', fontWeight: 800, color: isMastered ? 'var(--success)' : 'var(--primary)' }}>
              {mastery}%
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
              Standard: 75%
            </div>
          </div>

          <button
            onClick={() => setIsEditModalOpen(true)}
            style={{
              padding: '0.65rem 1.25rem',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-color)',
              backgroundColor: 'var(--card-bg)',
              color: 'var(--text-main)',
              fontSize: '0.9rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem'
            }}
          >
            ✏️ Edit Profile
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{
        display: 'flex',
        gap: '0.75rem',
        borderBottom: '2px solid var(--border-color)',
        marginBottom: '2rem',
        overflowX: 'auto'
      }}>
        <button
          onClick={() => setActiveTab('MAP')}
          style={{
            background: 'none',
            border: 'none',
            padding: '0.75rem 1.25rem',
            fontSize: '1rem',
            fontWeight: activeTab === 'MAP' ? 700 : 500,
            color: activeTab === 'MAP' ? 'var(--primary)' : 'var(--text-muted)',
            borderBottom: activeTab === 'MAP' ? '3px solid var(--primary)' : 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            whiteSpace: 'nowrap'
          }}
        >
          <span>🗺️</span> Visual Knowledge Graph
        </button>

        <button
          onClick={() => setActiveTab('RECOVERY')}
          style={{
            background: 'none',
            border: 'none',
            padding: '0.75rem 1.25rem',
            fontSize: '1rem',
            fontWeight: activeTab === 'RECOVERY' ? 700 : 500,
            color: activeTab === 'RECOVERY' ? 'var(--primary)' : 'var(--text-muted)',
            borderBottom: activeTab === 'RECOVERY' ? '3px solid var(--primary)' : 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            whiteSpace: 'nowrap'
          }}
        >
          <span>🛠️</span> Recovery Plans ({knowledgeGaps.length})
        </button>

        <button
          onClick={() => setActiveTab('FEEDBACK')}
          style={{
            background: 'none',
            border: 'none',
            padding: '0.75rem 1.25rem',
            fontSize: '1rem',
            fontWeight: activeTab === 'FEEDBACK' ? 700 : 500,
            color: activeTab === 'FEEDBACK' ? 'var(--primary)' : 'var(--text-muted)',
            borderBottom: activeTab === 'FEEDBACK' ? '3px solid var(--primary)' : 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            whiteSpace: 'nowrap'
          }}
        >
          <span>🤖</span> Daily AI Feedback
        </button>

        <button
          onClick={() => setActiveTab('OVERVIEW')}
          style={{
            background: 'none',
            border: 'none',
            padding: '0.75rem 1.25rem',
            fontSize: '1rem',
            fontWeight: activeTab === 'OVERVIEW' ? 700 : 500,
            color: activeTab === 'OVERVIEW' ? 'var(--primary)' : 'var(--text-muted)',
            borderBottom: activeTab === 'OVERVIEW' ? '3px solid var(--primary)' : 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            whiteSpace: 'nowrap'
          }}
        >
          <span>📊</span> Detailed Concept Breakdown
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'MAP' && (
        <div>
          <div style={{ marginBottom: '1rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Live Knowledge Dependency Graph rendered directly from {student.name}'s assessment attempts.
          </div>
          <VisualKnowledgeMap studentId={student.id} />
        </div>
      )}

      {activeTab === 'RECOVERY' && (
        <div>
          <div style={{ marginBottom: '1rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Automated learning recovery pathways targeting {student.name}'s diagnosed prerequisite gaps.
          </div>
          <RecoveryPlansList studentId={student.id} />
        </div>
      )}

      {activeTab === 'FEEDBACK' && (
        <div>
          <DailyFeedbackCard studentId={student.id} />
        </div>
      )}

      {activeTab === 'OVERVIEW' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
          {/* Mastered concepts */}
          <div style={{
            backgroundColor: 'var(--card-bg)',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border-color)',
            padding: '1.5rem',
            boxShadow: 'var(--shadow-sm)'
          }}>
            <h3 style={{ margin: '0 0 1rem', fontSize: '1.1rem', color: 'var(--success)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span>✓</span> Mastered Concepts ({masteredConcepts.length})
            </h3>
            {masteredConcepts.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>No concepts mastered yet (≥75% required).</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {masteredConcepts.map((c, i) => (
                  <div key={i} style={{
                    padding: '0.6rem 0.8rem',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: 'var(--bg-main)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-main)' }}>{c.conceptName}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{c.subjectName}</div>
                    </div>
                    <span style={{ fontWeight: 700, color: 'var(--success)', fontSize: '0.9rem' }}>
                      {Math.round(c.masteryScore)}%
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Knowledge Gaps */}
          <div style={{
            backgroundColor: 'var(--card-bg)',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border-color)',
            padding: '1.5rem',
            boxShadow: 'var(--shadow-sm)'
          }}>
            <h3 style={{ margin: '0 0 1rem', fontSize: '1.1rem', color: '#ef4444', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span>⚠️</span> Knowledge Gaps Needing Attention ({knowledgeGaps.length})
            </h3>
            {knowledgeGaps.length === 0 ? (
              <p style={{ color: 'var(--success)', fontSize: '0.9rem' }}>No active knowledge gaps detected!</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {knowledgeGaps.map((g, i) => (
                  <div key={i} style={{
                    padding: '0.6rem 0.8rem',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: 'var(--bg-main)',
                    borderLeft: '3px solid #ef4444',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-main)' }}>{g.conceptName}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{g.reason || 'Score below 75% threshold'}</div>
                    </div>
                    <span style={{ fontWeight: 700, color: '#ef4444', fontSize: '0.9rem' }}>
                      {Math.round(g.masteryScore)}%
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {isEditModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10000,
          padding: '1rem'
        }}>
          <div style={{
            backgroundColor: 'var(--card-bg)',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border-color)',
            maxWidth: '500px',
            width: '100%',
            padding: '2rem',
            boxShadow: 'var(--shadow-lg)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h2 style={{ margin: 0, fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-main)' }}>
                Edit Student Profile
              </h2>
              <button
                onClick={() => setIsEditModalOpen(false)}
                style={{ background: 'none', border: 'none', fontSize: '1.25rem', cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                ✕
              </button>
            </div>

            {formError && (
              <div style={{
                padding: '0.75rem',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: '#fee2e2',
                color: '#b91c1c',
                fontSize: '0.85rem',
                marginBottom: '1rem'
              }}>
                ⚠️ {formError}
              </div>
            )}

            <form onSubmit={handleEditSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.3rem', color: 'var(--text-main)' }}>
                  Full Legal Name *
                </label>
                <input
                  type="text"
                  required
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.85rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-color)',
                    backgroundColor: 'var(--bg-main)',
                    color: 'var(--text-main)',
                    fontSize: '0.9rem',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.3rem', color: 'var(--text-main)' }}>
                  Student Roll / ID *
                </label>
                <input
                  type="text"
                  required
                  value={editForm.studentId}
                  onChange={(e) => setEditForm({ ...editForm, studentId: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.85rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-color)',
                    backgroundColor: 'var(--bg-main)',
                    color: 'var(--text-main)',
                    fontSize: '0.9rem',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.3rem', color: 'var(--text-main)' }}>
                    Department
                  </label>
                  <select
                    value={editForm.department}
                    onChange={(e) => setEditForm({ ...editForm, department: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.65rem 0.85rem',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border-color)',
                      backgroundColor: 'var(--bg-main)',
                      color: 'var(--text-main)',
                      fontSize: '0.9rem',
                      boxSizing: 'border-box'
                    }}
                  >
                    <option value="Computer Engineering">Computer Engineering</option>
                    <option value="Information Technology">Information Technology</option>
                    <option value="AI & Data Science">AI & Data Science</option>
                    <option value="Electronics & Telecom">Electronics & Telecom</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.3rem', color: 'var(--text-main)' }}>
                    Academic Year
                  </label>
                  <select
                    value={editForm.academicYear}
                    onChange={(e) => setEditForm({ ...editForm, academicYear: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.65rem 0.85rem',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border-color)',
                      backgroundColor: 'var(--bg-main)',
                      color: 'var(--text-main)',
                      fontSize: '0.9rem',
                      boxSizing: 'border-box'
                    }}
                  >
                    <option value="FE">First Year (FE)</option>
                    <option value="SE">Second Year (SE)</option>
                    <option value="TE">Third Year (TE)</option>
                    <option value="BE">Final Year (BE)</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  style={{
                    padding: '0.65rem 1.25rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-color)',
                    backgroundColor: 'var(--bg-main)',
                    color: 'var(--text-main)',
                    fontSize: '0.9rem',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formSubmitting}
                  style={{
                    padding: '0.65rem 1.5rem',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'var(--primary)',
                    color: 'white',
                    border: 'none',
                    fontWeight: 700,
                    fontSize: '0.9rem',
                    cursor: formSubmitting ? 'not-allowed' : 'pointer'
                  }}
                >
                  {formSubmitting ? 'Saving...' : 'Save Profile Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminStudentDetail;
