import { useAdmin } from './AdminContext';

export default function AdminObservability() {
  const { obs, dateTime } = useAdmin();

  return (
    <>
      <div className="admin-page-head">
        <h3>Observability</h3>
        <p className="muted">Last 24 hours of request health, latency, and surfaced errors (auto-refresh every 8s).</p>
      </div>

      <section className="panel stack">
        {obs?.summary ? (
          <div className="stats-grid">
            <div className="status-card">
              <div className="muted">Requests</div>
              <strong style={{ fontSize: 28 }}>{obs.summary.total_requests}</strong>
            </div>
            <div className="status-card">
              <div className="muted">Avg Latency</div>
              <strong style={{ fontSize: 28 }}>{obs.summary.avg_latency_ms}ms</strong>
            </div>
            <div className="status-card">
              <div className="muted">Max Latency</div>
              <strong style={{ fontSize: 28 }}>{obs.summary.max_latency_ms}ms</strong>
            </div>
            <div className="status-card">
              <div className="muted">Failures</div>
              <strong style={{ fontSize: 28 }}>{obs.summary.failed_requests}</strong>
            </div>
          </div>
        ) : (
          <div className="muted">No observability data.</div>
        )}
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Action</th>
                <th>Count</th>
                <th>Avg ms</th>
              </tr>
            </thead>
            <tbody>
              {(obs?.byAction || []).map((r: { action: string; cnt: number; avg_ms: number }) => (
                <tr key={r.action}>
                  <td>{r.action}</td>
                  <td>{r.cnt}</td>
                  <td>{r.avg_ms}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {obs?.live?.last5m ? (
          <div className="row" style={{ gap: 12 }}>
            <span className="badge blue">5m req: {obs.live.last5m.requests}</span>
            <span className="badge slate">5m avg: {obs.live.last5m.avg_ms}ms</span>
            <span className="badge purple">fallbacks: {obs.live.fallback?.fallback_count || 0}</span>
          </div>
        ) : null}
        {obs?.errors?.length ? (
          <div className="table-wrap" style={{ marginTop: 16 }}>
            <div className="table-head">
              <strong>Recent error events</strong>
              <span className="muted" style={{ fontSize: 13 }}>
                Last {obs.errors.length} from usage_logs
              </span>
            </div>
            <table>
              <thead>
                <tr>
                  <th>Action</th>
                  <th>Message</th>
                  <th>Time</th>
                </tr>
              </thead>
              <tbody>
                {obs.errors.map((err: { action: string; error_message?: string; created_at: string }, i: number) => (
                  <tr key={`${err.created_at}-${i}`}>
                    <td>
                      <span className="badge pink">{err.action}</span>
                    </td>
                    <td className="muted" style={{ fontSize: 13, maxWidth: 420, wordBreak: 'break-word' }}>
                      {err.error_message || '—'}
                    </td>
                    <td className="muted">{dateTime(err.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
      </section>
    </>
  );
}
