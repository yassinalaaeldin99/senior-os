import { useState, useEffect } from 'react';
import { PageHeader, EmptyState, Bar } from '../common';
import { SUBJECTS, subjInfo } from '../../constants/data';
import { todayISO, startOfWeek, fmtDate, fmtMins, uid } from '../../utils/helpers';

export function Study({ data, update, openModal }) {
  const [viewMode, setViewMode] = useState('timer'); // 'timer' | 'analytics' | 'history'
  const today = todayISO();
  const weekStart = startOfWeek(today);

  // Timer states
  const [timerMinutes, setTimerMinutes] = useState(25);
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [timerRunning, setTimerRunning] = useState(false);
  const [timerSubject, setTimerSubject] = useState('physics');
  const [timerTopic, setTimerTopic] = useState('');
  const [loggedSuccess, setLoggedSuccess] = useState(false);

  useEffect(() => {
    let interval = null;
    if (timerRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((t) => t - 1);
      }, 1000);
    } else if (timeLeft === 0 && timerRunning) {
      setTimerRunning(false);
    }
    return () => clearInterval(interval);
  }, [timerRunning, timeLeft]);

  const selectPreset = (mins) => {
    setTimerMinutes(mins);
    setTimeLeft(mins * 60);
    setTimerRunning(false);
  };

  const handleLogTimerSession = () => {
    const elapsedMins = Math.max(1, Math.round((timerMinutes * 60 - timeLeft) / 60));
    update((d) => {
      d.study.unshift({
        id: uid(),
        date: todayISO(),
        subject: timerSubject,
        topic: timerTopic.trim() || 'Focused Study Session',
        durationMinutes: elapsedMins,
        method: 'Pomodoro Focus',
        notes: '',
      });
    });
    setLoggedSuccess(true);
    setTimeout(() => setLoggedSuccess(false), 3000);
    setTimeLeft(timerMinutes * 60);
    setTimerRunning(false);
  };

  const formatTimer = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

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
      <div className="tab-header">
        <div>
          <div className="display" style={{ fontSize: 24, fontWeight: 700 }}>
            Study Hours & Focus Timer
          </div>
          <div style={{ fontSize: 12.5, color: 'var(--text-dim)', marginTop: 2 }}>
            Track focused study time, revision sessions, and subject balance
          </div>
        </div>

        <div className="tab-header-actions">
          <div className="view-mode-toggle">
            <button
              className={`view-mode-btn ${viewMode === 'timer' ? 'active' : ''}`}
              onClick={() => setViewMode('timer')}
            >
              <span>⏱️</span> Focus Timer
            </button>
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

      {/* VIEW 1: INTERACTIVE FOCUS POMODORO TIMER */}
      {viewMode === 'timer' && (
        <div className="cards-grid">
          <div
            className="card"
            style={{
              padding: '28px 24px',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 18,
              border: timerRunning ? '1px solid var(--blue)' : '1px solid var(--border-soft)',
              boxShadow: timerRunning ? '0 0 24px rgba(59,130,246,0.2)' : 'var(--shadow-sm)',
            }}
          >
            <div style={{ display: 'flex', gap: 8 }}>
              {[25, 45, 60].map((mins) => (
                <button
                  key={mins}
                  onClick={() => selectPreset(mins)}
                  className="btn-ghost"
                  style={{
                    background: timerMinutes === mins ? 'var(--blue-dim)' : 'transparent',
                    borderColor: timerMinutes === mins ? 'var(--blue)' : 'var(--border)',
                    color: timerMinutes === mins ? '#93C5FD' : 'var(--text-dim)',
                    fontWeight: timerMinutes === mins ? 700 : 500,
                    padding: '5px 12px',
                    fontSize: 12,
                  }}
                >
                  {mins} min
                </button>
              ))}
            </div>

            {/* Glowing Big Timer Countdown */}
            <div
              className="display"
              style={{
                fontSize: 'clamp(52px, 12vw, 76px)',
                fontWeight: 700,
                color: timerRunning ? 'var(--blue-light)' : 'var(--text)',
                letterSpacing: 2,
                fontVariantNumeric: 'tabular-nums',
                textShadow: timerRunning ? '0 0 30px rgba(59,130,246,0.4)' : 'none',
              }}
            >
              {formatTimer(timeLeft)}
            </div>

            {/* Subject and Topic Configuration */}
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center', width: '100%', maxWidth: 420 }}>
              <select
                value={timerSubject}
                onChange={(e) => setTimerSubject(e.target.value)}
                style={{ flex: 1, minWidth: 160, padding: '8px 12px' }}
              >
                {SUBJECTS.filter((s) => s.key !== 'other').map((s) => (
                  <option key={s.key} value={s.key}>
                    {s.emoji} {s.label} ({s.teacher})
                  </option>
                ))}
              </select>

              <input
                type="text"
                placeholder="Topic (e.g. Electromagnetism)"
                value={timerTopic}
                onChange={(e) => setTimerTopic(e.target.value)}
                style={{ flex: 1, minWidth: 160, padding: '8px 12px' }}
              />
            </div>

            {/* Controls */}
            <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginTop: 4 }}>
              <button
                onClick={() => setTimerRunning((v) => !v)}
                className="btn-primary"
                style={{
                  fontSize: 15,
                  padding: '10px 28px',
                  background: timerRunning ? 'var(--amber)' : 'linear-gradient(135deg, var(--blue), #2563EB)',
                }}
              >
                {timerRunning ? '⏸ Pause' : '▶ Start Focus'}
              </button>

              <button
                onClick={() => {
                  setTimeLeft(timerMinutes * 60);
                  setTimerRunning(false);
                }}
                className="btn-ghost"
                style={{ padding: '10px 16px', fontSize: 13 }}
              >
                ↺ Reset
              </button>

              <button
                onClick={handleLogTimerSession}
                className="btn-ghost"
                style={{ padding: '10px 16px', fontSize: 13, borderColor: 'var(--green)', color: 'var(--green-light)' }}
                title="Save time spent as study log"
              >
                💾 Log Session
              </button>
            </div>

            {loggedSuccess && (
              <div style={{ color: 'var(--green)', fontSize: 13, fontWeight: 600 }}>
                ✓ Session logged & synced to database!
              </div>
            )}
          </div>

          {/* Quick Subject Study Breakdown */}
          <div className="card" style={{ padding: 20 }}>
            <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 14 }}>
              📚 Study Time Distribution
            </div>
            {SUBJECTS.filter((s) => s.key !== 'other' || bySubject.other).map((s) => {
              const mins = bySubject[s.key] || 0;
              return (
                <div key={s.key} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                  <div style={{ width: 105, fontSize: 12, fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {s.emoji} {s.label}
                  </div>
                  <div style={{ flex: 1 }}>
                    <Bar pct={(mins / maxMins) * 100} color={s.color || 'var(--blue)'} />
                  </div>
                  <div style={{ width: 60, fontSize: 11.5, color: mins > 0 ? 'var(--text)' : 'var(--text-faint)', textAlign: 'right', fontWeight: mins > 0 ? 600 : 400 }}>
                    {mins > 0 ? fmtMins(mins) : '—'}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* VIEW 2: ANALYTICS & BREAKDOWN */}
      {viewMode === 'analytics' && (
        <div className="cards-grid">
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

      {/* VIEW 3: FULL HISTORY LIST */}
      {viewMode === 'history' && (
        <div className="card" style={{ padding: 16 }}>
          {sortedSessions.length === 0 && <EmptyState icon="📖" text="No study sessions recorded yet." />}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {sortedSessions.map((s) => {
              const sub = subjInfo(s.subject);
              return (
                <div
                  key={s.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 14px',
                    background: 'var(--bg-elev)',
                    borderRadius: 10,
                    border: '1px solid var(--border-soft)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span style={{ fontSize: 20 }}>{sub.emoji}</span>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>
                        {sub.label} — {s.topic || 'Revision'}
                      </div>
                      <div style={{ fontSize: 11.5, color: 'var(--text-faint)', marginTop: 2 }}>
                        {fmtDate(s.date)} · Teacher: {sub.teacher} · Method: {s.method || 'Revision'}
                        {s.notes ? ` · "${s.notes}"` : ''}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span className="chip" style={{ background: 'var(--blue-dim)', color: '#93C5FD', fontWeight: 700, fontSize: 12 }}>
                      ⏱️ {fmtMins(s.durationMinutes)}
                    </span>
                    <button
                      onClick={() => remove(s.id)}
                      className="btn-danger"
                      style={{ padding: '4px 8px', fontSize: 11 }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
