import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import AdminCurriculumManager from '../components/AdminCurriculumManager';
import {
  IconUsers,
  IconBooks,
  IconUserPlus,
  IconSearch,
  IconEdit,
  IconArrowRight,
  IconCheck,
  IconAlertTriangle,
  IconX,
  IconAlertCircle,
  IconChartBar,
  IconAward,
  IconShieldLock,
  IconFilter
} from '@tabler/icons-react';

const AdminDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [adminTab, setAdminTab] = useState('STUDENTS'); // 'STUDENTS' | 'CURRICULUM'
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [deptFilter, setDeptFilter] = useState('ALL');
  const [yearFilter, setYearFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);

  // Form states
  const [addForm, setAddForm] = useState({
    name: '',
    email: '',
    password: '',
    studentId: '',
    department: 'Computer Engineering',
    academicYear: 'TE',
    role: 'STUDENT'
  });
  const [editForm, setEditForm] = useState({
    name: '',
    studentId: '',
    department: '',
    academicYear: ''
  });
  const [formError, setFormError] = useState('');
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [successToast, setSuccessToast] = useState('');

  // Fetch all students
  const fetchStudents = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/students');
      setStudents(res.data);
    } catch (err) {
      console.error("Failed to load students", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && user.role !== 'ADMIN') {
      navigate('/');
      return;
    }
    fetchStudents();
  }, [user]);

  const showToast = (msg) => {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(''), 4000);
  };

  // Add Student Handler
  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!addForm.name.trim() || !addForm.email.trim() || !addForm.password || !addForm.studentId.trim()) {
      setFormError('Please fill in all required fields.');
      return;
    }
    setFormSubmitting(true);
    setFormError('');
    try {
      await api.post('/admin/students', addForm);
      setIsAddModalOpen(false);
      setAddForm({
        name: '',
        email: '',
        password: '',
        studentId: '',
        department: 'Computer Engineering',
        academicYear: 'TE',
        role: 'STUDENT'
      });
      showToast('Student successfully enrolled into the system!');
      fetchStudents();
    } catch (err) {
      console.error("Error adding student", err);
      setFormError(err.response?.data || 'Failed to create student. Check for duplicate email or Student ID.');
    } finally {
      setFormSubmitting(false);
    }
  };

  // Edit Student Handler
  const openEditModal = (student) => {
    setSelectedStudent(student);
    setEditForm({
      name: student.name || '',
      studentId: student.studentId || '',
      department: student.department || 'Computer Engineering',
      academicYear: student.academicYear || 'TE'
    });
    setFormError('');
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editForm.name.trim() || !editForm.studentId.trim()) {
      setFormError('Name and Student ID are required.');
      return;
    }
    setFormSubmitting(true);
    setFormError('');
    try {
      await api.put(`/admin/students/${selectedStudent.id}`, editForm);
      setIsEditModalOpen(false);
      showToast(`Updated profile for ${editForm.name}.`);
      fetchStudents();
    } catch (err) {
      console.error("Error updating student", err);
      setFormError(err.response?.data || 'Failed to update student profile.');
    } finally {
      setFormSubmitting(false);
    }
  };

  // Metrics calculation
  const totalStudents = students.length;
  const masteredCohort = students.filter(s => (s.overallMastery || 0) >= 75).length;
  const needsAttentionCohort = students.filter(s => (s.overallMastery || 0) < 75).length;
  const avgCohortMastery = totalStudents === 0 ? 0 : Math.round(
    students.reduce((acc, curr) => acc + (curr.overallMastery || 0), 0) / totalStudents
  );

  // Filter students
  const filteredStudents = students.filter(s => {
    const matchesSearch = !searchQuery ||
      s.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.studentId?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDept = deptFilter === 'ALL' || s.department === deptFilter;
    const matchesYear = yearFilter === 'ALL' || s.academicYear === yearFilter;
    const matchesStatus = statusFilter === 'ALL' ||
      (statusFilter === 'MASTERED' && (s.overallMastery || 0) >= 75) ||
      (statusFilter === 'NEEDS_ATTENTION' && (s.overallMastery || 0) < 75);
    return matchesSearch && matchesDept && matchesYear && matchesStatus;
  });

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '2rem 1rem' }}>
      {/* Toast Notification */}
      {successToast && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          backgroundColor: '#10b981',
          color: 'white',
          padding: '0.75rem 1.25rem',
          borderRadius: 'var(--radius-md)',
          boxShadow: 'var(--shadow-lg)',
          zIndex: 9999,
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          fontSize: '0.9rem'
        }}>
          <IconCheck size={18} stroke={2.5} />
          <span>{successToast}</span>
        </div>
      )}

      {/* Header Banner */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem',
        marginBottom: '2rem'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            <h1 style={{ margin: 0, fontSize: '1.75rem', fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--text-main)' }}>
              Institutional Admin Dashboard
            </h1>
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              color: 'var(--danger, #ef4444)',
              border: '1px solid rgba(239, 68, 68, 0.25)',
              fontSize: '0.7rem',
              fontWeight: 700,
              padding: '0.2rem 0.55rem',
              borderRadius: 'var(--radius-sm)',
              letterSpacing: '0.05em',
              fontFamily: 'var(--font-mono, monospace)'
            }}>
              <IconShieldLock size={12} stroke={2} />
              APSIT PORTAL
            </span>
          </div>
          <p style={{ margin: '0.35rem 0 0', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Manage student records, inspect individual learning recovery plans, and monitor cohort mastery.
          </p>
        </div>

        {adminTab === 'STUDENTS' && (
          <button
            onClick={() => {
              setFormError('');
              setIsAddModalOpen(true);
            }}
            className="btn btn-primary"
            style={{
              padding: '0.65rem 1.25rem',
              fontWeight: 600,
              fontSize: '0.9rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            <IconUserPlus size={16} stroke={2} />
            <span>Add New Student</span>
          </button>
        )}
      </div>

      {/* Admin Tab Switcher */}
      <div style={{
        display: 'flex',
        gap: '0.5rem',
        borderBottom: '1px solid var(--border-color)',
        marginBottom: '2rem',
        paddingBottom: '0.25rem',
        overflowX: 'auto',
        WebkitOverflowScrolling: 'touch'
      }}>
        <button
          onClick={() => setAdminTab('STUDENTS')}
          style={{
            padding: '0.7rem 1.25rem',
            border: 'none',
            background: 'none',
            fontSize: '0.95rem',
            fontWeight: adminTab === 'STUDENTS' ? 700 : 500,
            cursor: 'pointer',
            color: adminTab === 'STUDENTS' ? 'var(--primary)' : 'var(--text-muted)',
            borderBottom: adminTab === 'STUDENTS' ? '2px solid var(--primary)' : '2px solid transparent',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            whiteSpace: 'nowrap',
            transition: 'all 0.15s ease'
          }}
        >
          <IconUsers size={17} stroke={1.75} />
          <span>Student Directory & Cohort Health ({totalStudents})</span>
        </button>
        <button
          onClick={() => setAdminTab('CURRICULUM')}
          style={{
            padding: '0.7rem 1.25rem',
            border: 'none',
            background: 'none',
            fontSize: '0.95rem',
            fontWeight: adminTab === 'CURRICULUM' ? 700 : 500,
            cursor: 'pointer',
            color: adminTab === 'CURRICULUM' ? 'var(--primary)' : 'var(--text-muted)',
            borderBottom: adminTab === 'CURRICULUM' ? '2px solid var(--primary)' : '2px solid transparent',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            whiteSpace: 'nowrap',
            transition: 'all 0.15s ease'
          }}
        >
          <IconBooks size={17} stroke={1.75} />
          <span>University Curriculum & Question Bank (MU Rev-2019 / NEP)</span>
        </button>
      </div>

      {adminTab === 'STUDENTS' ? (
        <>
          {/* High-Level Cohort Metrics */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '1rem',
            marginBottom: '2rem'
          }}>
            <div style={{
              backgroundColor: 'var(--card-bg)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-color)',
              padding: '1.25rem',
              boxShadow: 'var(--shadow-sm)'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontSize: '0.75rem',
                color: 'var(--text-muted)',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}>
                <span>Total Enrolled</span>
                <IconUsers size={16} stroke={1.75} style={{ color: 'var(--text-muted)' }} />
              </div>
              <div style={{
                fontSize: '2rem',
                fontWeight: 800,
                color: 'var(--text-main)',
                marginTop: '0.4rem',
                fontFamily: 'var(--font-mono, monospace)',
                letterSpacing: '-0.02em'
              }}>
                {totalStudents}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                Active student accounts
              </div>
            </div>

            <div style={{
              backgroundColor: 'var(--card-bg)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-color)',
              padding: '1.25rem',
              boxShadow: 'var(--shadow-sm)'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontSize: '0.75rem',
                color: 'var(--text-muted)',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}>
                <span>Average Mastery</span>
                <IconChartBar size={16} stroke={1.75} style={{ color: avgCohortMastery >= 75 ? 'var(--success)' : 'var(--primary)' }} />
              </div>
              <div style={{
                fontSize: '2rem',
                fontWeight: 800,
                color: avgCohortMastery >= 75 ? 'var(--success)' : 'var(--primary)',
                marginTop: '0.4rem',
                fontFamily: 'var(--font-mono, monospace)',
                letterSpacing: '-0.02em'
              }}>
                {avgCohortMastery}%
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                Strict 75.0% threshold benchmark
              </div>
            </div>

            <div style={{
              backgroundColor: 'var(--card-bg)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-color)',
              padding: '1.25rem',
              boxShadow: 'var(--shadow-sm)'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontSize: '0.75rem',
                color: 'var(--text-muted)',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}>
                <span>Mastered Cohort</span>
                <IconAward size={16} stroke={1.75} style={{ color: 'var(--success)' }} />
              </div>
              <div style={{
                fontSize: '2rem',
                fontWeight: 800,
                color: 'var(--success)',
                marginTop: '0.4rem',
                fontFamily: 'var(--font-mono, monospace)',
                letterSpacing: '-0.02em'
              }}>
                {masteredCohort}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                Students with ≥75% mastery
              </div>
            </div>

            <div style={{
              backgroundColor: 'var(--card-bg)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-color)',
              padding: '1.25rem',
              boxShadow: 'var(--shadow-sm)'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontSize: '0.75rem',
                color: 'var(--text-muted)',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}>
                <span>Needs Recovery</span>
                <IconAlertTriangle size={16} stroke={1.75} style={{ color: '#f59e0b' }} />
              </div>
              <div style={{
                fontSize: '2rem',
                fontWeight: 800,
                color: '#f59e0b',
                marginTop: '0.4rem',
                fontFamily: 'var(--font-mono, monospace)',
                letterSpacing: '-0.02em'
              }}>
                {needsAttentionCohort}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                Students below 75% threshold
              </div>
            </div>
          </div>

          {/* Student List Section */}
          <div style={{
            backgroundColor: 'var(--card-bg)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-color)',
            boxShadow: 'var(--shadow-sm)',
            overflow: 'hidden'
          }}>
            {/* Search & Filter Toolbar */}
            <div style={{
              padding: '1.25rem',
              borderBottom: '1px solid var(--border-color)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '0.75rem'
            }}>
              {/* Search box */}
              <div style={{ flex: '1 1 280px', position: 'relative' }}>
                <input
                  type="text"
                  placeholder="Search by name, email, or Student ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.6rem 0.85rem 0.6rem 2.25rem',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-color)',
                    backgroundColor: 'var(--bg-main)',
                    color: 'var(--text-main)',
                    fontSize: '0.85rem',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
                <IconSearch
                  size={15}
                  stroke={1.75}
                  style={{
                    position: 'absolute',
                    left: '0.75rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--text-muted)',
                    pointerEvents: 'none'
                  }}
                />
              </div>

              {/* Filters */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                <select
                  value={deptFilter}
                  onChange={(e) => setDeptFilter(e.target.value)}
                  style={{
                    padding: '0.55rem 0.75rem',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-color)',
                    backgroundColor: 'var(--bg-main)',
                    color: 'var(--text-main)',
                    fontSize: '0.85rem',
                    outline: 'none'
                  }}
                >
                  <option value="ALL">All Departments</option>
                  <option value="Computer Engineering">Computer Engineering</option>
                  <option value="Information Technology">Information Technology</option>
                  <option value="AI & Data Science">AI & Data Science</option>
                  <option value="Electronics & Telecom">Electronics & Telecom</option>
                </select>

                <select
                  value={yearFilter}
                  onChange={(e) => setYearFilter(e.target.value)}
                  style={{
                    padding: '0.55rem 0.75rem',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-color)',
                    backgroundColor: 'var(--bg-main)',
                    color: 'var(--text-main)',
                    fontSize: '0.85rem',
                    outline: 'none'
                  }}
                >
                  <option value="ALL">All Years</option>
                  <option value="FE">First Year (FE)</option>
                  <option value="SE">Second Year (SE)</option>
                  <option value="TE">Third Year (TE)</option>
                  <option value="BE">Final Year (BE)</option>
                </select>

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  style={{
                    padding: '0.55rem 0.75rem',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-color)',
                    backgroundColor: 'var(--bg-main)',
                    color: 'var(--text-main)',
                    fontSize: '0.85rem',
                    outline: 'none'
                  }}
                >
                  <option value="ALL">All Mastery Statuses</option>
                  <option value="MASTERED">Mastered (≥75%)</option>
                  <option value="NEEDS_ATTENTION">Needs Attention (&lt;75%)</option>
                </select>
              </div>
            </div>

            {/* Students Table */}
            <div style={{ overflowX: 'auto', width: '100%', WebkitOverflowScrolling: 'touch' }}>
              <table style={{ width: '100%', minWidth: '780px', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ backgroundColor: 'var(--bg-main)', borderBottom: '1px solid var(--border-color)' }}>
                    <th style={{ padding: '0.75rem 1.25rem', fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontFamily: 'var(--font-mono, monospace)' }}>
                      Student
                    </th>
                    <th style={{ padding: '0.75rem 1.25rem', fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontFamily: 'var(--font-mono, monospace)' }}>
                      Branch / Year
                    </th>
                    <th style={{ padding: '0.75rem 1.25rem', fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontFamily: 'var(--font-mono, monospace)' }}>
                      Mastery Level
                    </th>
                    <th style={{ padding: '0.75rem 1.25rem', fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontFamily: 'var(--font-mono, monospace)' }}>
                      Identified Gaps
                    </th>
                    <th style={{ padding: '0.75rem 1.25rem', fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontFamily: 'var(--font-mono, monospace)' }}>
                      Status
                    </th>
                    <th style={{ padding: '0.75rem 1.25rem', fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontFamily: 'var(--font-mono, monospace)', textAlign: 'right' }}>
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan="6" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                        <div style={{
                          width: '28px',
                          height: '28px',
                          border: '2px solid var(--border-color)',
                          borderTopColor: 'var(--primary)',
                          borderRadius: '50%',
                          animation: 'spin 1s linear infinite',
                          margin: '0 auto 0.75rem'
                        }} />
                        Loading student records...
                      </td>
                    </tr>
                  ) : filteredStudents.length === 0 ? (
                    <tr>
                      <td colSpan="6" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                        No students match the selected filter criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredStudents.map((s) => {
                      const mastery = Math.round(s.overallMastery || 0);
                      const isMastered = mastery >= 75;
                      return (
                        <tr
                          key={s.id}
                          style={{
                            borderBottom: '1px solid var(--border-color)',
                            transition: 'background-color 0.15s ease'
                          }}
                        >
                          {/* Student info */}
                          <td style={{ padding: '0.9rem 1.25rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                              <div style={{
                                width: '32px',
                                height: '32px',
                                borderRadius: 'var(--radius-sm)',
                                backgroundColor: 'var(--primary)',
                                color: 'white',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontWeight: 700,
                                fontSize: '0.85rem',
                                flexShrink: 0
                              }}>
                                {s.name ? s.name.charAt(0).toUpperCase() : 'S'}
                              </div>
                              <div>
                                <div style={{ fontWeight: 600, color: 'var(--text-main)', fontSize: '0.9rem' }}>
                                  {s.name}
                                </div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.35rem', flexWrap: 'wrap' }}>
                                  <span>{s.email}</span>
                                  <span>•</span>
                                  <span>ID: <code style={{ fontFamily: 'var(--font-mono, monospace)', color: 'var(--text-main)' }}>{s.studentId || s.id}</code></span>
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* Branch / Year */}
                          <td style={{ padding: '0.9rem 1.25rem' }}>
                            <div style={{ fontSize: '0.85rem', color: 'var(--text-main)', fontWeight: 500 }}>
                              {s.department || 'Computer Engineering'}
                            </div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono, monospace)' }}>
                              Year: {s.academicYear || 'TE'}
                            </div>
                          </td>

                          {/* Mastery Level */}
                          <td style={{ padding: '0.9rem 1.25rem', minWidth: '150px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
                              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: isMastered ? 'var(--success)' : 'var(--text-main)', fontFamily: 'var(--font-mono, monospace)' }}>
                                {mastery}%
                              </span>
                              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono, monospace)' }}>
                                Std: 75%
                              </span>
                            </div>
                            <div style={{
                              width: '100%',
                              height: '5px',
                              backgroundColor: 'var(--bg-main)',
                              borderRadius: '3px',
                              overflow: 'hidden'
                            }}>
                              <div style={{
                                width: `${Math.min(mastery, 100)}%`,
                                height: '100%',
                                backgroundColor: isMastered ? 'var(--success)' : mastery > 40 ? '#f59e0b' : '#ef4444',
                                borderRadius: '3px'
                              }} />
                            </div>
                          </td>

                          {/* Identified Gaps */}
                          <td style={{ padding: '0.9rem 1.25rem' }}>
                            <span style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.3rem',
                              padding: '0.2rem 0.55rem',
                              borderRadius: 'var(--radius-sm)',
                              fontSize: '0.75rem',
                              fontWeight: 600,
                              fontFamily: 'var(--font-mono, monospace)',
                              backgroundColor: s.gapsCount > 0 ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                              color: s.gapsCount > 0 ? '#ef4444' : 'var(--success)',
                              border: s.gapsCount > 0 ? '1px solid rgba(239, 68, 68, 0.25)' : '1px solid rgba(16, 185, 129, 0.25)'
                            }}>
                              {s.gapsCount > 0 ? (
                                <>
                                  <IconAlertTriangle size={13} stroke={2} />
                                  <span>{s.gapsCount} Gaps</span>
                                </>
                              ) : (
                                <>
                                  <IconCheck size={13} stroke={2.5} />
                                  <span>Clear</span>
                                </>
                              )}
                            </span>
                          </td>

                          {/* Status */}
                          <td style={{ padding: '0.9rem 1.25rem' }}>
                            <span className={`badge ${isMastered ? 'badge-success' : 'badge-danger'}`} style={{ fontSize: '0.75rem' }}>
                              {isMastered ? 'Mastered' : 'Needs Attention'}
                            </span>
                          </td>

                          {/* Actions */}
                          <td style={{ padding: '0.9rem 1.25rem', textAlign: 'right' }}>
                            <div style={{ display: 'inline-flex', gap: '0.4rem' }}>
                              <button
                                onClick={() => openEditModal(s)}
                                title="Edit student record"
                                className="btn btn-secondary"
                                style={{
                                  padding: '0.35rem 0.65rem',
                                  fontSize: '0.8rem',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '0.3rem'
                                }}
                              >
                                <IconEdit size={13} stroke={1.75} />
                                <span>Edit</span>
                              </button>
                              <Link
                                to={`/admin/students/${s.id}`}
                                className="btn btn-primary"
                                style={{
                                  padding: '0.35rem 0.75rem',
                                  fontSize: '0.8rem',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '0.3rem',
                                  textDecoration: 'none'
                                }}
                              >
                                <span>Inspect</span>
                                <IconArrowRight size={13} stroke={2} />
                              </Link>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        <AdminCurriculumManager onToast={showToast} />
      )}

      {/* Modal: Add Student */}
      {isAddModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.65)',
          backdropFilter: 'blur(4px)',
          WebkitBackdropFilter: 'blur(4px)',
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
            maxWidth: '520px',
            width: '100%',
            padding: '1.75rem',
            boxShadow: 'var(--shadow-lg)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <IconUserPlus size={18} stroke={2} />
                <span>Enroll New Student</span>
              </h2>
              <button
                onClick={() => setIsAddModalOpen(false)}
                aria-label="Close modal"
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', padding: '0.25rem' }}
              >
                <IconX size={18} stroke={1.75} />
              </button>
            </div>

            {formError && (
              <div style={{
                padding: '0.75rem',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                color: 'var(--danger, #ef4444)',
                border: '1px solid rgba(239, 68, 68, 0.25)',
                fontSize: '0.85rem',
                marginBottom: '1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem'
              }}>
                <IconAlertCircle size={15} stroke={2} />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleAddSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.3rem', color: 'var(--text-main)' }}>
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={addForm.name}
                  onChange={(e) => setAddForm({ ...addForm, name: e.target.value })}
                  placeholder="e.g. Rahul Sharma"
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.85rem',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-color)',
                    backgroundColor: 'var(--bg-main)',
                    color: 'var(--text-main)',
                    fontSize: '0.9rem',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.3rem', color: 'var(--text-main)' }}>
                    Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={addForm.email}
                    onChange={(e) => setAddForm({ ...addForm, email: e.target.value })}
                    placeholder="student@apsit.edu.in"
                    style={{
                      width: '100%',
                      padding: '0.65rem 0.85rem',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--border-color)',
                      backgroundColor: 'var(--bg-main)',
                      color: 'var(--text-main)',
                      fontSize: '0.9rem',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.3rem', color: 'var(--text-main)' }}>
                    Student Roll/ID *
                  </label>
                  <input
                    type="text"
                    required
                    value={addForm.studentId}
                    onChange={(e) => setAddForm({ ...addForm, studentId: e.target.value })}
                    placeholder="e.g. 123457"
                    style={{
                      width: '100%',
                      padding: '0.65rem 0.85rem',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--border-color)',
                      backgroundColor: 'var(--bg-main)',
                      color: 'var(--text-main)',
                      fontSize: '0.9rem',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.3rem', color: 'var(--text-main)' }}>
                    Department
                  </label>
                  <select
                    value={addForm.department}
                    onChange={(e) => setAddForm({ ...addForm, department: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.65rem 0.85rem',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--border-color)',
                      backgroundColor: 'var(--bg-main)',
                      color: 'var(--text-main)',
                      fontSize: '0.9rem',
                      outline: 'none',
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
                    value={addForm.academicYear}
                    onChange={(e) => setAddForm({ ...addForm, academicYear: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.65rem 0.85rem',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--border-color)',
                      backgroundColor: 'var(--bg-main)',
                      color: 'var(--text-main)',
                      fontSize: '0.9rem',
                      outline: 'none',
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

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.3rem', color: 'var(--text-main)' }}>
                  Initial Password *
                </label>
                <input
                  type="password"
                  required
                  value={addForm.password}
                  onChange={(e) => setAddForm({ ...addForm, password: e.target.value })}
                  placeholder="Min 6 characters"
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.85rem',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-color)',
                    backgroundColor: 'var(--bg-main)',
                    color: 'var(--text-main)',
                    fontSize: '0.9rem',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="btn btn-secondary"
                  style={{ padding: '0.6rem 1.25rem', fontSize: '0.85rem' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formSubmitting}
                  className="btn btn-primary"
                  style={{
                    padding: '0.6rem 1.5rem',
                    fontWeight: 600,
                    fontSize: '0.85rem',
                    cursor: formSubmitting ? 'not-allowed' : 'pointer'
                  }}
                >
                  {formSubmitting ? 'Enrolling...' : 'Enroll Student'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Edit Student */}
      {isEditModalOpen && selectedStudent && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.65)',
          backdropFilter: 'blur(4px)',
          WebkitBackdropFilter: 'blur(4px)',
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
            padding: '1.75rem',
            boxShadow: 'var(--shadow-lg)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <IconEdit size={18} stroke={1.75} />
                <span>Edit Student Profile</span>
              </h2>
              <button
                onClick={() => setIsEditModalOpen(false)}
                aria-label="Close modal"
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', padding: '0.25rem' }}
              >
                <IconX size={18} stroke={1.75} />
              </button>
            </div>

            {formError && (
              <div style={{
                padding: '0.75rem',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                color: 'var(--danger, #ef4444)',
                border: '1px solid rgba(239, 68, 68, 0.25)',
                fontSize: '0.85rem',
                marginBottom: '1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem'
              }}>
                <IconAlertCircle size={15} stroke={2} />
                <span>{formError}</span>
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
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-color)',
                    backgroundColor: 'var(--bg-main)',
                    color: 'var(--text-main)',
                    fontSize: '0.9rem',
                    outline: 'none',
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
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-color)',
                    backgroundColor: 'var(--bg-main)',
                    color: 'var(--text-main)',
                    fontSize: '0.9rem',
                    outline: 'none',
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
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--border-color)',
                      backgroundColor: 'var(--bg-main)',
                      color: 'var(--text-main)',
                      fontSize: '0.9rem',
                      outline: 'none',
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
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--border-color)',
                      backgroundColor: 'var(--bg-main)',
                      color: 'var(--text-main)',
                      fontSize: '0.9rem',
                      outline: 'none',
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
                  className="btn btn-secondary"
                  style={{ padding: '0.6rem 1.25rem', fontSize: '0.85rem' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formSubmitting}
                  className="btn btn-primary"
                  style={{
                    padding: '0.6rem 1.5rem',
                    fontWeight: 600,
                    fontSize: '0.85rem',
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

export default AdminDashboard;
