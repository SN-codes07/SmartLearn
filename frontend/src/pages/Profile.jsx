import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const Profile = () => {
  const { user } = useAuth();
  const [profileData, setProfileData] = useState(null);
  const [learningStats, setLearningStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfileAndStats = async () => {
      try {
        setLoading(true);
        // Fetch current user details from /auth/me
        const meRes = await api.get('/auth/me');
        if (meRes.data?.user) {
          setProfileData(meRes.data.user);
        } else {
          setProfileData(user);
        }

        // If student, fetch learning profile stats
        if (user && user.role !== 'ADMIN') {
          try {
            const statsRes = await api.get(`/students/${user.id}/profile`);
            setLearningStats(statsRes.data);
          } catch (e) {
            console.error("Could not load student learning stats", e);
          }
        }
      } catch (err) {
        console.error("Error fetching profile", err);
        setProfileData(user);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchProfileAndStats();
    }
  }, [user]);

  const activeUser = profileData || user;
  const isStudent = activeUser?.role === 'STUDENT';
  const mastery = learningStats?.overallMastery ? Math.round(learningStats.overallMastery) : 0;
  const isMastered = mastery >= 75;

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '2rem 1rem' }}>
      {/* Profile Header Banner */}
      <div style={{
        backgroundColor: 'var(--card-bg)',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border-color)',
        padding: '2.5rem 2rem',
        boxShadow: 'var(--shadow-sm)',
        marginBottom: '2rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1.5rem',
        background: 'linear-gradient(to right, var(--card-bg), var(--bg-main))'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <div style={{
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            backgroundColor: isStudent ? 'var(--primary)' : '#ef4444',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '2.25rem',
            fontWeight: 800,
            boxShadow: '0 8px 16px rgba(0, 0, 0, 0.15)'
          }}>
            {activeUser?.name ? activeUser.name.charAt(0).toUpperCase() : 'U'}
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
              <h1 style={{ margin: 0, fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-main)' }}>
                {activeUser?.name || 'Loading...'}
              </h1>
              <span className={`badge ${isStudent ? 'badge-primary' : 'badge-danger'}`} style={{ fontSize: '0.8rem', padding: '0.25rem 0.6rem' }}>
                {activeUser?.role || 'STUDENT'}
              </span>
            </div>
            <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.95rem' }}>
              {activeUser?.email}
            </p>
            {activeUser?.studentId && (
              <p style={{ margin: '0.35rem 0 0', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                Student ID: <strong>{activeUser.studentId}</strong> • APSIT College of Engineering
              </p>
            )}
          </div>
        </div>

        {isStudent && learningStats && (
          <div style={{
            textAlign: 'right',
            backgroundColor: 'var(--bg-main)',
            padding: '1rem 1.5rem',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-color)'
          }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>
              Current Mastery
            </div>
            <div style={{
              fontSize: '2rem',
              fontWeight: 800,
              color: isMastered ? 'var(--success)' : 'var(--warning)',
              lineHeight: 1.1
            }}>
              {mastery}%
            </div>
            <div style={{ fontSize: '0.75rem', color: isMastered ? 'var(--success)' : 'var(--text-muted)', fontWeight: 600 }}>
              {isMastered ? '✓ Mastered (≥75%)' : 'Target: 75% Mastery'}
            </div>
          </div>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: isStudent ? '1.2fr 0.8fr' : '1fr', gap: '2rem' }}>
        {/* Academic Details Card */}
        <div style={{
          backgroundColor: 'var(--card-bg)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-color)',
          padding: '2rem',
          boxShadow: 'var(--shadow-sm)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
            <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span>🏛️</span> Academic Information
            </h2>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', backgroundColor: 'var(--bg-main)', padding: '0.25rem 0.5rem', borderRadius: '4px' }}>
              Official Record
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>
                  Full Legal Name
                </label>
                <div style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-main)', marginTop: '0.2rem' }}>
                  {activeUser?.name || '—'}
                </div>
              </div>
              <div>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>
                  College Email
                </label>
                <div style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-main)', marginTop: '0.2rem' }}>
                  {activeUser?.email || '—'}
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>
                  Student Roll / ID
                </label>
                <div style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-main)', marginTop: '0.2rem' }}>
                  {activeUser?.studentId || 'N/A (Admin)'}
                </div>
              </div>
              <div>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>
                  Academic Role
                </label>
                <div style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-main)', marginTop: '0.2rem' }}>
                  {activeUser?.role || 'STUDENT'}
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>
                  Department / Branch
                </label>
                <div style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-main)', marginTop: '0.2rem' }}>
                  {activeUser?.department || 'Information Technology'}
                </div>
              </div>
              <div>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>
                  Academic Year
                </label>
                <div style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-main)', marginTop: '0.2rem' }}>
                  {activeUser?.academicYear ? `${activeUser.academicYear} (Undergraduate)` : 'Faculty / Staff'}
                </div>
              </div>
            </div>

            {/* Read-only notice */}
            <div style={{
              backgroundColor: 'var(--bg-main)',
              border: '1px dashed var(--border-color)',
              borderRadius: 'var(--radius-md)',
              padding: '1rem',
              display: 'flex',
              gap: '0.75rem',
              alignItems: 'flex-start'
            }}>
              <span style={{ fontSize: '1.2rem' }}>🔒</span>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                <strong style={{ color: 'var(--text-main)' }}>Managed Institution Record:</strong><br />
                Academic identifiers and branch records are verified by the college registrar. Students cannot self-edit academic credentials. Contact your department administrator for corrections.
              </div>
            </div>
          </div>
        </div>

        {/* Student Stats & Quick Actions */}
        {isStudent && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{
              backgroundColor: 'var(--card-bg)',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--border-color)',
              padding: '1.5rem',
              boxShadow: 'var(--shadow-sm)'
            }}>
              <h3 style={{ margin: '0 0 1rem', fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)' }}>
                Academic Progress Summary
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.4rem' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Curriculum Mastery Target:</span>
                    <strong style={{ color: isMastered ? 'var(--success)' : 'var(--warning)' }}>{mastery}% / 75%</strong>
                  </div>
                  <div style={{
                    width: '100%',
                    height: '8px',
                    backgroundColor: 'var(--bg-main)',
                    borderRadius: '4px',
                    overflow: 'hidden'
                  }}>
                    <div style={{
                      width: `${Math.min(mastery, 100)}%`,
                      height: '100%',
                      backgroundColor: isMastered ? 'var(--success)' : 'var(--warning)',
                      borderRadius: '4px',
                      transition: 'width 0.6s ease'
                    }} />
                  </div>
                </div>

                <div style={{
                  padding: '0.85rem',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'var(--bg-main)',
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '0.75rem',
                  textAlign: 'center'
                }}>
                  <div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-main)' }}>
                      {learningStats?.knowledgeGaps?.length || 0}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      Identified Gaps
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 700, color: isMastered ? 'var(--success)' : 'var(--text-main)' }}>
                      {isMastered ? 'Proficient' : 'In Progress'}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      Status
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div style={{
              backgroundColor: 'var(--card-bg)',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--border-color)',
              padding: '1.5rem',
              boxShadow: 'var(--shadow-sm)'
            }}>
              <h3 style={{ margin: '0 0 1rem', fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)' }}>
                Learning Recovery Links
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                <Link
                  to="/"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.75rem 1rem',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'var(--bg-main)',
                    border: '1px solid var(--border-color)',
                    color: 'var(--text-main)',
                    textDecoration: 'none',
                    fontWeight: 600,
                    fontSize: '0.9rem',
                    transition: 'border-color 0.2s'
                  }}
                >
                  <span>🗺️ Visual Knowledge Map</span>
                  <span>→</span>
                </Link>

                <Link
                  to="/learning-path"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.75rem 1rem',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'var(--bg-main)',
                    border: '1px solid var(--border-color)',
                    color: 'var(--text-main)',
                    textDecoration: 'none',
                    fontWeight: 600,
                    fontSize: '0.9rem',
                    transition: 'border-color 0.2s'
                  }}
                >
                  <span>📚 Structured Curriculum</span>
                  <span>→</span>
                </Link>

                <Link
                  to="/select-assessment"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.75rem 1rem',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'var(--bg-main)',
                    border: '1px solid var(--border-color)',
                    color: 'var(--text-main)',
                    textDecoration: 'none',
                    fontWeight: 600,
                    fontSize: '0.9rem',
                    transition: 'border-color 0.2s'
                  }}
                >
                  <span>✍️ Take Diagnostic Assessment</span>
                  <span>→</span>
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
