import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { IconTarget, IconSparkles, IconArrowRight, IconBook, IconCircleCheck } from '@tabler/icons-react';

const NextActionCard = ({ studentId }) => {
  const { user } = useAuth();
  const activeStudentId = studentId || user?.id || 1;
  const [nextAction, setNextAction] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.get(`/students/${activeStudentId}/next-action`)
      .then(res => {
        setNextAction(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error loading next action", err);
        setLoading(false);
      });
  }, [activeStudentId]);

  if (loading || !nextAction) return null;

  // Concept & target names
  const conceptName = nextAction.conceptName || 'this topic';
  const targetConcept = nextAction.targetConceptName || null;
  const currentProgress = nextAction.currentMastery !== undefined ? Math.round(nextAction.currentMastery) : 0;

  // Clean internal routes and emojis from any text strings
  const sanitize = (text) => {
    if (!text) return '';
    return text
      .replace(/(?:Navigate to\s*)?\/(?:learning|practice|reassessment|adaptive-quiz)\/\d+/gi, '')
      .replace(/[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '')
      .trim();
  };

  // Friendly sentence-case title
  let displayTitle = sanitize(nextAction.title);
  if (!displayTitle || displayTitle.startsWith('Review Foundation:') || displayTitle.includes('PREREQUISITE')) {
    displayTitle = `Start with ${nextAction.subjectName ? nextAction.subjectName + ' ' : ''}${conceptName}`;
  }

  // Friendly badge label (eliminating technical jargon)
  let badgeLabel = nextAction.badge || 'Recommended Next Step';
  let badgeBg = 'var(--primary-light)';
  let badgeColor = 'var(--primary)';

  if (badgeLabel.includes('GAP') || badgeLabel.includes('FIRST')) {
    badgeLabel = 'Recommended First Step';
    badgeBg = 'var(--primary-light)';
    badgeColor = 'var(--primary)';
  } else if (badgeLabel.includes('REASSESS') || badgeLabel.includes('QUIZ')) {
    badgeLabel = 'Quiz Ready';
    badgeBg = 'var(--success-bg)';
    badgeColor = 'var(--success-text)';
  } else if (badgeLabel.includes('PRACTICE')) {
    badgeLabel = 'Practice Next';
    badgeBg = 'var(--warning-bg)';
    badgeColor = 'var(--warning-text)';
  } else if (badgeLabel.includes('UNLOCKED')) {
    badgeLabel = 'Next Topic Ready';
    badgeBg = 'var(--primary-light)';
    badgeColor = 'var(--primary)';
  } else if (badgeLabel.includes('FOUNDATION')) {
    badgeLabel = 'Recommended Topic';
    badgeBg = 'var(--primary-light)';
    badgeColor = 'var(--primary)';
  }

  // Friendly "Why" (Reason)
  let why = sanitize(nextAction.reason);
  if (!why || why.includes('critical prerequisite required for') || why.includes('mastery) is a')) {
    const match = why.match(/^([A-Za-z0-9_\s\-]+?)\s*\(\d+%\s*mastery\)\s*is a critical prerequisite required for\s*([A-Za-z0-9_\s\-]+?)\s*\(/i);
    if (match) {
      const prereq = match[1].trim();
      const target = match[2].trim();
      why = `You should learn ${prereq} first because it is an essential basic concept. You need this concept before learning ${target}.`;
    } else if (targetConcept) {
      why = `You should learn ${conceptName} first because it provides the foundational principles you need before learning ${targetConcept}.`;
    } else {
      why = `You should learn ${conceptName} first because it builds the core foundation you need for this subject.`;
    }
  }

  // Friendly "What to do"
  let whatToDo = sanitize(nextAction.whatToDo);
  if (!whatToDo) {
    if (targetConcept) {
      whatToDo = `Start the ${conceptName} lesson and complete the practice questions. Once you understand ${conceptName}, you can move on to ${targetConcept}.`;
    } else if (nextAction.actionType === 'REASSESS') {
      whatToDo = `Take the quick verification quiz. Reaching 75% or higher will mark ${conceptName} as mastered.`;
    } else if (nextAction.actionType === 'PRACTICE') {
      whatToDo = `Solve the practice questions to test what you have learned and build your confidence.`;
    } else {
      whatToDo = `Start the ${conceptName} lesson and complete the practice questions to master this topic.`;
    }
  }

  // Goal
  const goal = nextAction.goal || 'Reach 75% or higher to master this topic.';

  // Button text
  let actionButtonLabel = sanitize(nextAction.buttonText);
  if (!actionButtonLabel || actionButtonLabel === 'Start Learning' || actionButtonLabel === 'Continue Learning') {
    if (nextAction.actionType === 'REASSESS') {
      actionButtonLabel = `Take quiz on ${conceptName}`;
    } else if (nextAction.actionType === 'PRACTICE') {
      actionButtonLabel = `Practice ${conceptName}`;
    } else {
      actionButtonLabel = `Start learning ${conceptName}`;
    }
  }

  return (
    <div className="card" style={{
      backgroundColor: 'var(--card-bg)',
      color: 'var(--text-main)',
      border: '1px solid var(--border-color)',
      borderLeft: '4px solid var(--primary)',
      boxShadow: 'var(--shadow-md)',
      padding: '1.75rem',
      borderRadius: 'var(--radius-lg)'
    }}>
      {/* Top Header Tag & Badge */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '0.85rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <IconTarget size={20} stroke={2} style={{ color: 'var(--primary)' }} />
          <span style={{ fontSize: '0.8rem', fontWeight: 700, letterSpacing: '0.5px', textTransform: 'uppercase', color: 'var(--primary)' }}>
            What you should learn next
          </span>
        </div>
        <span style={{
          fontSize: '0.75rem',
          fontWeight: 600,
          padding: '0.25rem 0.75rem',
          borderRadius: 'var(--radius-full)',
          backgroundColor: badgeBg,
          color: badgeColor,
          border: '1px solid var(--border-color)'
        }}>
          {badgeLabel}
        </span>
      </div>

      {/* Main Title */}
      <h2 style={{ margin: '0 0 0.85rem 0', fontSize: '1.45rem', fontWeight: 700, color: 'var(--text-main)', letterSpacing: '-0.01em' }}>
        {displayTitle}
      </h2>

      {/* Why you need this topic */}
      <p style={{ margin: '0 0 1rem 0', fontSize: '0.95rem', color: 'var(--text-main)', lineHeight: 1.6 }}>
        {why}
      </p>

      {/* Progress & Goal Box */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '1.5rem',
        flexWrap: 'wrap',
        margin: '1rem 0',
        padding: '0.85rem 1.1rem',
        backgroundColor: 'var(--surface-secondary, var(--bg-main))',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--border-color)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Current progress:</span>
          <strong style={{
            fontSize: '1rem',
            fontFamily: 'JetBrains Mono, monospace',
            color: currentProgress >= 75 ? 'var(--success)' : 'var(--text-main)'
          }}>
            {currentProgress}%
          </strong>
        </div>
        <div style={{ width: '1px', height: '18px', backgroundColor: 'var(--border-color)' }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Mastery goal:</span>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-main)', fontWeight: 600 }}>
            {goal}
          </span>
        </div>
      </div>

      {/* What to do section */}
      <div style={{ margin: '1rem 0 1.5rem 0' }}>
        <div style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--primary)', marginBottom: '0.35rem' }}>
          Next step:
        </div>
        <p style={{ margin: 0, fontSize: '0.92rem', color: 'var(--text-main)', lineHeight: 1.55 }}>
          {whatToDo}
        </p>
      </div>

      {/* Action Buttons */}
      <div style={{ display: 'flex', gap: '0.85rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <Link
          to={nextAction.actionUrl || '/learning-path'}
          className="btn btn-primary"
          style={{
            padding: '0.65rem 1.35rem',
            fontSize: '0.92rem',
            fontWeight: 600,
            borderRadius: 'var(--radius-md)'
          }}
        >
          <IconBook size={18} stroke={1.75} />
          {actionButtonLabel}
          <IconArrowRight size={16} stroke={1.75} />
        </Link>

        <button
          onClick={() => window.dispatchEvent(new CustomEvent('open-ai-assistant', { 
            detail: { 
              conceptId: nextAction.conceptId,
              prompt: `I want to learn about "${conceptName}". Can you explain this topic in simple terms and guide me step-by-step?`
            }
          }))}
          className="btn btn-secondary"
          style={{
            padding: '0.65rem 1.2rem',
            fontSize: '0.9rem',
            fontWeight: 600,
            borderRadius: 'var(--radius-md)'
          }}
        >
          <IconSparkles size={17} stroke={1.75} style={{ color: 'var(--primary)' }} />
          Ask AI tutor about this topic
        </button>
      </div>
    </div>
  );
};

export default NextActionCard;
