import { useEffect, useState } from 'react';
import { Check, CreditCard, Receipt } from 'lucide-react';
import api from '../hooks/useApi';

const PLANS = [
  {
    id: 'solo',
    name: 'Solo',
    price: 499,
    limit: 100,
    popular: false,
    desc: 'For individual developers.',
    features: ['100 requests / day', 'Autocomplete + chat', 'Explain, fix, refactor', 'Email support'],
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 999,
    limit: 500,
    popular: true,
    desc: 'For heavy daily users.',
    features: ['500 requests / day', 'Everything in Solo', 'Priority model routing', 'Priority email support'],
  },
  {
    id: 'team',
    name: 'Team',
    price: 799,
    limit: 2000,
    popular: false,
    desc: 'For teams with shared admin.',
    features: ['2,000 requests / day / seat', 'Admin console', 'Centralized billing', 'Slack support'],
  },
];

export default function Billing() {
  const [loading, setLoading] = useState<string | null>(null);
  const [done, setDone] = useState<string | null>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [currentPlan, setCurrentPlan] = useState<string>('free');
  const [currency, setCurrency] = useState<'INR' | 'USD'>('INR');

  useEffect(() => {
    Promise.all([api.get('/billing/history'), api.get('/auth/me')]).then(([h, u]) => {
      setHistory(h.data || []);
      setCurrentPlan(u.data?.plan || 'free');
    });
  }, [done]);

  const pay = async (planId: string, amountMinor: number) => {
    setLoading(planId);
    try {
      const res = await api.post('/billing/create-order', { plan: planId, currency });
      const { orderId } = res.data;

      const options = {
        key: (import.meta as any).env?.VITE_RAZORPAY_KEY || 'rzp_test_xxxx',
        amount: amountMinor,
        currency,
        name: 'DevMind AI',
        description: `DevMind ${planId} plan (${currency})`,
        order_id: orderId,
        handler: async (response: any) => {
          await api.post('/billing/verify', {
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
            plan: planId,
            currency,
          });
          setDone(planId);
          setCurrentPlan(planId);
        },
        theme: { color: '#a78bfa' },
      };
      const razorpay = new (window as any).Razorpay(options);
      razorpay.open();
    } catch {
      window.alert('Payment failed. Please try again.');
    } finally {
      setLoading(null);
    }
  };

  return (
    <>
      <div className="topbar">
        <div className="topbar-copy">
          <h2>Plans & billing</h2>
          <p>Simple, transparent plans. Upgrade or downgrade at any time.</p>
        </div>
        <div className="split-actions">
          <button className={currency === 'INR' ? 'primary-button' : 'secondary-button'} onClick={() => setCurrency('INR')}>INR (₹)</button>
          <button className={currency === 'USD' ? 'primary-button' : 'secondary-button'} onClick={() => setCurrency('USD')}>USD ($)</button>
        </div>
      </div>

      {done ? (
        <div className="success-text">
          <strong>{done.toUpperCase()}</strong> plan activated successfully.
        </div>
      ) : null}

      <div className="pricing-grid">
        {PLANS.map((plan) => {
          const isCurrent = currentPlan === plan.id;
          const buttonLabel = isCurrent
            ? 'Current plan'
            : loading === plan.id
            ? 'Processing…'
            : `Upgrade to ${plan.name}`;

          return (
            <section key={plan.id} className={`pricing-card${plan.popular ? ' popular' : ''}`}>
              <div className="row">
                <h3>{plan.name}</h3>
                {isCurrent ? <span className="badge green">Current</span> : null}
              </div>
              <div className="price-row">
                <strong>{currency === 'INR' ? `₹${plan.price}` : `$${Math.round(plan.price / 55)}`}</strong>
                <span className="muted">/month</span>
              </div>
              <p className="muted" style={{ fontSize: 14, marginTop: -4 }}>{plan.desc}</p>
              <ul className="feature-list">
                {plan.features.map((feature) => (
                  <li key={feature}>
                    <Check size={16} color="#4ade80" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <button
                className={isCurrent || !plan.popular ? 'secondary-button' : 'primary-button'}
                disabled={Boolean(loading) || isCurrent}
                onClick={() => pay(plan.id, currency === 'INR' ? plan.price * 100 : Math.round((plan.price / 55) * 100))}
              >
                <CreditCard size={16} />
                {buttonLabel}
              </button>
            </section>
          );
        })}
      </div>

      <section className="table-wrap">
        <div className="table-head">
          <strong>Payment history</strong>
          <span className="badge slate">
            <Receipt size={13} />
            {history.length} record{history.length === 1 ? '' : 's'}
          </span>
        </div>
        {history.length ? (
          <table>
            <thead>
              <tr>
                <th>Plan</th>
                <th>Amount</th>
                <th>Payment ID</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {history.map((entry) => (
                <tr key={`${entry.payment_id}-${entry.created_at}`}>
                  <td>
                    <span className="badge purple">{String(entry.plan).toUpperCase()}</span>
                  </td>
                  <td>{entry.currency === 'USD' ? `$${(entry.amount / 100).toLocaleString('en-US')}` : `₹${(entry.amount / 100).toLocaleString('en-IN')}`}</td>
                  <td style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 13, color: 'var(--muted)' }}>
                    {entry.payment_id}
                  </td>
                  <td>{new Date(entry.created_at).toLocaleDateString('en-IN')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="empty-state">
            <span className="muted">No payments yet. Your free plan is still active.</span>
          </div>
        )}
      </section>
    </>
  );
}
