import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
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
    <div style={{ textAlign: 'center', padding: '5rem' }}>
      <div style={{ width: '50px', height: '50px', border: '4px solid var(--border-color)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 1.5rem' }}></div>
      <h3 style={{ color: 'var(--text-muted)' }}>Loading assessment...</h3>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
  
  if (questions.length === 0) return (
    <div className="empty-state" style={{ marginTop: '3rem' }}>
      <div className="empty-state-icon">⚠️</div>
      <h2>No Questions Found</h2>
      <p>Make sure backend data is initialized and available.</p>
      <button className="btn" onClick={() => navigate('/')}>Return to Dashboard</button>
    </div>
  );

  const currentQ = questions[currentIndex];
  const progressPercent = ((currentIndex + 1) / questions.length) * 100;
  const isLast = currentIndex === questions.length - 1;

  return (
    <div className="assessment" style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div className="page-header" style={{ alignItems: 'center' }}>
        <h1>{type === 'DIAGNOSTIC' ? 'Diagnostic Assessment' : 'Assessment'}</h1>
        <span className="badge badge-primary" style={{ padding: '0.5rem 1rem' }}>
          Question {currentIndex + 1} of {questions.length}
        </span>
      </div>
      
      <div className="progress-wrapper" style={{ marginBottom: '2rem', height: '10px' }}>
        <div className="progress-fill" style={{ width: `${progressPercent}%`, backgroundColor: 'var(--primary)' }}></div>
      </div>
      
      <div className="card" style={{ padding: '2.5rem' }}>
        <h2 style={{ fontSize: '1.4rem', lineHeight: '1.5', marginBottom: '2rem', color: 'var(--text-main)' }}>
          {currentQ.text}
        </h2>
        
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {['A', 'B', 'C', 'D'].map(opt => {
            const optionText = currentQ[`option${opt}`];
            const isSelected = answers[currentQ.id] === opt;
            return (
              <label 
                key={opt} 
                className={`radio-option ${isSelected ? 'selected' : ''}`}
              >
                <input 
                  type="radio" 
                  name={`q-${currentQ.id}`} 
                  value={opt} 
                  checked={isSelected}
                  onChange={() => handleOptionSelect(currentQ.id, opt)}
                />
                <span style={{ fontWeight: isSelected ? '600' : '500' }}>
                  <span style={{ opacity: 0.6, marginRight: '0.5rem' }}>{opt}.</span> 
                  {optionText}
                </span>
              </label>
            );
          })}
        </div>
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
          <button 
            className="btn" 
            onClick={() => setCurrentIndex(prev => Math.min(questions.length - 1, prev + 1))}
            disabled={!answers[currentQ.id]}
          >
            Next Question
          </button>
        ) : (
          <button 
            className="btn btn-success" 
            onClick={handleSubmit}
            disabled={submitting || Object.keys(answers).length < questions.length}
          >
            {submitting ? 'Submitting...' : 'Submit Assessment'}
          </button>
        )}
      </div>
    </div>
  );
}

export default Assessment;
