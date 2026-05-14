import { useAdmin } from './AdminContext';

export default function AdminActivity() {
  const { activity, activityUserFilter, setActivityUserFilter, loadActivity, dateTime } = useAdmin();

  return (
    <>
      <div className="admin-page-head">
        <h3>Activity</h3>
        <p className="muted">Latest extension and API actions across all accounts, or filtered to one user id.</p>
      </div>

      <section className="panel stack">
        <div className="row" style={{ flexWrap: 'wrap', gap: 12, alignItems: 'flex-end' }}>
          <strong style={{ marginRight: 'auto' }}>Usage stream</strong>
          <div className="field" style={{ minWidth: 240, margin: 0 }}>
            <label htmlFor="actUser">User id</label>
            <input
              id="actUser"
              placeholder="Paste user UUID to narrow"
              value={activityUserFilter}
              onChange={(e) => setActivityUserFilter(e.target.value)}
            />
          </div>
          <button className="primary-button" type="button" onClick={() => void loadActivity()}>
            Apply
          </button>
          <button type="button" className="ghost-button" onClick={() => setActivityUserFilter('')}>
            Clear
          </button>
        </div>
        <p className="muted" style={{ fontSize: 13, margin: 0 }}>
          {activityUserFilter.trim()
            ? 'Filtered to the given user id.'
            : 'Showing the latest events across all accounts.'}
        </p>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>User</th>
                <th>Action</th>
                <th>IP</th>
                <th>Time</th>
              </tr>
            </thead>
            <tbody>
              {activity.length === 0 ? (
                <tr>
                  <td colSpan={4} className="muted">
                    No activity yet
                  </td>
                </tr>
              ) : (
                activity.map((row) => (
                  <tr key={row.id + row.timestamp}>
                    <td>{row.name || row.email}</td>
                    <td>
                      <span className="badge slate">{row.action}</span>
                    </td>
                    <td className="muted">{row.ip_address || '—'}</td>
                    <td className="muted">{dateTime(row.timestamp)}</td>
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
