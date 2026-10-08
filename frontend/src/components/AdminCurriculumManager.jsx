import { useState, useEffect } from 'react';
import api from '../services/api';
import {
  IconBooks,
  IconBook,
  IconBook2,
  IconBulb,
  IconPlus,
  IconEdit,
  IconTrash,
  IconChevronDown,
  IconHelpCircle,
  IconFileText,
  IconSettings,
  IconX
} from '@tabler/icons-react';

const BRANCH_LIST = [
  'All Branches',
  'Computer Engineering',
  'Information Technology',
  'Artificial Intelligence & Data Science',
  'Electronics & Telecommunication (EXTC)',
  'Mechanical Engineering',
  'Civil Engineering',
  'Electrical Engineering'
];

const YEAR_LIST = ['All Years', '1st Year', '2nd Year', '3rd Year', '4th Year'];

const YEAR_SEMESTER_MAP = {
  '1st Year': [1, 2],
  '2nd Year': [3, 4],
  '3rd Year': [5, 6],
  '4th Year': [7, 8]
};

const AdminCurriculumManager = ({ onToast }) => {
  const [curriculum, setCurriculum] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [branchFilter, setBranchFilter] = useState('All Branches');
  const [yearFilter, setYearFilter] = useState('All Years');
  const [semFilter, setSemFilter] = useState('ALL');

  // Expanded items
  const [expandedSubjectId, setExpandedSubjectId] = useState(null);
  const [expandedChapterId, setExpandedChapterId] = useState(null);

  // Modals state
  const [subjectModal, setSubjectModal] = useState({ open: false, mode: 'create', data: null });
  const [chapterModal, setChapterModal] = useState({ open: false, mode: 'create', data: null, subjectId: null });
  const [conceptModal, setConceptModal] = useState({ open: false, mode: 'create', data: null, chapterId: null });
  const [questionModal, setQuestionModal] = useState({ open: false, concept: null, questions: [], loading: false });
  const [resourceModal, setResourceModal] = useState({ open: false, concept: null, resource: null, loading: false });

  // Form states for modals
  const [subjectForm, setSubjectForm] = useState({
    name: '',
    subjectCode: '',
    branch: 'Computer Engineering',
    academicYear: '2nd Year',
    semester: 3,
    description: '',
    scheme: "Rev-2019 'C' Scheme"
  });

  const [chapterForm, setChapterForm] = useState({
    name: '',
    unitNumber: 1,
    description: ''
  });

  const [conceptForm, setConceptForm] = useState({
    name: '',
    topicName: ''
  });

  const [newQuestionForm, setNewQuestionForm] = useState({
    text: '',
    optionA: '',
    optionB: '',
    optionC: '',
    optionD: '',
    correctOption: 'A',
    difficultyLevel: 'MEDIUM'
  });

  const [resourceForm, setResourceForm] = useState({
    title: '',
    shortExplanation: '',
    detailedExplanation: '',
    keyPoints: '',
    workedExample: '',
    examPoints: '',
    practiceHint: ''
  });

  // Fetch curriculum
  const fetchCurriculum = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (branchFilter && branchFilter !== 'All Branches') {
        params.append('branch', branchFilter);
      }
      if (yearFilter && yearFilter !== 'All Years') {
        params.append('academicYear', yearFilter);
      }
      if (semFilter && semFilter !== 'ALL') {
        params.append('semester', semFilter);
      }

      const res = await api.get(`/admin/curriculum?${params.toString()}`);
      setCurriculum(res.data || []);
    } catch (err) {
      console.error('Failed to load curriculum', err);
      if (onToast) onToast('Failed to load curriculum.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCurriculum();
  }, [branchFilter, yearFilter, semFilter]);

  // Aggregate counts
  const totalSubjects = curriculum.length;
  const totalUnits = curriculum.reduce((acc, s) => acc + (s.chapters?.length || 0), 0);
  const totalConcepts = curriculum.reduce((acc, s) => acc + (s.totalConcepts || 0), 0);
  const totalQuestions = curriculum.reduce((acc, s) => acc + (s.totalQuestions || 0), 0);

  // Subject CRUD
  const openCreateSubject = () => {
    setSubjectForm({
      name: '',
      subjectCode: '',
      branch: branchFilter !== 'All Branches' ? branchFilter : 'Computer Engineering',
      academicYear: yearFilter !== 'All Years' ? yearFilter : '2nd Year',
      semester: semFilter !== 'ALL' ? parseInt(semFilter, 10) : 3,
      description: '',
      scheme: "Rev-2019 'C' Scheme"
    });
    setSubjectModal({ open: true, mode: 'create', data: null });
  };

  const openEditSubject = (s, e) => {
    e.stopPropagation();
    setSubjectForm({
      name: s.name,
      subjectCode: s.subjectCode || '',
      branch: s.branch || 'Computer Engineering',
      academicYear: s.academicYear || '2nd Year',
      semester: s.semester || 3,
      description: s.description || '',
      scheme: s.scheme || "Rev-2019 'C' Scheme"
    });
    setSubjectModal({ open: true, mode: 'edit', data: s });
  };

  const handleSaveSubject = async (e) => {
    e.preventDefault();
    if (!subjectForm.name.trim()) return;
    try {
      if (subjectModal.mode === 'create') {
        await api.post('/admin/subjects', subjectForm);
        if (onToast) onToast('Subject created successfully!');
      } else {
        await api.put(`/admin/subjects/${subjectModal.data.id}`, subjectForm);
        if (onToast) onToast('Subject updated successfully!');
      }
      setSubjectModal({ open: false, mode: 'create', data: null });
      fetchCurriculum();
    } catch (err) {
      alert(err.response?.data || 'Failed to save subject.');
    }
  };

  const handleDeleteSubject = async (s, e) => {
    e.stopPropagation();
    if (!window.confirm(`Are you sure you want to delete subject "${s.name}"? This action cannot be undone.`)) {
      return;
    }
    try {
      await api.delete(`/admin/subjects/${s.id}`);
      if (onToast) onToast(`Subject "${s.name}" deleted.`);
      fetchCurriculum();
    } catch (err) {
      alert(err.response?.data || 'Failed to delete subject.');
    }
  };

  // Chapter CRUD
  const openCreateChapter = (subjectId, e) => {
    e.stopPropagation();
    setChapterForm({ name: '', unitNumber: 1, description: '' });
    setChapterModal({ open: true, mode: 'create', data: null, subjectId });
  };

  const openEditChapter = (ch, e) => {
    e.stopPropagation();
    setChapterForm({
      name: ch.name,
      unitNumber: ch.unitNumber || 1,
      description: ch.description || ''
    });
    setChapterModal({ open: true, mode: 'edit', data: ch, subjectId: ch.subjectId });
  };

  const handleSaveChapter = async (e) => {
    e.preventDefault();
    if (!chapterForm.name.trim()) return;
    try {
      if (chapterModal.mode === 'create') {
        await api.post('/admin/chapters', {
          ...chapterForm,
          subjectId: chapterModal.subjectId
        });
        if (onToast) onToast('Unit created successfully!');
      } else {
        await api.put(`/admin/chapters/${chapterModal.data.id}`, chapterForm);
        if (onToast) onToast('Unit updated successfully!');
      }
      setChapterModal({ open: false, mode: 'create', data: null, subjectId: null });
      fetchCurriculum();
    } catch (err) {
      alert(err.response?.data || 'Failed to save unit.');
    }
  };

  const handleDeleteChapter = async (ch, e) => {
    e.stopPropagation();
    if (!window.confirm(`Are you sure you want to delete unit "${ch.name}"?`)) return;
    try {
      await api.delete(`/admin/chapters/${ch.id}`);
      if (onToast) onToast('Unit deleted.');
      fetchCurriculum();
    } catch (err) {
      alert(err.response?.data || 'Failed to delete unit.');
    }
  };

  // Concept CRUD
  const openCreateConcept = (chapterId, e) => {
    e.stopPropagation();
    setConceptForm({ name: '', topicName: '' });
    setConceptModal({ open: true, mode: 'create', data: null, chapterId });
  };

  const openEditConcept = (con, e) => {
    e.stopPropagation();
    setConceptForm({
      name: con.name,
      topicName: con.topicName || con.name
    });
    setConceptModal({ open: true, mode: 'edit', data: con, chapterId: con.chapterId });
  };

  const handleSaveConcept = async (e) => {
    e.preventDefault();
    if (!conceptForm.name.trim()) return;
    try {
      if (conceptModal.mode === 'create') {
        await api.post('/admin/concepts', {
          ...conceptForm,
          chapterId: conceptModal.chapterId
        });
        if (onToast) onToast('Concept created successfully!');
      } else {
        await api.put(`/admin/concepts/${conceptModal.data.id}`, conceptForm);
        if (onToast) onToast('Concept updated successfully!');
      }
      setConceptModal({ open: false, mode: 'create', data: null, chapterId: null });
      fetchCurriculum();
    } catch (err) {
      alert(err.response?.data || 'Failed to save concept.');
    }
  };

  const handleDeleteConcept = async (con, e) => {
    e.stopPropagation();
    if (!window.confirm(`Are you sure you want to delete concept "${con.name}"?`)) return;
    try {
      await api.delete(`/admin/concepts/${con.id}`);
      if (onToast) onToast('Concept deleted.');
      fetchCurriculum();
    } catch (err) {
      alert(err.response?.data || 'Failed to delete concept.');
    }
  };

  // Question Management Modal
  const openQuestionModal = async (con, e) => {
    e.stopPropagation();
    setQuestionModal({ open: true, concept: con, questions: [], loading: true });
    try {
      const res = await api.get(`/admin/concepts/${con.id}/questions`);
      setQuestionModal(prev => ({ ...prev, questions: res.data || [], loading: false }));
    } catch (err) {
      console.error('Error fetching questions', err);
      setQuestionModal(prev => ({ ...prev, loading: false }));
    }
  };

  const handleAddQuestion = async (e) => {
    e.preventDefault();
    if (!newQuestionForm.text.trim()) return;
    try {
      await api.post(`/admin/concepts/${questionModal.concept.id}/questions`, newQuestionForm);
      const res = await api.get(`/admin/concepts/${questionModal.concept.id}/questions`);
      setQuestionModal(prev => ({ ...prev, questions: res.data || [] }));
      setNewQuestionForm({
        text: '',
        optionA: '',
        optionB: '',
        optionC: '',
        optionD: '',
        correctOption: 'A',
        difficultyLevel: 'MEDIUM'
      });
      if (onToast) onToast('Question added!');
      fetchCurriculum();
    } catch (err) {
      alert('Failed to add question');
    }
  };

  const handleDeleteQuestion = async (qId) => {
    if (!window.confirm('Delete this question?')) return;
    try {
      await api.delete(`/admin/questions/${qId}`);
      setQuestionModal(prev => ({
        ...prev,
        questions: prev.questions.filter(q => q.id !== qId)
      }));
      if (onToast) onToast('Question deleted.');
      fetchCurriculum();
    } catch (err) {
      alert('Failed to delete question');
    }
  };

  // Resource Management Modal
  const openResourceModal = async (con, e) => {
    e.stopPropagation();
    setResourceModal({ open: true, concept: con, resource: null, loading: true });
    try {
      const res = await api.get(`/admin/concepts/${con.id}/resource`);
      const r = res.data;
      setResourceModal(prev => ({ ...prev, resource: r, loading: false }));
      if (r) {
        setResourceForm({
          title: r.title || `Mastering ${con.name}`,
          shortExplanation: r.shortExplanation || '',
          detailedExplanation: r.detailedExplanation || '',
          keyPoints: r.keyPoints || '',
          workedExample: r.workedExample || '',
          examPoints: r.examPoints || '',
          practiceHint: r.practiceHint || ''
        });
      } else {
        setResourceForm({
          title: `Mastering ${con.name}`,
          shortExplanation: `${con.name} is a foundational engineering concept.`,
          detailedExplanation: `Detailed breakdown and analysis of ${con.name}.`,
          keyPoints: `1. Key architectural principles.\n2. Standard patterns and implementations.`,
          workedExample: `Step-by-step application walkthrough.`,
          examPoints: `High-frequency Mumbai University exam problem notes.`,
          practiceHint: `Watch out for boundary conditions and syntax limits.`
        });
      }
    } catch (err) {
      console.error('Error fetching resource', err);
      setResourceModal(prev => ({ ...prev, loading: false }));
    }
  };

  const handleSaveResource = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/admin/concepts/${resourceModal.concept.id}/resource`, resourceForm);
      if (onToast) onToast('Learning resource updated successfully!');
      setResourceModal({ open: false, concept: null, resource: null, loading: false });
    } catch (err) {
      alert('Failed to save learning resource.');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Metrics Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
        <div style={{ backgroundColor: 'var(--card-bg)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', padding: '1.25rem', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            <span>Subjects Enrolled</span>
            <IconBooks size={16} stroke={1.75} style={{ color: 'var(--text-muted)' }} />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '0.4rem', fontFamily: 'var(--font-mono, monospace)', letterSpacing: '-0.02em' }}>
            {totalSubjects}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
            Across all engineering branches
          </div>
        </div>

        <div style={{ backgroundColor: 'var(--card-bg)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', padding: '1.25rem', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            <span>Syllabus Units</span>
            <IconBook2 size={16} stroke={1.75} style={{ color: 'var(--primary)' }} />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--primary)', marginTop: '0.4rem', fontFamily: 'var(--font-mono, monospace)', letterSpacing: '-0.02em' }}>
            {totalUnits}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
            Structured course units
          </div>
        </div>

        <div style={{ backgroundColor: 'var(--card-bg)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', padding: '1.25rem', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            <span>Active Concepts</span>
            <IconBulb size={16} stroke={1.75} style={{ color: 'var(--success)' }} />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--success)', marginTop: '0.4rem', fontFamily: 'var(--font-mono, monospace)', letterSpacing: '-0.02em' }}>
            {totalConcepts}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
            Mapped with learning resources
          </div>
        </div>

        <div style={{ backgroundColor: 'var(--card-bg)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', padding: '1.25rem', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            <span>Question Bank</span>
            <IconHelpCircle size={16} stroke={1.75} style={{ color: '#f59e0b' }} />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#f59e0b', marginTop: '0.4rem', fontFamily: 'var(--font-mono, monospace)', letterSpacing: '-0.02em' }}>
            {totalQuestions}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
            Verified assessment items
          </div>
        </div>
      </div>

      {/* Filter and Action Bar */}
      <div style={{
        backgroundColor: 'var(--card-bg)',
        border: '1px solid var(--border-color)',
        borderRadius: 'var(--radius-md)',
        padding: '1.25rem',
        boxShadow: 'var(--shadow-sm)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
          <div>
            <h3 style={{ margin: '0 0 0.25rem', fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <IconSettings size={18} stroke={1.75} />
              <span>Curriculum Hierarchy & Accreditation Scope</span>
            </h3>
            <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Filter by engineering branch, academic year, and semester to inspect or modify University of Mumbai modules.
            </p>
          </div>

          <button
            onClick={openCreateSubject}
            className="btn btn-primary"
            style={{ padding: '0.6rem 1.25rem', fontWeight: 600, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          >
            <IconPlus size={16} stroke={2} />
            <span>Add Subject Module</span>
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.35rem' }}>
              Branch
            </label>
            <select
              value={branchFilter}
              onChange={(e) => setBranchFilter(e.target.value)}
              style={{
                width: '100%',
                padding: '0.6rem 0.8rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-color)',
                backgroundColor: 'var(--bg-main)',
                color: 'var(--text-main)',
                fontSize: '0.9rem',
                outline: 'none'
              }}
            >
              {BRANCH_LIST.map(b => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.35rem' }}>
              Academic Level
            </label>
            <select
              value={yearFilter}
              onChange={(e) => setYearFilter(e.target.value)}
              style={{
                width: '100%',
                padding: '0.6rem 0.8rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-color)',
                backgroundColor: 'var(--bg-main)',
                color: 'var(--text-main)',
                fontSize: '0.9rem',
                outline: 'none'
              }}
            >
              {YEAR_LIST.map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.35rem' }}>
              Semester
            </label>
            <select
              value={semFilter}
              onChange={(e) => setSemFilter(e.target.value)}
              style={{
                width: '100%',
                padding: '0.6rem 0.8rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-color)',
                backgroundColor: 'var(--bg-main)',
                color: 'var(--text-main)',
                fontSize: '0.9rem',
                outline: 'none'
              }}
            >
              <option value="ALL">All Semesters (1 - 8)</option>
              {[1, 2, 3, 4, 5, 6, 7, 8].map(s => (
                <option key={s} value={s}>Semester {s}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Curriculum Subject Tree */}
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
          Loading University of Mumbai curriculum modules...
        </div>
      ) : curriculum.length === 0 ? (
        <div style={{
          backgroundColor: 'var(--card-bg)',
          borderRadius: 'var(--radius-lg)',
          border: '1px dashed var(--border-color)',
          padding: '3rem',
          textAlign: 'center'
        }}>
          <p style={{ margin: 0, color: 'var(--text-muted)' }}>No curriculum subjects match this filter.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {curriculum.map(sub => (
            <div key={sub.id} className="card" style={{ padding: 0, overflow: 'hidden' }}>
              {/* Subject Row */}
              <div
                onClick={() => setExpandedSubjectId(prev => (prev === sub.id ? null : sub.id))}
                style={{
                  padding: '1.25rem 1.5rem',
                  cursor: 'pointer',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  backgroundColor: expandedSubjectId === sub.id ? 'var(--bg-main)' : 'var(--card-bg)',
                  flexWrap: 'wrap',
                  gap: '1rem',
                  transition: 'background-color 0.15s ease'
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap', marginBottom: '0.35rem' }}>
                    <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <IconBook size={18} stroke={1.75} style={{ color: 'var(--primary)' }} />
                      <span>{sub.name}</span>
                    </h3>
                    {sub.subjectCode && (
                      <span style={{
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        backgroundColor: 'var(--primary-light)',
                        color: 'var(--primary)',
                        padding: '0.15rem 0.5rem',
                        borderRadius: 'var(--radius-sm)',
                        border: '1px solid var(--border-color)',
                        fontFamily: 'var(--font-mono, monospace)'
                      }}>
                        {sub.subjectCode}
                      </span>
                    )}
                    <span className="badge badge-primary" style={{ fontSize: '0.75rem' }}>
                      {sub.branch || 'All Branches'}
                    </span>
                    <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', backgroundColor: 'var(--bg-main)', padding: '0.15rem 0.5rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', fontFamily: 'var(--font-mono, monospace)' }}>
                      {sub.academicYear} • Sem {sub.semester}
                    </span>
                  </div>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    {sub.description || 'University of Mumbai syllabus module'}
                  </p>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <button
                    onClick={(e) => openCreateChapter(sub.id, e)}
                    className="btn btn-outline"
                    style={{ padding: '0.35rem 0.7rem', fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}
                  >
                    <IconPlus size={13} stroke={2} />
                    <span>Unit</span>
                  </button>
                  <button
                    onClick={(e) => openEditSubject(sub, e)}
                    className="btn btn-secondary"
                    style={{ padding: '0.35rem 0.7rem', fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}
                  >
                    <IconEdit size={13} stroke={1.75} />
                    <span>Edit</span>
                  </button>
                  <button
                    onClick={(e) => handleDeleteSubject(sub, e)}
                    className="btn btn-outline"
                    style={{ padding: '0.35rem 0.7rem', fontSize: '0.8rem', color: 'var(--danger)', borderColor: 'var(--danger)', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}
                  >
                    <IconTrash size={13} stroke={1.75} />
                    <span>Delete</span>
                  </button>
                  <IconChevronDown
                    size={16}
                    stroke={2}
                    style={{
                      color: 'var(--text-muted)',
                      transform: expandedSubjectId === sub.id ? 'rotate(180deg)' : 'rotate(0deg)',
                      transition: 'transform 0.2s ease',
                      marginLeft: '0.25rem'
                    }}
                  />
                </div>
              </div>

              {/* Units Accordion */}
              {expandedSubjectId === sub.id && (
                <div style={{ borderTop: '1px solid var(--border-color)', backgroundColor: 'var(--card-bg)' }}>
                  {(sub.chapters || []).length > 0 ? (
                    sub.chapters.map(chapter => (
                      <div key={chapter.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                        <div
                          onClick={(e) => {
                            e.stopPropagation();
                            setExpandedChapterId(prev => (prev === chapter.id ? null : chapter.id));
                          }}
                          style={{
                            padding: '0.85rem 1.5rem 0.85rem 2.25rem',
                            cursor: 'pointer',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            backgroundColor: 'var(--bg-main)'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--primary)', fontFamily: 'var(--font-mono, monospace)' }}>
                              Unit {chapter.unitNumber || 1}:
                            </span>
                            <h4 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                              <IconBook2 size={16} stroke={1.75} style={{ color: 'var(--text-muted)' }} />
                              <span>{chapter.name}</span>
                            </h4>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                            <button
                              onClick={(e) => openCreateConcept(chapter.id, e)}
                              className="btn btn-outline"
                              style={{ padding: '0.25rem 0.55rem', fontSize: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}
                            >
                              <IconPlus size={12} stroke={2} />
                              <span>Concept</span>
                            </button>
                            <button
                              onClick={(e) => openEditChapter(chapter, e)}
                              className="btn btn-secondary"
                              style={{ padding: '0.25rem 0.55rem', fontSize: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}
                            >
                              <IconEdit size={12} stroke={1.75} />
                              <span>Edit</span>
                            </button>
                            <button
                              onClick={(e) => handleDeleteChapter(chapter, e)}
                              className="btn btn-outline"
                              style={{ padding: '0.25rem 0.55rem', fontSize: '0.75rem', color: 'var(--danger)', borderColor: 'var(--danger)', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}
                            >
                              <IconTrash size={12} stroke={1.75} />
                              <span>Delete</span>
                            </button>
                            <IconChevronDown
                              size={15}
                              stroke={2}
                              style={{
                                color: 'var(--text-muted)',
                                transform: expandedChapterId === chapter.id ? 'rotate(180deg)' : 'rotate(0deg)',
                                transition: 'transform 0.2s ease',
                                marginLeft: '0.2rem'
                              }}
                            />
                          </div>
                        </div>

                        {/* Concepts List */}
                        {expandedChapterId === chapter.id && (
                          <div style={{ padding: '0.85rem 1.5rem 0.85rem 3rem', backgroundColor: 'var(--card-bg)' }}>
                            {(chapter.concepts || []).length > 0 ? (
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                {chapter.concepts.map(con => (
                                  <div
                                    key={con.id}
                                    style={{
                                      display: 'flex',
                                      justifyContent: 'space-between',
                                      alignItems: 'center',
                                      padding: '0.6rem 0.85rem',
                                      borderRadius: 'var(--radius-sm)',
                                      border: '1px solid var(--border-color)',
                                      backgroundColor: 'var(--bg-main)'
                                    }}
                                  >
                                    <div>
                                      <div style={{ fontWeight: 600, color: 'var(--text-main)', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                        <IconBulb size={15} stroke={1.75} style={{ color: 'var(--primary)', flexShrink: 0 }} />
                                        <span>{con.name}</span>
                                      </div>
                                      {con.topicName && con.topicName !== con.name && (
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.15rem', marginLeft: '1.35rem' }}>
                                          Topic: {con.topicName}
                                        </div>
                                      )}
                                    </div>

                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                      <button
                                        onClick={(e) => openQuestionModal(con, e)}
                                        className="btn btn-secondary"
                                        style={{ padding: '0.25rem 0.6rem', fontSize: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}
                                      >
                                        <IconHelpCircle size={13} stroke={1.75} />
                                        <span>Questions (<span style={{ fontFamily: 'var(--font-mono, monospace)' }}>{con.questionCount || 0}</span>)</span>
                                      </button>
                                      <button
                                        onClick={(e) => openResourceModal(con, e)}
                                        className="btn btn-outline"
                                        style={{ padding: '0.25rem 0.6rem', fontSize: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}
                                      >
                                        <IconFileText size={13} stroke={1.75} />
                                        <span>Resource</span>
                                      </button>
                                      <button
                                        onClick={(e) => openEditConcept(con, e)}
                                        className="btn btn-outline"
                                        style={{ padding: '0.25rem 0.6rem', fontSize: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}
                                      >
                                        <IconEdit size={13} stroke={1.75} />
                                        <span>Edit</span>
                                      </button>
                                      <button
                                        onClick={(e) => handleDeleteConcept(con, e)}
                                        className="btn btn-outline"
                                        style={{ padding: '0.25rem 0.6rem', fontSize: '0.75rem', color: 'var(--danger)', borderColor: 'var(--danger)', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}
                                      >
                                        <IconTrash size={13} stroke={1.75} />
                                        <span>Delete</span>
                                      </button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                No concepts in this unit. Click <strong>+ Concept</strong> above to add one.
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <div style={{ padding: '1.25rem 2rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                      No units created yet. Click <strong>+ Unit</strong> above to add Unit 1.
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Subject Modal */}
      {subjectModal.open && (
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
          zIndex: 1000,
          padding: '1rem'
        }}>
          <div style={{
            backgroundColor: 'var(--card-bg)',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border-color)',
            maxWidth: '520px',
            width: '100%',
            padding: '2rem',
            boxShadow: 'var(--shadow-lg)'
          }}>
            <h3 style={{ margin: '0 0 1.25rem', color: 'var(--text-main)', fontSize: '1.25rem' }}>
              {subjectModal.mode === 'create' ? 'Create Subject Module' : 'Edit Subject Module'}
            </h3>

            <form onSubmit={handleSaveSubject} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.3rem' }}>
                  Subject Name *
                </label>
                <input
                  type="text"
                  required
                  value={subjectForm.name}
                  onChange={(e) => setSubjectForm({ ...subjectForm, name: e.target.value })}
                  placeholder="e.g. Database Management"
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.8rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-color)',
                    backgroundColor: 'var(--bg-main)',
                    color: 'var(--text-main)',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.3rem' }}>
                    Subject Code
                  </label>
                  <input
                    type="text"
                    value={subjectForm.subjectCode}
                    onChange={(e) => setSubjectForm({ ...subjectForm, subjectCode: e.target.value })}
                    placeholder="e.g. CSC403"
                    style={{
                      width: '100%',
                      padding: '0.65rem 0.8rem',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border-color)',
                      backgroundColor: 'var(--bg-main)',
                      color: 'var(--text-main)',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.3rem' }}>
                    Semester
                  </label>
                  <select
                    value={subjectForm.semester}
                    onChange={(e) => setSubjectForm({ ...subjectForm, semester: parseInt(e.target.value, 10) })}
                    style={{
                      width: '100%',
                      padding: '0.65rem 0.8rem',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border-color)',
                      backgroundColor: 'var(--bg-main)',
                      color: 'var(--text-main)',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8].map(s => (
                      <option key={s} value={s}>Semester {s}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.3rem' }}>
                    Engineering Branch
                  </label>
                  <select
                    value={subjectForm.branch}
                    onChange={(e) => setSubjectForm({ ...subjectForm, branch: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.65rem 0.8rem',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border-color)',
                      backgroundColor: 'var(--bg-main)',
                      color: 'var(--text-main)',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  >
                    {BRANCH_LIST.filter(b => b !== 'All Branches').map(b => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.3rem' }}>
                    Academic Year
                  </label>
                  <select
                    value={subjectForm.academicYear}
                    onChange={(e) => setSubjectForm({ ...subjectForm, academicYear: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.65rem 0.8rem',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border-color)',
                      backgroundColor: 'var(--bg-main)',
                      color: 'var(--text-main)',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  >
                    <option value="1st Year">1st Year (FE)</option>
                    <option value="2nd Year">2nd Year (SE)</option>
                    <option value="3rd Year">3rd Year (TE)</option>
                    <option value="4th Year">4th Year (BE)</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.3rem' }}>
                  Description
                </label>
                <textarea
                  rows="3"
                  value={subjectForm.description}
                  onChange={(e) => setSubjectForm({ ...subjectForm, description: e.target.value })}
                  placeholder="Overview of syllabus module..."
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.8rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-color)',
                    backgroundColor: 'var(--bg-main)',
                    color: 'var(--text-main)',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setSubjectModal({ open: false, mode: 'create', data: null })}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {subjectModal.mode === 'create' ? 'Create Subject' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Chapter Modal */}
      {chapterModal.open && (
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
          zIndex: 1000,
          padding: '1rem'
        }}>
          <div style={{
            backgroundColor: 'var(--card-bg)',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border-color)',
            maxWidth: '460px',
            width: '100%',
            padding: '2rem',
            boxShadow: 'var(--shadow-lg)'
          }}>
            <h3 style={{ margin: '0 0 1.25rem', color: 'var(--text-main)', fontSize: '1.25rem' }}>
              {chapterModal.mode === 'create' ? 'Add Unit / Chapter' : 'Edit Unit / Chapter'}
            </h3>

            <form onSubmit={handleSaveChapter} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.3rem' }}>
                  Unit Number *
                </label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  required
                  value={chapterForm.unitNumber}
                  onChange={(e) => setChapterForm({ ...chapterForm, unitNumber: parseInt(e.target.value, 10) })}
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.8rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-color)',
                    backgroundColor: 'var(--bg-main)',
                    color: 'var(--text-main)',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.3rem' }}>
                  Unit / Chapter Name *
                </label>
                <input
                  type="text"
                  required
                  value={chapterForm.name}
                  onChange={(e) => setChapterForm({ ...chapterForm, name: e.target.value })}
                  placeholder="e.g. Relational Data Model"
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.8rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-color)',
                    backgroundColor: 'var(--bg-main)',
                    color: 'var(--text-main)',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.3rem' }}>
                  Description
                </label>
                <textarea
                  rows="2"
                  value={chapterForm.description}
                  onChange={(e) => setChapterForm({ ...chapterForm, description: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.8rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-color)',
                    backgroundColor: 'var(--bg-main)',
                    color: 'var(--text-main)',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setChapterModal({ open: false, mode: 'create', data: null, subjectId: null })}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {chapterModal.mode === 'create' ? 'Add Unit' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Concept Modal */}
      {conceptModal.open && (
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
          zIndex: 1000,
          padding: '1rem'
        }}>
          <div style={{
            backgroundColor: 'var(--card-bg)',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border-color)',
            maxWidth: '460px',
            width: '100%',
            padding: '2rem',
            boxShadow: 'var(--shadow-lg)'
          }}>
            <h3 style={{ margin: '0 0 1.25rem', color: 'var(--text-main)', fontSize: '1.25rem' }}>
              {conceptModal.mode === 'create' ? 'Add Concept / Topic' : 'Edit Concept'}
            </h3>

            <form onSubmit={handleSaveConcept} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.3rem' }}>
                  Concept Name *
                </label>
                <input
                  type="text"
                  required
                  value={conceptForm.name}
                  onChange={(e) => setConceptForm({ ...conceptForm, name: e.target.value })}
                  placeholder="e.g. Boyce-Codd Normal Form"
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.8rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-color)',
                    backgroundColor: 'var(--bg-main)',
                    color: 'var(--text-main)',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.3rem' }}>
                  Topic / Subtopic Name
                </label>
                <input
                  type="text"
                  value={conceptForm.topicName}
                  onChange={(e) => setConceptForm({ ...conceptForm, topicName: e.target.value })}
                  placeholder="e.g. Schema Normalization"
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.8rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-color)',
                    backgroundColor: 'var(--bg-main)',
                    color: 'var(--text-main)',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setConceptModal({ open: false, mode: 'create', data: null, chapterId: null })}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {conceptModal.mode === 'create' ? 'Add Concept' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Question Bank Modal */}
      {questionModal.open && (
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
          zIndex: 1000,
          padding: '1rem'
        }}>
          <div style={{
            backgroundColor: 'var(--card-bg)',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border-color)',
            maxWidth: '750px',
            width: '100%',
            maxHeight: '90vh',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: 'var(--shadow-lg)'
          }}>
            <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ margin: '0 0 0.25rem', color: 'var(--text-main)', fontSize: '1.2rem' }}>
                  Questions for: {questionModal.concept?.name}
                </h3>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Total Questions: {questionModal.questions.length}
                </span>
              </div>
              <button
                onClick={() => setQuestionModal({ open: false, concept: null, questions: [], loading: false })}
                className="btn btn-secondary"
                style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}
              >
                <IconX size={15} stroke={2} />
                <span>Close</span>
              </button>
            </div>

            <div style={{ padding: '1.5rem', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {/* Add Question Form */}
              <div style={{ backgroundColor: 'var(--bg-main)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '1.25rem' }}>
                <h4 style={{ margin: '0 0 0.75rem', fontSize: '0.95rem', color: 'var(--text-main)' }}>
                  + Add New Question
                </h4>
                <form onSubmit={handleAddQuestion} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <div>
                    <input
                      type="text"
                      required
                      placeholder="Question prompt or code problem..."
                      value={newQuestionForm.text}
                      onChange={(e) => setNewQuestionForm({ ...newQuestionForm, text: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '0.55rem 0.75rem',
                        borderRadius: 'var(--radius-sm)',
                        border: '1px solid var(--border-color)',
                        backgroundColor: 'var(--card-bg)',
                        color: 'var(--text-main)',
                        fontSize: '0.85rem',
                        outline: 'none',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                    <input
                      type="text"
                      required
                      placeholder="Option A"
                      value={newQuestionForm.optionA}
                      onChange={(e) => setNewQuestionForm({ ...newQuestionForm, optionA: e.target.value })}
                      style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--border-color)', backgroundColor: 'var(--card-bg)', color: 'var(--text-main)', fontSize: '0.85rem' }}
                    />
                    <input
                      type="text"
                      required
                      placeholder="Option B"
                      value={newQuestionForm.optionB}
                      onChange={(e) => setNewQuestionForm({ ...newQuestionForm, optionB: e.target.value })}
                      style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--border-color)', backgroundColor: 'var(--card-bg)', color: 'var(--text-main)', fontSize: '0.85rem' }}
                    />
                    <input
                      type="text"
                      required
                      placeholder="Option C"
                      value={newQuestionForm.optionC}
                      onChange={(e) => setNewQuestionForm({ ...newQuestionForm, optionC: e.target.value })}
                      style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--border-color)', backgroundColor: 'var(--card-bg)', color: 'var(--text-main)', fontSize: '0.85rem' }}
                    />
                    <input
                      type="text"
                      required
                      placeholder="Option D"
                      value={newQuestionForm.optionD}
                      onChange={(e) => setNewQuestionForm({ ...newQuestionForm, optionD: e.target.value })}
                      style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--border-color)', backgroundColor: 'var(--card-bg)', color: 'var(--text-main)', fontSize: '0.85rem' }}
                    />
                  </div>

                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <div style={{ flex: 1 }}>
                      <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>Correct Option: </label>
                      <select
                        value={newQuestionForm.correctOption}
                        onChange={(e) => setNewQuestionForm({ ...newQuestionForm, correctOption: e.target.value })}
                        style={{ marginLeft: '0.5rem', padding: '0.35rem', borderRadius: '4px', border: '1px solid var(--border-color)', backgroundColor: 'var(--card-bg)', color: 'var(--text-main)' }}
                      >
                        <option value="A">Option A</option>
                        <option value="B">Option B</option>
                        <option value="C">Option C</option>
                        <option value="D">Option D</option>
                      </select>
                    </div>

                    <div style={{ flex: 1 }}>
                      <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>Difficulty: </label>
                      <select
                        value={newQuestionForm.difficultyLevel}
                        onChange={(e) => setNewQuestionForm({ ...newQuestionForm, difficultyLevel: e.target.value })}
                        style={{ marginLeft: '0.5rem', padding: '0.35rem', borderRadius: '4px', border: '1px solid var(--border-color)', backgroundColor: 'var(--card-bg)', color: 'var(--text-main)' }}
                      >
                        <option value="EASY">EASY</option>
                        <option value="MEDIUM">MEDIUM</option>
                        <option value="HARD">HARD</option>
                      </select>
                    </div>

                    <button type="submit" className="btn btn-primary" style={{ padding: '0.45rem 1rem', fontSize: '0.85rem' }}>
                      Add Item
                    </button>
                  </div>
                </form>
              </div>

              {/* List Existing Questions */}
              {questionModal.loading ? (
                <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>Loading items...</div>
              ) : questionModal.questions.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>No questions found. Add one above!</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {questionModal.questions.map((q, idx) => (
                    <div
                      key={q.id}
                      style={{
                        padding: '0.85rem 1rem',
                        border: '1px solid var(--border-color)',
                        borderRadius: 'var(--radius-sm)',
                        backgroundColor: 'var(--bg-main)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        gap: '1rem'
                      }}
                    >
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>#{idx + 1}</span>
                          <span className={`badge ${q.difficultyLevel === 'EASY' ? 'badge-success' : q.difficultyLevel === 'HARD' ? 'badge-danger' : 'badge-primary'}`} style={{ fontSize: '0.7rem' }}>
                            {q.difficultyLevel}
                          </span>
                          <span style={{ fontSize: '0.75rem', color: 'var(--success)', fontWeight: 700 }}>
                            Ans: {q.correctOption}
                          </span>
                        </div>
                        <div style={{ fontSize: '0.9rem', color: 'var(--text-main)', marginBottom: '0.4rem' }}>
                          {q.text}
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.25rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          <div><strong>A:</strong> {q.optionA}</div>
                          <div><strong>B:</strong> {q.optionB}</div>
                          <div><strong>C:</strong> {q.optionC}</div>
                          <div><strong>D:</strong> {q.optionD}</div>
                        </div>
                      </div>

                      <button
                        onClick={() => handleDeleteQuestion(q.id)}
                        className="btn btn-outline"
                        style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', color: 'var(--danger)', borderColor: 'var(--danger)' }}
                      >
                        Delete
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Learning Resource Modal */}
      {resourceModal.open && (
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
          zIndex: 1000,
          padding: '1rem'
        }}>
          <div style={{
            backgroundColor: 'var(--card-bg)',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border-color)',
            maxWidth: '650px',
            width: '100%',
            maxHeight: '90vh',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: 'var(--shadow-lg)'
          }}>
            <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, color: 'var(--text-main)', fontSize: '1.2rem' }}>
                Resource: {resourceModal.concept?.name}
              </h3>
              <button
                onClick={() => setResourceModal({ open: false, concept: null, resource: null, loading: false })}
                className="btn btn-secondary"
                style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}
              >
                <IconX size={15} stroke={2} />
                <span>Close</span>
              </button>
            </div>

            <form onSubmit={handleSaveResource} style={{ padding: '1.5rem', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.3rem' }}>
                  Module Title
                </label>
                <input
                  type="text"
                  required
                  value={resourceForm.title}
                  onChange={(e) => setResourceForm({ ...resourceForm, title: e.target.value })}
                  style={{ width: '100%', padding: '0.6rem 0.8rem', borderRadius: '4px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-main)', color: 'var(--text-main)', boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.3rem' }}>
                  Short Summary
                </label>
                <input
                  type="text"
                  value={resourceForm.shortExplanation}
                  onChange={(e) => setResourceForm({ ...resourceForm, shortExplanation: e.target.value })}
                  style={{ width: '100%', padding: '0.6rem 0.8rem', borderRadius: '4px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-main)', color: 'var(--text-main)', boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.3rem' }}>
                  Detailed Architectural / Theoretical Breakdown
                </label>
                <textarea
                  rows="4"
                  value={resourceForm.detailedExplanation}
                  onChange={(e) => setResourceForm({ ...resourceForm, detailedExplanation: e.target.value })}
                  style={{ width: '100%', padding: '0.6rem 0.8rem', borderRadius: '4px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-main)', color: 'var(--text-main)', boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.3rem' }}>
                  Key Points
                </label>
                <textarea
                  rows="3"
                  value={resourceForm.keyPoints}
                  onChange={(e) => setResourceForm({ ...resourceForm, keyPoints: e.target.value })}
                  style={{ width: '100%', padding: '0.6rem 0.8rem', borderRadius: '4px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-main)', color: 'var(--text-main)', boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.3rem' }}>
                  Mumbai University Exam Points & Anti-Patterns
                </label>
                <textarea
                  rows="2"
                  value={resourceForm.examPoints}
                  onChange={(e) => setResourceForm({ ...resourceForm, examPoints: e.target.value })}
                  style={{ width: '100%', padding: '0.6rem 0.8rem', borderRadius: '4px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-main)', color: 'var(--text-main)', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setResourceModal({ open: false, concept: null, resource: null, loading: false })}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save Resource
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCurriculumManager;
