import type { ReactNode } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import {
  AlertTriangle,
  CreditCard,
  DollarSign,
  KeyRound,
  LayoutDashboard,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Users,
  Zap,
} from 'lucide-react';
import { useAdmin } from './AdminContext';

const navSections: {
  label: string;
  items: { to: string; label: string; icon: ReactNode; desc?: string }[];
}[] = [
  {
    label: 'Overview',
    items: [
      {
        to: '/admin/overview',
        label: 'Home',
        desc: 'KPIs, plans, product usage',
        icon: <LayoutDashboard size={16} />,
      },
    ],
  },
  {
    label: 'People',
    items: [
      { to: '/admin/users', label: 'Users', desc: 'Accounts & deep profile', icon: <Users size={16} /> },
      { to: '/admin/activity', label: 'Activity', desc: 'Usage stream', icon: <Zap size={16} /> },
    ],
  },
  {
    label: 'Trust & access',
    items: [
      {
        to: '/admin/security',
        label: 'Security',
        desc: 'IPs & sessions',
        icon: <KeyRound size={16} />,
      },
    ],
  },
  {
    label: 'Billing',
    items: [
      { to: '/admin/payments', label: 'Payments', desc: 'Ledger', icon: <CreditCard size={16} /> },
      { to: '/admin/revenue', label: 'Revenue', desc: 'Trends', icon: <DollarSign size={16} /> },
    ],
  },
  {
    label: 'Platform',
    items: [
      {
        to: '/admin/observability',
        label: 'Observability',
        desc: 'Latency & errors',
        icon: <TrendingUp size={16} />,
      },
      { to: '/admin/memory', label: 'Team memory', desc: 'Policies', icon: <Sparkles size={16} /> },
    ],
  },
];

export function AdminLayout() {
  const { authorized, refreshAll } = useAdmin();

  if (!authorized) {
    return (
      <div className="empty-state">
        <span className="badge pink" style={{ marginBottom: 8 }}>
          <AlertTriangle size={13} /> Access denied
        </span>
        <strong>Admin routes are protected.</strong>
        <span className="muted" style={{ display: 'block', marginTop: 6 }}>
          This area requires an account with the <code>is_admin</code> flag.
        </span>
      </div>
    );
  }

  return (
    <div className="page-inner admin-console-root">
      <div className="admin-console">
        <aside className="admin-console-sidebar">
          <div className="admin-console-brand">
            <span className="eyebrow">
              <ShieldCheck size={13} />
              Admin
            </span>
            <strong>DevMind</strong>
            <span className="muted admin-console-sub">Workspace controls</span>
          </div>
          <nav className="admin-console-nav">
            {navSections.map((section) => (
              <div key={section.label} className="admin-console-nav-section">
                <div className="admin-console-nav-heading">{section.label}</div>
                {section.items.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    className={({ isActive }) => `admin-console-link${isActive ? ' active' : ''}`}
                  >
                    <span className="admin-console-link-icon">{item.icon}</span>
                    <span className="admin-console-link-text">
                      <span className="admin-console-link-label">{item.label}</span>
                      {item.desc ? <span className="admin-console-link-desc">{item.desc}</span> : null}
                    </span>
                  </NavLink>
                ))}
              </div>
            ))}
          </nav>
          <div className="admin-console-sidebar-foot muted" style={{ fontSize: 12, lineHeight: 1.45 }}>
            Each page loads its own tables. Use <strong>Users</strong> for plans, bans, and API keys.
          </div>
        </aside>

        <div className="admin-console-main">
          <header className="admin-console-toolbar">
            <div>
              <h2 className="admin-console-title">Operations</h2>
              <p className="muted admin-console-toolbar-copy">
                Refresh syncs overview stats, the user directory, and payment cache.
              </p>
            </div>
            <button type="button" className="secondary-button" onClick={() => void refreshAll()}>
              <RefreshCw size={15} />
              Refresh data
            </button>
          </header>
          <div className="admin-console-outlet">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
}
