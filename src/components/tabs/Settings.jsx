import { useState } from 'react';
import { PageHeader, Field } from '../common';
import { defaultData } from '../../constants/data';
import { getApiKey, setApiKey } from '../../services/gemini';
import { testSupabaseConnection, saveCloudData, fetchCloudData } from '../../services/supabase';
import { todayISO } from '../../utils/helpers';

const SUPABASE_SQL_SETUP = `-- Run this in your Supabase SQL Editor:
create table if not exists public.senior_os_data (
  id text primary key default 'primary_user',
  payload jsonb not null default '{}'::jsonb,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security (RLS)
alter table public.senior_os_data enable row level security;

-- Allow public read/write access using publishable key
create policy "Allow public read" on public.senior_os_data for select using (true);
create policy "Allow public insert" on public.senior_os_data for insert with check (true);
create policy "Allow public update" on public.senior_os_data for update using (true);
`;

export function Settings({ data, update, syncStatus = 'local' }) {
  const s = data.settings || {};
  const [apiKey, setKey] = useState(() => getApiKey());
  const [savedKey, setSavedKey] = useState(false);
  const [testStatus, setTestStatus] = useState(null);
  const [testing, setTesting] = useState(false);
  const [importStatus, setImportStatus] = useState(null);

  // Supabase states
  const [testingSupabase, setTestingSupabase] = useState(false);
  const [supabaseTestRes, setSupabaseTestRes] = useState(null);
  const [manualSyncRes, setManualSyncRes] = useState(null);
  const [copiedSql, setCopiedSql] = useState(false);

  const set = (k, v) =>
    update((d) => {
      if (!d.settings) d.settings = {};
      d.settings[k] = v;
    });

  const handleSaveKey = () => {
    setApiKey(apiKey);
    setSavedKey(true);
    setTimeout(() => setSavedKey(false), 2500);
  };

  const handleTestKey = async () => {
    setTesting(true);
    setTestStatus(null);
    try {
      const keyToTest = apiKey.trim() || getApiKey();
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-lite-latest:generateContent?key=${keyToTest}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: 'Ping' }] }],
          }),
        }
      );
      const json = await res.json();
      if (json.error) {
        setTestStatus({ ok: false, msg: json.error.message || 'API error' });
      } else {
        setTestStatus({ ok: true, msg: 'Gemini Flash Lite connected successfully!' });
      }
    } catch (e) {
      setTestStatus({ ok: false, msg: e.message || 'Connection failed' });
    }
    setTesting(false);
  };

  // Test Supabase
  const handleTestSupabase = async () => {
    setTestingSupabase(true);
    setSupabaseTestRes(null);
    const res = await testSupabaseConnection();
    setSupabaseTestRes(res);
    setTestingSupabase(false);
  };

  // Manual Force Sync to Cloud
  const handleForceCloudSync = async () => {
    setManualSyncRes({ ok: null, msg: 'Pushing to cloud…' });
    const res = await saveCloudData(data);
    if (res.success) {
      setManualSyncRes({ ok: true, msg: '✓ Successfully synced data to Supabase!' });
    } else {
      setManualSyncRes({ ok: false, msg: `✕ Sync failed: ${res.error}` });
    }
    setTimeout(() => setManualSyncRes(null), 3500);
  };

  const copySqlToClipboard = () => {
    navigator.clipboard.writeText(SUPABASE_SQL_SETUP);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2500);
  };

  // Export full backup as JSON
  const handleExportBackup = () => {
    const jsonStr = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `senior-os-backup-${todayISO()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Import backup from JSON file
  const handleImportFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const imported = JSON.parse(event.target.result);
        if (!imported || typeof imported !== 'object' || !imported.grades) {
          throw new Error('Invalid Senior OS backup format');
        }
        update((d) => {
          Object.assign(d, imported);
        });
        setImportStatus({ ok: true, msg: 'Backup successfully restored!' });
        setTimeout(() => setImportStatus(null), 3000);
      } catch (err) {
        setImportStatus({ ok: false, msg: err.message || 'Failed to parse JSON file' });
      }
    };
    reader.readAsText(file);
  };

  const resetAll = () => {
    if (confirm('Reset all Senior OS data back to defaults? This cannot be undone.')) {
      update((d) => {
        Object.assign(d, defaultData());
      });
    }
  };

  return (
    <div className="fade-in">
      <div style={{ marginBottom: 20 }}>
        <div className="display" style={{ fontSize: 24, fontWeight: 700 }}>
          System Settings & Cloud Database
        </div>
        <div style={{ fontSize: 12.5, color: 'var(--text-dim)', marginTop: 2 }}>
          Manage your student profile, UAE dates, Gemini AI, and Supabase cloud sync
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: 20, maxWidth: 1040 }}>
        {/* Supabase Cloud Database */}
        <div className="card" style={{ padding: 20, border: '1px solid var(--border-bright)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 18 }}>⚡</span>
              <div style={{ fontSize: 15, fontWeight: 700 }}>Supabase Cloud Database</div>
            </div>
            <span
              className="chip"
              style={{
                background: syncStatus === 'synced' ? 'var(--green-dim)' : 'var(--blue-dim)',
                color: syncStatus === 'synced' ? 'var(--green)' : '#93C5FD',
                fontWeight: 700,
              }}
            >
              {syncStatus === 'synced' ? '● Live Synced' : syncStatus === 'syncing' ? '● Syncing…' : '● Ready'}
            </span>
          </div>

          <div style={{ fontSize: 12, color: 'var(--text-dim)', marginBottom: 12, lineHeight: 1.5 }}>
            Project: <code style={{ color: 'var(--blue-light)' }}>huipurlxufktnwbysgfr</code>. Your Senior OS data automatically syncs across all devices.
          </div>

          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 14 }}>
            <button
              onClick={handleTestSupabase}
              disabled={testingSupabase}
              className="btn-primary"
              style={{ fontSize: 12 }}
            >
              {testingSupabase ? 'Testing…' : 'Test Cloud Connection'}
            </button>
            <button
              onClick={handleForceCloudSync}
              className="btn-ghost"
              style={{ fontSize: 12 }}
            >
              Force Sync Now
            </button>
          </div>

          {supabaseTestRes && (
            <div
              style={{
                fontSize: 12,
                fontWeight: 600,
                marginBottom: 12,
                color: supabaseTestRes.ok ? 'var(--green)' : 'var(--amber-light)',
              }}
            >
              {supabaseTestRes.ok ? '✓ ' : '⚠️ '}
              {supabaseTestRes.msg}
            </div>
          )}

          {manualSyncRes && (
            <div
              style={{
                fontSize: 12,
                fontWeight: 600,
                marginBottom: 12,
                color: manualSyncRes.ok ? 'var(--green)' : 'var(--red-light)',
              }}
            >
              {manualSyncRes.msg}
            </div>
          )}

          {/* 1-Click Table Setup Helper */}
          <div
            style={{
              background: 'var(--bg-elev)',
              padding: 12,
              borderRadius: 10,
              border: '1px solid var(--border-soft)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <div style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--text-dim)' }}>
                Database SQL Setup (Run Once in Supabase SQL Editor):
              </div>
              <button
                onClick={copySqlToClipboard}
                className="btn-ghost"
                style={{ padding: '2px 8px', fontSize: 11 }}
              >
                {copiedSql ? '✓ Copied!' : 'Copy SQL'}
              </button>
            </div>
            <pre
              style={{
                fontSize: 10.5,
                color: 'var(--text-faint)',
                maxHeight: 90,
                overflowY: 'auto',
                margin: 0,
                lineHeight: 1.4,
              }}
              className="scrollbar-thin"
            >
              {SUPABASE_SQL_SETUP}
            </pre>
          </div>
        </div>

        {/* Student Profile & Academic Dates */}
        <div className="card" style={{ padding: 20 }}>
          <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 14 }}>
            🎓 Student Profile & UAE School Year
          </div>
          <Field label="Full Name">
            <input
              value={s.name || 'Yassin'}
              onChange={(e) => set('name', e.target.value)}
              style={{ width: '100%' }}
            />
          </Field>
          <Field label="School Year Start (UAE MOE Approved: Aug 31, 2026)">
            <input
              type="date"
              value={s.yearStart || '2026-08-31'}
              onChange={(e) => set('yearStart', e.target.value)}
              style={{ width: '100%' }}
            />
          </Field>
          <Field label="Official Graduation Date (UAE MOE Approved: July 02, 2027)">
            <input
              type="date"
              value={s.graduation || '2027-07-02'}
              onChange={(e) => set('graduation', e.target.value)}
              style={{ width: '100%' }}
            />
          </Field>
          <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
            <button
              onClick={() => {
                set('yearStart', '2026-08-31');
                set('graduation', '2027-07-02');
              }}
              className="btn-ghost"
              style={{ fontSize: 11.5 }}
            >
              Sync to Official UAE MOE Dates
            </button>
          </div>
        </div>

        {/* Gemini AI Settings */}
        <div className="card" style={{ padding: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <div style={{ fontSize: 15, fontWeight: 700 }}>✦ Gemini AI Assistant</div>
            <span className="chip" style={{ background: 'var(--green-dim)', color: 'var(--green)' }}>
              Connected
            </span>
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-dim)', marginBottom: 12, lineHeight: 1.5 }}>
            Powers SENIOR AI mentor with real-time streaming, syllabus advice, teacher awareness, and automated planner actions.
          </div>
          <Field label="Gemini API Key">
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setKey(e.target.value)}
              placeholder="Paste your Gemini API key"
              style={{ width: '100%', fontFamily: 'monospace' }}
            />
          </Field>
          <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
            <button onClick={handleSaveKey} className="btn-primary" style={{ fontSize: 12 }}>
              {savedKey ? '✓ Key Saved' : 'Save Key'}
            </button>
            <button
              onClick={handleTestKey}
              disabled={testing}
              className="btn-ghost"
              style={{ fontSize: 12 }}
            >
              {testing ? 'Testing…' : 'Test Connection'}
            </button>
          </div>
          {testStatus && (
            <div
              style={{
                marginTop: 10,
                fontSize: 12,
                fontWeight: 600,
                color: testStatus.ok ? 'var(--green)' : 'var(--red-light)',
              }}
            >
              {testStatus.ok ? '✓ ' : '✕ '}
              {testStatus.msg}
            </div>
          )}
        </div>

        {/* Progressive Web App (PWA) Card */}
        <div className="card" style={{ padding: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 18 }}>📱</span>
              <div style={{ fontSize: 15, fontWeight: 700 }}>Install as App (PWA)</div>
            </div>
            <span className="chip" style={{ background: 'var(--blue-dim)', color: '#93C5FD' }}>
              Offline Ready
            </span>
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-dim)', marginBottom: 12, lineHeight: 1.5 }}>
            Install SENIOR OS on your Windows PC, Mac, iPhone, iPad, or Android for full-screen standalone mode and offline caching.
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 12, color: 'var(--text)' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
              <span>💻</span>
              <span><b>Windows / Chrome / Edge:</b> Click the install icon (⊕ or 💻) in your address bar or the header button.</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
              <span>🍏</span>
              <span><b>iPhone / iPad (Safari):</b> Tap the Share button (square with arrow) ➔ select <b>"Add to Home Screen"</b>.</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
              <span>🤖</span>
              <span><b>Android:</b> Tap the 3 dots ➔ select <b>"Install app"</b> or <b>"Add to Home screen"</b>.</span>
            </div>
          </div>
        </div>

        {/* Data Backup & Restore */}
        <div className="card" style={{ padding: 20 }}>
          <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 8 }}>
            💾 Offline Backup & Restore
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-dim)', marginBottom: 14, lineHeight: 1.5 }}>
            Save an offline JSON snapshot of your homework, exams, grades, study sessions, and goals, or import a backup anytime.
          </div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <button onClick={handleExportBackup} className="btn-primary" style={{ fontSize: 12 }}>
              ⬇ Download Backup (JSON)
            </button>
            <label className="btn-ghost" style={{ fontSize: 12, cursor: 'pointer' }}>
              ⬆ Restore Backup (JSON)
              <input
                type="file"
                accept=".json"
                onChange={handleImportFile}
                style={{ display: 'none' }}
              />
            </label>
          </div>
          {importStatus && (
            <div
              style={{
                marginTop: 10,
                fontSize: 12,
                fontWeight: 600,
                color: importStatus.ok ? 'var(--green)' : 'var(--red-light)',
              }}
            >
              {importStatus.msg}
            </div>
          )}
        </div>

        {/* Danger Zone */}
        <div className="card" style={{ padding: 20, border: '1px solid rgba(239,68,68,0.3)' }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--red-light)', marginBottom: 6 }}>
            ⚠️ Reset Application State
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-dim)', marginBottom: 14, lineHeight: 1.5 }}>
            Reset all your local homework, marks, study sessions, and milestones back to initial state.
          </div>
          <button
            onClick={resetAll}
            className="btn-danger"
          >
            Reset All Data to Defaults
          </button>
        </div>
      </div>
    </div>
  );
}
