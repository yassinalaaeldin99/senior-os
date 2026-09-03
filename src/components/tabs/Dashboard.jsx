import { useState } from 'react';
import { SectionTitle, EmptyState, Chip, Bar, StatCard } from '../common';
import { PRIORITIES, MONTHS, MONTH_FOCUS, subjInfo, SUBJECTS, UAE_MOE_CALENDAR_2026_2027 } from '../../constants/data';
import {
  todayISO,
  daysBetween,
  startOfWeek,
  timeOfDay,
  fmtMins,
  overallAverage,
  currentSeniorMonth,
  fmtDate,
} from '../../utils/helpers';

export function smartTasks(data) {
  const today = todayISO();
  const items = [];
  data.homework
    .filter((h) => h.status !== 'completed')
    .forEach((h) => {
      const days = daysBetween(today, h.dueDate);
      items.push({
        id: h.id,
        kind: 'homework',
        subject: h.subject,
        ref: h,
        date: h.dueDate,
        days,
        priority: h.priority,
        label: `${subjInfo(h.subject).emoji} ${h.name}`,
        sub:
          days < 0
            ? 'Overdue'
            : days === 0
            ? 'Due today'
            : days === 1
            ? 'Due tomorrow'
            : `Due in ${days} days`,
        est: h.estMinutes,
      });
    });

  data.exams.forEach((e) => {
    const days = daysBetween(today, e.date);
    if (days >= 0 && days <= 14)
      items.push({
        id: e.id,
        kind: 'exam',
        subject: e.subject,
        ref: e,
        date: e.date,
        days,
        priority: days <= 3 ? 'high' : 'medium',
        label: `${subjInfo(e.subject).emoji} ${e.name}`,
        sub: days === 0 ? 'Today' : `In ${days} days`,
        est: null,
      });
  });

  const score = (t) => {
    let s = 0;
    if (t.days < 0) s += 1000;
    else s += Math.max(0, 30 - t.days) * 10;
    s += t.priority === 'high' ? 300 : t.priority === 'medium' ? 150 : 50;
    if (t.kind === 'exam') s += 120;
    return s;
  };

  return items.sort((a, b) => score(b) - score(a));
}

