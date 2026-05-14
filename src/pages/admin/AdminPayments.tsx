import { useAdmin } from './AdminContext';

export default function AdminPayments() {
  const { payments, formatMinor, dateTime } = useAdmin();

  return (
    <>
      <div className="admin-page-head">
        <h3>Payments</h3>
        <p className="muted">Global payment ledger (most recent first).</p>
      </div>

      <section className="panel stack">
        <div className="row" style={{ gap: 10 }}>
          <span className="badge blue">INR: {payments.filter((p) => (p.currency || 'INR') === 'INR').length}</span>
          <span className="badge purple">USD: {payments.filter((p) => (p.currency || 'INR') === 'USD').length}</span>
          <span className="badge green">
            Completed: {payments.filter((p) => (p.status || 'completed') === 'completed').length}
          </span>
        </div>
        <div className="table-wrap">
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
              {payments.length ? (
                payments.map((payment) => (
                  <tr key={payment.id}>
                    <td>{payment.name || payment.email}</td>
                    <td>{String(payment.plan).toUpperCase()}</td>
                    <td>{formatMinor(payment.amount, payment.currency)}</td>
                    <td style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 13 }}>{payment.payment_id || '—'}</td>
                    <td>
                      <span
                        className={`badge ${
                          (payment.status || 'completed') === 'completed' ? 'green' : 'slate'
                        }`}
                      >
                        {payment.status || 'completed'}
                      </span>
                    </td>
                    <td>{dateTime(payment.created_at)}</td>
                  </tr>
                ))
              ) : (
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
