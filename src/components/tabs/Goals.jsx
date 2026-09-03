import { useState } from 'react';
import { PageHeader, Bar } from '../common';
import { MONTHS } from '../../constants/data';
import { uid, currentSeniorMonth } from '../../utils/helpers';

function AddInline({ value, setValue, onAdd, placeholder }) {
  return (
    <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') onAdd();
        }}
        placeholder={placeholder}
        style={{ flex: 1, fontSize: 12.5, padding: '7px 11px' }}
      />
      <button onClick={onAdd} className="btn-primary" style={{ padding: '7px 14px', fontSize: 12 }}>
        Add
      </button>
    </div>
  );
}

export function Goals({ data, update }) {
  const [monthTab, setMonthTab] = useState(currentSeniorMonth());
  const [newYear, setNewYear] = useState('');
  const [newMonth, setNewMonth] = useState('');
  const [newWeek, setNewWeek] = useState('');

  const toggle = (arrPath, id) =>
    update((d) => {
      let arr;
      if (arrPath === 'year') arr = d.goals.year;
      else if (arrPath === 'weekly') arr = d.goals.weekly;
      else arr = d.goals.monthly[monthTab] = d.goals.monthly[monthTab] || [];
      const g = arr.find((x) => x.id === id);
      if (g) g.done = !g.done;
    });

  const addGoal = (scope, text) => {
    if (!text.trim()) return;
    update((d) => {
      if (scope === 'year') d.goals.year.push({ id: uid(), text, done: false });
      else if (scope === 'weekly') d.goals.weekly.push({ id: uid(), text, done: false });
      else {
        d.goals.monthly[monthTab] = d.goals.monthly[monthTab] || [];
        d.goals.monthly[monthTab].push({ id: uid(), text, done: false });
      }
    });
  };

  const removeGoal = (scope, id) =>
    update((d) => {
      if (scope === 'year') d.goals.year = d.goals.year.filter((x) => x.id !== id);
      else if (scope === 'weekly') d.goals.weekly = d.goals.weekly.filter((x) => x.id !== id);
      else d.goals.monthly[monthTab] = (d.goals.monthly[monthTab] || []).filter((x) => x.id !== id);
    });

  const GoalList = ({ items, scope, empty }) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flex: 1 }}>
      {items.length === 0 && (
        <div style={{ fontSize: 12.5, color: 'var(--text-faint)', padding: '24px 0', textAlign: 'center' }}>
          {empty}
        </div>
      )}
      {items.map((g) => (
        <div
          key={g.id}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '9px 12px',
            background: 'var(--bg-elev)',
            borderRadius: 10,
            border: '1px solid var(--border-soft)',
          }}
        >
          <input
            type="checkbox"
            checked={g.done}
            onChange={() => toggle(scope, g.id)}
            style={{ width: 16, height: 16, cursor: 'pointer', accentColor: 'var(--green)' }}
          />
          <span
            style={{
              fontSize: 13,
              flex: 1,
              textDecoration: g.done ? 'line-through' : 'none',
              color: g.done ? 'var(--text-faint)' : 'var(--text)',
            }}
          >
            {g.text}
          </span>
          <button
            onClick={() => removeGoal(scope, g.id)}
            className="btn-ghost"
            style={{ padding: '2px 6px', fontSize: 11, border: 'none' }}
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  );

  const monthGoals = data.goals.monthly[monthTab] || [];

  const calcPct = (arr) => (arr.length > 0 ? Math.round((arr.filter((g) => g.done).length / arr.length) * 100) : 0);
  const yearPct = calcPct(data.goals.year);
  const monthPct = calcPct(monthGoals);
  const weekPct = calcPct(data.goals.weekly);

  return (
    <div className="fade-in">
      <div style={{ marginBottom: 20 }}>
        <div className="display" style={{ fontSize: 24, fontWeight: 700 }}>
          Goals & Milestones
        </div>
        <div style={{ fontSize: 12.5, color: 'var(--text-dim)', marginTop: 2 }}>
          Structured academic objectives across annual, monthly, and weekly horizons
        </div>
      </div>

      <div className="cards-grid">
        {/* YEAR GOALS */}
        <div className="card" style={{ padding: 20, display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <div style={{ fontSize: 15, fontWeight: 700 }}>🏆 Year 2026-2027 Goals</div>
            <span className="chip" style={{ background: 'var(--blue-dim)', color: '#93C5FD' }}>
              {yearPct}% Done
            </span>
          </div>
          <div style={{ marginBottom: 14 }}>
            <Bar pct={yearPct} color="var(--blue)" />
          </div>

          <GoalList items={data.goals.year} scope="year" empty="No annual goals set yet." />

          <AddInline
            value={newYear}
            setValue={setNewYear}
            onAdd={() => {
              addGoal('year', newYear);
              setNewYear('');
            }}
            placeholder="Add an annual milestone goal…"
          />
        </div>

        {/* MONTHLY GOALS */}
        <div className="card" style={{ padding: 20, display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <div style={{ fontSize: 15, fontWeight: 700 }}>🗓️ Monthly Target</div>
            <select
              value={monthTab}
              onChange={(e) => setMonthTab(e.target.value)}
              style={{ fontSize: 12, padding: '4px 8px' }}
            >
              {MONTHS.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>
          <div style={{ marginBottom: 14 }}>
            <Bar pct={monthPct} color="var(--violet)" />
          </div>

          <GoalList
            items={monthGoals}
            scope="monthly"
            empty={`No specific goals set for ${monthTab} yet.`}
          />

          <AddInline
            value={newMonth}
            setValue={setNewMonth}
            onAdd={() => {
              addGoal('monthly', newMonth);
              setNewMonth('');
            }}
            placeholder={`Add a goal for ${monthTab}…`}
          />
        </div>

        {/* WEEKLY GOALS */}
        <div className="card" style={{ padding: 20, display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <div style={{ fontSize: 15, fontWeight: 700 }}>⚡ This Week's Priorities</div>
            <span className="chip" style={{ background: 'var(--green-dim)', color: 'var(--green)' }}>
              {weekPct}% Done
            </span>
          </div>
          <div style={{ marginBottom: 14 }}>
            <Bar pct={weekPct} color="var(--green)" />
          </div>

          <GoalList items={data.goals.weekly} scope="weekly" empty="No weekly priorities set." />

          <AddInline
            value={newWeek}
            setValue={setNewWeek}
            onAdd={() => {
              addGoal('weekly', newWeek);
              setNewWeek('');
            }}
            placeholder="Add an immediate weekly focus item…"
          />
        </div>
      </div>
    </div>
  );
}
