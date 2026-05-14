import { RefreshCw } from 'lucide-react';
import { useAdmin } from './AdminContext';

export default function AdminRevenue() {
  const { revenue, money, loadRevenue } = useAdmin();

  return (
    <>
      <div className="admin-page-head">
        <h3>Revenue</h3>
        <p className="muted">Plan and currency rollups plus trailing daily totals.</p>
      </div>

      <section className="panel stack">
        <div className="row">
          <strong>Analytics</strong>
          <button type="button" className="secondary-button" onClick={() => void loadRevenue()}>
            <RefreshCw size={14} />
            Refresh
          </button>
        </div>
        {!revenue ? (
          <div className="muted">Loading…</div>
        ) : (
          <>
            <div className="table-wrap">
              <div className="table-head">
                <strong>By plan & currency</strong>
              </div>
              <table>
                <thead>
                  <tr>
                    <th>Plan</th>
                    <th>Currency</th>
                    <th>Count</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {(revenue.byPlan || []).length ? (
                    revenue.byPlan.map((r: { plan: string; currency: string; cnt: number; total: number }, i: number) => (
                      <tr key={`${r.plan}-${r.currency}-${i}`}>
                        <td>{String(r.plan).toUpperCase()}</td>
                        <td>{r.currency}</td>
                        <td>{r.cnt}</td>
                        <td>{r.currency === 'USD' ? `$${(Number(r.total) / 100).toFixed(2)}` : money(Number(r.total))}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="muted">
                        No payment rows yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className="table-wrap" style={{ marginTop: 16 }}>
              <div className="table-head">
                <strong>Daily totals (30 days)</strong>
              </div>
              <table>
                <thead>
                  <tr>
                    <th>Day</th>
                    <th>Currency</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {(revenue.daily || []).map(
                    (r: { day: string; currency: string; total: number }, i: number) => (
                      <tr key={`${r.day}-${r.currency}-${i}`}>
                        <td>{String(r.day)}</td>
                        <td>{r.currency}</td>
                        <td>{r.currency === 'USD' ? `$${(Number(r.total) / 100).toFixed(2)}` : money(Number(r.total))}</td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}
      </section>
    </>
  );
}
