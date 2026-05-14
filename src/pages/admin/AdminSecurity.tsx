import { useAdmin } from './AdminContext';

export default function AdminSecurity() {
  const { ipSessions, sessions, dateTime } = useAdmin();

  return (
    <>
      <div className="admin-page-head">
        <h3>Security</h3>
        <p className="muted">Client IPs tied to accounts and recent session-style activity summaries.</p>
      </div>

      <section className="panel stack">
        <div className="row">
          <strong>IP addresses</strong>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>User</th>
                <th>IP Address</th>
                <th>Last Login</th>
                <th>Requests</th>
              </tr>
            </thead>
            <tbody>
              {ipSessions.length === 0 ? (
                <tr>
                  <td colSpan={4} className="muted">
                    No IPs recorded
                  </td>
                </tr>
              ) : (
                ipSessions.map((row) => (
                  <tr key={row.id}>
                    <td>{row.name || row.email}</td>
                    <td>
                      <code style={{ fontSize: 12 }}>{row.ip_address || '—'}</code>
                    </td>
                    <td className="muted">{dateTime(row.last_login_at)}</td>
                    <td>{row.request_count}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="panel stack" style={{ marginTop: 20 }}>
        <div className="row">
          <strong>Sessions</strong>
          <span className="muted" style={{ fontSize: 13 }}>Verified users with latest API activity</span>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>User</th>
                <th>IP</th>
                <th>Last Activity</th>
                <th>Requests</th>
              </tr>
            </thead>
            <tbody>
              {sessions.length === 0 ? (
                <tr>
                  <td colSpan={4} className="muted">
                    No sessions
                  </td>
                </tr>
              ) : (
                sessions.map((row: { id: string; name: string; email: string; ip_address?: string; last_activity?: string; total_requests: number }) => (
                  <tr key={row.id}>
                    <td>{row.name || row.email}</td>
                    <td>
                      <code style={{ fontSize: 12 }}>{row.ip_address || '—'}</code>
                    </td>
                    <td className="muted">{dateTime(row.last_activity)}</td>
                    <td>{row.total_requests}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}
