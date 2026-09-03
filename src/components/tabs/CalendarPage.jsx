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
        sub: `Homework Assignment (${subjInfo(h.subject).label})`,
      })
    );
    data.exams.forEach((e) =>
      push(e.date, {
        type: 'exam',
        emoji: '📝',
        label: e.name,
        color: '#EF4444',
        sub: `Exam (${subjInfo(e.subject).label} · ${e.difficulty || 'Medium'})`,
      })
    );
    data.study.forEach((s) =>
      push(s.date, {
        type: 'study',
        emoji: '📖',
        label: s.topic || subjInfo(s.subject).label,
        color: '#3B82F6',
        sub: `Study Session (${s.durationMinutes}m)`,
      })
    );
    (data.milestones || []).forEach((m) =>
      push(m.date, {
        type: 'milestone',
        emoji: m.emoji || '🗓️',
        label: m.name,
        color: '#8B5CF6',
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

  const jumpToToday = () => {
    const d = new Date();
    setCursor({ y: d.getFullYear(), m: d.getMonth() });
    setSelected(todayISO());
  };

  return (
    <div className="fade-in">
      <div className="tab-header">
        <div>
          <div className="display" style={{ fontSize: 24, fontWeight: 700 }}>
            Academic Calendar
          </div>
          <div style={{ fontSize: 12.5, color: 'var(--text-dim)', marginTop: 2 }}>
            UAE MOE 2026–2027 breaks, exam deadlines, and study history
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
          <div className="card" style={{ padding: '18px 16px' }}>
            {/* Month Header Navigation */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <button
                  className="btn-ghost"
                  style={{ padding: '5px 10px', fontSize: 13 }}
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
                  title="Previous month"
                >
                  ‹
                </button>
                <button
                  className="btn-ghost"
                  style={{ padding: '5px 11px', fontSize: 11.5, fontWeight: 600 }}
                  onClick={jumpToToday}
                >
                  Today
                </button>
                <button
                  className="btn-ghost"
                  style={{ padding: '5px 10px', fontSize: 13 }}
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
                  title="Next month"
                >
                  ›
                </button>
              </div>

              <div className="display" style={{ fontWeight: 700, fontSize: 16 }}>
                {monthLabel}
              </div>
            </div>

            {/* Day of Week Labels */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(7, 1fr)',
                gap: 4,
                fontSize: 11,
                fontWeight: 700,
                color: 'var(--text-faint)',
                marginBottom: 6,
                textAlign: 'center',
              }}
            >
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d) => (
                <div key={d} style={{ padding: '2px 0' }}>{d}</div>
              ))}
            </div>

            {/* Month Grid Cells */}
            <div className="calendar-grid-cells">
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
                    className={`calendar-cell ${isSelected ? 'selected' : ''} ${isToday ? 'today' : ''}`}
                  >
                    <div
                      style={{
                        fontSize: 12.5,
                        color: isSelected ? '#fff' : isToday ? 'var(--blue-light)' : 'var(--text)',
                        fontWeight: isToday || isSelected ? 700 : 500,
                        textAlign: 'center',
                      }}
                    >
                      {d}
                    </div>

                    {/* Desktop View: Text Pills */}
                    <div className="calendar-cell-desktop-pills">
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

                    {/* Mobile View: Event Colored Indicator Dots */}
                    <div className="calendar-cell-mobile-dots">
                      {items.slice(0, 3).map((it, idx) => (
                        <div
                          key={idx}
                          className="cal-dot"
                          style={{ background: it.color || 'var(--blue)' }}
                          title={it.label}
                        />
                      ))}
                      {items.length > 3 && (
                        <span style={{ fontSize: 8, color: 'var(--text-faint)', fontWeight: 700 }}>+</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Event Category Legend */}
            <div
              style={{
                display: 'flex',
                gap: 12,
                flexWrap: 'wrap',
                marginTop: 14,
                paddingTop: 10,
                borderTop: '1px solid var(--border-soft)',
                fontSize: 11,
                color: 'var(--text-faint)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <span className="cal-dot" style={{ background: '#10B981' }} />
                <span>UAE MOE Break</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <span className="cal-dot" style={{ background: '#EF4444' }} />
                <span>Exam</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <span className="cal-dot" style={{ background: '#3B82F6' }} />
                <span>Homework</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <span className="cal-dot" style={{ background: '#8B5CF6' }} />
                <span>Study / Milestone</span>
              </div>
            </div>
          </div>

          {/* Selected Date Details Panel (Stacks seamlessly under calendar on phone) */}
          <div className="card" style={{ padding: '18px 20px', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <div>
                <div style={{ fontSize: 11, color: 'var(--text-faint)', textTransform: 'uppercase', fontWeight: 700 }}>
                  Selected Date
                </div>
                <div className="display" style={{ fontSize: 18, fontWeight: 700, color: 'var(--text)', marginTop: 2 }}>
                  {fmtDate(selected)}
                </div>
              </div>
              {selected === todayISO() && (
                <span className="chip" style={{ background: 'var(--blue-dim)', color: '#93C5FD', fontWeight: 700 }}>
                  Today
                </span>
              )}
            </div>

            {selectedItems.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '32px 10px', color: 'var(--text-faint)' }}>
                <div style={{ fontSize: 24, marginBottom: 6 }}>✨</div>
                <div style={{ fontSize: 13, fontWeight: 500 }}>No events or exams on this date</div>
                <div style={{ fontSize: 11.5, marginTop: 2, color: 'var(--text-faint)' }}>Great day to get ahead on syllabus review</div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {selectedItems.map((it, idx) => (
                  <div
                    key={idx}
                    style={{
                      padding: '12px 14px',
                      borderRadius: 10,
                      background: 'var(--bg-elev)',
                      borderLeft: `4px solid ${it.color || 'var(--blue)'}`,
                      border: '1px solid var(--border-soft)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 16 }}>{it.emoji}</span>
                      <div style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--text)' }}>
                        {it.label}
                      </div>
                    </div>
                    <div style={{ fontSize: 11.5, color: 'var(--text-dim)', marginTop: 4 }}>
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
        <div className="card" style={{ padding: '18px 16px' }}>
          <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 14 }}>
            🗓️ Chronological Schedule (Including UAE MOE Dates)
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
                    padding: '12px 14px',
                    background: isToday ? 'linear-gradient(90deg, var(--card-hi), var(--card))' : 'var(--bg-elev)',
                    borderRadius: 10,
                    border: isToday ? '1px solid var(--blue)' : '1px solid var(--border-soft)',
                    borderLeft: `4px solid ${item.color || 'var(--blue)'}`,
                    gap: 12,
                    flexWrap: 'wrap',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0, flex: 1 }}>
                    <div style={{ minWidth: 90 }}>
                      <div style={{ fontSize: 12.5, fontWeight: 700, color: isToday ? 'var(--blue-light)' : 'var(--text)' }}>
                        {fmtDate(item.date)}
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--text-faint)' }}>
                        {days < 0 ? `${Math.abs(days)}d ago` : days === 0 ? 'Today!' : `in ${days} days`}
                      </div>
                    </div>

                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--text)' }}>
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
                      fontWeight: 600,
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
