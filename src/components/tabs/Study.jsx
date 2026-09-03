import { useState } from 'react';
import { PageHeader, EmptyState, Bar } from '../common';
import { SUBJECTS, subjInfo } from '../../constants/data';
import { todayISO, startOfWeek, fmtDate, fmtMins } from '../../utils/helpers';

export function Study({ data, update, openModal }) {
  const [viewMode, setViewMode] = useState('analytics'); // 'analytics' | 'history'
  const today = todayISO();
  const weekStart = startOfWeek(today);

  const thisWeek = data.study.filter((s) => s.date >= weekStart);
  const bySubject = {};
  thisWeek.forEach((s) => {
    bySubject[s.subject] = (bySubject[s.subject] || 0) + Number(s.durationMinutes || 0);
  });

  const totalMins = thisWeek.reduce((a, s) => a + Number(s.durationMinutes || 0), 0);
  const maxMins = Math.max(60, ...Object.values(bySubject));

  const remove = (id) =>
    update((d) => {
      d.study = d.study.filter((x) => x.id !== id);
    });

  const sortedSessions = [...data.study].sort((a, b) => b.date.localeCompare(a.date));

  return (
    <div className="fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <div className="display" style={{ fontSize: 24, fontWeight: 700 }}>
            Study Hours & Logs
          </div>
          <div style={{ fontSize: 12.5, color: 'var(--text-dim)', marginTop: 2 }}>
            Track focused study time, revision sessions, and subject balance
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div className="view-mode-toggle">
            <button
              className={`view-mode-btn ${viewMode === 'analytics' ? 'active' : ''}`}
              onClick={() => setViewMode('analytics')}
            >
              <span>📊</span> Analytics
            </button>
            <button
              className={`view-mode-btn ${viewMode === 'history' ? 'active' : ''}`}
              onClick={() => setViewMode('history')}
            >
              <span>📋</span> All Sessions ({sortedSessions.length})
            </button>
          </div>

          <button onClick={() => openModal({ type: 'study' })} className="btn-primary">
            <span>+</span> Log Session
          </button>
        </div>
      </div>

      {/* Metric Cards Banner */}
      <div
        className="card"
        style={{
          padding: '16px 20px',
          marginBottom: 20,
          display: 'flex',
          gap: 24,
          alignItems: 'center',
          flexWrap: 'wrap',
          background: 'var(--bg-elev)',
        }}
      >
        <div>
          <div style={{ fontSize: 11, color: 'var(--text-faint)', textTransform: 'uppercase', fontWeight: 600 }}>
            Study This Week
          </div>
          <div className="display" style={{ fontSize: 24, fontWeight: 700, color: 'var(--blue)' }}>
            {fmtMins(totalMins)}
          </div>
        </div>

        <div style={{ borderLeft: '1px solid var(--border)', height: 32 }} />

        <div>
          <div style={{ fontSize: 11, color: 'var(--text-faint)', textTransform: 'uppercase', fontWeight: 600 }}>
            Sessions Logged
          </div>
          <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--text)' }}>
            {thisWeek.length} this week
          </div>
        </div>

        <div style={{ borderLeft: '1px solid var(--border)', height: 32 }} />

        <div>
          <div style={{ fontSize: 11, color: 'var(--text-faint)', textTransform: 'uppercase', fontWeight: 600 }}>
            Weekly Target
          </div>
          <div style={{ fontSize: 13, color: 'var(--green-light)', fontWeight: 600, marginTop: 2 }}>
            🎯 Target: 20h / week ({Math.round((totalMins / (20 * 60)) * 100)}% met)
          </div>
        </div>
      </div>

      {/* VIEW 1: ANALYTICS & BREAKDOWN */}
      {viewMode === 'analytics' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: 20 }}>
          {/* Subject Distribution Bar Breakdown */}
          <div className="card" style={{ padding: 20 }}>
            <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 16 }}>
              📚 Study Time by Subject (This Week)
            </div>

            {SUBJECTS.filter((s) => s.key !== 'other' || bySubject.other).map((s) => {
              const mins = bySubject[s.key] || 0;
              return (
                <div key={s.key} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                  <div style={{ width: 110, fontSize: 12.5, fontWeight: 500 }}>
                    {s.emoji} {s.label}
                  </div>
                  <div style={{ flex: 1 }}>
                    <Bar pct={(mins / maxMins) * 100} color={s.color || 'var(--blue)'} />
                  </div>
                  <div style={{ width: 65, fontSize: 12, color: mins > 0 ? 'var(--text)' : 'var(--text-faint)', textAlign: 'right', fontWeight: mins > 0 ? 600 : 400 }}>
                    {mins > 0 ? fmtMins(mins) : '—'}
                  </div>
                </div>
              );
            })}

            <div style={{ marginTop: 14, paddingTop: 12, borderTop: '1px solid var(--border-soft)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 13, color: 'var(--text-dim)' }}>Total Active Time</span>
              <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--blue)' }}>{fmtMins(totalMins)}</span>
            </div>
          </div>

          {/* Recent Sessions */}
          <div className="card" style={{ padding: 20 }}>
            <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 14 }}>
              🕒 Recent Study Sessions
            </div>

            {sortedSessions.length === 0 && <EmptyState icon="📖" text="No sessions logged yet." />}

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {sortedSessions.slice(0, 7).map((s) => {
                const sub = subjInfo(s.subject);
                return (
                  <div
                    key={s.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '10px 12px',
                      background: 'var(--bg-elev)',
                      borderRadius: 10,
                      border: '1px solid var(--border-soft)',
                    }}
                  >
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>
                        {sub.emoji} {s.topic || sub.label}
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--text-faint)', marginTop: 2 }}>
                        {fmtDate(s.date)} · {s.method || 'Revision'}
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span className="chip" style={{ background: 'var(--blue-dim)', color: '#93C5FD', fontWeight: 700 }}>
                        {fmtMins(s.durationMinutes)}
                      </span>
                      <button onClick={() => remove(s.id)} className="btn-ghost" style={{ padding: '2px 6px', fontSize: 11, border: 'none' }}>
                        ✕
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: HISTORY TABLE */}
      {viewMode === 'history' && (
        <div className="card" style={{ padding: 12, overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Subject</th>
                <th>Topic / Chapter</th>
                <th>Duration</th>
                <th>Study Method</th>
                <th>Notes</th>
                <th style={{ textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {sortedSessions.map((s) => {
                const sub = subjInfo(s.subject);

                return (
                  <tr key={s.id}>
                    <td>
                      <span style={{ fontWeight: 600 }}>{fmtDate(s.date)}</span>
                    </td>
                    <td>
                      <span style={{ fontWeight: 600, color: sub.color || 'var(--text)' }}>
                        {sub.emoji} {sub.label}
                      </span>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{s.topic || 'General study'}</div>
                    </td>
                    <td>
                      <span className="chip" style={{ background: 'var(--blue-dim)', color: '#93C5FD' }}>
                        {fmtMins(s.durationMinutes)}
                      </span>
                    </td>
                    <td>
                      <span className="chip" style={{ background: 'var(--bg-elev)' }}>
                        {s.method || 'Revision'}
                      </span>
                    </td>
                    <td style={{ color: 'var(--text-dim)', fontSize: 12 }}>{s.notes || '—'}</td>
                    <td style={{ textAlign: 'right' }}>
                      <button onClick={() => remove(s.id)} className="btn-ghost" style={{ padding: '3px 8px', fontSize: 11 }}>
                        ✕
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
