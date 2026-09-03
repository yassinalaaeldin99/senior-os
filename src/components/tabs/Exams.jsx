import { useState } from 'react';
import { PageHeader, EmptyState, Bar } from '../common';
import { subjInfo } from '../../constants/data';
import { todayISO, daysBetween, fmtDate } from '../../utils/helpers';

export function Exams({ data, update, openModal }) {
  const [viewMode, setViewMode] = useState('cards'); // 'cards' | 'table'
  const today = todayISO();

  const toggleTopic = (examId, ti) =>
    update((d) => {
      const e = d.exams.find((x) => x.id === examId);
      if (!e) return;
      e.topics[ti].done = !e.topics[ti].done;
      e.prepPercent = Math.round(
        (e.topics.filter((t) => t.done).length / Math.max(1, e.topics.length)) * 100
      );
    });

  const remove = (id) =>
    update((d) => {
      d.exams = d.exams.filter((x) => x.id !== id);
    });

  const sorted = [...data.exams].sort((a, b) => a.date.localeCompare(b.date));

  // Computed metrics
  const upcomingCount = sorted.filter((e) => daysBetween(today, e.date) >= 0).length;
  const avgPrep =
    sorted.length > 0
      ? Math.round(sorted.reduce((acc, e) => acc + (e.prepPercent || 0), 0) / sorted.length)
      : 0;

  return (
    <div className="fade-in">
      <div className="tab-header">
        <div>
          <div className="display" style={{ fontSize: 24, fontWeight: 700 }}>
            Exams & Assessments
          </div>
          <div style={{ fontSize: 12.5, color: 'var(--text-dim)', marginTop: 2 }}>
            School Quizzes, Midterms, and Official Ministry Finals
          </div>
        </div>

        <div className="tab-header-actions">
          <div className="view-mode-toggle">
            <button
              className={`view-mode-btn ${viewMode === 'cards' ? 'active' : ''}`}
              onClick={() => setViewMode('cards')}
            >
              <span>🗂️</span> Prep Cards
            </button>
            <button
              className={`view-mode-btn ${viewMode === 'table' ? 'active' : ''}`}
              onClick={() => setViewMode('table')}
            >
              <span>📋</span> Schedule Table
            </button>
          </div>

          <button onClick={() => openModal({ type: 'exam' })} className="btn-primary">
            <span>+</span> Add Exam
          </button>
        </div>
      </div>

      {/* Stats Summary Bar */}
      <div
        className="card"
        style={{
          padding: '14px 20px',
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
            Upcoming Exams
          </div>
          <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--text)' }}>
            {upcomingCount} Scheduled
          </div>
        </div>

        <div style={{ borderLeft: '1px solid var(--border)', height: 32 }} />

        <div>
          <div style={{ fontSize: 11, color: 'var(--text-faint)', textTransform: 'uppercase', fontWeight: 600 }}>
            Average Syllabus Prep
          </div>
          <div style={{ fontSize: 20, fontWeight: 700, color: avgPrep >= 80 ? 'var(--green)' : 'var(--blue)' }}>
            {avgPrep}%
          </div>
        </div>

        <div style={{ borderLeft: '1px solid var(--border)', height: 32 }} />

        <div>
          <div style={{ fontSize: 11, color: 'var(--text-faint)', textTransform: 'uppercase', fontWeight: 600 }}>
            Immediate Next Exam
          </div>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>
            {sorted.find((e) => daysBetween(today, e.date) >= 0)
              ? `${sorted.find((e) => daysBetween(today, e.date) >= 0).name} (${fmtDate(
                  sorted.find((e) => daysBetween(today, e.date) >= 0).date
                )})`
              : 'None scheduled'}
          </div>
        </div>
      </div>

      {data.exams.length === 0 && (
        <EmptyState icon="📝" text="No exams scheduled. Add your first exam or quiz above!" />
      )}

      {/* VIEW 1: CARDS / PREP VIEW */}
      {viewMode === 'cards' && (
        <div className="cards-grid">
          {sorted.map((e) => {
            const s = subjInfo(e.subject);
            const days = daysBetween(today, e.date);
            const isUrgent = days >= 0 && days <= 4;

            return (
              <div
                key={e.id}
                className="card card-interactive"
                style={{
                  padding: 20,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 14,
                  borderTop: `4px solid ${s.color || 'var(--blue)'}`,
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ fontSize: 16, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span>{s.emoji}</span>
                      <span>{e.name}</span>
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text-faint)', marginTop: 4 }}>
                      {fmtDate(e.date)} ·{' '}
                      <b style={{ color: isUrgent ? 'var(--red-light)' : days === 0 ? 'var(--green)' : 'var(--text-dim)' }}>
                        {days < 0 ? 'Finished' : days === 0 ? 'Today!' : `in ${days} days`}
                      </b>
                    </div>
                  </div>
                  <button
                    onClick={() => remove(e.id)}
                    className="btn-ghost"
                    style={{ padding: '3px 7px', fontSize: 11, border: 'none' }}
                  >
                    ✕
                  </button>
                </div>

                {/* Progress bar */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 5 }}>
                    <span style={{ color: 'var(--text-dim)' }}>Topic Mastery</span>
                    <span style={{ fontWeight: 700, color: 'var(--text)' }}>{e.prepPercent || 0}%</span>
                  </div>
                  <Bar pct={e.prepPercent || 0} color={s.color || 'var(--blue)'} />
                </div>

                {/* Topics checklist */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, background: 'var(--bg-elev)', padding: '10px 12px', borderRadius: 10 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-faint)', textTransform: 'uppercase' }}>
                    Topics Checklist
                  </div>
                  {(e.topics || []).length === 0 && (
                    <div style={{ fontSize: 11.5, color: 'var(--text-faint)' }}>No topics specified</div>
                  )}
                  {(e.topics || []).map((t, ti) => (
                    <label
                      key={ti}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        fontSize: 12.5,
                        cursor: 'pointer',
                        color: t.done ? 'var(--text-faint)' : 'var(--text)',
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={t.done}
                        onChange={() => toggleTopic(e.id, ti)}
                        style={{ accentColor: 'var(--green)' }}
                      />
                      <span style={{ textDecoration: t.done ? 'line-through' : 'none' }}>
                        {t.name}
                      </span>
                    </label>
                  ))}
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 8, borderTop: '1px solid var(--border-soft)' }}>
                  <span className="chip" style={{ background: 'var(--bg-elev)', border: '1px solid var(--border)' }}>
                    Difficulty: {e.difficulty || 'Medium'}
                  </span>
                  <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--green-light)' }}>
                    Target: {e.targetGrade || 95}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* VIEW 2: SCHEDULE TABLE */}
      {viewMode === 'table' && (
        <div className="card" style={{ padding: 12, overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Countdown</th>
                <th>Subject</th>
                <th>Exam Name</th>
                <th style={{ minWidth: 160 }}>Prep Progress</th>
                <th>Difficulty</th>
                <th>Target</th>
                <th style={{ textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((e) => {
                const s = subjInfo(e.subject);
                const days = daysBetween(today, e.date);

                return (
                  <tr key={e.id}>
                    <td>
                      <span style={{ fontWeight: 600 }}>{fmtDate(e.date)}</span>
                    </td>
                    <td>
                      <span
                        className="chip"
                        style={{
                          background: days < 0 ? 'var(--card-hi)' : days <= 3 ? 'var(--red-dim)' : 'var(--bg-elev)',
                          color: days < 0 ? 'var(--text-faint)' : days <= 3 ? 'var(--red-light)' : 'var(--text-dim)',
                        }}
                      >
                        {days < 0 ? 'Past' : days === 0 ? 'Today' : `${days} days`}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontWeight: 600, color: s.color || 'var(--text)' }}>
                        {s.emoji} {s.label}
                      </span>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{e.name}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-faint)' }}>
                        {(e.topics || []).filter((t) => t.done).length} / {(e.topics || []).length} topics done
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ flex: 1 }}>
                          <Bar pct={e.prepPercent || 0} color={s.color || 'var(--blue)'} />
                        </div>
                        <span style={{ fontSize: 11.5, fontWeight: 700 }}>{e.prepPercent || 0}%</span>
                      </div>
                    </td>
                    <td>
                      <span className="chip" style={{ background: 'var(--bg-elev)' }}>
                        {e.difficulty || 'Medium'}
                      </span>
                    </td>
                    <td style={{ fontWeight: 700, color: 'var(--green-light)' }}>
                      {e.targetGrade || 95}%
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button onClick={() => remove(e.id)} className="btn-ghost" style={{ padding: '3px 8px', fontSize: 11 }}>
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
