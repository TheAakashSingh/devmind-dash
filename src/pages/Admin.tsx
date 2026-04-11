import { useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  ArrowRight,
  CalendarDays,
  CreditCard,
  IndianRupee,
  KeyRound,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  UserCog,
  Users,
  Zap,
} from 'lucide-react';
import api from '../hooks/useApi';

type UserRow = {
  id: string;
  email: string;
  name: string;
  plan: string;
  is_admin: boolean;
  email_verified_at?: string | null;
  created_at: string;
  updated_at?: string;
  total_paid_paise?: number;
  last_payment_at?: string | null;
  requests_24h?: number;
};

type UserDetail = {
  user: UserRow & { api_key: string };
  summary: {
    totalRequests: number;
    tokensIn: number;
    tokensOut: number;
    requests24h: number;
  };
  payments: Array<{
    id: number;
    plan: string;
    amount: number;
    payment_id: string;
    order_id: string;
    status: string;
    created_at: string;
  }>;
  usage: Array<{
    id: number;
    action: string;
    model: string | null;
    tokens_in: number;
    tokens_out: number;
    created_at: string;
  }>;
};

export default function Admin() {
  const [stats, setStats] = useState<any>(null);
  const [users, setUsers] = useState<UserRow[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [selectedUser, setSelectedUser] = useState<UserDetail | null>(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [planFilter, setPlanFilter] = useState('');
  const [authorized, setAuthorized] = useState(true);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [savingUserId, setSavingUserId] = useState('');

  const selectedUserRow = useMemo(
    () => users.find((user) => user.id === selectedUserId) || null,
    [users, selectedUserId]
  );

  const loadStats = async () => {
    const res = await api.get('/admin/stats');
    setStats(res.data);
  };

  const loadPayments = async () => {
    const res = await api.get('/admin/payments?limit=12');
    setPayments(res.data.payments || []);
  };

  const loadUsers = async () => {
    setLoadingUsers(true);
    try {
      const res = await api.get('/admin/users', {
        params: { page, q: search.trim(), plan: planFilter },
      });
      setUsers(res.data.users || []);
      setTotal(res.data.total || 0);
      setAuthorized(true);

      const first = res.data.users?.[0];
      if (!selectedUserId && first) {
        setSelectedUserId(first.id);
      }
    } catch {
      setAuthorized(false);
    } finally {
      setLoadingUsers(false);
    }
  };

  const loadUserDetail = async (userId: string) => {
    if (!userId) return;

    setLoadingDetail(true);
    try {
      const res = await api.get(`/admin/users/${userId}`);
      setSelectedUser(res.data);
      setAuthorized(true);
    } catch {
      setAuthorized(false);
    } finally {
      setLoadingDetail(false);
    }
  };

  useEffect(() => {
    loadStats().catch(() => setAuthorized(false));
    loadPayments().catch(() => setAuthorized(false));
  }, []);

  useEffect(() => {
    loadUsers().catch(() => setAuthorized(false));
    // reset pagination when filters change
  }, [page, search, planFilter]);

  useEffect(() => {
    if (selectedUserId) {
      loadUserDetail(selectedUserId).catch(() => setAuthorized(false));
    }
  }, [selectedUserId]);

  const refreshAll = async () => {
    await Promise.all([loadStats(), loadPayments(), loadUsers()]);
    if (selectedUserId) {
      await loadUserDetail(selectedUserId);
    }
  };

  const changePlan = async (userId: string, plan: string) => {
    setSavingUserId(userId);
    try {
      await api.patch(`/admin/users/${userId}/plan`, { plan });
      setUsers((current) => current.map((user) => (user.id === userId ? { ...user, plan } : user)));
      if (selectedUser?.user.id === userId) {
        setSelectedUser((current) => (current ? { ...current, user: { ...current.user, plan } } : current));
      }
      await loadStats();
    } finally {
      setSavingUserId('');
    }
  };

  const toggleAdmin = async (userId: string, isAdmin: boolean) => {
    setSavingUserId(userId);
    try {
      await api.patch(`/admin/users/${userId}/admin`, { isAdmin });
      setUsers((current) => current.map((user) => (user.id === userId ? { ...user, is_admin: isAdmin } : user)));
      if (selectedUser?.user.id === userId) {
        setSelectedUser((current) => (current ? { ...current, user: { ...current.user, is_admin: isAdmin } } : current));
      }
      await loadStats();
    } finally {
      setSavingUserId('');
    }
  };

  const money = (paise: number) => `₹${(paise / 100).toLocaleString('en-IN')}`;
  const date = (value?: string | null) => (value ? new Date(value).toLocaleDateString('en-IN') : '—');
  const dateTime = (value?: string | null) => (value ? new Date(value).toLocaleString('en-IN') : '—');

  if (!authorized) {
    return (
      <div className="empty-state">
        <span className="badge pink" style={{ marginBottom: 8 }}>
          <AlertTriangle size={13} /> Access denied
        </span>
        <strong>Admin routes are protected.</strong>
        <span className="muted" style={{ display: 'block', marginTop: 6 }}>
          This view requires accounts with the <code>is_admin</code> flag enabled.
        </span>
      </div>
    );
  }

  return (
    <>
      <div className="topbar">
        <div className="topbar-copy">
          <span className="eyebrow">
            <ShieldCheck size={14} />
            Admin console
          </span>
          <h2>Full control center for users, billing, and usage.</h2>
          <p>
            Search accounts, inspect payments, review daily usage, and adjust plans or admin access from one place.
          </p>
        </div>
        <div className="topbar-actions">
          <button className="secondary-button" onClick={() => void refreshAll()}>
            <RefreshCw size={15} />
            Refresh
          </button>
          <span className="badge blue">
            <Sparkles size={13} />
            Protected
          </span>
        </div>
      </div>

      {stats ? (
        <div className="stats-grid">
          {[
            { label: 'Total users', value: stats.totalUsers, foot: 'All registered accounts.', icon: <Users size={16} /> },
            { label: 'Paid users', value: stats.paidUsers, foot: 'Active non-free plans.', icon: <TrendingUp size={16} /> },
            {
              label: 'Revenue',
              value: money(stats.revenueInPaise),
              foot: 'Lifetime recorded payments.',
              icon: <IndianRupee size={16} />,
            },
            { label: 'Requests today', value: stats.todayRequests, foot: 'Current 24-hour activity.', icon: <Zap size={16} /> },
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
      ) : null}

      {stats?.planBreakdown?.length ? (
        <section className="panel stack">
          <div className="row">
            <strong style={{ fontSize: 15 }}>Plan distribution</strong>
            <span className="muted" style={{ fontSize: 13 }}>Users per plan</span>
          </div>
          <div className="stats-grid">
            {stats.planBreakdown.map((entry: any) => (
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

      <div className="admin-toolbar">
        <div className="field">
          <label htmlFor="search">Search users</label>
          <input
            id="search"
            placeholder="Search by email or name"
            value={search}
            onChange={(event) => {
              setPage(1);
              setSearch(event.target.value);
            }}
          />
        </div>
        <div className="field" style={{ maxWidth: 220 }}>
          <label htmlFor="planFilter">Plan filter</label>
          <select
            id="planFilter"
            value={planFilter}
            onChange={(event) => {
              setPage(1);
              setPlanFilter(event.target.value);
            }}
          >
            <option value="">All plans</option>
            {['free', 'solo', 'pro', 'team'].map((plan) => (
              <option key={plan} value={plan}>
                {plan.toUpperCase()}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="admin-split">
        <section className="table-wrap">
          <div className="table-head">
            <strong>Users ({total})</strong>
            <span className="muted" style={{ fontSize: 13 }}>
              Page {page}
            </span>
          </div>

          <div className="admin-table-scroll">
            <table>
              <thead>
                <tr>
                  <th>User</th>
                  <th>Plan</th>
                  <th>Paid</th>
                  <th>Usage 24h</th>
                  <th>Joined</th>
                </tr>
              </thead>
              <tbody>
                {loadingUsers ? (
                  <tr>
                    <td colSpan={5} style={{ textAlign: 'center', color: 'var(--muted)', padding: 40 }}>
                      Loading users...
                    </td>
                  </tr>
                ) : users.length ? (
                  users.map((user) => (
                    <tr
                      key={user.id}
                      onClick={() => setSelectedUserId(user.id)}
                      style={{
                        cursor: 'pointer',
                        background: selectedUserId === user.id ? 'rgba(56,189,248,0.08)' : 'transparent',
                      }}
                    >
                      <td>
                        <div style={{ display: 'grid', gap: 4 }}>
                          <strong>{user.name || user.email}</strong>
                          <span className="muted">{user.email}</span>
                        </div>
                      </td>
                      <td>
                        <span className={`badge ${user.plan === 'free' ? 'slate' : 'purple'}`}>
                          {String(user.plan).toUpperCase()}
                        </span>
                      </td>
                      <td>{money(user.total_paid_paise || 0)}</td>
                      <td>{user.requests_24h || 0}</td>
                      <td className="muted">{date(user.created_at)}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} style={{ textAlign: 'center', color: 'var(--muted)', padding: 40 }}>
                      No users found for the current filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="split-actions" style={{ padding: 20, borderTop: '1px solid var(--line)' }}>
            <button
              className="secondary-button"
              disabled={page === 1}
              onClick={() => setPage((current) => Math.max(1, current - 1))}
            >
              Previous
            </button>
            <button
              className="secondary-button"
              disabled={page * 20 >= total}
              onClick={() => setPage((current) => current + 1)}
            >
              Next
            </button>
          </div>
        </section>

        <aside className="panel admin-detail">
          <div className="row">
            <strong style={{ fontSize: 15 }}>Selected user</strong>
            <span className="badge blue">
              <UserCog size={13} />
              Deep view
            </span>
          </div>

          {loadingDetail ? (
            <div className="loading-panel">Loading selected user...</div>
          ) : selectedUser ? (
            <>
              <div className="admin-muted-box">
                <div className="row" style={{ alignItems: 'flex-start' }}>
                  <div>
                    <strong style={{ fontSize: 18 }}>{selectedUser.user.name || selectedUser.user.email}</strong>
                    <div className="muted" style={{ marginTop: 4 }}>
                      {selectedUser.user.email}
                    </div>
                  </div>
                  <span className={`badge ${selectedUser.user.is_admin ? 'green' : 'slate'}`}>
                    {selectedUser.user.is_admin ? 'Admin' : 'User'}
                  </span>
                </div>

                <div className="meta" style={{ marginTop: 12 }}>
                  <span className="badge blue">{selectedUser.user.plan.toUpperCase()}</span>
                  <span className="badge slate">{dateTime(selectedUser.user.email_verified_at)}</span>
                  <span className="badge slate">Joined {date(selectedUser.user.created_at)}</span>
                </div>
              </div>

              <div className="admin-detail-grid">
                <div className="status-card">
                  <div className="muted">Requests 24h</div>
                  <strong style={{ fontSize: 28 }}>{selectedUser.summary.requests24h}</strong>
                </div>
                <div className="status-card">
                  <div className="muted">Total requests</div>
                  <strong style={{ fontSize: 28 }}>{selectedUser.summary.totalRequests}</strong>
                </div>
                <div className="status-card">
                  <div className="muted">Tokens in</div>
                  <strong style={{ fontSize: 28 }}>{selectedUser.summary.tokensIn}</strong>
                </div>
                <div className="status-card">
                  <div className="muted">Tokens out</div>
                  <strong style={{ fontSize: 28 }}>{selectedUser.summary.tokensOut}</strong>
                </div>
              </div>

              <div className="admin-muted-box">
                <div className="row">
                  <strong style={{ fontSize: 14 }}>Plan controls</strong>
                  <span className="muted" style={{ fontSize: 12 }}>Update subscription or role</span>
                </div>
                <div className="split-actions" style={{ marginTop: 12 }}>
                  <select
                    value={selectedUser.user.plan}
                    onChange={(event) => changePlan(selectedUser.user.id, event.target.value)}
                    disabled={savingUserId === selectedUser.user.id}
                  >
                    {['free', 'solo', 'pro', 'team'].map((plan) => (
                      <option key={plan} value={plan}>
                        {plan.toUpperCase()}
                      </option>
                    ))}
                  </select>
                  <button
                    className={selectedUser.user.is_admin ? 'secondary-button' : 'primary-button'}
                    disabled={savingUserId === selectedUser.user.id}
                    onClick={() => toggleAdmin(selectedUser.user.id, !selectedUser.user.is_admin)}
                  >
                    {selectedUser.user.is_admin ? 'Remove admin' : 'Make admin'}
                  </button>
                </div>
              </div>

              <div className="admin-muted-box">
                <div className="row">
                  <strong style={{ fontSize: 14 }}>API key</strong>
                  <button
                    className="ghost-button"
                    onClick={() => navigator.clipboard.writeText(selectedUser.user.api_key)}
                  >
                    <KeyRound size={14} />
                    Copy key
                  </button>
                </div>
                <code style={{ display: 'block', marginTop: 10, overflow: 'auto' }}>{selectedUser.user.api_key}</code>
              </div>

              <div className="admin-muted-box">
                <div className="row">
                  <strong style={{ fontSize: 14 }}>Recent payments</strong>
                  <span className="muted" style={{ fontSize: 12 }}>{selectedUser.payments.length} records</span>
                </div>
                <div className="admin-list" style={{ marginTop: 12 }}>
                  {selectedUser.payments.length ? selectedUser.payments.map((payment) => (
                    <div key={payment.id} className="admin-user-card">
                      <div className="row">
                        <strong>{payment.plan.toUpperCase()}</strong>
                        <span className="badge blue">{money(payment.amount)}</span>
                      </div>
                      <div className="muted" style={{ fontSize: 12 }}>
                        {payment.status} • {dateTime(payment.created_at)}
                      </div>
                      <div className="muted" style={{ fontSize: 12, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        Payment ID: {payment.payment_id || '—'}
                      </div>
                    </div>
                  )) : (
                    <div className="muted">No payments recorded for this user.</div>
                  )}
                </div>
              </div>

              <div className="admin-muted-box">
                <div className="row">
                  <strong style={{ fontSize: 14 }}>Recent usage</strong>
                  <span className="muted" style={{ fontSize: 12 }}>{selectedUser.usage.length} records</span>
                </div>
                <div className="admin-list" style={{ marginTop: 12 }}>
                  {selectedUser.usage.length ? selectedUser.usage.map((entry) => (
                    <div key={entry.id} className="admin-user-card">
                      <div className="row">
                        <strong>{entry.action}</strong>
                        <span className="badge slate">{dateTime(entry.created_at)}</span>
                      </div>
                      <div className="muted" style={{ fontSize: 12 }}>
                        Model: {entry.model || 'n/a'} • In: {entry.tokens_in} • Out: {entry.tokens_out}
                      </div>
                    </div>
                  )) : (
                    <div className="muted">No usage logged for this user yet.</div>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="empty-state">
              <strong>Select a user to inspect details.</strong>
              <span className="muted" style={{ display: 'block', marginTop: 8 }}>
                You can review plan, admin role, payment history, API key, and usage from here.
              </span>
            </div>
          )}
        </aside>
      </div>

      <section className="table-wrap">
        <div className="table-head">
          <strong>Recent payments</strong>
          <span className="muted" style={{ fontSize: 13 }}>
            Latest {payments.length} payment records
          </span>
        </div>
        <div className="admin-table-scroll">
          <table>
            <thead>
              <tr>
                <th>User</th>
                <th>Plan</th>
                <th>Amount</th>
                <th>Payment ID</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {payments.length ? payments.map((payment) => (
                <tr key={payment.id}>
                  <td>{payment.name || payment.email}</td>
                  <td>{String(payment.plan).toUpperCase()}</td>
                  <td>{money(payment.amount)}</td>
                  <td>{payment.payment_id || '—'}</td>
                  <td>
                    <span className="badge green">{payment.status}</span>
                  </td>
                  <td>{dateTime(payment.created_at)}</td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', color: 'var(--muted)', padding: 40 }}>
                    No recent payments found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}
