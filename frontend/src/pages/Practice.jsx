import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import MistakeAnalysisCard from '../components/MistakeAnalysisCard';

function Practice({ type }) {
  const { conceptId } = useParams();
  const { user } = useAuth();
  const studentId = user?.id || 1;
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [revealed, setRevealed] = useState({});
  const [mistakeAnalyses, setMistakeAnalyses] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    const endpoint = type === 'PRACTICE' 
      ? `/students/${studentId}/practice/${conceptId}` 
      : `/students/${studentId}/reassessment/${conceptId}`;
      
    api.get(endpoint)
      .then(res => {
        setQuestions(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching questions", err);
        setLoading(false);
      });
  }, [conceptId, type, studentId]);

  const handleOptionSelect = (questionId, option) => {
    if (type === 'PRACTICE' && revealed[questionId]) return;
    
    setAnswers(prev => ({
      ...prev,
      [questionId]: option
    }));
  };

  const handleReveal = async (questionId) => {
    if (!answers[questionId]) return;
    const q = questions.find(q => q.id === questionId);
    const isCorrect = answers[questionId] === q.correctOption;
    if (isCorrect) setScore(prev => prev + 1);
    
    setRevealed(prev => ({
      ...prev,
      [questionId]: true
    }));

    if (!isCorrect && type === 'PRACTICE') {
      try {
        const res = await api.post(`/students/${studentId}/analyze-mistake`, {
          questionId: questionId,
          selectedOption: answers[questionId]
        });
        setMistakeAnalyses(prev => ({
          ...prev,
          [questionId]: res.data
        }));
      } catch (err) {
        console.error("Could not fetch mistake analysis", err);
      }
    }
  };

  const handleTrySimilar = async (similarQuestionId) => {
    try {
      const res = await api.get(`/students/${studentId}/similar-question/${similarQuestionId}`);
      if (res.data) {
        setQuestions(prev => [...prev, res.data]);
        setCurrentIndex(questions.length); // move to newly added question
      }
    } catch (err) {
      console.error("Could not load similar question", err);
    }
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
        subjectId: null,
        answers: answers
      };
      
      const response = await api.post('/assessments/submit', submission);
      navigate(`/reassessment-result/${response.data.attemptId}`);
    } catch (err) {
      console.error("Error submitting", err);
      alert("Submission failed.");
      setSubmitting(false);
    }
  };

  if (loading) return (
    <div style={{ textAlign: 'center', padding: '5rem' }}>
      <div style={{ width: '50px', height: '50px', border: '4px solid var(--border-color)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 1.5rem' }}></div>
      <h3 style={{ color: 'var(--text-muted)' }}>Loading {type.toLowerCase()}...</h3>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  if (questions.length === 0) return (
    <div className="empty-state" style={{ marginTop: '3rem' }}>
      <div className="empty-state-icon">⚠️</div>
      <h2>No Questions Available</h2>
      <p>No questions found for this concept right now.</p>
      <button className="btn" onClick={() => navigate('/')}>Return to Dashboard</button>
    </div>
  );

  const currentQ = questions[currentIndex];
  const progressPercent = ((currentIndex + 1) / questions.length) * 100;
  const isLast = currentIndex === questions.length - 1;
  const isRevealed = revealed[currentQ.id];
  const isCorrect = isRevealed && answers[currentQ.id] === currentQ.correctOption;

  return (
    <div className="practice-page" style={{ maxWidth: '820px', margin: '0 auto' }}>
      <div className="page-header" style={{ alignItems: 'center' }}>
        <div>
          <h1>{type === 'PRACTICE' ? '🎯 Targeted Practice Mode' : '📝 Verification Re-assessment'}</h1>
          <p style={{ margin: 0, color: 'var(--text-muted)' }}>
            {type === 'PRACTICE' ? 'Instant misconception diagnosis and remedial feedback' : 'Requires ≥ 75% score to achieve MASTERED status'}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          {type === 'PRACTICE' && (
            <span className="badge" style={{ backgroundColor: 'var(--success-bg)', color: 'var(--success)', fontSize: '0.85rem' }}>
              Score: {score}/{Object.keys(revealed).length}
            </span>
          )}
          <span className="badge badge-primary" style={{ padding: '0.5rem 1rem' }}>
            Question {currentIndex + 1} of {questions.length}
          </span>
        </div>
      </div>
      
      <div className="progress-wrapper" style={{ marginBottom: '2rem', height: '10px' }}>
        <div className="progress-fill" style={{ width: `${progressPercent}%`, backgroundColor: 'var(--primary)' }}></div>
      </div>
      
      <div className="card" style={{ padding: '2.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <h2 style={{ fontSize: '1.3rem', lineHeight: '1.5', margin: 0, color: 'var(--text-main)', flex: 1 }}>
            {currentQ.text}
          </h2>
          <span className={`badge badge-${currentQ.difficultyLevel === 'HARD' ? 'danger' : currentQ.difficultyLevel === 'MEDIUM' ? 'warning' : 'success'}`} style={{ height: 'fit-content' }}>
            {currentQ.difficultyLevel}
          </span>
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {['A', 'B', 'C', 'D'].map(opt => {
            const optionText = currentQ[`option${opt}`];
            const isSelected = answers[currentQ.id] === opt;
            
            let optionStyle = {};
            if (type === 'PRACTICE' && isRevealed) {
              if (currentQ.correctOption === opt) {
                optionStyle = { backgroundColor: '#f0fdf4', borderColor: '#86efac', color: '#166534' };
              } else if (isSelected) {
                optionStyle = { backgroundColor: '#fef2f2', borderColor: '#fca5a5', color: '#991b1b' };
              } else {
                optionStyle = { opacity: 0.5 };
              }
            }

            return (
              <label 
                key={opt} 
                className={`radio-option ${isSelected ? 'selected' : ''}`}
                style={{ ...optionStyle, cursor: (type === 'PRACTICE' && isRevealed) ? 'default' : 'pointer' }}
              >
                <input 
                  type="radio" 
                  name={`q-${currentQ.id}`} 
                  value={opt} 
                  checked={isSelected}
                  onChange={() => handleOptionSelect(currentQ.id, opt)}
                  disabled={type === 'PRACTICE' && isRevealed}
                />
                <span style={{ fontWeight: isSelected ? '600' : '500' }}>
                  <span style={{ opacity: 0.6, marginRight: '0.5rem' }}>{opt}.</span> 
                  {optionText}
                </span>
                
                {type === 'PRACTICE' && isRevealed && currentQ.correctOption === opt && (
                  <span style={{ marginLeft: 'auto' }}>✅</span>
                )}
                {type === 'PRACTICE' && isRevealed && isSelected && currentQ.correctOption !== opt && (
                  <span style={{ marginLeft: 'auto' }}>❌</span>
                )}
              </label>
            );
          })}
        </div>
        
        {/* Correct feedback */}
        {type === 'PRACTICE' && isRevealed && isCorrect && (
          <div style={{ marginTop: '2rem', padding: '1.25rem', backgroundColor: '#f0fdf4', borderRadius: 'var(--radius-md)', border: '1px solid #bbf7d0', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span style={{ fontSize: '1.5rem' }}>🎉</span>
            <div>
              <h4 style={{ margin: '0 0 0.25rem 0', color: '#166534' }}>Correct! Great understanding.</h4>
              <p style={{ margin: 0, fontSize: '0.85rem', color: '#15803d' }}>
                Your choice matches the foundational specification for this concept.
              </p>
            </div>
          </div>
        )}

        {/* Deep Misconception Analysis for Incorrect Answer */}
        {type === 'PRACTICE' && isRevealed && !isCorrect && (
          <MistakeAnalysisCard
            analysis={mistakeAnalyses[currentQ.id]}
            onTrySimilar={handleTrySimilar}
          />
        )}
      </div>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2rem' }}>
        <button 
          className="btn btn-secondary" 
          onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
          disabled={currentIndex === 0 || submitting}
        >
          Previous
        </button>
        
        {!isLast ? (
          type === 'PRACTICE' && !isRevealed ? (
            <button 
              className="btn" 
              onClick={() => handleReveal(currentQ.id)}
              disabled={!answers[currentQ.id]}
            >
              Check Answer
            </button>
          ) : (
            <button 
              className="btn" 
              onClick={() => setCurrentIndex(prev => Math.min(questions.length - 1, prev + 1))}
              disabled={!answers[currentQ.id]}
            >
              Next Question →
            </button>
          )
        ) : (
          type === 'PRACTICE' && !isRevealed ? (
            <button 
              className="btn" 
              onClick={() => handleReveal(currentQ.id)}
              disabled={!answers[currentQ.id]}
            >
              Check Answer
            </button>
          ) : (
            <button 
              className="btn btn-success" 
              onClick={handleSubmit}
              disabled={submitting || Object.keys(answers).length < questions.length}
            >
              {submitting ? 'Submitting...' : (type === 'PRACTICE' ? 'Finish Practice & Update Profile' : 'Submit Reassessment')}
            </button>
          )
        )}
      </div>
    </div>
  );
}

export default Practice;