export function Dashboard({ data, update, setTab, openModal, setAiOpen }) {
  const [dashboardView, setDashboardView] = useState('bento'); // 'bento' | 'focus'
  const [selectedSubjFilter, setSelectedSubjFilter] = useState('all');
  const today = todayISO();
  const allTasks = smartTasks(data);
  const filteredTasks = selectedSubjFilter === 'all'
    ? allTasks.slice(0, 8)
    : allTasks.filter((t) => t.subject === selectedSubjFilter).slice(0, 8);

  const weekStart = startOfWeek(today);

  const dueThisWeek = data.homework.filter(
    (h) =>
      h.status !== 'completed' &&
      daysBetween(today, h.dueDate) >= 0 &&
      daysBetween(today, h.dueDate) <= 7
  ).length;

  const upcomingExams = data.exams.filter((e) => daysBetween(today, e.date) >= 0).length;
  const studyMinsWeek = data.study
    .filter((s) => s.date >= weekStart)
    .reduce((a, s) => a + Number(s.durationMinutes || 0), 0);

  const avg = overallAverage(data.grades);
  const curMonth = currentSeniorMonth(data.settings?.yearStart);
  const monthInfo = MONTH_FOCUS[curMonth] || { title: 'Academic Focus', points: ['Stay on track with syllabus'] };

  // Next upcoming UAE MOE break or milestone
  const nextMoeEvent = UAE_MOE_CALENDAR_2026_2027
    .map((evt) => ({ ...evt, days: daysBetween(today, evt.startDate) }))
    .filter((evt) => evt.days > 0)
    .sort((a, b) => a.days - b.days)[0];

  const daysToGrad = daysBetween(today, data.settings?.graduation || '2027-07-02');

  const toggleHomework = (id) =>
    update((d) => {
      const h = d.homework.find((x) => x.id === id);
      if (h) h.status = h.status === 'completed' ? 'not_started' : 'completed';
    });

  // Calculate average IELTS score
  const ieltsCurrent = data.ielts?.current;
  const ieltsAvg = ieltsCurrent
    ? ((ieltsCurrent.listening + ieltsCurrent.reading + ieltsCurrent.writing + ieltsCurrent.speaking) / 4).toFixed(1)
    : '6.6';

  return (
    <div className="fade-in">
      {/* Top Welcome Banner */}
      <div
        className="card welcome-banner"
        style={{
          marginBottom: 20,
          background: 'linear-gradient(135deg, rgba(18,26,42,0.92), rgba(24,34,54,0.98))',
          border: '1px solid var(--border-bright)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 16,
          boxShadow: 'var(--shadow-md)',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 24 }}>🚀</span>
            <div className="display" style={{ fontSize: 24, fontWeight: 700 }}>
              Good {timeOfDay()}, {data.settings?.name || 'Yassin'}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center', marginTop: 8 }}>
            <span className="chip" style={{ background: 'var(--blue-dim)', color: '#93C5FD', fontWeight: 600 }}>
              🩺 Pre-Med '27
            </span>
            <span className="chip" style={{ background: 'var(--bg-elev)', color: 'var(--text-dim)', border: '1px solid var(--border-soft)' }}>
              🗓️ {curMonth} Roadmap
            </span>
            {nextMoeEvent && (
              <span className="chip" style={{ background: 'var(--amber-dim)', color: 'var(--amber-light)', fontWeight: 600 }}>
                🏖️ Break in {nextMoeEvent.days}d
              </span>
            )}
          </div>
        </div>

        {/* View Switcher & Quick Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <div className="view-mode-toggle">
            <button
              className={`view-mode-btn ${dashboardView === 'bento' ? 'active' : ''}`}
              onClick={() => setDashboardView('bento')}
            >
              <span>🍱</span> Command Center
            </button>
            <button
              className={`view-mode-btn ${dashboardView === 'focus' ? 'active' : ''}`}
              onClick={() => setDashboardView('focus')}
            >
              <span>🎯</span> Focus Mode
            </button>
          </div>

          <button
            onClick={() => setAiOpen && setAiOpen(true)}
            className="btn-primary"
            style={{ background: 'linear-gradient(135deg, var(--blue), var(--violet))' }}
          >
            <span>✦</span> Ask SENIOR
          </button>
        </div>
      </div>

      {/* 5 Core Metric Cards */}
      <div className="metrics-grid">
        <div
          className="card card-interactive metric-card"
          onClick={() => setTab('grades')}
          style={{ cursor: 'pointer' }}
        >
          <div style={{ fontSize: 11, color: 'var(--text-faint)', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.4px' }}>
            Annual GPA
          </div>
          <div className="display metric-card-num" style={{ fontSize: 26, fontWeight: 700, color: 'var(--blue)', margin: '4px 0' }}>
            {avg != null ? `${avg.toFixed(1)}%` : '—'}
          </div>
          <div style={{ fontSize: 11, color: avg >= 95 ? 'var(--green)' : 'var(--amber-light)', fontWeight: 600 }}>
            {avg >= 95 ? '✓ Medical Met' : 'Aiming 95%+'}
          </div>
        </div>

        <div
          className="card card-interactive metric-card"
          onClick={() => setTab('homework')}
          style={{ cursor: 'pointer' }}
        >
          <div style={{ fontSize: 11, color: 'var(--text-faint)', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.4px' }}>
            Due This Week
          </div>
          <div className="display metric-card-num" style={{ fontSize: 26, fontWeight: 700, color: dueThisWeek > 0 ? 'var(--amber-light)' : 'var(--text)', margin: '4px 0' }}>
            {dueThisWeek}
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-faint)' }}>assignments pending</div>
        </div>

        <div
          className="card card-interactive metric-card"
          onClick={() => setTab('exams')}
          style={{ cursor: 'pointer' }}
        >
          <div style={{ fontSize: 11, color: 'var(--text-faint)', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.4px' }}>
            Upcoming Exams
          </div>
          <div className="display metric-card-num" style={{ fontSize: 26, fontWeight: 700, color: upcomingExams > 0 ? 'var(--red-light)' : 'var(--text)', margin: '4px 0' }}>
            {upcomingExams}
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-faint)' }}>scheduled assessments</div>
        </div>

        <div
          className="card card-interactive metric-card"
          onClick={() => setTab('study')}
          style={{ cursor: 'pointer' }}
        >
          <div style={{ fontSize: 11, color: 'var(--text-faint)', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.4px' }}>
            Study This Week
          </div>
          <div className="display metric-card-num" style={{ fontSize: 26, fontWeight: 700, color: 'var(--green)', margin: '4px 0' }}>
            {fmtMins(studyMinsWeek)}
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-faint)' }}>active study time</div>
        </div>

        {/* Card 5: Full Width Ribbon on Mobile */}
        <div
          className="card card-interactive metric-card"
          onClick={() => setTab('timeline')}
          style={{ cursor: 'pointer' }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: 11, color: 'var(--text-faint)', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.4px' }}>
                Graduation (Jul 2, 2027)
              </div>
              <div className="display metric-card-num" style={{ fontSize: 26, fontWeight: 700, color: 'var(--violet-light)', margin: '3px 0' }}>
                {daysToGrad} Days Left
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-faint)' }}>Official UAE MOE Date</div>
            </div>
            <div style={{ fontSize: 32, paddingRight: 6 }}>🎓</div>
          </div>
        </div>
      </div>

      {/* DASHBOARD VIEW: BENTO COMMAND CENTER */}
      {dashboardView === 'bento' && (
        <div className="bento-grid">
          {/* Left Column: Smart Priority Queue */}
          <div className="card dashboard-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <div>
                <div style={{ fontSize: 15, fontWeight: 700 }}>⚡ Smart Priority Queue</div>
                <div style={{ fontSize: 12, color: 'var(--text-faint)' }}>Auto-ranked by urgency and term weight</div>
              </div>
              <button onClick={() => setTab('homework')} className="btn-ghost" style={{ fontSize: 11.5, padding: '4px 10px' }}>
                View All HW ➔
              </button>
            </div>

            {/* Subject Filter Pills */}
            <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 10, marginBottom: 8 }} className="scrollbar-thin">
              <button
                onClick={() => setSelectedSubjFilter('all')}
                style={{
                  background: selectedSubjFilter === 'all' ? 'var(--blue)' : 'var(--bg-elev)',
                  color: selectedSubjFilter === 'all' ? '#fff' : 'var(--text-dim)',
                  border: '1px solid var(--border-soft)',
                  borderRadius: 14,
                  padding: '3px 10px',
                  fontSize: 11,
                  fontWeight: 600,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                }}
              >
                All ({allTasks.length})
              </button>
              {SUBJECTS.filter((s) => s.key !== 'other').map((s) => {
                const count = allTasks.filter((t) => t.subject === s.key).length;
                if (count === 0) return null;
                const isSelected = selectedSubjFilter === s.key;
                return (
                  <button
                    key={s.key}
                    onClick={() => setSelectedSubjFilter(s.key)}
                    style={{
                      background: isSelected ? s.color : 'var(--bg-elev)',
                      color: isSelected ? '#fff' : 'var(--text-dim)',
                      border: '1px solid var(--border-soft)',
                      borderRadius: 14,
                      padding: '3px 10px',
                      fontSize: 11,
                      fontWeight: 600,
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {s.emoji} {s.label} ({count})
                  </button>
                );
              })}
            </div>

            {filteredTasks.length === 0 ? (
              <EmptyState
                icon="🎉"
                title="All caught up!"
                text="No pending tasks or immediate exams scheduled. Great job staying ahead!"
                actionText="+ Add Homework"
                onAction={() => openModal && openModal({ type: 'homework' })}
              />
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {filteredTasks.map((t) => {
                  const isExam = t.kind === 'exam';
                  return (
                    <div
                      key={`${t.kind}-${t.id}`}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 12,
                        padding: '11px 14px',
                        background: 'var(--bg-elev)',
                        borderRadius: 10,
                        border: '1px solid var(--border-soft)',
                        borderLeft: `4px solid ${
                          t.days < 0 ? 'var(--red)' : isExam ? 'var(--red-light)' : subjInfo(t.subject).color
                        }`,
                        transition: 'all 0.15s ease',
                      }}
                    >
                      {!isExam ? (
                        <input
                          type="checkbox"
                          checked={false}
                          onChange={() => toggleHomework(t.ref.id)}
                          style={{ width: 17, height: 17, cursor: 'pointer', accentColor: 'var(--green)' }}
                          title="Mark complete"
                        />
                      ) : (
                        <span style={{ fontSize: 16 }}>📝</span>
                      )}

                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--text)' }}>
                          {t.label}
                        </div>
                        <div style={{ fontSize: 11, color: t.days < 0 ? 'var(--red-light)' : 'var(--text-faint)', marginTop: 2 }}>
                          {t.sub} {t.est ? `· ⏱️ ${t.est}m` : ''}
                        </div>
                      </div>

                      <span
                        className="chip"
                        style={{
                          background: t.priority === 'high' ? 'var(--red-dim)' : 'var(--bg)',
                          color: t.priority === 'high' ? 'var(--red-light)' : 'var(--text-dim)',
                          border: '1px solid var(--border)',
                        }}
                      >
                        {t.priority}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right Column: Month Mission & Pre-Med Track */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Senior Year Mission Box */}
            <div className="card dashboard-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <div style={{ fontSize: 15, fontWeight: 700 }}>
                  🎯 {curMonth} Mission: {monthInfo.title}
                </div>
                <span className="chip" style={{ background: 'var(--blue-dim)', color: '#93C5FD' }}>
                  Roadmap
                </span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {monthInfo.points.map((pt, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12.5, color: 'var(--text-dim)' }}>
                    <span style={{ color: 'var(--blue-light)' }}>•</span>
                    <span>{pt}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Pre-Med & IELTS Target Card */}
            <div
              className="card card-interactive dashboard-card"
              onClick={() => setTab('ielts')}
              style={{ cursor: 'pointer' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <div style={{ fontSize: 14, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span>🩺</span> Pre-Med & IELTS Progress
                </div>
                <span className="chip" style={{ background: 'var(--violet-dim)', color: 'var(--violet-light)' }}>
                  Target 7.5+
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <span style={{ fontSize: 12, color: 'var(--text-dim)' }}>Current Band Average:</span>
                <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)' }}>{ieltsAvg} / 9.0</span>
              </div>
              <Bar pct={Math.min(100, Math.round((Number(ieltsAvg) / 7.5) * 100))} color="var(--violet)" />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--text-faint)', marginTop: 8 }}>
                <span>L: {ieltsCurrent?.listening} · R: {ieltsCurrent?.reading}</span>
                <span>W: {ieltsCurrent?.writing} · S: {ieltsCurrent?.speaking}</span>
              </div>
            </div>

            {/* Quick Action Dock */}
            <div className="card dashboard-card">
              <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 12 }}>
                ⚡ Quick Action Launcher
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <button
                  onClick={() => openModal && openModal({ type: 'homework' })}
                  className="btn-ghost"
                  style={{ justifyContent: 'center', padding: '10px 8px' }}
                >
                  📚 + Homework
                </button>
                <button
                  onClick={() => openModal && openModal({ type: 'study' })}
                  className="btn-ghost"
                  style={{ justifyContent: 'center', padding: '10px 8px' }}
                >
                  📖 + Log Study
                </button>
                <button
                  onClick={() => openModal && openModal({ type: 'exam' })}
                  className="btn-ghost"
                  style={{ justifyContent: 'center', padding: '10px 8px' }}
                >
                  📝 + Add Exam
                </button>
                <button
                  onClick={() => openModal && openModal({ type: 'grade' })}
                  className="btn-ghost"
                  style={{ justifyContent: 'center', padding: '10px 8px' }}
                >
                  📊 + Record Grade
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DASHBOARD VIEW: FOCUS STREAM */}
      {dashboardView === 'focus' && (
        <div className="card dashboard-card" style={{ maxWidth: 760, margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
            <div>
              <div style={{ fontSize: 18, fontWeight: 700 }}>🎯 Deep Work Focus Queue</div>
              <div style={{ fontSize: 12.5, color: 'var(--text-dim)' }}>Single-tasking stream: Work down the list one by one</div>
            </div>
            <span className="chip" style={{ background: 'var(--green-dim)', color: 'var(--green)' }}>
              Deep Focus
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {allTasks.length === 0 ? (
              <EmptyState
                icon="🎯"
                title="Focus Queue Empty"
                text="You have completed all pending tasks for today!"
              />
            ) : (
              allTasks.slice(0, 10).map((t, idx) => (
                <div
                  key={t.id}
                  style={{
                    padding: 16,
                    borderRadius: 12,
                    background: idx === 0 ? 'linear-gradient(135deg, var(--card-hi), var(--card))' : 'var(--bg-elev)',
                    border: idx === 0 ? '2px solid var(--blue)' : '1px solid var(--border-soft)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span style={{ fontSize: 18, fontWeight: 700, color: idx === 0 ? 'var(--blue-light)' : 'var(--text-faint)' }}>
                      #{idx + 1}
                    </span>
                    <div>
                      <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text)' }}>
                        {t.label}
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--text-faint)', marginTop: 2 }}>
                        {t.sub} {t.est ? `· ⏱️ ${t.est} mins` : ''}
                      </div>
                    </div>
                  </div>

                  {t.kind === 'homework' && (
                    <button
                      onClick={() => toggleHomework(t.ref.id)}
                      className="btn-primary"
                      style={{ fontSize: 12, padding: '6px 14px' }}
                    >
                      ✓ Complete
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
