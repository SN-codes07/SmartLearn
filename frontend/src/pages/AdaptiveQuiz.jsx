import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { IconBrain, IconCircleCheck, IconAlertTriangle, IconFlame, IconArrowRight } from '@tabler/icons-react';

function AdaptiveQuiz() {
  const { conceptId } = useParams();
  const { user } = useAuth();
  const studentId = user?.id || 1;
  const navigate = useNavigate();

  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [difficulty, setDifficulty] = useState('MEDIUM');
  const [answers, setAnswers] = useState({});
  const [askedQuestionIds, setAskedQuestionIds] = useState([]);
  const [sessionHistory, setSessionHistory] = useState([]); // [{ isCorrect, difficulty }]
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState(null);
  const [questionCount, setQuestionCount] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [selectedOption, setSelectedOption] = useState('');
  const [initialCalibrated, setInitialCalibrated] = useState(false);

  // 1. Initial difficulty calibration based on prior student profile
  useEffect(() => {
    let initialDiff = 'MEDIUM';
    api.get(`/students/${studentId}/profile`)
      .then(res => {
        const perf = res.data?.concepts?.find(c => String(c.conceptId) === String(conceptId));
        if (perf) {
          if (perf.score < 50) initialDiff = 'EASY';
          else if (perf.score >= 80) initialDiff = 'HARD';
          else initialDiff = 'MEDIUM';
        }
      })
      .catch(() => {
        initialDiff = 'MEDIUM';
      })
      .finally(() => {
        setDifficulty(initialDiff);
        setInitialCalibrated(true);
        fetchNextQuestion(initialDiff, []);
      });
    // eslint-disable-next-line
  }, [conceptId, studentId]);

  const fetchNextQuestion = (targetDiff, excludeList) => {
    setLoading(true);
    const excludeParam = excludeList.length > 0 ? `&excludeIds=${excludeList.join(',')}` : '';
    api.get(`/students/${studentId}/adaptive-question?conceptId=${conceptId}&difficulty=${targetDiff}${excludeParam}`)
      .then(res => {
        setCurrentQuestion(res.data);
        setDifficulty(res.data.difficulty || targetDiff);
        setAskedQuestionIds(prev => [...prev, res.data.questionId]);
        setSelectedOption('');
        setFeedback(null);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error loading adaptive question", err);
        setLoading(false);
      });
  };

  /**
   * Multi-signal Adaptive Progression Engine:
   * Considers recent performance streaks and composite correctness rather than single-question flips.
   */
  const computeNextDifficulty = (currentDiff, newHistory) => {
    const totalAnswered = newHistory.length;
    const lastResult = newHistory[totalAnswered - 1]?.isCorrect;
    
    // Calculate current streaks
    let consecutiveCorrect = 0;
    for (let i = totalAnswered - 1; i >= 0; i--) {
      if (newHistory[i].isCorrect) consecutiveCorrect++;
      else break;
    }

    let consecutiveIncorrect = 0;
    for (let i = totalAnswered - 1; i >= 0; i--) {
      if (!newHistory[i].isCorrect) consecutiveIncorrect++;
      else break;
    }

    const correctCount = newHistory.filter(h => h.isCorrect).length;
    const accuracy = correctCount / totalAnswered;

    if (lastResult) {
      // Correct answer path
      if (currentDiff === 'EASY') {
        return {
          nextDiff: 'MEDIUM',
          reason: 'Correct! Fundamentals verified — advancing difficulty to MEDIUM.'
        };
      }
      if (currentDiff === 'MEDIUM') {
        if (consecutiveCorrect >= 2 || accuracy >= 0.75) {
          return {
            nextDiff: 'HARD',
            reason: `Excellent streak (${consecutiveCorrect} correct)! Scaling up to HARD.`
          };
        }
        return {
          nextDiff: 'MEDIUM',
          reason: 'Correct! Solid grasp — maintaining MEDIUM to test stability.'
        };
      }
      if (currentDiff === 'HARD') {
        return {
          nextDiff: 'HARD',
          reason: 'Outstanding! Sustained HARD level mastery demonstrated.'
        };
      }
    } else {
      // Incorrect answer path
      if (currentDiff === 'HARD') {
        return {
          nextDiff: 'MEDIUM',
          reason: 'Incorrect. Calibrating back to MEDIUM to steady understanding.'
        };
      }
      if (currentDiff === 'MEDIUM') {
        if (consecutiveIncorrect >= 2 || accuracy < 0.5) {
          return {
            nextDiff: 'EASY',
            reason: 'Multiple misses. Adjusting to EASY to rebuild core conceptual foundations.'
          };
        }
        return {
          nextDiff: 'MEDIUM',
          reason: 'Incorrect. Retrying at MEDIUM to give you another chance at this level.'
        };
      }
      if (currentDiff === 'EASY') {
        return {
          nextDiff: 'EASY',
          reason: 'Incorrect. Keeping difficulty at EASY to reinforce basics before advancing.'
        };
      }
    }

    return { nextDiff: currentDiff, reason: lastResult ? 'Correct!' : 'Incorrect.' };
  };

  const handleNext = async () => {
    if (!selectedOption || !currentQuestion) return;

    const newAnswers = { ...answers, [currentQuestion.questionId]: selectedOption };
    setAnswers(newAnswers);

    try {
      const res = await api.get(`/students/${studentId}/adaptive-check?questionId=${currentQuestion.questionId}&selectedOption=${selectedOption}`);
      const isCorrect = res.data.isCorrect;

      const updatedHistory = [...sessionHistory, { isCorrect, difficulty }];
      setSessionHistory(updatedHistory);

      const adaptation = computeNextDifficulty(difficulty, updatedHistory);
      setFeedback({
        isCorrect,
        message: adaptation.reason,
        nextDiff: adaptation.nextDiff
      });

      setTimeout(() => {
        if (questionCount < 5) {
          setQuestionCount(prev => prev + 1);
          const updatedExcludes = [...askedQuestionIds, currentQuestion.questionId];
          fetchNextQuestion(adaptation.nextDiff, updatedExcludes);
        } else {
          submitQuiz(newAnswers);
        }
      }, 1600);

    } catch (err) {
      console.error("Adaptive answer check error", err);
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
      console.error("Error submitting adaptive quiz", err);
      alert("Submission failed. Returning to dashboard.");
      navigate('/');
    }
  };

  if (loading && !currentQuestion) return (
    <div style={{ textAlign: 'center', padding: '5rem' }}>
      <div style={{ width: '50px', height: '50px', border: '4px solid var(--border-color)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 1.5rem' }}></div>
      <h3 style={{ color: 'var(--text-muted)' }}>Calibrating dynamic adaptive environment...</h3>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
  
  if (!currentQuestion) return (
    <div className="empty-state" style={{ marginTop: '3rem' }}>
      <div className="empty-state-icon" style={{ display: 'flex', justifyContent: 'center' }}>
        <IconAlertTriangle size={40} stroke={1.75} style={{ color: 'var(--warning)' }} />
      </div>
      <h2>Adaptive question unavailable</h2>
      <p>We could not find questions for this concept right now.</p>
      <button className="btn" onClick={() => navigate('/')}>Return to Dashboard</button>
    </div>
  );

  const diffColor = difficulty === 'HARD' ? 'var(--danger)' : difficulty === 'MEDIUM' ? 'var(--warning)' : 'var(--success)';
  const progressPercent = (questionCount / 5) * 100;

  let currentStreak = 0;
  for (let i = sessionHistory.length - 1; i >= 0; i--) {
    if (sessionHistory[i].isCorrect) currentStreak++;
    else break;
  }

  return (
    <div className="adaptive-quiz-page" style={{ maxWidth: '820px', margin: '0 auto', padding: '0.5rem 0' }}>
      {/* Header */}
      <div className="page-header" style={{ alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
        <div>
          <h1 style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', margin: '0 0 0.35rem 0', fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-main)' }}>
            <IconBrain size={24} stroke={1.75} style={{ color: 'var(--primary)' }} />
            Adaptive assessment engine
          </h1>
          <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.88rem' }}>
            Real-time multi-signal difficulty scaling based on question streaks and accuracy (Easy ➔ Medium ➔ Hard).
          </p>
        </div>

        {/* Live Metrics Strip */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
          {currentStreak > 0 && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: '0.35rem',
              padding: '0.4rem 0.8rem', borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--warning-bg)', border: '1px solid var(--warning)',
              color: 'var(--warning-text)', fontSize: '0.8rem', fontWeight: 700
            }}>
              <IconFlame size={16} stroke={2} />
              <span>{currentStreak} Streak</span>
            </div>
          )}

          <div style={{
            display: 'flex', alignItems: 'center', gap: '0.5rem',
            padding: '0.4rem 0.85rem', borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--card-bg)', border: '1px solid var(--border-color)',
            boxShadow: 'var(--shadow-sm)'
          }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', color: 'var(--text-muted)' }}>Difficulty:</span>
            <span style={{
              fontSize: '0.8rem', fontWeight: 800,
              fontFamily: 'var(--font-mono, monospace)',
              color: diffColor, padding: '0.15rem 0.55rem',
              borderRadius: 'var(--radius-sm)', backgroundColor: `${diffColor}22`
            }}>
              {difficulty}
            </span>
          </div>
        </div>
      </div>
      
      {/* Progress Bar */}
      <div className="progress-wrapper" style={{ marginBottom: '1.75rem', height: '8px' }}>
        <div className="progress-fill" style={{ width: `${progressPercent}%`, backgroundColor: 'var(--primary)' }}></div>
      </div>
      
      {/* Question Card */}
      <div className="card auth-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <span className="badge" style={{ backgroundColor: 'var(--bg-color)', color: 'var(--text-main)', border: '1px solid var(--border-color)', textTransform: 'none', fontSize: '0.82rem' }}>
            Target: <strong style={{ marginLeft: '0.35rem', color: 'var(--primary)' }}>{currentQuestion.conceptName}</strong>
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span className="badge badge-primary" style={{ fontFamily: 'var(--font-mono, monospace)', fontSize: '0.78rem', letterSpacing: '0.02em' }}>
              Question {questionCount} of 5
            </span>
          </div>
        </div>
        
        <h2 style={{ fontSize: '1.25rem', lineHeight: '1.55', marginBottom: '1.75rem', color: 'var(--text-main)', fontWeight: 600 }}>
          {currentQuestion.questionText}
        </h2>
        
        {/* Radio Options */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {['A', 'B', 'C', 'D'].map(opt => {
            const optionText = currentQuestion[`option${opt}`];
            const isSelected = selectedOption === opt;
            return (
              <label 
                key={opt} 
                className={`radio-option ${isSelected ? 'selected' : ''}`}
                style={{ opacity: feedback && !isSelected ? 0.6 : 1, margin: 0, padding: '0.9rem 1.1rem' }}
              >
                <input 
                  type="radio" 
                  name="option" 
                  value={opt} 
                  checked={isSelected}
                  onChange={() => setSelectedOption(opt)}
                  disabled={feedback !== null}
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

        {/* Dynamic Adaptive Feedback Banner */}
        {feedback && (
          <div style={{ 
            padding: '1rem 1.25rem', marginTop: '1.5rem', borderRadius: 'var(--radius-md)', 
            backgroundColor: feedback.isCorrect ? 'var(--success-bg)' : 'var(--danger-bg)', 
            color: feedback.isCorrect ? 'var(--success-text)' : 'var(--danger-text)', 
            border: `1px solid ${feedback.isCorrect ? 'var(--success)' : 'var(--danger)'}`,
            display: 'flex', alignItems: 'center', gap: '0.75rem', fontWeight: 600, fontSize: '0.9rem' 
          }}>
            <span style={{ display: 'flex', alignItems: 'center' }}>
              {feedback.isCorrect ? <IconCircleCheck size={22} stroke={2} /> : <IconAlertTriangle size={22} stroke={2} />}
            </span>
            <div>
              <div>{feedback.message}</div>
              <div style={{ fontSize: '0.8rem', opacity: 0.9, marginTop: '0.2rem' }}>
                Next calibration: <strong style={{ fontFamily: 'var(--font-mono, monospace)' }}>{feedback.nextDiff}</strong> level
              </div>
            </div>
          </div>
        )}

        {/* Submit & Next Button */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.75rem' }}>
          {!feedback && (
            <button 
              className="btn btn-primary" 
              onClick={handleNext} 
              disabled={submitting || !selectedOption || loading}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.7rem 1.5rem', fontSize: '0.95rem' }}
            >
              {submitting ? 'Submitting assessment...' : loading && questionCount > 1 ? 'Calibrating level...' : 'Submit answer'}
              <IconArrowRight size={16} stroke={2} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdaptiveQuiz;
