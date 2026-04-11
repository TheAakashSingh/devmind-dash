import { useState } from 'react';
import { ArrowRight, Check, Mail, ShieldCheck, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import api from '../hooks/useApi';

function isGmail(email: string) {
  return /^[^\s@]+@gmail\.com$/i.test(email.trim());
}

export default function Login() {
  const [mode, setMode] = useState<'signup' | 'signin'>('signup');
  const [step, setStep] = useState<'email' | 'otp'>('email');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [transitioning, setTransitioning] = useState(false);
  const [sentTo, setSentTo] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const resetErrors = () => setError('');

  const requestOtp = async () => {
    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail) return setError('Please enter your Gmail address.');
    if (!isGmail(normalizedEmail)) return setError('Only @gmail.com email addresses are supported.');
    if (mode === 'signup' && !name.trim()) return setError('Please enter your full name.');

    setLoading(true);
    setError('');

    try {
      await api.post('/auth/request-otp', {
        email: normalizedEmail,
        name: mode === 'signup' ? name.trim() : '',
      });
      setSentTo(normalizedEmail);
      setStep('otp');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Could not send the verification code.');
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async () => {
    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail) return setError('Please enter your Gmail address.');
    if (!otp.trim()) return setError('Please enter the 6-digit code.');

    setLoading(true);
    setError('');

    try {
      const res = await api.post('/auth/verify-otp', {
        email: normalizedEmail,
        otp: otp.trim(),
        name: mode === 'signup' ? name.trim() : '',
      });

      localStorage.setItem('devmind_apikey', res.data.apiKey);
      login(res.data.token);
      setTransitioning(true);
      window.setTimeout(() => navigate('/'), 180);
    } catch (err: any) {
      setError(err.response?.data?.error || 'The verification code was not accepted.');
    } finally {
      setLoading(false);
    }
  };

  const submit = () => {
    if (step === 'email') {
      void requestOtp();
      return;
    }
    void verifyOtp();
  };

  return (
    <div className="auth-layout">
      {transitioning ? (
        <div className="auth-loader" role="status" aria-live="polite">
          <div className="auth-loader-card">
            <img className="brand-image" src="/logo.png" alt="DevMind AI logo" />
            <div className="spinner" />
            <strong>Opening your dashboard</strong>
            <p>Verifying your workspace and loading your API key...</p>
          </div>
        </div>
      ) : null}
      <section className="auth-showcase">
        <div className="auth-showcase-inner">
          <a className="brand brand-auth" href="/">
            <img className="brand-image" src="/logo.png" alt="DevMind AI logo" />
            <div className="brand-copy">
              <h1>DevMind AI</h1>
              <p>Founded by Aakash Singh</p>
            </div>
          </a>

          <span className="eyebrow" style={{ marginTop: 24 }}>
            <Sparkles size={14} />
            Secure sign in
          </span>

          <h1>
            A cleaner way to
            <br />
            <span className="highlight-text">access your workspace.</span>
          </h1>
          <p>
            Sign in with a Gmail-only OTP, unlock your dashboard, and connect the VS Code extension
            from one verified account.
          </p>

          <ul className="auth-feature-list">
            <li>
              <Check size={18} />
              <span>Use a Gmail inbox for secure account access</span>
            </li>
            <li>
              <Check size={18} />
              <span>Receive a one-time code by email and verify instantly</span>
            </li>
            <li>
              <Check size={18} />
              <span>One account unlocks the dashboard and the VS Code extension</span>
            </li>
            <li>
              <Check size={18} />
              <span>Your API key stays inside the dashboard and extension settings</span>
            </li>
          </ul>
        </div>
      </section>

      <section className="auth-panel">
        <div className="auth-card">
          <div>
            <h2>{step === 'email' ? 'Sign in or sign up' : 'Verify your code'}</h2>
            <p className="muted" style={{ marginTop: 6, fontSize: 14 }}>
              {step === 'email'
                ? 'Use your Gmail address to get a secure one-time code.'
                : `We sent a 6-digit code to ${sentTo || email}. Enter it below to continue.`}
            </p>
          </div>

          <div className="pill-switch">
            <button
              className={mode === 'signup' ? 'active' : ''}
              onClick={() => {
                setMode('signup');
                setStep('email');
                setOtp('');
                resetErrors();
              }}
            >
              Sign up
            </button>
            <button
              className={mode === 'signin' ? 'active' : ''}
              onClick={() => {
                setMode('signin');
                setStep('email');
                setOtp('');
                resetErrors();
              }}
            >
              Sign in
            </button>
          </div>

          {error ? <div className="error-text">{error}</div> : null}

          <div className="input-grid">
            {mode === 'signup' && step === 'email' ? (
              <div className="field">
                <label htmlFor="name">Full name</label>
                <input
                  id="name"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Ada Lovelace"
                />
              </div>
            ) : null}

            <div className="field">
              <label htmlFor="email">Gmail address</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                onKeyDown={(event) => event.key === 'Enter' && submit()}
                placeholder="you@gmail.com"
              />
              <span className="muted" style={{ fontSize: 12 }}>
                Gmail accounts only. We use OTP instead of passwords.
              </span>
            </div>

            {step === 'otp' ? (
              <div className="field">
                <label htmlFor="otp">6-digit verification code</label>
                <input
                  id="otp"
                  inputMode="numeric"
                  value={otp}
                  onChange={(event) => setOtp(event.target.value.replace(/\D/g, '').slice(0, 6))}
                  onKeyDown={(event) => event.key === 'Enter' && submit()}
                  placeholder="123456"
                />
              </div>
            ) : null}
          </div>

          <button className="primary-button btn-lg" onClick={submit} disabled={loading} style={{ width: '100%' }}>
            {loading
              ? 'Working...'
              : step === 'email'
                ? 'Send verification code'
                : 'Verify code and continue'}
            <ArrowRight size={17} />
          </button>

          {step === 'otp' ? (
            <button
              className="secondary-button"
              onClick={() => {
                setStep('email');
                setOtp('');
                resetErrors();
              }}
            >
              Back
            </button>
          ) : null}

          <div style={{ textAlign: 'center', fontSize: 12.5, color: 'var(--dim)', display: 'grid', gap: 6 }}>
            <span><ShieldCheck size={14} style={{ verticalAlign: 'text-bottom' }} /> OTP expires in 10 minutes.</span>
            <span>After verification, your dashboard and API key are ready to use.</span>
          </div>
        </div>
      </section>
    </div>
  );
}
