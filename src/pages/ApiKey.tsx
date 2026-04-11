import { useEffect, useMemo, useState } from 'react';
import { Check, Copy, Eye, EyeOff, ExternalLink, KeyRound } from 'lucide-react';
import api from '../hooks/useApi';

export default function ApiKey() {
  const [visible, setVisible] = useState(false);
  const [copied, setCopied] = useState(false);
  const [apiKey, setApiKey] = useState(localStorage.getItem('devmind_apikey') || '');
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    api.get('/auth/me').then((res) => {
      setUser(res.data);
      if (res.data.api_key) {
        localStorage.setItem('devmind_apikey', res.data.api_key);
        setApiKey(res.data.api_key);
      }
    });
  }, []);

  const hiddenKey = useMemo(
    () =>
      apiKey
        ? `${apiKey.slice(0, 6)}${'*'.repeat(Math.max(apiKey.length - 10, 8))}${apiKey.slice(-4)}`
        : 'No API key available',
    [apiKey]
  );

  const copy = async () => {
    if (!apiKey) return;
    await navigator.clipboard.writeText(apiKey);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  };

  return (
    <>
      <div className="topbar">
        <div className="topbar-copy">
          <h2>Connect the extension</h2>
          <p>
            After Gmail OTP verification, copy this key once and paste it into the VS Code
            extension. The dashboard, billing, and extension stay on the same account.
          </p>
        </div>
        <div className="topbar-actions">
          <a
            className="primary-button"
            href="https://marketplace.visualstudio.com/items?itemName=devmind.devmind-ai"
            target="_blank"
            rel="noreferrer"
          >
            Install for VS Code
            <ExternalLink size={16} />
          </a>
        </div>
      </div>

      <div className="detail-grid">
        <section className="panel stack">
          <div className="row">
            <strong style={{ fontSize: 15, display: 'inline-flex', alignItems: 'center', gap: 8 }}>
              <KeyRound size={16} /> Your API key
            </strong>
            <span className="badge purple">Secret</span>
          </div>
          <div className="keybox">
            <code>{visible ? apiKey || 'No API key available' : hiddenKey}</code>
            <button
              className="icon-btn"
              title={visible ? 'Hide' : 'Reveal'}
              onClick={() => setVisible((v) => !v)}
            >
              {visible ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
            <button className="icon-btn" title="Copy" onClick={copy} disabled={!apiKey}>
              {copied ? <Check size={15} /> : <Copy size={15} />}
            </button>
          </div>
          <div className="notice">
            Signed in as <strong>{user?.email || 'your account'}</strong>. Never commit this key to source control.
          </div>
        </section>

        <section className="code-card">
          <div className="code-head">
            <strong>Setup flow</strong>
            <span className="badge slate">4 steps</span>
          </div>
          <pre>{[
            '1.  Open VS Code',
            '2.  Press Ctrl+Shift+P  (Cmd+Shift+P on macOS)',
            '3.  Run  DevMind: Set API Key',
            '4.  Paste the API key from this page',
            '',
            'Or open the DevMind sidebar after the key is saved.',
          ].join('\n')}</pre>
        </section>
      </div>

      <div className="detail-grid">
        <section className="panel stack">
          <div className="row">
            <strong style={{ fontSize: 15 }}>Why this flow works</strong>
          </div>
          <ul className="feature-list">
            <li>
              <Check size={16} color="#4ade80" />
              <span>Gmail OTP keeps signup safe and simple.</span>
            </li>
            <li>
              <Check size={16} color="#4ade80" />
              <span>Your dashboard and extension stay tied to one verified account.</span>
            </li>
            <li>
              <Check size={16} color="#4ade80" />
              <span>You only paste the key once, then the extension works normally.</span>
            </li>
          </ul>
        </section>

        <section className="panel stack">
          <div className="row">
            <strong style={{ fontSize: 15 }}>Next</strong>
          </div>
          <div className="split-actions">
            <a className="secondary-button" href="/">
              Back to overview
            </a>
            <a className="ghost-button" href="/billing">
              Compare plans
            </a>
          </div>
        </section>
      </div>
    </>
  );
}
