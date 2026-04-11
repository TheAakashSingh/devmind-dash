import React, { useEffect, useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  CreditCard,
  Key,
  LayoutDashboard,
  LogOut,
  Shield,
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import api from '../hooks/useApi';

type UserSummary = {
  name?: string;
  email?: string;
  is_admin?: boolean;
  plan?: string;
};

export default function Layout({ children }: { children: React.ReactNode }) {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState<UserSummary | null>(null);

  useEffect(() => {
    api
      .get('/auth/me')
      .then((res) => setUser(res.data))
      .catch(() => setUser(null));
  }, [location.pathname]);

  const links = [
    { to: '/', icon: <LayoutDashboard size={17} />, label: 'Overview' },
    { to: '/api-key', icon: <Key size={17} />, label: 'Extension setup' },
    { to: '/billing', icon: <CreditCard size={17} />, label: 'Plans & billing' },
  ];

  if (user?.is_admin) {
    links.push({ to: '/admin', icon: <Shield size={17} />, label: 'Admin console' });
  }

  const initial = (user?.name || user?.email || 'D')[0].toUpperCase();

  return (
    <div className="shell">
      <aside className="sidebar">
        <div className="sidebar-panel">
          <a className="brand" href="/">
            <span className="brand-mark">D</span>
            <div className="brand-copy">
              <h1>DevMind</h1>
              <p>Aakash Singh, Founder</p>
            </div>
          </a>

          <div className="sidebar-user">
            <div className="avatar">{initial}</div>
            <div className="info">
              <strong>{user?.name || 'Your workspace'}</strong>
              <span>{user?.email || 'Signed in'}</span>
            </div>
          </div>

          <div>
            <div className="sidebar-section-label">Workspace</div>
            <nav className="sidebar-nav">
              {links.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  end={link.to === '/'}
                  className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
                >
                  {link.icon}
                  <span>{link.label}</span>
                </NavLink>
              ))}
            </nav>
          </div>

          <div className="sidebar-footer">
            <div className="sidebar-plan-card">
              <div className="row">
                <span className="muted" style={{ fontSize: 12 }}>Current plan</span>
                <span className="badge purple">{(user?.plan || 'free').toUpperCase()}</span>
              </div>
              <p className="muted">Upgrade anytime to raise your daily request quota.</p>
            </div>

            <button
              className="ghost-button"
              onClick={() => {
                logout();
                navigate('/login');
              }}
              style={{ width: '100%', justifyContent: 'flex-start' }}
            >
              <LogOut size={16} />
              Sign out
            </button>
          </div>
        </div>
      </aside>

      <main className="page">
        <div className="page-inner">{children}</div>
      </main>
    </div>
  );
}
