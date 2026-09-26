import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

function AdaptiveQuiz() {
  const { conceptId } = useParams();
  const { user } = useAuth();
  const studentId = user?.id || 1;
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [difficulty, setDifficulty] = useState('MEDIUM');
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState(null);
  const [questionCount, setQuestionCount] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [selectedOption, setSelectedOption] = useState('');
  const navigate = useNavigate();

  const fetchQuestion = (diff) => {
    setLoading(true);
    api.get(`/students/${studentId}/adaptive-question?conceptId=${conceptId}&difficulty=${diff}`)
      .then(res => {
        setCurrentQuestion(res.data);
        setDifficulty(res.data.difficulty);
        setSelectedOption('');
        setFeedback(null);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchQuestion('MEDIUM');
    // eslint-disable-next-line
  }, [conceptId, studentId]);

  const handleNext = async () => {
    if (!selectedOption) return;

    const newAnswers = { ...answers, [currentQuestion.questionId]: selectedOption };
    setAnswers(newAnswers);

    try {
      const res = await api.get(`/students/${studentId}/adaptive-check?questionId=${currentQuestion.questionId}&selectedOption=${selectedOption}`);
      const isCorrect = res.data.isCorrect;

      if (isCorrect) {
        setFeedback("Correct! Increasing difficulty.");
        if (difficulty === 'EASY') setDifficulty('MEDIUM');
        else if (difficulty === 'MEDIUM') setDifficulty('HARD');
      } else {
        setFeedback("Incorrect. Reinforcing fundamentals.");
        if (difficulty === 'HARD') setDifficulty('MEDIUM');
        else if (difficulty === 'MEDIUM') setDifficulty('EASY');
      }

      setTimeout(() => {
        if (questionCount < 5) {
          setQuestionCount(prev => prev + 1);
          fetchQuestion(isCorrect ? getNextDiff(difficulty, true) : getNextDiff(difficulty, false));
        } else {
          submitQuiz(newAnswers);
        }
      }, 1500);

    } catch (err) {
      console.error(err);
    }
  };

  const getNextDiff = (current, correct) => {
    if (correct) {
      if (current === 'EASY') return 'MEDIUM';
      return 'HARD';
    } else {
      if (current === 'HARD') return 'MEDIUM';
      return 'EASY';
    }
  };

  const submitQuiz = async (finalAnswers) => {
    setSubmitting(true);
    try {
      const submission = {
        assessmentType: "ADAPTIVE",
        subjectId: null,
        answers: finalAnswers
      };
      const response = await api.post('/assessments/submit', submission);
      navigate(`/reassessment-result/${response.data.attemptId}`);
    } catch (err) {
      console.error("Error submitting", err);
      alert("Submission failed.");
      setSubmitting(false);
    }
  };

  if (loading && !currentQuestion) return (
    <div style={{ textAlign: 'center', padding: '5rem' }}>
      <div style={{ width: '50px', height: '50px', border: '4px solid var(--border-color)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 1.5rem' }}></div>
      <h3 style={{ color: 'var(--text-muted)' }}>Preparing adaptive environment...</h3>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
  
  if (!currentQuestion) return (
    <div className="empty-state" style={{ marginTop: '3rem' }}>
      <div className="empty-state-icon">⚠️</div>
      <h2>Failed to Load</h2>
      <p>Could not load the adaptive question.</p>
      <button className="btn" onClick={() => navigate('/')}>Return to Dashboard</button>
    </div>
  );

  const diffColor = difficulty === 'HARD' ? 'var(--danger)' : difficulty === 'MEDIUM' ? 'var(--warning)' : 'var(--success)';
  const progressPercent = (questionCount / 5) * 100;

  return (
    <div className="adaptive-quiz-page" style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div className="page-header" style={{ alignItems: 'center' }}>
        <div>
          <h1>Adaptive Quiz</h1>
          <p style={{ margin: 0 }}>Difficulty automatically scales with your performance.</p>
        </div>
      </div>
      
      <div className="progress-wrapper" style={{ marginBottom: '2rem', height: '10px' }}>
        <div className="progress-fill" style={{ width: `${progressPercent}%`, backgroundColor: 'var(--primary)' }}></div>
      </div>
      
      <div className="card" style={{ padding: '2.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <span className="badge" style={{ backgroundColor: '#f1f5f9', color: 'var(--text-muted)' }}>
            Concept: <strong style={{ color: 'var(--text-main)' }}>{currentQuestion.conceptName}</strong>
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: '600' }}>
              Level: <strong style={{ color: diffColor }}>{difficulty}</strong>
            </span>
            <span className="badge badge-primary">Q{questionCount} of 5</span>
          </div>
        </div>
        
        <h2 style={{ fontSize: '1.4rem', lineHeight: '1.5', marginBottom: '2rem', color: 'var(--text-main)' }}>
          {currentQuestion.questionText}
        </h2>
        
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {['A', 'B', 'C', 'D'].map(opt => {
            const optionText = currentQuestion[`option${opt}`];
            const isSelected = selectedOption === opt;
            return (
              <label 
                key={opt} 
                className={`radio-option ${isSelected ? 'selected' : ''}`}
                style={{ opacity: feedback && !isSelected ? 0.6 : 1 }}
              >
                <input 
                  type="radio" 
                  name="option" 
                  value={opt} 
                  checked={isSelected}
                  onChange={() => setSelectedOption(opt)}
                  disabled={feedback !== null}
                />
                <span style={{ fontWeight: isSelected ? '600' : '500' }}>
                  <span style={{ opacity: 0.6, marginRight: '0.5rem' }}>{opt}.</span> 
                  {optionText}
                </span>
              </label>
            );
          })}
        </div>

        {feedback && (
          <div style={{ padding: '1rem', marginTop: '1.5rem', borderRadius: 'var(--radius-sm)', backgroundColor: feedback.includes('Correct') ? 'var(--success-bg)' : 'var(--danger-bg)', color: feedback.includes('Correct') ? 'var(--success-text)' : 'var(--danger-text)', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: '500' }}>
            <span>{feedback.includes('Correct') ? '✅' : '❌'}</span>
            {feedback}
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '2rem' }}>
          {!feedback && (
            <button className="btn" onClick={handleNext} disabled={submitting || !selectedOption || loading}>
              {submitting ? 'Submitting...' : loading && questionCount > 1 ? 'Loading Next...' : 'Submit Answer'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdaptiveQuiz;
