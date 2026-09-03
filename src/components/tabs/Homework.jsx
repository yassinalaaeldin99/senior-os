import { useState } from 'react';
import { PageHeader, EmptyState, Chip } from '../common';
import { SUBJECTS, PRIORITIES, STATUSES, subjInfo } from '../../constants/data';
import { todayISO, daysBetween, fmtDate } from '../../utils/helpers';

export function Homework({ data, update, openModal, openScanner }) {
  const [viewMode, setViewMode] = useState('cards'); // 'cards' | 'table' | 'kanban'
  const [timeFilter, setTimeFilter] = useState('all');
  const [subjFilter, setSubjFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const today = todayISO();

  // Filter list
  let list = data.homework.filter((h) => subjFilter === 'all' || h.subject === subjFilter);

  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase();
    list = list.filter((h) => h.name.toLowerCase().includes(q) || (h.notes && h.notes.toLowerCase().includes(q)));
  }

  list = list
    .filter((h) => {
      const d = daysBetween(today, h.dueDate);
      if (timeFilter === 'today') return d === 0 && h.status !== 'completed';
      if (timeFilter === 'tomorrow') return d === 1 && h.status !== 'completed';
      if (timeFilter === 'week') return d >= 0 && d <= 7 && h.status !== 'completed';
      if (timeFilter === 'overdue') return d < 0 && h.status !== 'completed';
      if (timeFilter === 'completed') return h.status === 'completed';
      return true;
    })
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate));

  const setStatus = (id, status) =>
    update((d) => {
      const h = d.homework.find((x) => x.id === id);
      if (h) h.status = status;
    });

  const remove = (id) =>
    update((d) => {
      d.homework = d.homework.filter((x) => x.id !== id);
    });

  return (
    <div className="fade-in">
      <div className="tab-header">
        <div>
          <div className="display" style={{ fontSize: 24, fontWeight: 700 }}>
            Homework & Tasks
          </div>
          <div style={{ fontSize: 12.5, color: 'var(--text-dim)', marginTop: 2 }}>
            Track assignments, estimated duration, and priority deadlines
          </div>
        </div>

        <div className="tab-header-actions">
          {/* View Mode Toggle */}
          <div className="view-mode-toggle">
            <button
              className={`view-mode-btn ${viewMode === 'cards' ? 'active' : ''}`}
              onClick={() => setViewMode('cards')}
            >
              <span>🗂️</span> Cards
            </button>
            <button
              className={`view-mode-btn ${viewMode === 'table' ? 'active' : ''}`}
              onClick={() => setViewMode('table')}
            >
              <span>📋</span> Table
            </button>
            <button
              className={`view-mode-btn ${viewMode === 'kanban' ? 'active' : ''}`}
              onClick={() => setViewMode('kanban')}
            >
              <span>📑</span> Kanban
            </button>
          </div>

          <button
            onClick={openScanner}
            className="btn-ghost"
            style={{
              borderColor: 'var(--blue)',
              color: 'var(--blue-light)',
              background: 'var(--blue-dim)',
              fontWeight: 600,
            }}
            title="Snap or upload homework photo/PDF to auto-sort by subject"
          >
            <span>📷</span> Scan Paper / PDF
          </button>

          <button onClick={() => openModal({ type: 'homework' })} className="btn-primary">
            <span>+</span> Add Homework
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div
        className="card"
        style={{
          padding: '12px 16px',
          marginBottom: 20,
          display: 'flex',
          gap: 12,
          alignItems: 'center',
          flexWrap: 'wrap',
          background: 'var(--bg-elev)',
        }}
      >
        {/* Search */}
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search assignments..."
          style={{ width: 220, fontSize: 12.5, padding: '6px 12px' }}
        />

        {/* Time filters */}
        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
          {[
            ['all', 'All'],
            ['week', 'This Week'],
            ['today', 'Today'],
            ['tomorrow', 'Tomorrow'],
            ['overdue', 'Overdue'],
            ['completed', 'Completed'],
          ].map(([k, l]) => (
            <button
              key={k}
              onClick={() => setTimeFilter(k)}
              className="btn-ghost"
              style={{
                padding: '5px 11px',
                fontSize: 12,
                background: timeFilter === k ? 'var(--blue-dim)' : 'transparent',
                borderColor: timeFilter === k ? 'var(--blue)' : 'transparent',
                color: timeFilter === k ? '#93C5FD' : 'var(--text-dim)',
                fontWeight: timeFilter === k ? 600 : 500,
              }}
            >
              {l}
            </button>
          ))}
        </div>

        {/* Subject dropdown filter */}
        <div style={{ marginLeft: 'auto' }}>
          <select
            value={subjFilter}
            onChange={(e) => setSubjFilter(e.target.value)}
            style={{ fontSize: 12.5, padding: '6px 10px' }}
          >
            <option value="all">All subjects</option>
            {SUBJECTS.map((s) => (
              <option key={s.key} value={s.key}>
                {s.emoji} {s.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {list.length === 0 && <EmptyState icon="📚" text="No assignments found for this filter." />}

      {/* VIEW 1: CARDS / GRID VIEW */}
      {viewMode === 'cards' && (
        <div className="cards-grid">
          {list.map((h) => {
            const days = daysBetween(today, h.dueDate);
            const s = subjInfo(h.subject);
            const isDone = h.status === 'completed';
            const isOverdue = days < 0 && !isDone;

            return (
              <div
                key={h.id}
                className="card card-interactive"
                style={{
                  padding: 16,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 12,
                  borderLeft: `4px solid ${s.color || 'var(--blue)'}`,
                  opacity: isDone ? 0.7 : 1,
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <input
                      type="checkbox"
                      checked={isDone}
                      onChange={() => setStatus(h.id, isDone ? 'not_started' : 'completed')}
                      style={{ width: 18, height: 18, cursor: 'pointer', accentColor: 'var(--green)' }}
                    />
                    <div>
                      <div
                        style={{
                          fontSize: 14.5,
                          fontWeight: 600,
                          textDecoration: isDone ? 'line-through' : 'none',
                          color: isDone ? 'var(--text-faint)' : 'var(--text)',
                        }}
                      >
                        {h.name}
                      </div>
                      <div style={{ fontSize: 11.5, color: 'var(--text-faint)', marginTop: 2 }}>
                        {s.emoji} {s.label}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => remove(h.id)}
                    className="btn-ghost"
                    style={{ padding: '3px 7px', fontSize: 11, border: 'none' }}
                    title="Delete"
                  >
                    ✕
                  </button>
                </div>

                {h.notes && (
                  <div style={{ fontSize: 12, color: 'var(--text-dim)', background: 'var(--bg-elev)', padding: '6px 10px', borderRadius: 8 }}>
                    {h.notes}
                  </div>
                )}

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto', paddingTop: 8, borderTop: '1px solid var(--border-soft)' }}>
                  <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                    <span
                      className="chip"
                      style={{
                        background: isOverdue ? 'var(--red-dim)' : days === 0 ? 'var(--amber-dim)' : 'var(--bg-elev)',
                        color: isOverdue ? 'var(--red-light)' : days === 0 ? 'var(--amber-light)' : 'var(--text-dim)',
                        border: '1px solid var(--border)',
                      }}
                    >
                      {isOverdue ? `Overdue (${Math.abs(days)}d)` : days === 0 ? 'Due Today' : `Due in ${days}d`}
                    </span>
                    {h.estMinutes && (
                      <span style={{ fontSize: 11, color: 'var(--text-faint)' }}>
                        ⏱️ {h.estMinutes}m
                      </span>
                    )}
                  </div>

                  <span
                    className="chip"
                    style={{
                      background: PRIORITIES[h.priority]?.color ? `${PRIORITIES[h.priority].color}22` : 'var(--bg-elev)',
                      color: PRIORITIES[h.priority]?.color || 'var(--text-faint)',
                    }}
                  >
                    {PRIORITIES[h.priority]?.label || 'Medium'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* VIEW 2: DATA TABLE VIEW */}
      {viewMode === 'table' && (
        <div className="card" style={{ padding: 12, overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ width: 40 }}>Done</th>
                <th>Subject</th>
                <th>Assignment</th>
                <th>Due Date</th>
                <th>Est. Time</th>
                <th>Priority</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {list.map((h) => {
                const days = daysBetween(today, h.dueDate);
                const s = subjInfo(h.subject);
                const isDone = h.status === 'completed';

                return (
                  <tr key={h.id}>
                    <td>
                      <input
                        type="checkbox"
                        checked={isDone}
                        onChange={() => setStatus(h.id, isDone ? 'not_started' : 'completed')}
                        style={{ width: 16, height: 16, cursor: 'pointer', accentColor: 'var(--green)' }}
                      />
                    </td>
                    <td>
                      <span style={{ fontWeight: 600, color: s.color || 'var(--text)' }}>
                        {s.emoji} {s.label}
                      </span>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, textDecoration: isDone ? 'line-through' : 'none', color: isDone ? 'var(--text-faint)' : 'var(--text)' }}>
                        {h.name}
                      </div>
                      {h.notes && <div style={{ fontSize: 11, color: 'var(--text-faint)' }}>{h.notes}</div>}
                    </td>
                    <td>
                      <span style={{ color: days < 0 && !isDone ? 'var(--red-light)' : 'var(--text-dim)', fontWeight: days <= 1 ? 600 : 400 }}>
                        {fmtDate(h.dueDate)} ({days < 0 ? `${Math.abs(days)}d ago` : days === 0 ? 'Today' : `in ${days}d`})
                      </span>
                    </td>
                    <td>{h.estMinutes ? `${h.estMinutes} mins` : '—'}</td>
                    <td>
                      <span
                        className="chip"
                        style={{
                          background: PRIORITIES[h.priority]?.color ? `${PRIORITIES[h.priority].color}22` : 'var(--bg-elev)',
                          color: PRIORITIES[h.priority]?.color || 'var(--text-faint)',
                        }}
                      >
                        {PRIORITIES[h.priority]?.label || 'Medium'}
                      </span>
                    </td>
                    <td>
                      <select
                        value={h.status}
                        onChange={(e) => setStatus(h.id, e.target.value)}
                        style={{ fontSize: 11.5, padding: '3px 7px' }}
                      >
                        {Object.entries(STATUSES).map(([k, st]) => (
                          <option key={k} value={k}>
                            {st.label}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button onClick={() => remove(h.id)} className="btn-ghost" style={{ padding: '3px 8px', fontSize: 11 }}>
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

      {/* VIEW 3: KANBAN BOARD */}
      {viewMode === 'kanban' && (
        <div className="kanban-grid">
          {[
            { id: 'not_started', title: 'To Do', icon: '⏳', color: 'var(--text-dim)' },
            { id: 'in_progress', title: 'In Progress', icon: '🚀', color: 'var(--blue)' },
            { id: 'completed', title: 'Completed', icon: '✅', color: 'var(--green)' },
          ].map((col) => {
            const colItems = list.filter((h) => h.status === col.id);

            return (
              <div key={col.id} className="kanban-col">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: 8, borderBottom: '1px solid var(--border-soft)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700, fontSize: 13, color: col.color }}>
                    <span>{col.icon}</span> {col.title}
                  </div>
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      background: 'var(--card)',
                      border: '1px solid var(--border)',
                      padding: '2px 8px',
                      borderRadius: 10,
                      color: 'var(--text-faint)',
                    }}
                  >
                    {colItems.length}
                  </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, flex: 1 }}>
                  {colItems.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '30px 10px', fontSize: 12, color: 'var(--text-faint)' }}>
                      No items
                    </div>
                  )}
                  {colItems.map((h) => {
                    const s = subjInfo(h.subject);
                    const days = daysBetween(today, h.dueDate);

                    return (
                      <div
                        key={h.id}
                        className="card"
                        style={{
                          padding: 12,
                          display: 'flex',
                          flexDirection: 'column',
                          gap: 8,
                          borderLeft: `3px solid ${s.color || 'var(--blue)'}`,
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>
                            {h.name}
                          </div>
                          <button onClick={() => remove(h.id)} style={{ background: 'none', border: 'none', color: 'var(--text-faint)', cursor: 'pointer' }}>
                            ✕
                          </button>
                        </div>
                        <div style={{ fontSize: 11, color: 'var(--text-faint)' }}>
                          {s.emoji} {s.label} · Due {fmtDate(h.dueDate)}
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 }}>
                          <span
                            className="chip"
                            style={{
                              fontSize: 10,
                              background: days < 0 ? 'var(--red-dim)' : 'var(--bg-elev)',
                              color: days < 0 ? 'var(--red-light)' : 'var(--text-dim)',
                            }}
                          >
                            {days < 0 ? 'Overdue' : days === 0 ? 'Today' : `${days}d`}
                          </span>

                          {col.id !== 'completed' ? (
                            <button
                              onClick={() => setStatus(h.id, col.id === 'not_started' ? 'in_progress' : 'completed')}
                              className="btn-ghost"
                              style={{ padding: '3px 8px', fontSize: 10.5 }}
                            >
                              Move ➔
                            </button>
                          ) : (
                            <button
                              onClick={() => setStatus(h.id, 'not_started')}
                              className="btn-ghost"
                              style={{ padding: '3px 8px', fontSize: 10.5 }}
                            >
                              ↺ Reset
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
