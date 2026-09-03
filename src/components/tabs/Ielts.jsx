import { useState } from 'react';
import { PageHeader, Bar, Chip, MiniStat, EmptyState } from '../common';
import { todayISO, daysBetween, fmtDate } from '../../utils/helpers';

export function Ielts({ data, update, openModal }) {
  const [viewMode, setViewMode] = useState('overview'); // 'overview' | 'sessions'
  const i = data.ielts;
  const avg =
    (i.current.listening + i.current.reading + i.current.writing + i.current.speaking) / 4;
  const daysLeft = i.examDate ? daysBetween(todayISO(), i.examDate) : null;

  const setSkill = (skill, val) =>
    update((d) => {
      d.ielts.current[skill] = Number(val);
    });

  const removeSession = (id) =>
    update((d) => {
      d.ielts.sessions = d.ielts.sessions.filter((x) => x.id !== id);
    });

  const totalHrs = i.sessions.reduce((a, s) => a + Number(s.durationMinutes || 0), 0) / 60;
  const bestMock = i.mockTests.length
    ? Math.max(...i.mockTests.map((m) => Number(m.overall)))
    : null;
  const avgMock = i.mockTests.length
    ? i.mockTests.reduce((a, m) => a + Number(m.overall), 0) / i.mockTests.length
    : null;

  const sortedSessions = [...i.sessions].sort((a, b) => b.date.localeCompare(a.date));

  return (
    <div className="fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <div className="display" style={{ fontSize: 24, fontWeight: 700 }}>
            IELTS Academic Preparation
          </div>
          <div style={{ fontSize: 12.5, color: 'var(--text-dim)', marginTop: 2 }}>
            Band score tracking, 4-skill breakdown, and mock examination logs
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div className="view-mode-toggle">
            <button
              className={`view-mode-btn ${viewMode === 'overview' ? 'active' : ''}`}
              onClick={() => setViewMode('overview')}
            >
              <span>🇬🇧</span> Band Overview
            </button>
            <button
              className={`view-mode-btn ${viewMode === 'sessions' ? 'active' : ''}`}
              onClick={() => setViewMode('sessions')}
            >
              <span>📋</span> All Sessions ({sortedSessions.length})
            </button>
          </div>

          <button onClick={() => openModal({ type: 'ielts' })} className="btn-primary">
            <span>+</span> Log Practice
          </button>
        </div>
      </div>

      {/* Metric Cards Banner */}
      <div
        className="card"
        style={{
          padding: '18px 24px',
          marginBottom: 24,
          display: 'flex',
          gap: 28,
          alignItems: 'center',
          flexWrap: 'wrap',
          background: 'linear-gradient(135deg, var(--card), var(--card-hi))',
        }}
      >
        <div>
          <div style={{ fontSize: 11, color: 'var(--text-faint)', textTransform: 'uppercase', fontWeight: 600 }}>
            Current Band Estimate
          </div>
          <div className="display" style={{ fontSize: 32, fontWeight: 700, color: 'var(--blue)' }}>
            {avg.toFixed(1)} / 9.0
          </div>
        </div>

        <div style={{ borderLeft: '1px solid var(--border)', height: 42 }} />

        <div>
          <div style={{ fontSize: 11, color: 'var(--text-faint)', textTransform: 'uppercase', fontWeight: 600 }}>
            Medical Admission Target
          </div>
          <div className="display" style={{ fontSize: 32, fontWeight: 700, color: 'var(--green)' }}>
            {i.target || '7.5'}
          </div>
        </div>

        <div style={{ borderLeft: '1px solid var(--border)', height: 42 }} />

        <div>
          <div style={{ fontSize: 11, color: 'var(--text-faint)', textTransform: 'uppercase', fontWeight: 600 }}>
            Practice Logged
          </div>
          <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--text)' }}>
            {totalHrs.toFixed(1)} Hours
          </div>
        </div>

        <div style={{ borderLeft: '1px solid var(--border)', height: 42 }} />

        <div>
          <div style={{ fontSize: 11, color: 'var(--text-faint)', textTransform: 'uppercase', fontWeight: 600 }}>
            Exam Countdown
          </div>
          <div style={{ fontSize: 18, fontWeight: 700, color: daysLeft && daysLeft <= 14 ? 'var(--red-light)' : 'var(--amber-light)' }}>
            {daysLeft != null ? (daysLeft >= 0 ? `${daysLeft} Days` : 'Completed') : 'Date not set'}
          </div>
        </div>
      </div>

      {/* VIEW 1: OVERVIEW & SKILLS */}
      {viewMode === 'overview' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: 20 }}>
          {/* Skill Breakdown */}
          <div className="card" style={{ padding: 20 }}>
            <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 14 }}>
              🎯 4-Skill Mastery Breakdown
            </div>

            {['listening', 'reading', 'writing', 'speaking'].map((skill) => (
              <div key={skill} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
                <div style={{ width: 85, fontSize: 13, textTransform: 'capitalize', fontWeight: 600 }}>
                  {skill}
                </div>
                <div style={{ flex: 1 }}>
                  <Bar pct={(i.current[skill] / 9) * 100} color="var(--blue)" />
                </div>
                <input
                  type="number"
                  step="0.5"
                  min="0"
                  max="9"
                  value={i.current[skill]}
                  onChange={(e) => setSkill(skill, e.target.value)}
                  style={{ width: 56, fontSize: 13, padding: '4px 6px', textAlign: 'center', fontWeight: 700 }}
                />
              </div>
            ))}

            <div style={{ marginTop: 18, paddingTop: 14, borderTop: '1px solid var(--border-soft)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontSize: 12, color: 'var(--text-dim)', fontWeight: 500 }}>
                Scheduled Test Date
              </div>
              <input
                type="date"
                value={i.examDate || ''}
                onChange={(e) =>
                  update((d) => {
                    d.ielts.examDate = e.target.value;
                  })
                }
                style={{ fontSize: 12, padding: '5px 8px' }}
              />
            </div>
          </div>

          {/* Quick Mock Summary & Recent Sessions */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <div className="card" style={{ padding: 20 }}>
              <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 12 }}>
                📝 Mock Test Benchmarks
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
                <div style={{ background: 'var(--bg-elev)', padding: '10px 12px', borderRadius: 10, textAlign: 'center' }}>
                  <div style={{ fontSize: 11, color: 'var(--text-faint)' }}>Total Mocks</div>
                  <div style={{ fontSize: 18, fontWeight: 700, marginTop: 2 }}>{i.mockTests.length}</div>
                </div>
                <div style={{ background: 'var(--bg-elev)', padding: '10px 12px', borderRadius: 10, textAlign: 'center' }}>
                  <div style={{ fontSize: 11, color: 'var(--text-faint)' }}>Average</div>
                  <div style={{ fontSize: 18, fontWeight: 700, marginTop: 2 }}>{avgMock != null ? avgMock.toFixed(1) : '—'}</div>
                </div>
                <div style={{ background: 'var(--bg-elev)', padding: '10px 12px', borderRadius: 10, textAlign: 'center' }}>
                  <div style={{ fontSize: 11, color: 'var(--text-faint)' }}>Best Mock</div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--green)', marginTop: 2 }}>{bestMock != null ? bestMock.toFixed(1) : '—'}</div>
                </div>
              </div>
            </div>

            <div className="card" style={{ padding: 20, flex: 1 }}>
              <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 12 }}>
                🕒 Recent Practice Sessions
              </div>
              {sortedSessions.length === 0 && (
                <EmptyState icon="🇬🇧" text="No IELTS sessions logged yet." />
              )}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {sortedSessions.slice(0, 5).map((s) => (
                  <div
                    key={s.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '8px 12px',
                      background: 'var(--bg-elev)',
                      borderRadius: 8,
                      border: '1px solid var(--border-soft)',
                    }}
                  >
                    <div>
                      <span style={{ fontWeight: 600, textTransform: 'capitalize', fontSize: 13 }}>
                        {s.skill}
                      </span>
                      <span style={{ fontSize: 11.5, color: 'var(--text-faint)', marginLeft: 8 }}>
                        {fmtDate(s.date)} · {s.durationMinutes} min
                      </span>
                    </div>
                    <button
                      onClick={() => removeSession(s.id)}
                      className="btn-ghost"
                      style={{ padding: '2px 6px', fontSize: 11, border: 'none' }}
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: ALL SESSIONS TABLE */}
      {viewMode === 'sessions' && (
        <div className="card" style={{ padding: 12, overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Skill Focus</th>
                <th>Duration</th>
                <th>Notes / Materials</th>
                <th style={{ textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {sortedSessions.map((s) => (
                <tr key={s.id}>
                  <td>
                    <span style={{ fontWeight: 600 }}>{fmtDate(s.date)}</span>
                  </td>
                  <td>
                    <span className="chip" style={{ background: 'var(--blue-dim)', color: '#93C5FD', textTransform: 'capitalize' }}>
                      {s.skill}
                    </span>
                  </td>
                  <td>{s.durationMinutes} mins</td>
                  <td style={{ color: 'var(--text-dim)', fontSize: 12.5 }}>{s.notes || '—'}</td>
                  <td style={{ textAlign: 'right' }}>
                    <button onClick={() => removeSession(s.id)} className="btn-ghost" style={{ padding: '3px 8px', fontSize: 11 }}>
                      ✕
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
