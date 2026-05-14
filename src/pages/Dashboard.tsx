import { useEffect, useMemo, useState } from 'react';
import {
  Activity,
  ArrowRight,
  BarChart3,
  Calendar,
  Clock,
  KeyRound,
  Mail,
  Rocket,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import api from '../hooks/useApi';

const PLAN_LIMITS: Record<string, number> = { free: 20, solo: 100, pro: 500, team: 2000 };

export default function Dashboard() {
  const [info, setInfo] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [activity, setActivity] = useState<{ recent: any[]; byAction: any[] } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.get('/auth/validate'), api.get('/auth/me'), api.get('/auth/activity')])
      .then(([validateRes, userRes, actRes]) => {
        setInfo(validateRes.data);
        setUser(userRes.data);
        setActivity(actRes.data || null);
      })
      .finally(() => setLoading(false));
  }, []);

  const limit = PLAN_LIMITS[info?.plan] || PLAN_LIMITS.free;
  const used = info?.used || 0;
  const remaining = info?.remaining || 0;
  const usagePercent = Math.min(100, Math.round((used / Math.max(limit, 1)) * 100));

  const setupSteps = useMemo(
    () => [
      'Install DevMind from the VS Code marketplace.',
      'Open VS Code and run "DevMind: Sign In" from the command palette.',
      'Sign in with the same email you used here.',
      'Start coding — autocomplete, chat, explain, fix.',
    ],
    [],
  );

  if (loading) {
    return <div className="loading-panel">Loading your workspace…</div>;
  }

  const firstName = user?.name?.split(' ')[0] || 'there';

  return (
    <>
      <div className="topbar">
        <div className="topbar-copy">
          <h2>Welcome back, {firstName}.</h2>
          <p>Here's a quick look at your workspace, quota, and setup status.</p>
        </div>
        <div className="topbar-actions">
          <a className="secondary-button" href="/api-key">
            <KeyRound size={16} />
            Connect extension
          </a>
          <a className="primary-button" href="/billing">
            <Zap size={16} />
            Upgrade plan
          </a>
        </div>
      </div>

      <div className="hero-grid">
        <section className="hero-card stack">
          <span className="eyebrow">
            <Rocket size={12} />
            {(info?.plan || 'free').toUpperCase()} plan
          </span>
          <h3>
            Your AI pair programmer is ready.
          </h3>
          <p>
            DevMind is active across your VS Code editor. Use inline autocomplete, the sidebar chat,
            or run commands to explain, fix and refactor code.
          </p>
          <div className="split-actions" style={{ marginTop: 6 }}>
            <a className="primary-button" href="/api-key">
              View setup guide
              <ArrowRight size={16} />
            </a>
            <a className="ghost-button" href="/billing">
              Compare plans
            </a>
          </div>
        </section>

        <section className="panel stack">
          <div className="row">
            <strong style={{ fontSize: 14 }}>Daily quota</strong>
            <span className="muted" style={{ fontSize: 13 }}>
              {used} / {limit}
            </span>
          </div>
          <div className="progress">
            <span style={{ width: `${usagePercent}%` }} />
          </div>
          <div className="mini-grid" style={{ marginTop: 6 }}>
            <div className="status-card">
              <div className="muted" style={{ fontSize: 12, marginBottom: 4 }}>Remaining</div>
              <div style={{ fontSize: 26, fontWeight: 700, letterSpacing: '-0.02em' }}>{remaining}</div>
            </div>
            <div className="status-card">
              <div className="muted" style={{ fontSize: 12, marginBottom: 4 }}>Resets</div>
              <div style={{ fontSize: 14, fontWeight: 600 }}>In 24h</div>
            </div>
          </div>
        </section>
      </div>

      <div className="stats-grid">
        {[
          {
            label: 'Plan',
            value: (info?.plan || 'free').toUpperCase(),
            foot: 'Manage from billing.',
            icon: <Rocket size={16} />,
          },
          {
            label: 'Used today',
            value: used,
            foot: 'Resets every 24 hours.',
            icon: <BarChart3 size={16} />,
          },
          {
            label: 'Remaining',
            value: remaining,
            foot: 'Across all extension actions.',
            icon: <Zap size={16} />,
          },
          {
            label: 'Account type',
            value: user?.is_admin ? 'Admin' : 'User',
            foot: user?.email,
            icon: <ShieldCheck size={16} />,
          },
        ].map((item) => (
          <article key={item.label} className="metric-card">
            <div className="metric-head">
              <span className="metric-label">{item.label}</span>
              <span className="metric-icon">{item.icon}</span>
            </div>
            <p className="metric-value">{item.value}</p>
            <div className="metric-foot">{item.foot}</div>
          </article>
        ))}
      </div>

      <div className="detail-grid">
        <section className="panel stack">
          <div className="row">
            <strong style={{ fontSize: 15 }}>Recent extension usage</strong>
            <span className="badge slate">
              <Activity size={13} />
              Latest
            </span>
          </div>
          {activity?.recent?.length ? (
            <div className="table-wrap" style={{ marginTop: 4 }}>
              <table>
                <thead>
                  <tr>
                    <th>Action</th>
                    <th>Model</th>
                    <th>Status</th>
                    <th>Time</th>
                  </tr>
                </thead>
                <tbody>
                  {activity.recent.slice(0, 12).map((row: any) => (
                    <tr key={row.id}>
                      <td>
                        <span className="badge purple">{row.action}</span>
                      </td>
                      <td className="muted" style={{ fontSize: 13 }}>
                        {row.model || '—'}
                      </td>
                      <td>
                        <span className={`badge ${row.status === 'error' ? 'pink' : 'green'}`}>{row.status || 'ok'}</span>
                      </td>
                      <td className="muted" style={{ fontSize: 13 }}>
                        <Clock size={12} style={{ verticalAlign: 'middle', marginRight: 4 }} />
                        {new Date(row.created_at).toLocaleString('en-IN')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="muted" style={{ fontSize: 14, margin: 0 }}>
              No requests logged yet. Use the VS Code extension, then refresh this page.
            </p>
          )}
        </section>

        <section className="panel stack">
          <div className="row">
            <strong style={{ fontSize: 15 }}>Last 7 days by action</strong>
            <span className="badge blue">Totals</span>
          </div>
          {activity?.byAction?.length ? (
            <ul className="stack" style={{ gap: 8, listStyle: 'none', padding: 0, margin: 0 }}>
              {activity.byAction.map((row: any) => (
                <li key={row.action} className="row" style={{ justifyContent: 'space-between' }}>
                  <span className="badge slate">{row.action}</span>
                  <span style={{ fontWeight: 600 }}>{row.cnt}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="muted" style={{ fontSize: 14, margin: 0 }}>
              A per-action breakdown appears after you use different extension features.
            </p>
          )}
        </section>
      </div>

      <div className="detail-grid">
        <section className="panel stack">
          <div className="row">
            <strong style={{ fontSize: 15 }}>Get started in VS Code</strong>
            <span className="badge purple">4 steps</span>
          </div>
          <ol className="step-list">
            {setupSteps.map((step, index) => (
              <li key={step}>
                <span className="step-number">{index + 1}</span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
        </section>

        <section className="panel stack">
          <div className="row">
            <strong style={{ fontSize: 15 }}>Account</strong>
            <span className={`badge ${user?.is_admin ? 'pink' : 'slate'}`}>
              {user?.is_admin ? 'Admin' : 'Member'}
            </span>
          </div>
          <div className="stack" style={{ gap: 10 }}>
            <div className="row">
              <span className="muted" style={{ fontSize: 13, display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                <Mail size={14} /> Email
              </span>
              <span style={{ fontSize: 14 }}>{user?.email}</span>
            </div>
            <div className="row">
              <span className="muted" style={{ fontSize: 13, display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                <ShieldCheck size={14} /> Name
              </span>
              <span style={{ fontSize: 14 }}>{user?.name || 'Not set'}</span>
            </div>
            <div className="row">
              <span className="muted" style={{ fontSize: 13, display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                <Zap size={14} /> Daily limit
              </span>
              <span style={{ fontSize: 14 }}>{limit} requests</span>
            </div>
            <div className="row">
              <span className="muted" style={{ fontSize: 13, display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                <Calendar size={14} /> Member since
              </span>
              <span style={{ fontSize: 14 }}>
                {user?.created_at ? new Date(user.created_at).toLocaleDateString('en-IN') : '—'}
              </span>
            </div>
            <div className="row">
              <span className="muted" style={{ fontSize: 13, display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                <Clock size={14} /> Last sign-in
              </span>
              <span style={{ fontSize: 14 }}>
                {user?.last_login_at ? new Date(user.last_login_at).toLocaleString('en-IN') : '—'}
              </span>
            </div>
            {user?.ip_address ? (
              <div className="row">
                <span className="muted" style={{ fontSize: 13 }}>
                  Last IP (from dashboard login)
                </span>
                <code style={{ fontSize: 13 }}>{user.ip_address}</code>
              </div>
            ) : null}
          </div>
        </section>
      </div>
    </>
  );
}
