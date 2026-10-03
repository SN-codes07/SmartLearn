import React from 'react';
import { Link } from 'react-router-dom';
import { MacbookScrollDemo } from '../components/MacbookScrollDemo';

export default function Landing() {
  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '3rem' }}>
      {/* Top Hero Banner */}
      <section style={{
        textAlign: 'center',
        padding: '3rem 1rem 1rem',
        maxWidth: '860px',
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '1.25rem'
      }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '0.4rem 1rem',
          borderRadius: '9999px',
          backgroundColor: 'var(--primary-light)',
          color: 'var(--primary)',
          fontSize: '0.85rem',
          fontWeight: 600,
          border: '1px solid var(--border-color)'
        }}>
          <span>⚡ Next-Generation Adaptive Learning</span>
        </div>

        <h1 style={{
          fontSize: 'clamp(2.2rem, 4.5vw, 3.5rem)',
          fontWeight: 800,
          lineHeight: 1.15,
          letterSpacing: '-0.03em',
          color: 'var(--text-main)',
          margin: 0
        }}>
          Your Personalized AI Learning Platform
        </h1>

        <p style={{
          fontSize: '1.2rem',
          color: 'var(--text-muted)',
          maxWidth: '680px',
          lineHeight: 1.6,
          margin: 0
        }}>
          Learn smarter. Practice adaptively. Master every concept.
        </p>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '1rem',
          marginTop: '0.75rem',
          flexWrap: 'wrap'
        }}>
          <Link to="/signup" className="btn" style={{ padding: '0.75rem 1.75rem', fontSize: '1.05rem' }}>
            Get Started Free →
          </Link>
          <Link to="/login" className="btn btn-secondary" style={{ padding: '0.75rem 1.75rem', fontSize: '1.05rem' }}>
            Sign In to Dashboard
          </Link>
        </div>
      </section>

      {/* MacbookScroll Hero Section */}
      <section style={{
        width: '100%',
        position: 'relative',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border-color)',
        overflow: 'hidden',
        background: 'var(--card-bg)'
      }}>
        <MacbookScrollDemo />
      </section>

      {/* Feature Highlights Grid */}
      <section style={{
        padding: '2rem 0',
        display: 'flex',
        flexDirection: 'column',
        gap: '2rem'
      }}>
        <div style={{ textAlign: 'center', maxWidth: '640px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '1.85rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.5rem' }}>
            Why Engineering Students Choose SmartLearn
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.98rem' }}>
            A complete intelligent ecosystem designed to help you conquer complex technical subjects with zero guesswork.
          </p>
        </div>

        <div className="grid-3" style={{ gap: '1.5rem' }}>
          <div className="card card-hover" style={{ padding: '1.75rem' }}>
            <div style={{
              width: '46px',
              height: '46px',
              borderRadius: '12px',
              backgroundColor: 'var(--primary-light)',
              color: 'var(--primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.4rem',
              marginBottom: '1rem'
            }}>
              🤖
            </div>
            <h3 style={{ fontSize: '1.15rem', marginBottom: '0.5rem', color: 'var(--text-main)' }}>
              Gemini AI Tutor
            </h3>
            <p style={{ fontSize: '0.92rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.5 }}>
              Ask anything, receive deep conceptual breakdowns, code analysis, and contextual hints without revealing answers outright.
            </p>
          </div>

          <div className="card card-hover" style={{ padding: '1.75rem' }}>
            <div style={{
              width: '46px',
              height: '46px',
              borderRadius: '12px',
              backgroundColor: 'var(--primary-light)',
              color: 'var(--primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.4rem',
              marginBottom: '1rem'
            }}>
              🎯
            </div>
            <h3 style={{ fontSize: '1.15rem', marginBottom: '0.5rem', color: 'var(--text-main)' }}>
              Prerequisite Gap Analysis
            </h3>
            <p style={{ fontSize: '0.92rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.5 }}>
              Automatic diagnostic testing identifies hidden conceptual gaps and constructs remedial pathways before advanced assessments.
            </p>
          </div>

          <div className="card card-hover" style={{ padding: '1.75rem' }}>
            <div style={{
              width: '46px',
              height: '46px',
              borderRadius: '12px',
              backgroundColor: 'var(--primary-light)',
              color: 'var(--primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.4rem',
              marginBottom: '1rem'
            }}>
              📈
            </div>
            <h3 style={{ fontSize: '1.15rem', marginBottom: '0.5rem', color: 'var(--text-main)' }}>
              Adaptive Quizzing & Progress
            </h3>
            <p style={{ fontSize: '0.92rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.5 }}>
              Question difficulty dynamically scales with your performance, providing real-time tracking toward ≥75% course certification.
            </p>
          </div>
        </div>
      </section>

      {/* Bottom CTA Card */}
      <section className="card" style={{
        padding: '3rem 2rem',
        textAlign: 'center',
        background: 'linear-gradient(135deg, var(--card-bg) 0%, var(--surface-secondary) 100%)',
        border: '1px solid var(--border-color)',
        borderRadius: 'var(--radius-lg)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '1rem',
        marginBottom: '2rem'
      }}>
        <h2 style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-main)', margin: 0 }}>
          Ready to Elevate Your Engineering Studies?
        </h2>
        <p style={{ color: 'var(--text-muted)', maxWidth: '540px', fontSize: '0.98rem', margin: 0 }}>
          Join SmartLearn today and experience adaptive, student-centric mastery backed by modern artificial intelligence.
        </p>
        <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem', flexWrap: 'wrap', justifyContent: 'center' }}>
          <Link to="/signup" className="btn" style={{ padding: '0.7rem 1.75rem' }}>
            Create Your Free Account
          </Link>
          <Link to="/login" className="btn btn-secondary" style={{ padding: '0.7rem 1.75rem' }}>
            Log In
          </Link>
        </div>
      </section>
    </div>
  );
}
