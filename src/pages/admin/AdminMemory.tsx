import { useAdmin } from './AdminContext';

export default function AdminMemory() {
  const {
    teamMemory,
    policyName,
    setPolicyName,
    policyText,
    setPolicyText,
    policyPriority,
    setPolicyPriority,
    savePolicy,
    updatePolicy,
  } = useAdmin();

  return (
    <>
      <div className="admin-page-head">
        <h3>Team memory</h3>
        <p className="muted">Global policies that shape assistant behavior for your workspace.</p>
      </div>

      <section className="panel stack">
        <div className="field">
          <label>Policy name</label>
          <input value={policyName} onChange={(e) => setPolicyName(e.target.value)} />
        </div>
        <div className="field">
          <label>Policy text</label>
          <textarea rows={4} value={policyText} onChange={(e) => setPolicyText(e.target.value)} />
        </div>
        <div className="field">
          <label>Priority</label>
          <input
            type="number"
            value={policyPriority}
            onChange={(e) => setPolicyPriority(Number(e.target.value || 100))}
          />
        </div>
        <div className="split-actions">
          <button type="button" className="primary-button" onClick={() => void savePolicy()}>
            Add policy
          </button>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Scope</th>
                <th>Status</th>
                <th>Priority</th>
                <th>Policy</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {teamMemory.map((m) => (
                <tr key={m.id}>
                  <td>{m.policy_name}</td>
                  <td>{m.scope}</td>
                  <td>{m.status || (m.is_active ? 'approved' : 'disabled')}</td>
                  <td>{m.priority || 100}</td>
                  <td className="muted">{m.policy_text}</td>
                  <td>
                    <div className="split-actions">
                      <button
                        type="button"
                        className="ghost-button"
                        onClick={() => void updatePolicy(m.id, { status: 'approved', isActive: true })}
                      >
                        Approve
                      </button>
                      <button
                        type="button"
                        className="ghost-button"
                        onClick={() => void updatePolicy(m.id, { status: 'draft', isActive: false })}
                      >
                        Disable
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}
