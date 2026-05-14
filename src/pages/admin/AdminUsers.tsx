import { NavLink } from 'react-router-dom';
import { KeyRound, UserCog } from 'lucide-react';
import { useAdmin } from './AdminContext';

export default function AdminUsers() {
  const {
    users,
    total,
    page,
    setPage,
    search,
    setSearch,
    planFilter,
    setPlanFilter,
    loadingUsers,
    loadingDetail,
    selectedUserId,
    setSelectedUserId,
    selectedUser,
    savingUserId,
    changePlan,
    toggleAdmin,
    toggleBan,
    paidCell,
    date,
    dateTime,
    formatMinor,
    setActivityUserFilter,
  } = useAdmin();

  return (
    <>
      <div className="admin-page-head">
        <h3>Users</h3>
        <p className="muted">
          Search the directory, open a row for the inspector, then jump to{' '}
          <NavLink to="/admin/activity">Activity</NavLink> or{' '}
          <NavLink to="/admin/payments">Payments</NavLink> for ledgers.
        </p>
      </div>

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
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, alignItems: 'center' }}>
                          <span className={`badge ${user.plan === 'free' ? 'slate' : 'purple'}`}>
                            {String(user.plan).toUpperCase()}
                          </span>
                          {user.banned ? <span className="badge pink">Banned</span> : null}
                        </div>
                      </td>
                      <td className="muted" style={{ fontSize: 13 }}>
                        {paidCell(user)}
                      </td>
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
            <strong style={{ fontSize: 15 }}>Inspector</strong>
            <span className="badge blue">
              <UserCog size={13} />
              Selected user
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
                  {selectedUser.user.banned ? <span className="badge pink">Banned</span> : null}
                  <span className="badge slate">Verified {dateTime(selectedUser.user.email_verified_at)}</span>
                  <span className="badge slate">Joined {date(selectedUser.user.created_at)}</span>
                  <span className="badge slate">Login {dateTime(selectedUser.user.last_login_at)}</span>
                </div>
                {selectedUser.user.ip_address ? (
                  <div className="muted" style={{ fontSize: 12, marginTop: 8 }}>
                    Last IP: <code>{selectedUser.user.ip_address}</code>
                  </div>
                ) : null}
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
                  <strong style={{ fontSize: 14 }}>Plan & roles</strong>
                  <span className="muted" style={{ fontSize: 12 }}>Subscription and privileges</span>
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
                  <NavLink
                    className="ghost-button"
                    to="/admin/activity"
                    onClick={() => setActivityUserFilter(selectedUser.user.id)}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
                  >
                    Activity log
                  </NavLink>
                </div>
              </div>

              <div className="admin-muted-box">
                <div className="row">
                  <strong style={{ fontSize: 14 }}>Access control</strong>
                  <span className="muted" style={{ fontSize: 12 }}>Ban blocks extension API access</span>
                </div>
                <div className="split-actions" style={{ marginTop: 12 }}>
                  <button
                    type="button"
                    className={selectedUser.user.banned ? 'primary-button' : 'secondary-button'}
                    disabled={savingUserId === selectedUser.user.id}
                    onClick={() => toggleBan(selectedUser.user.id, !selectedUser.user.banned)}
                  >
                    {selectedUser.user.banned ? 'Unban account' : 'Ban account'}
                  </button>
                </div>
              </div>

              <div className="admin-muted-box">
                <div className="row">
                  <strong style={{ fontSize: 14 }}>API key</strong>
                  <button
                    type="button"
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
                  <NavLink to="/admin/payments" className="muted" style={{ fontSize: 12 }}>
                    Open ledger →
                  </NavLink>
                </div>
                <div className="admin-list" style={{ marginTop: 12 }}>
                  {selectedUser.payments.length ? (
                    selectedUser.payments.map((payment) => (
                      <div key={payment.id} className="admin-user-card">
                        <div className="row">
                          <strong>{payment.plan.toUpperCase()}</strong>
                          <span className="badge blue">{formatMinor(payment.amount, payment.currency)}</span>
                        </div>
                        <div className="muted" style={{ fontSize: 12 }}>
                          {payment.status} • {dateTime(payment.created_at)}
                        </div>
                        <div className="muted" style={{ fontSize: 12, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          Payment ID: {payment.payment_id || '—'}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="muted">No payments recorded for this user.</div>
                  )}
                </div>
              </div>

              <div className="admin-muted-box">
                <div className="row">
                  <strong style={{ fontSize: 14 }}>Recent usage</strong>
                  <span className="muted" style={{ fontSize: 12 }}>{selectedUser.usage.length} events</span>
                </div>
                <div className="admin-list" style={{ marginTop: 12 }}>
                  {selectedUser.usage.length ? (
                    selectedUser.usage.map((entry) => (
                      <div key={entry.id} className="admin-user-card">
                        <div className="row">
                          <strong>{entry.action}</strong>
                          <span className="badge slate">{dateTime(entry.created_at)}</span>
                        </div>
                        <div className="muted" style={{ fontSize: 12 }}>
                          Model: {entry.model || 'n/a'} • In: {entry.tokens_in} • Out: {entry.tokens_out} •{' '}
                          {entry.request_ms != null ? `${entry.request_ms} ms` : '—'} •{' '}
                          <span className={entry.status === 'error' ? 'badge pink' : 'badge slate'}>
                            {entry.status || 'ok'}
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="muted">No usage logged for this user yet.</div>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="empty-state">
              <strong>Select a user from the table.</strong>
              <span className="muted" style={{ display: 'block', marginTop: 8 }}>
                The inspector shows tokens, payments, API keys, and moderation controls.
              </span>
            </div>
          )}
        </aside>
      </div>
    </>
  );
}
