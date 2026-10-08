import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  IconAlertTriangle, 
  IconArrowLeft, 
  IconArrowRight, 
  IconCircleCheck 
} from '@tabler/icons-react';
import api from '../services/api';

function Assessment() {
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();
  
  const queryParams = new URLSearchParams(location.search);
  const type = queryParams.get('type') || 'DIAGNOSTIC';
  const subjectId = queryParams.get('subjectId');
  const conceptId = queryParams.get('conceptId');

  useEffect(() => {
    let endpoint = '/questions/diagnostic';
    if (type === 'SUBJECT' && subjectId) {
      endpoint = `/subjects/${subjectId}/questions`;
    } else if (type === 'CONCEPT' && conceptId) {
      // Use the practice endpoint to get concept questions
      endpoint = `/students/1/practice/${conceptId}`;
    }
      
    api.get(endpoint)
      .then(res => {
        setQuestions(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching questions", err);
        setLoading(false);
      });
  }, [type, subjectId, conceptId]);

  const handleOptionSelect = (questionId, option) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: option
    }));
  };

  const handleSubmit = async () => {
    if (Object.keys(answers).length < questions.length) {
      alert("Please answer all questions before submitting.");
      return;
    }
    
    setSubmitting(true);
    try {
      const submission = {
        assessmentType: type,
        subjectId: type === 'SUBJECT' ? parseInt(subjectId) : null,
        answers: answers
      };
      
      const response = await api.post('/assessments/submit', submission);
      navigate(`/result/${response.data.attemptId}`);
    } catch (err) {
      console.error("Error submitting assessment", err);
      alert("Submission failed. Check console.");
      setSubmitting(false);
    }
  };

  if (loading) return (
    <div style={{ textAlign: 'center', padding: '5rem 1rem' }}>
      <div style={{ width: '42px', height: '42px', border: '3px solid var(--border-color)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 1.5rem' }}></div>
      <h3 style={{ color: 'var(--text-muted)', fontSize: '0.95rem', fontWeight: 500 }}>Loading assessment...</h3>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
  
  if (questions.length === 0) return (
    <div className="empty-state" style={{ marginTop: '3rem' }}>
      <div className="empty-state-icon" style={{ display: 'flex', justifyContent: 'center' }}>
        <IconAlertTriangle size={36} stroke={1.75} style={{ color: 'var(--warning)' }} />
      </div>
      <h2>No questions found</h2>
      <p>Make sure backend data is initialized and available.</p>
      <button className="btn btn-secondary" onClick={() => navigate('/')}>Return to Dashboard</button>
    </div>
  );

  const currentQ = questions[currentIndex];
  const progressPercent = ((currentIndex + 1) / questions.length) * 100;
  const isLast = currentIndex === questions.length - 1;

  return (
    <div className="assessment" style={{ maxWidth: '820px', margin: '0 auto', padding: '0.5rem 0' }}>
      <div className="page-header" style={{ alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1.25rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700, margin: '0 0 0.35rem', color: 'var(--text-main)' }}>
            {type === 'DIAGNOSTIC' ? 'Diagnostic assessment' : 'Curriculum assessment'}
          </h1>
          <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.88rem' }}>
            Answer each question to benchmark your knowledge profile and uncover prerequisites.
          </p>
        </div>
        <span className="badge badge-primary" style={{ fontFamily: 'var(--font-mono, monospace)', padding: '0.4rem 0.85rem', fontSize: '0.8rem', letterSpacing: '0.02em' }}>
          Question {currentIndex + 1} of {questions.length}
        </span>
      </div>
      
      <div className="progress-wrapper" style={{ marginBottom: '1.75rem', height: '8px' }}>
        <div className="progress-fill" style={{ width: `${progressPercent}%`, backgroundColor: 'var(--primary)' }}></div>
      </div>
      
      <div className="card auth-card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
          <span style={{ 
            fontFamily: 'var(--font-mono, monospace)', 
            fontSize: '0.78rem', 
            fontWeight: 700, 
            color: 'var(--primary)',
            backgroundColor: 'var(--primary-light)',
            padding: '0.2rem 0.55rem',
            borderRadius: 'var(--radius-sm)'
          }}>
            Q{currentIndex + 1}
          </span>
          {currentQ.conceptName && (
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Topic: <strong style={{ color: 'var(--text-main)', fontWeight: 600 }}>{currentQ.conceptName}</strong>
            </span>
          )}
        </div>

        <h2 style={{ fontSize: '1.25rem', lineHeight: '1.55', marginBottom: '1.75rem', color: 'var(--text-main)', fontWeight: 600 }}>
          {currentQ.text}
        </h2>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {['A', 'B', 'C', 'D'].map(opt => {
            const optionText = currentQ[`option${opt}`];
            const isSelected = answers[currentQ.id] === opt;
            return (
              <label 
                key={opt} 
                className={`radio-option ${isSelected ? 'selected' : ''}`}
                style={{ margin: 0, padding: '0.9rem 1.1rem' }}
              >
                <input 
                  type="radio" 
                  name={`q-${currentQ.id}`} 
                  value={opt} 
                  checked={isSelected}
                  onChange={() => handleOptionSelect(currentQ.id, opt)}
                />
                <span style={{ fontWeight: isSelected ? '600' : '400', color: 'var(--text-main)', fontSize: '0.92rem' }}>
                  <span style={{ 
                    fontFamily: 'var(--font-mono, monospace)', 
                    fontWeight: 700, 
                    marginRight: '0.5rem',
                    color: isSelected ? 'var(--primary)' : 'var(--text-muted)'
                  }}>
                    {opt}.
                  </span> 
                  {optionText}
                </span>
              </label>
            );
          })}
        </div>
      </div>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.75rem', gap: '1rem', flexWrap: 'wrap' }}>
        <button 
          className="btn btn-secondary" 
          onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
          disabled={currentIndex === 0 || submitting}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
        >
          <IconArrowLeft size={16} stroke={2} />
          Previous
        </button>
        
        {!isLast ? (
          <button 
            className="btn btn-primary" 
            onClick={() => setCurrentIndex(prev => Math.min(questions.length - 1, prev + 1))}
            disabled={!answers[currentQ.id]}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
          >
            Next question
            <IconArrowRight size={16} stroke={2} />
          </button>
        ) : (
          <button 
            className="btn btn-success" 
            onClick={handleSubmit}
            disabled={submitting || Object.keys(answers).length < questions.length}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
          >
            <IconCircleCheck size={18} stroke={2} />
            {submitting ? 'Submitting...' : 'Submit assessment'}
          </button>
        )}
      </div>
    </div>
  );
}

export default Assessment;
