import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  IconBrain,
  IconEye,
  IconEyeOff,
  IconAlertTriangle,
  IconCircleCheck,
  IconUserPlus,
  IconLoader2,
  IconBuildingBank
} from '@tabler/icons-react';

const YEAR_SEMESTER_MAP = {
  '1st Year': [1, 2],
  '2nd Year': [3, 4],
  '3rd Year': [5, 6],
  '4th Year': [7, 8]
};

const BRANCHES = [
  'Computer Engineering',
  'Information Technology',
  'Artificial Intelligence & Data Science',
  'Electronics & Telecommunication (EXTC)',
  'Mechanical Engineering',
  'Civil Engineering',
  'Electrical Engineering'
];

const SignUp = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    studentId: '',
    branch: 'Computer Engineering',
    academicYear: '2nd Year',
    semester: 4
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleYearChange = (e) => {
    const yr = e.target.value;
    const availableSems = YEAR_SEMESTER_MAP[yr] || [1, 2];
    setFormData({
      ...formData,
      academicYear: yr,
      semester: availableSems[0]
    });
    if (error) setError('');
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.name === 'semester' ? parseInt(e.target.value, 10) : e.target.value
    });
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim() || !formData.password || !formData.studentId.trim()) {
      setError('Please fill in all required fields.');
      return;
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    setError('');

    const res = await signup({
      name: formData.name.trim(),
      email: formData.email.trim(),
      password: formData.password,
      confirmPassword: formData.confirmPassword,
      studentId: formData.studentId.trim(),
      branch: formData.branch,
      department: formData.branch,
      academicYear: formData.academicYear,
      semester: formData.semester,
      role: 'STUDENT'
    });

    setLoading(false);
    if (res.success) {
      setSuccess('Account created successfully. Redirecting to sign in…');
      setTimeout(() => {
        navigate('/login', { state: { registered: true, email: formData.email.trim() } });
      }, 1200);
    } else {
      setError(res.error || res.message || 'Registration failed. Email or Student ID may already be registered.');
    }
  };

  return (
    <div style={{
      maxWidth: '560px',
      width: '100%',
      boxSizing: 'border-box',
      margin: '2rem auto',
      padding: '0 0.5rem'
    }}>
      <div className="card auth-card" style={{
        backgroundColor: 'var(--card-bg)',
        border: '1px solid var(--border-color)',
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-sm)'
      }}>
        {/* Header & Academic Eyebrow */}
        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.45rem',
            padding: '0.3rem 0.75rem',
            borderRadius: '2rem',
            backgroundColor: 'var(--bg-inset)',
            border: '1px solid var(--border-color)',
            color: 'var(--text-muted)',
            fontSize: '0.72rem',
            fontFamily: 'var(--font-mono)',
            fontWeight: 600,
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            marginBottom: '1rem'
          }}>
            <IconBrain size={14} stroke={1.75} style={{ color: 'var(--primary)' }} />
            <span>SMARTLEARN • STUDENT ONBOARDING</span>
          </div>
          <h1 style={{
            fontSize: '1.75rem',
            margin: '0 0 0.4rem 0',
            fontWeight: 700,
            color: 'var(--text-main)',
            letterSpacing: '-0.02em'
          }}>
            Create your SmartLearn account
          </h1>
          <p style={{
            margin: 0,
            fontSize: '0.88rem',
            color: 'var(--text-muted)',
            lineHeight: 1.5
          }}>
            Adaptive AI-powered engineering learning with curriculum mastery.
          </p>
        </div>

        {/* Success Alert Banner */}
        {success && (
          <div style={{
            padding: '0.85rem 1rem',
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            border: '1px solid var(--success)',
            borderRadius: 'var(--radius-md)',
            color: 'var(--success)',
            fontSize: '0.85rem',
            marginBottom: '1.25rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.6rem'
          }}>
            <IconCircleCheck size={18} stroke={1.75} style={{ flexShrink: 0 }} />
            <span>{success}</span>
          </div>
        )}

        {/* Error Alert Banner */}
        {error && (
          <div style={{
            padding: '0.85rem 1rem',
            backgroundColor: 'var(--danger-bg)',
            border: '1px solid var(--danger)',
            borderRadius: 'var(--radius-md)',
            color: 'var(--danger-text)',
            fontSize: '0.85rem',
            marginBottom: '1.25rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.6rem'
          }}>
            <IconAlertTriangle size={18} stroke={1.75} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.4rem' }}>
          {/* Section 1: Account Identity */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            <div style={{
              fontSize: '0.72rem',
              fontFamily: 'var(--font-mono)',
              fontWeight: 700,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              color: 'var(--text-muted)',
              borderBottom: '1px solid var(--border-color)',
              paddingBottom: '0.35rem'
            }}>
              01 / Account Identity
            </div>

            <div>
              <label
                htmlFor="signup-name"
                style={{
                  display: 'block',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  color: 'var(--text-main)',
                  marginBottom: '0.35rem'
                }}
              >
                Full Name *
              </label>
              <input
                id="signup-name"
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g. John Doe"
                autoComplete="name"
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-color)',
                  backgroundColor: 'var(--bg-main)',
                  color: 'var(--text-main)',
                  fontSize: '0.92rem',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <div className="auth-grid-2">
              <div>
                <label
                  htmlFor="signup-email"
                  style={{
                    display: 'block',
                    fontSize: '0.82rem',
                    fontWeight: 600,
                    color: 'var(--text-main)',
                    marginBottom: '0.35rem'
                  }}
                >
                  Institutional Email *
                </label>
                <input
                  id="signup-email"
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="student@apsit.edu.in"
                  autoComplete="email"
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-color)',
                    backgroundColor: 'var(--bg-main)',
                    color: 'var(--text-main)',
                    fontSize: '0.92rem',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div>
                <label
                  htmlFor="signup-studentId"
                  style={{
                    display: 'block',
                    fontSize: '0.82rem',
                    fontWeight: 600,
                    color: 'var(--text-main)',
                    marginBottom: '0.35rem'
                  }}
                >
                  Student ID / Roll No *
                </label>
                <input
                  id="signup-studentId"
                  type="text"
                  name="studentId"
                  required
                  value={formData.studentId}
                  onChange={handleChange}
                  placeholder="e.g. 123456"
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-color)',
                    backgroundColor: 'var(--bg-main)',
                    color: 'var(--text-main)',
                    fontSize: '0.92rem',
                    fontFamily: 'var(--font-mono)',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
            </div>
          </div>

          {/* Section 2: Academic Profile */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            <div style={{
              fontSize: '0.72rem',
              fontFamily: 'var(--font-mono)',
              fontWeight: 700,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              color: 'var(--text-muted)',
              borderBottom: '1px solid var(--border-color)',
              paddingBottom: '0.35rem'
            }}>
              02 / Academic Profile
            </div>

            <div>
              <label
                htmlFor="signup-branch"
                style={{
                  display: 'block',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  color: 'var(--text-main)',
                  marginBottom: '0.35rem'
                }}
              >
                Engineering Branch (MU) *
              </label>
              <select
                id="signup-branch"
                name="branch"
                value={formData.branch}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-color)',
                  backgroundColor: 'var(--bg-main)',
                  color: 'var(--text-main)',
                  fontSize: '0.92rem',
                  boxSizing: 'border-box'
                }}
              >
                {BRANCHES.map(b => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            </div>

            <div className="auth-grid-2">
              <div>
                <label
                  htmlFor="signup-year"
                  style={{
                    display: 'block',
                    fontSize: '0.82rem',
                    fontWeight: 600,
                    color: 'var(--text-main)',
                    marginBottom: '0.35rem'
                  }}
                >
                  Academic Year *
                </label>
                <select
                  id="signup-year"
                  name="academicYear"
                  value={formData.academicYear}
                  onChange={handleYearChange}
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-color)',
                    backgroundColor: 'var(--bg-main)',
                    color: 'var(--text-main)',
                    fontSize: '0.92rem',
                    boxSizing: 'border-box'
                  }}
                >
                  <option value="1st Year">1st Year (FE)</option>
                  <option value="2nd Year">2nd Year (SE)</option>
                  <option value="3rd Year">3rd Year (TE)</option>
                  <option value="4th Year">4th Year (BE)</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="signup-semester"
                  style={{
                    display: 'block',
                    fontSize: '0.82rem',
                    fontWeight: 600,
                    color: 'var(--text-main)',
                    marginBottom: '0.35rem'
                  }}
                >
                  Semester *
                </label>
                <select
                  id="signup-semester"
                  name="semester"
                  value={formData.semester}
                  onChange={handleChange}
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-color)',
                    backgroundColor: 'var(--bg-main)',
                    color: 'var(--text-main)',
                    fontSize: '0.92rem',
                    boxSizing: 'border-box'
                  }}
                >
                  {(YEAR_SEMESTER_MAP[formData.academicYear] || [1, 2]).map(sem => (
                    <option key={sem} value={sem}>Semester {sem}</option>
                  ))}
                </select>
              </div>
            </div>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              fontSize: '0.75rem',
              color: 'var(--text-muted)',
              backgroundColor: 'var(--bg-inset)',
              padding: '0.5rem 0.75rem',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-color)'
            }}>
              <IconBuildingBank size={14} stroke={1.75} style={{ color: 'var(--primary)', flexShrink: 0 }} />
              <span>Curriculum aligned with University of Mumbai (Rev-2019 &apos;C&apos; Scheme / NEP-2020)</span>
            </div>
          </div>

          {/* Section 3: Security Credentials */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            <div style={{
              fontSize: '0.72rem',
              fontFamily: 'var(--font-mono)',
              fontWeight: 700,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              color: 'var(--text-muted)',
              borderBottom: '1px solid var(--border-color)',
              paddingBottom: '0.35rem'
            }}>
              03 / Security Credentials
            </div>

            <div className="auth-grid-2">
              <div>
                <label
                  htmlFor="signup-password"
                  style={{
                    display: 'block',
                    fontSize: '0.82rem',
                    fontWeight: 600,
                    color: 'var(--text-main)',
                    marginBottom: '0.35rem'
                  }}
                >
                  Password *
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    id="signup-password"
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Min. 6 characters"
                    autoComplete="new-password"
                    style={{
                      width: '100%',
                      padding: '0.75rem 2.5rem 0.75rem 1rem',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border-color)',
                      backgroundColor: 'var(--bg-main)',
                      color: 'var(--text-main)',
                      fontSize: '0.92rem',
                      boxSizing: 'border-box'
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    style={{
                      position: 'absolute',
                      right: '0.5rem',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      padding: '0.4rem',
                      color: 'var(--text-muted)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    {showPassword ? <IconEyeOff size={18} stroke={1.75} /> : <IconEye size={18} stroke={1.75} />}
                  </button>
                </div>
                {formData.password && formData.password.length < 6 && (
                  <div style={{ fontSize: '0.75rem', color: 'var(--danger)', marginTop: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <IconAlertTriangle size={13} stroke={2} />
                    <span>Password must be at least 6 characters.</span>
                  </div>
                )}
              </div>

              <div>
                <label
                  htmlFor="signup-confirmPassword"
                  style={{
                    display: 'block',
                    fontSize: '0.82rem',
                    fontWeight: 600,
                    color: 'var(--text-main)',
                    marginBottom: '0.35rem'
                  }}
                >
                  Confirm Password *
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    id="signup-confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    required
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Re-enter password"
                    autoComplete="new-password"
                    style={{
                      width: '100%',
                      padding: '0.75rem 2.5rem 0.75rem 1rem',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border-color)',
                      backgroundColor: 'var(--bg-main)',
                      color: 'var(--text-main)',
                      fontSize: '0.92rem',
                      boxSizing: 'border-box'
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                    style={{
                      position: 'absolute',
                      right: '0.5rem',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      padding: '0.4rem',
                      color: 'var(--text-muted)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    {showConfirmPassword ? <IconEyeOff size={18} stroke={1.75} /> : <IconEye size={18} stroke={1.75} />}
                  </button>
                </div>
                {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                  <div style={{ fontSize: '0.75rem', color: 'var(--danger)', marginTop: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <IconAlertTriangle size={13} stroke={2} />
                    <span>Passwords do not match.</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Error Alert Banner above button */}
          {error && (
            <div
              role="alert"
              style={{
                padding: '0.85rem 1rem',
                backgroundColor: 'var(--danger-bg)',
                border: '1px solid var(--danger)',
                borderRadius: 'var(--radius-md)',
                color: 'var(--danger-text)',
                fontSize: '0.85rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.6rem'
              }}
            >
              <IconAlertTriangle size={18} stroke={1.75} style={{ flexShrink: 0 }} />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            className="btn"
            disabled={loading || Boolean(success)}
            style={{
              marginTop: '0.5rem',
              padding: '0.85rem',
              fontSize: '0.95rem',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              opacity: (loading || Boolean(success)) ? 0.75 : 1,
              cursor: (loading || Boolean(success)) ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? (
              <>
                <IconLoader2 size={18} stroke={2} className="spin" />
                <span>Creating account…</span>
              </>
            ) : (
              <>
                <span>Complete Registration</span>
                <IconUserPlus size={18} stroke={2} />
              </>
            )}
          </button>
        </form>

        {/* Footer Navigation */}
        <div style={{
          marginTop: '1.5rem',
          paddingTop: '1.25rem',
          borderTop: '1px solid var(--border-color)',
          textAlign: 'center',
          fontSize: '0.85rem',
          color: 'var(--text-muted)'
        }}>
          Already registered?{' '}
          <Link
            to="/login"
            style={{
              color: 'var(--primary)',
              fontWeight: 600,
              textDecoration: 'none'
            }}
          >
            Sign In here
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
