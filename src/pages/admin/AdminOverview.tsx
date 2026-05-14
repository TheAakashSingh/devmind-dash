import { IndianRupee, TrendingUp, Users, Zap, DollarSign } from 'lucide-react';
import { useAdmin } from './AdminContext';

export default function AdminOverview() {
  const { stats, money } = useAdmin();

  return (
    <>
      <div className="admin-page-head">
        <h3>Overview</h3>
        <p className="muted">High-level health of users, billing, and request volume.</p>
      </div>

      {stats ? (
        <div className="stats-grid">
          {[
            {
              label: 'Total users',
              value: stats.totalUsers,
              foot: `${stats.bannedUsers || 0} banned · all registered accounts.`,
              icon: <Users size={16} />,
            },
            { label: 'Paid users', value: stats.paidUsers, foot: 'Active non-free plans.', icon: <TrendingUp size={16} /> },
            {
              label: 'Revenue (INR)',
              value: money(stats.revenueInPaise || 0),
              foot: 'Lifetime INR payments.',
              icon: <IndianRupee size={16} />,
            },
            {
              label: 'Revenue (USD)',
              value: `$${((stats.revenueUSDCents || 0) / 100).toLocaleString('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}`,
              foot: 'Lifetime USD payments.',
              icon: <DollarSign size={16} />,
            },
            { label: 'Requests today', value: stats.todayRequests, foot: 'Rolling 24h usage_logs.', icon: <Zap size={16} /> },
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
      ) : (
        <div className="loading-panel">Loading overview…</div>
      )}

      {stats?.planBreakdown?.length ? (
        <section className="panel stack" style={{ marginTop: 8 }}>
          <div className="row">
            <strong style={{ fontSize: 15 }}>Plan distribution</strong>
            <span className="muted" style={{ fontSize: 13 }}>Users per plan</span>
          </div>
          <div className="stats-grid">
            {stats.planBreakdown.map((entry: { plan: string; cnt: number }) => (
              <div key={entry.plan} className="status-card">
                <div className="muted" style={{ fontSize: 12, marginBottom: 6 }}>
                  {String(entry.plan).toUpperCase()}
                </div>
                <div style={{ fontSize: 26, fontWeight: 700, letterSpacing: '-0.02em' }}>{entry.cnt}</div>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {stats?.featureUsage?.length ? (
        <section className="panel stack" style={{ marginTop: 8 }}>
          <div className="row">
            <strong style={{ fontSize: 15 }}>Top extension actions (7 days)</strong>
            <span className="muted" style={{ fontSize: 13 }}>Across all users</span>
          </div>
          <div className="stats-grid">
            {stats.featureUsage.map((entry: { action: string; cnt: number }) => (
              <div key={entry.action} className="status-card">
                <div className="muted" style={{ fontSize: 12, marginBottom: 6 }}>
                  {entry.action}
                </div>
                <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.02em' }}>{entry.cnt}</div>
              </div>
            ))}
          </div>
        </section>
      ) : null}
    </>
  );
}
