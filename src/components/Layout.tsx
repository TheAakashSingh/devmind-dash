import React, { useEffect, useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  CreditCard,
  Brain,
  Key,
  LayoutDashboard,
  LogOut,
  Shield,
  ChevronRight,
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import api from '../hooks/useApi';

type UserSummary = {
  name?: string;
  email?: string;
  is_admin?: boolean;
  plan?: string;
};

type QuotaHint = { used?: number; remaining?: number; limit?: number };

export default function Layout({ children }: { children: React.ReactNode }) {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState<UserSummary | null>(null);
  const [quota, setQuota] = useState<QuotaHint | null>(null);

  useEffect(() => {
    Promise.all([api.get('/auth/me'), api.get('/auth/validate').catch(() => null)])
      .then(([meRes, valRes]) => {
        setUser(meRes.data);
        if (valRes?.data?.valid) {
          const plan = (meRes.data?.plan || valRes.data.plan || 'free') as string;
          const limits: Record<string, number> = { free: 20, solo: 100, pro: 500, team: 2000 };
          const limit = limits[plan] ?? limits.free;
          setQuota({
            used: valRes.data.used,
            remaining: valRes.data.remaining,
            limit,
          });
        } else {
          setQuota(null);
        }
      })
      .catch(() => {
        setUser(null);
        setQuota(null);
      });
  }, [location.pathname]);

  const links = [
    { to: '/', icon: <LayoutDashboard size={17} />, label: 'Overview' },
    { to: '/api-key', icon: <Key size={17} />, label: 'Extension setup' },
    { to: '/billing', icon: <CreditCard size={17} />, label: 'Plans & billing' },
    { to: '/ai-studio', icon: <Brain size={17} />, label: 'AI studio' },
  ];

  if (user?.is_admin) {
    links.push({ to: '/admin', icon: <Shield size={17} />, label: 'Admin console' });
  }

  const initial = (user?.name || user?.email || 'D')[0].toUpperCase();

  return (
    <div className="shell">
      <aside className="sidebar">
        <div className="sidebar-panel">
          <div className="sidebar-header">
            <div className="logo">D</div>
            <div className="brand-text">
              <span>DevMind</span>
              <span>v1.0</span>
            </div>
          </div>

          <div className="sidebar-user-mini">
            <div className="avatar">{initial}</div>
            <div className="user-info">
              <strong>{user?.name || 'Workspace'}</strong>
              <span>{user?.email || 'Signed in'}</span>
            </div>
            <ChevronRight size={14} className="chevron" />
          </div>

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

          <div className="sidebar-footer">
            <div className="sidebar-plan-card">
              <div className="row">
                <span className="muted">Plan</span>
                <span className="badge">{(user?.plan || 'free').toUpperCase()}</span>
              </div>
              {quota && typeof quota.used === 'number' && typeof quota.limit === 'number' ? (
                <p className="muted" style={{ fontSize: 12, marginTop: 8, lineHeight: 1.4 }}>
                  Today: <strong style={{ color: 'var(--text)' }}>{quota.used}</strong> / {quota.limit} requests
                  <br />
                  <span>{quota.remaining} left before reset</span>
                </p>
              ) : (
                <p className="muted">Upgrade to unlock more requests.</p>
              )}
            </div>

            <button
              className="nav-link"
              onClick={() => {
                logout();
                navigate('/login');
              }}
            >
              <LogOut size={18} />
              <span>Sign out</span>
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
