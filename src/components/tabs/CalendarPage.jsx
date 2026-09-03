import { useState, useMemo } from 'react';
import { PageHeader, EmptyState } from '../common';
import { subjInfo, UAE_MOE_CALENDAR_2026_2027 } from '../../constants/data';
import { todayISO, fmtDate, daysBetween } from '../../utils/helpers';

export function CalendarPage({ data }) {
  const [viewMode, setViewMode] = useState('month'); // 'month' | 'agenda'
  const [cursor, setCursor] = useState(() => {
    const d = new Date();
    return { y: d.getFullYear(), m: d.getMonth() };
  });
  const [selected, setSelected] = useState(todayISO());

  const itemsByDate = useMemo(() => {
    const map = {};
    const push = (date, item) => {
      if (!date) return;
      (map[date] = map[date] || []).push(item);
    };

    // Official UAE MOE Calendar events
    UAE_MOE_CALENDAR_2026_2027.forEach((evt) => {
      push(evt.startDate, {
        type: 'moe',
        emoji: evt.emoji || '🇦🇪',
        label: evt.eventEn,
        color: '#10B981',
        sub: `UAE MOE: ${evt.eventAr}`,
      });
      if (evt.endDate && evt.endDate !== evt.startDate) {
        push(evt.endDate, {
          type: 'moe',
          emoji: '🏁',
          label: `${evt.eventEn} (End)`,
          color: '#10B981',
          sub: `UAE MOE: نهاية ${evt.eventAr}`,
        });
      }
    });

    data.homework.forEach((h) =>
      push(h.dueDate, {
        type: 'homework',
        emoji: subjInfo(h.subject).emoji,
        label: h.name,
        color: subjInfo(h.subject).color,
        sub: 'Homework Assignment',
      })
    );
    data.exams.forEach((e) =>
      push(e.date, {
        type: 'exam',
        emoji: '📝',
        label: e.name,
        color: 'var(--red)',
        sub: `Exam (${e.difficulty || 'Medium'})`,
      })
    );
    data.study.forEach((s) =>
      push(s.date, {
        type: 'study',
        emoji: '📖',
        label: s.topic || subjInfo(s.subject).label,
        color: 'var(--blue)',
        sub: `Study Session (${s.durationMinutes}m)`,
      })
    );
    (data.milestones || []).forEach((m) =>
      push(m.date, {
        type: 'milestone',
        emoji: m.emoji || '🗓️',
        label: m.name,
        color: 'var(--violet)',
        sub: 'Milestone',
      })
    );
    return map;
  }, [data]);

  const allAgendaItems = useMemo(() => {
    const list = [];
    Object.entries(itemsByDate).forEach(([date, items]) => {
      items.forEach((it) => {
        list.push({ date, ...it });
      });
    });
    return list.sort((a, b) => a.date.localeCompare(b.date));
  }, [itemsByDate]);

  const first = new Date(cursor.y, cursor.m, 1);
  const startOffset = (first.getDay() + 6) % 7; // Monday-first
  const daysInMonth = new Date(cursor.y, cursor.m + 1, 0).getDate();
  const cells = [];
  for (let i = 0; i < startOffset; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const monthLabel = first.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const selectedItems = itemsByDate[selected] || [];

  return (
    <div className="fade-in">
      <div className="tab-header">
        <div>
          <div className="display" style={{ fontSize: 24, fontWeight: 700 }}>
            Academic Calendar
          </div>
          <div style={{ fontSize: 12.5, color: 'var(--text-dim)', marginTop: 2 }}>
            Official UAE MOE 2026–2027 Schedule, breaks, exam deadlines, and study logs
          </div>
        </div>

        <div className="tab-header-actions">
          <div className="view-mode-toggle">
            <button
              className={`view-mode-btn ${viewMode === 'month' ? 'active' : ''}`}
              onClick={() => setViewMode('month')}
            >
              <span>📅</span> Month Grid
            </button>
            <button
              className={`view-mode-btn ${viewMode === 'agenda' ? 'active' : ''}`}
              onClick={() => setViewMode('agenda')}
            >
              <span>📜</span> Agenda View
            </button>
          </div>
        </div>
      </div>

      {/* VIEW 1: MONTH GRID */}
      {viewMode === 'month' && (
        <div className="calendar-split">
          <div className="card" style={{ padding: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <button
                className="btn-ghost"
                onClick={() =>
                  setCursor((c) => {
                    let m = c.m - 1,
                      y = c.y;
                    if (m < 0) {
                      m = 11;
                      y--;
                    }
                    return { y, m };
                  })
                }
              >
                ‹ Prev
              </button>
              <div style={{ fontWeight: 700, fontSize: 16 }}>{monthLabel}</div>
              <button
                className="btn-ghost"
                onClick={() =>
                  setCursor((c) => {
                    let m = c.m + 1,
                      y = c.y;
                    if (m > 11) {
                      m = 0;
                      y++;
                    }
                    return { y, m };
                  })
                }
              >
                Next ›
              </button>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(7, 1fr)',
                gap: 6,
                fontSize: 11,
                fontWeight: 700,
                color: 'var(--text-faint)',
                marginBottom: 8,
                textAlign: 'center',
              }}
            >
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d) => (
                <div key={d}>{d}</div>
              ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 6 }}>
              {cells.map((d, i) => {
                if (d === null) return <div key={i} />;
                const iso = `${cursor.y}-${String(cursor.m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
                const items = itemsByDate[iso] || [];
                const isToday = iso === todayISO();
                const isSelected = selected === iso;

                return (
                  <div
                    key={i}
                    onClick={() => setSelected(iso)}
                    style={{
                      minHeight: 74,
                      borderRadius: 10,
                      padding: 8,
                      cursor: 'pointer',
                      background: isSelected ? 'var(--card-hi)' : 'var(--bg-elev)',
                      border: isSelected
                        ? '2px solid var(--blue)'
                        : isToday
                        ? '1px solid var(--blue-glow)'
                        : '1px solid var(--border-soft)',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <div
                      style={{
                        fontSize: 12,
                        color: isToday ? 'var(--blue-light)' : 'var(--text-dim)',
                        fontWeight: isToday || isSelected ? 700 : 500,
                        marginBottom: 4,
                      }}
                    >
                      {d}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                      {items.slice(0, 2).map((it, idx) => (
                        <div
                          key={idx}
                          style={{
                            fontSize: 10,
                            padding: '2px 4px',
                            borderRadius: 4,
                            background: it.color ? `${it.color}22` : 'var(--border)',
                            color: it.color || 'var(--text)',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            fontWeight: 600,
                          }}
                        >
                          {it.emoji} {it.label}
                        </div>
                      ))}
                      {items.length > 2 && (
                        <div style={{ fontSize: 9, color: 'var(--text-faint)', fontWeight: 600 }}>
                          +{items.length - 2} more
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Selected Date Details Panel */}
          <div className="card" style={{ padding: 20, display: 'flex', flexDirection: 'column' }}>
            <div style={{ fontSize: 11, color: 'var(--text-faint)', textTransform: 'uppercase', fontWeight: 700 }}>
              Selected Date
            </div>
            <div className="display" style={{ fontSize: 20, fontWeight: 700, margin: '4px 0 16px' }}>
              {fmtDate(selected)}
            </div>

            {selectedItems.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 10px', color: 'var(--text-faint)', fontSize: 13 }}>
                No events or deadlines for this day.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {selectedItems.map((it, idx) => (
                  <div
                    key={idx}
                    style={{
                      padding: '10px 12px',
                      borderRadius: 10,
                      background: 'var(--bg-elev)',
                      borderLeft: `3px solid ${it.color || 'var(--blue)'}`,
                      border: '1px solid var(--border-soft)',
                    }}
                  >
                    <div style={{ fontSize: 13, fontWeight: 600 }}>
                      {it.emoji} {it.label}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--text-faint)', marginTop: 2 }}>
                      {it.sub}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* VIEW 2: AGENDA VIEW */}
      {viewMode === 'agenda' && (
        <div className="card" style={{ padding: 20 }}>
          <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>
            🗓️ Chronological Agenda (Including UAE MOE Dates)
          </div>
          {allAgendaItems.length === 0 && <EmptyState icon="📅" text="No calendar items found." />}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {allAgendaItems.map((item, idx) => {
              const days = daysBetween(todayISO(), item.date);
              const isToday = days === 0;

              return (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 16px',
                    background: isToday ? 'linear-gradient(90deg, var(--card-hi), var(--card))' : 'var(--bg-elev)',
                    borderRadius: 10,
                    border: isToday ? '1px solid var(--blue)' : '1px solid var(--border-soft)',
                    borderLeft: `4px solid ${item.color || 'var(--blue)'}`,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <div style={{ minWidth: 100 }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: isToday ? 'var(--blue-light)' : 'var(--text)' }}>
                        {fmtDate(item.date)}
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--text-faint)' }}>
                        {days < 0 ? `${Math.abs(days)}d ago` : days === 0 ? 'Today!' : `in ${days} days`}
                      </div>
                    </div>

                    <div>
                      <div style={{ fontSize: 14, fontWeight: 600 }}>
                        {item.emoji} {item.label}
                      </div>
                      <div style={{ fontSize: 11.5, color: 'var(--text-faint)', marginTop: 2 }}>
                        {item.sub}
                      </div>
                    </div>
                  </div>

                  <span
                    className="chip"
                    style={{
                      background: item.color ? `${item.color}22` : 'var(--bg)',
                      color: item.color || 'var(--text)',
                      textTransform: 'capitalize',
                    }}
                  >
                    {item.type === 'moe' ? 'UAE MOE' : item.type}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
