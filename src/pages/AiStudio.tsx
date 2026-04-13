import { useEffect, useState } from 'react';
import { Brain, Save, Shield, Sparkles } from 'lucide-react';
import api from '../hooks/useApi';

type Intent = 'build' | 'debug' | 'refactor' | 'optimize' | 'secure';

export default function AiStudio() {
  const [intent, setIntent] = useState<Intent>('build');
  const [autoVerify, setAutoVerify] = useState(false);
  const [projectMemory, setProjectMemory] = useState('');
  const [temperature, setTemperature] = useState(0.15);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    api.get('/preferences')
      .then((res) => {
        setIntent(res.data?.defaultIntent || 'build');
        setAutoVerify(Boolean(res.data?.autoVerify));
        setProjectMemory(String(res.data?.projectMemory || ''));
        setTemperature(Number(res.data?.preferredTemperature ?? 0.15));
      })
      .finally(() => setLoading(false));
  }, []);

  const save = async () => {
    setSaving(true);
    setMsg('');
    try {
      await api.patch('/preferences', {
        defaultIntent: intent,
        autoVerify,
        projectMemory,
        preferredTemperature: temperature,
      });
      setMsg('Saved AI studio settings.');
    } catch (e: any) {
      setMsg(e?.response?.data?.error || 'Failed to save settings.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="loading-panel">Loading AI studio…</div>;

  return (
    <>
      <div className="topbar">
        <div className="topbar-copy">
          <span className="eyebrow"><Brain size={13} /> AI Studio</span>
          <h2>Tune DevMind to your workflow.</h2>
          <p>Set default assistant intent, project memory, and verification behavior shared across your account.</p>
        </div>
      </div>

      <section className="panel stack">
        <div className="row">
          <strong style={{ fontSize: 16 }}>Default intent mode</strong>
          <span className="badge blue"><Sparkles size={13} /> Active in chat</span>
        </div>
        <div className="split-actions">
          {(['build', 'debug', 'refactor', 'optimize', 'secure'] as Intent[]).map((x) => (
            <button
              key={x}
              className={intent === x ? 'primary-button' : 'secondary-button'}
              onClick={() => setIntent(x)}
            >
              {x}
            </button>
          ))}
        </div>
      </section>

      <section className="panel stack">
        <div className="row">
          <strong style={{ fontSize: 16 }}>Project memory</strong>
          <span className="muted" style={{ fontSize: 12 }}>{projectMemory.length}/12000</span>
        </div>
        <textarea
          rows={8}
          value={projectMemory}
          onChange={(e) => setProjectMemory(e.target.value.slice(0, 12000))}
          placeholder="Store architecture decisions, coding conventions, domain terms, and constraints..."
        />
      </section>

      <section className="panel stack">
        <div className="row">
          <strong style={{ fontSize: 16 }}>Reliability controls</strong>
          <span className="badge slate"><Shield size={13} /> Safer output</span>
        </div>
        <label className="row" style={{ justifyContent: 'flex-start', gap: 10 }}>
          <input type="checkbox" checked={autoVerify} onChange={(e) => setAutoVerify(e.target.checked)} />
          <span>Enable auto-verify workflow (lint/test/build checks)</span>
        </label>
        <div className="field" style={{ maxWidth: 320 }}>
          <label>Preferred temperature ({temperature.toFixed(2)})</label>
          <input
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={temperature}
            onChange={(e) => setTemperature(Number(e.target.value))}
          />
        </div>
      </section>

      <div className="split-actions">
        <button className="primary-button" onClick={save} disabled={saving}>
          <Save size={15} /> {saving ? 'Saving...' : 'Save AI settings'}
        </button>
        {msg ? <span className="muted" style={{ alignSelf: 'center' }}>{msg}</span> : null}
      </div>
    </>
  );
}
