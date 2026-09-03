import { useState } from 'react';
import { PageHeader, SectionTitle, MiniStat, Bar } from '../common';
import { MONTHS, MONTH_FOCUS, UAE_MOE_CALENDAR_2026_2027 } from '../../constants/data';
import {
  todayISO,
  daysBetween,
  currentSeniorMonth,
  monthProgress,
  pctDone,
  overallAverage,
  fmtDate,
} from '../../utils/helpers';

export function Timeline({ data, update }) {
  const [viewMode, setViewMode] = useState('moe'); // 'moe' | 'grid' | 'milestones'
  const grad = data.settings?.graduation || '2027-07-02';
  const today = todayISO();
  const daysToGrad = daysBetween(today, grad);

  const setMilestoneDate = (id, date) =>
    update((d) => {
      const m = d.milestones.find((x) => x.id === id);
      if (m) m.date = date;
    });

  const toggleMilestone = (id) =>
    update((d) => {
      const m = d.milestones.find((x) => x.id === id);
      if (m) m.done = !m.done;
    });

  const totalStudyHours = (
    data.study.reduce((a, s) => a + Number(s.durationMinutes || 0), 0) / 60
  ).toFixed(0);

  return (
    <div className="fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <div className="display" style={{ fontSize: 24, fontWeight: 700 }}>
            Academic Year Plan & Timeline
          </div>
          <div style={{ fontSize: 12.5, color: 'var(--text-dim)', marginTop: 2 }}>
            Official UAE Ministry of Education (MOE) 2026–2027 Calendar & Graduation Roadmap
          </div>
        </div>

        <div className="view-mode-toggle">
          <button
            className={`view-mode-btn ${viewMode === 'moe' ? 'active' : ''}`}
            onClick={() => setViewMode('moe')}
          >
            <span>🇦🇪</span> UAE Official Plan
          </button>
          <button
            className={`view-mode-btn ${viewMode === 'grid' ? 'active' : ''}`}
            onClick={() => setViewMode('grid')}
          >
            <span>🗓️</span> Month Roadmap
          </button>
          <button
            className={`view-mode-btn ${viewMode === 'milestones' ? 'active' : ''}`}
            onClick={() => setViewMode('milestones')}
          >
            <span>🚩</span> Personal Milestones
          </button>
        </div>
      </div>

      {/* Graduation Countdown Bar */}
      <div
        className="card"
        style={{
          padding: '20px 24px',
          marginBottom: 24,
          display: 'flex',
          gap: 32,
          alignItems: 'center',
          flexWrap: 'wrap',
          background: 'linear-gradient(135deg, var(--card), var(--card-hi))',
          border: '1px solid var(--border-bright)',
        }}
      >
        <div>
          <div style={{ fontSize: 11, color: 'var(--text-faint)', textTransform: 'uppercase', fontWeight: 600 }}>
            Official Graduation Date
          </div>
          <div className="display" style={{ fontSize: 32, fontWeight: 700, color: 'var(--blue)' }}>
            {daysToGrad} Days Left
          </div>
          <div style={{ fontSize: 11.5, color: 'var(--text-faint)', marginTop: 2 }}>
            July 02, 2027 (02 يوليو 2027)
          </div>
        </div>

        <div style={{ borderLeft: '1px solid var(--border)', height: 42 }} />

        <div>
          <div style={{ fontSize: 11, color: 'var(--text-faint)', textTransform: 'uppercase', fontWeight: 600 }}>
            HW Completion Rate
          </div>
          <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--green)' }}>
            {pctDone(data.homework)}
          </div>
        </div>

        <div style={{ borderLeft: '1px solid var(--border)', height: 42 }} />

        <div>
          <div style={{ fontSize: 11, color: 'var(--text-faint)', textTransform: 'uppercase', fontWeight: 600 }}>
            Cumulative GPA
          </div>
          <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--text)' }}>
            {(overallAverage(data.grades) || 0).toFixed(1)}%
          </div>
        </div>

        <div style={{ borderLeft: '1px solid var(--border)', height: 42 }} />

        <div>
          <div style={{ fontSize: 11, color: 'var(--text-faint)', textTransform: 'uppercase', fontWeight: 600 }}>
            Total Study Logged
          </div>
          <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--violet)' }}>
            {totalStudyHours}h
          </div>
        </div>
      </div>

      {/* VIEW 1: OFFICIAL UAE MOE CALENDAR */}
      {viewMode === 'moe' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div
            className="card"
            style={{
              padding: '20px 24px',
              borderLeft: '4px solid #10B981',
              background: 'linear-gradient(135deg, rgba(16,185,129,0.06), var(--card))',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 10 }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 20 }}>🇦🇪</span>
                  <div style={{ fontSize: 17, fontWeight: 700 }}>
                    التقويم الأكاديمي المعتمد للأعوام الدراسية 2026 – 2027
                  </div>
                </div>
                <div style={{ fontSize: 12.5, color: 'var(--text-dim)', marginTop: 4 }}>
                  وزارة التربية والتعليم الإماراتية · المدارس الحكومية والخاصة على مستوى الدولة
                </div>
              </div>
              <span className="chip" style={{ background: 'var(--green-dim)', color: 'var(--green)', fontWeight: 700 }}>
                ✓ Official Decree
              </span>
            </div>
          </div>

          <div className="card" style={{ padding: 12, overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Event / المناسبة</th>
                  <th>Dates (التاريخ)</th>
                  <th>Countdown / المتبقي</th>
                  <th>Type</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {UAE_MOE_CALENDAR_2026_2027.map((event) => {
                  const daysStart = daysBetween(today, event.startDate);
                  const daysEnd = daysBetween(today, event.endDate);
                  const isOngoing = daysStart <= 0 && daysEnd >= 0;
                  const isPast = daysEnd < 0;

                  return (
                    <tr key={event.key}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <span style={{ fontSize: 18 }}>{event.emoji}</span>
                          <div>
                            <div style={{ fontWeight: 700, fontSize: 13.5 }}>{event.eventEn}</div>
                            <div style={{ fontSize: 11.5, color: 'var(--text-faint)', direction: 'rtl' }}>
                              {event.eventAr}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td>
                        <div style={{ fontWeight: 600 }}>
                          {event.startDate === event.endDate
                            ? fmtDate(event.startDate)
                            : `${fmtDate(event.startDate)} – ${fmtDate(event.endDate)}`}
                        </div>
                      </td>

                      <td>
                        {isPast ? (
                          <span className="chip" style={{ background: 'var(--bg-elev)', color: 'var(--text-faint)' }}>
                            Completed
                          </span>
                        ) : isOngoing ? (
                          <span className="chip" style={{ background: 'var(--green-dim)', color: 'var(--green)', fontWeight: 700 }}>
                            Happening Now!
                          </span>
                        ) : (
                          <span
                            className="chip"
                            style={{
                              background: daysStart <= 14 ? 'var(--amber-dim)' : 'var(--blue-dim)',
                              color: daysStart <= 14 ? 'var(--amber-light)' : '#93C5FD',
                              fontWeight: 700,
                            }}
                          >
                            in {daysStart} days
                          </span>
                        )}
                      </td>

                      <td>
                        <span className="chip" style={{ background: 'var(--bg-elev)', textTransform: 'capitalize' }}>
                          {event.type}
                        </span>
                      </td>

                      <td>
                        <span style={{ fontSize: 12, fontWeight: 600, color: isPast ? 'var(--text-faint)' : 'var(--text)' }}>
                          {event.badge}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VIEW 2: MONTH BY MONTH ROADMAP */}
      {viewMode === 'grid' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
          {MONTHS.map((m) => {
            const f = MONTH_FOCUS[m] || { title: 'Focus', points: [] };
            const pct = monthProgress(m);
            const isCurrent = m === currentSeniorMonth();

            return (
              <div
                key={m}
                className="card card-interactive"
                style={{
                  padding: 18,
                  border: isCurrent ? '2px solid var(--blue)' : '1px solid var(--border-soft)',
                  background: isCurrent ? 'linear-gradient(135deg, var(--card-hi), var(--card))' : 'var(--card)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 12,
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontWeight: 700, fontSize: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span>{m}</span>
                    {isCurrent && (
                      <span className="chip" style={{ background: 'var(--blue-dim)', color: '#93C5FD' }}>
                        Active Month
                      </span>
                    )}
                  </div>
                  <span style={{ fontSize: 11.5, color: 'var(--text-faint)', fontWeight: 600 }}>
                    {f.title}
                  </span>
                </div>

                <Bar pct={pct} color={isCurrent ? 'var(--blue)' : 'var(--border)'} />

                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 4 }}>
                  {f.points.map((p, ix) => (
                    <div key={ix} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: 'var(--text-dim)' }}>
                      <span style={{ color: isCurrent ? 'var(--blue)' : 'var(--text-faint)' }}>•</span>
                      <span>{p}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* VIEW 3: KEY MILESTONES */}
      {viewMode === 'milestones' && (
        <div className="card" style={{ padding: 20 }}>
          <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>
            🚩 Complete Senior Year Milestone Checklist
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {(data.milestones || []).map((ms) => {
              const days = ms.date ? daysBetween(todayISO(), ms.date) : null;
              return (
                <div
                  key={ms.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 16px',
                    background: 'var(--bg-elev)',
                    borderRadius: 10,
                    border: ms.official ? '1px solid rgba(16,185,129,0.3)' : '1px solid var(--border-soft)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <input
                      type="checkbox"
                      checked={ms.done}
                      onChange={() => toggleMilestone(ms.id)}
                      style={{ width: 16, height: 16, cursor: 'pointer', accentColor: 'var(--green)' }}
                    />
                    <div>
                      <div
                        style={{
                          fontSize: 14,
                          fontWeight: 600,
                          textDecoration: ms.done ? 'line-through' : 'none',
                          color: ms.done ? 'var(--text-faint)' : 'var(--text)',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 6,
                        }}
                      >
                        <span>{ms.emoji || '🗓️'}</span>
                        <span>{ms.name}</span>
                        {ms.official && (
                          <span className="chip" style={{ fontSize: 9.5, background: 'var(--green-dim)', color: 'var(--green)' }}>
                            MOE
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: 11.5, color: 'var(--text-faint)', marginTop: 2 }}>
                        {ms.date ? `Target: ${fmtDate(ms.date)}` : 'No date set'}
                        {days != null && !ms.done && ` · ${days < 0 ? 'Passed' : days === 0 ? 'Today!' : `in ${days} days`}`}
                      </div>
                    </div>
                  </div>

                  <input
                    type="date"
                    value={ms.date || ''}
                    onChange={(e) => setMilestoneDate(ms.id, e.target.value)}
                    style={{ fontSize: 12, padding: '4px 8px' }}
                  />
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
