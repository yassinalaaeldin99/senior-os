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
  calcTermGrade,
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

export function Dashboard({ data, update, setTab, openModal, setAiOpen, openScanner }) {
  const [dashboardView, setDashboardView] = useState('bento'); // 'bento' | 'focus'
  const [selectedSubjFilter, setSelectedSubjFilter] = useState('all');
  const [completedMissionPoints, setCompletedMissionPoints] = useState(() => {
    return data.goals?.monthlyMissionChecks || [0, 1];
  });

  const today = todayISO();
  const allTasks = smartTasks(data);
  const filteredTasks =
    selectedSubjFilter === 'all'
      ? allTasks.slice(0, 8)
      : allTasks.filter((t) => t.subject === selectedSubjFilter).slice(0, 8);

  const weekStart = startOfWeek(today);

  const dueThisWeek = data.homework.filter(
    (h) =>
      h.status !== 'completed' &&
      daysBetween(today, h.dueDate) >= 0 &&
      daysBetween(today, h.dueDate) <= 7
  ).length;

  const overdueHw = data.homework.filter(
    (h) => h.status !== 'completed' && daysBetween(today, h.dueDate) < 0
  ).length;

  const upcomingExams = data.exams.filter((e) => daysBetween(today, e.date) >= 0).length;
  const nextExam = data.exams
    .map((e) => ({ ...e, days: daysBetween(today, e.date) }))
    .filter((e) => e.days >= 0)
    .sort((a, b) => a.days - b.days)[0];

  const studyMinsWeek = data.study
    .filter((s) => s.date >= weekStart)
    .reduce((a, s) => a + Number(s.durationMinutes || 0), 0);

  const avg = overallAverage(data.grades);
  const curMonth = currentSeniorMonth(data.settings?.yearStart);
  const monthInfo = MONTH_FOCUS[curMonth] || {
    title: 'Academic Focus',
    points: [
      'Establish daily study routine',
      'Track every homework assignment',
      'Build continuous study habits',
      'Start IELTS preparation',
      'Research medical career options',
    ],
  };

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

  const toggleMissionPoint = (idx) => {
    setCompletedMissionPoints((prev) => {
      const next = prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx];
      update((d) => {
        if (!d.goals) d.goals = {};
        d.goals.monthlyMissionChecks = next;
      });
      return next;
    });
  };

  // Calculate average IELTS score
  const ieltsCurrent = data.ielts?.current;
  const ieltsAvg = ieltsCurrent
    ? (
        (ieltsCurrent.listening +
          ieltsCurrent.reading +
          ieltsCurrent.writing +
          ieltsCurrent.speaking) /
        4
      ).toFixed(1)
    : '6.6';

  const coreSubjects = SUBJECTS.filter((s) => s.key !== 'other');

  return (
    <div className="fade-in" style={{ width: '100%', maxWidth: '100%' }}>
      {/* 1. Top Executive Welcome Banner */}
      <div
        className="card welcome-banner"
        style={{
          background:
            'linear-gradient(135deg, rgba(18,26,42,0.96) 0%, rgba(22,32,52,0.98) 60%, rgba(28,40,64,0.95) 100%)',
          border: '1px solid var(--border-bright)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.35)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 16,
        }}
      >
        <div className="welcome-banner-header">
          <div className="welcome-title-wrap" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                background: 'linear-gradient(135deg, var(--blue), var(--violet))',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 22,
                boxShadow: '0 4px 16px rgba(59,130,246,0.35)',
                flexShrink: 0,
              }}
            >
              🚀
            </div>
            <div>
              <div className="display" style={{ fontSize: 24, fontWeight: 700, letterSpacing: '-0.02em' }}>
                Good {timeOfDay()}, {data.settings?.name || 'Yassin'}
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-dim)', marginTop: 2 }}>
                {fmtDate(today)} · Term 1 (35% Weight) · Grade 12 Senior Year
              </div>
            </div>
          </div>

          <div
            className="welcome-chips"
            style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center', marginTop: 12 }}
          >
            <span
              className="chip"
              style={{
                background: 'var(--blue-dim)',
                color: '#93C5FD',
                border: '1px solid rgba(59,130,246,0.3)',
                fontWeight: 600,
                padding: '4px 10px',
              }}
            >
              🩺 Pre-Med '27
            </span>
            <span
              className="chip"
              style={{
                background: 'var(--green-dim)',
                color: 'var(--green-light)',
                border: '1px solid rgba(16,185,129,0.3)',
                fontWeight: 600,
                padding: '4px 10px',
              }}
            >
              🔥 4d Study Momentum
            </span>
            <span
              className="chip"
              style={{
                background: 'var(--bg-elev)',
                color: 'var(--text-dim)',
                border: '1px solid var(--border-soft)',
                padding: '4px 10px',
              }}
            >
              🗓️ {curMonth} Roadmap
            </span>
            {nextMoeEvent && (
              <span
                className="chip"
                style={{
                  background: 'var(--amber-dim)',
                  color: 'var(--amber-light)',
                  border: '1px solid rgba(245,158,11,0.3)',
                  fontWeight: 600,
                  padding: '4px 10px',
                }}
              >
                🏖️ Mid-Term Break in {nextMoeEvent.days}d
              </span>
            )}
            <span
              className="chip"
              style={{
                background: 'var(--violet-dim)',
                color: 'var(--violet-light)',
                border: '1px solid rgba(139,92,246,0.3)',
                fontWeight: 600,
                padding: '4px 10px',
              }}
            >
              ⚖️ MOE 35/30/35% Active
            </span>
          </div>
        </div>

        {/* View Switcher & AI Launcher */}
        <div className="welcome-actions" style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <div className="view-mode-toggle" style={{ background: 'var(--bg-surface)' }}>
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
            style={{
              background: 'linear-gradient(135deg, var(--blue), var(--violet))',
              boxShadow: '0 4px 16px rgba(91,141,239,0.35)',
              display: 'flex',
              alignItems: 'center',
              gap: 7,
              padding: '9px 16px',
            }}
          >
            <span style={{ fontSize: 14 }}>✦</span>
            <span>Ask SENIOR AI</span>
          </button>
        </div>
      </div>

      {/* 2. 5 Core Executive Metric KPI Cards */}
      <div className="metrics-grid">
        {/* Card 1: Annual GPA */}
        <div
          className="card card-interactive metric-card"
          onClick={() => setTab('grades')}
          style={{ cursor: 'pointer', borderTop: '3px solid var(--blue)' }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ fontSize: 11, color: 'var(--text-faint)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.6px' }}>
              Annual GPA
            </div>
            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: 8,
                background: 'var(--blue-dim)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 14,
                color: 'var(--blue-light)',
              }}
            >
              🎯
            </div>
          </div>
          <div className="display metric-card-num" style={{ fontSize: 26, fontWeight: 700, color: 'var(--blue-light)', margin: '6px 0 2px' }}>
            {avg != null ? `${avg.toFixed(1)}%` : '—'}
          </div>
          <div>
            <div style={{ fontSize: 11.5, color: avg >= 95 ? 'var(--green)' : 'var(--amber-light)', fontWeight: 600 }}>
              {avg >= 95 ? '✓ 95%+ Target Met' : 'Aiming 95%+ Pre-Med'}
            </div>
            <div style={{ fontSize: 10.5, color: 'var(--text-faint)', marginTop: 2 }}>
              T1 (35%) · T2 (30%) · T3 (35%)
            </div>
          </div>
        </div>

        {/* Card 2: Due This Week */}
        <div
          className="card card-interactive metric-card"
          onClick={() => setTab('homework')}
          style={{ cursor: 'pointer', borderTop: '3px solid var(--amber)' }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ fontSize: 11, color: 'var(--text-faint)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.6px' }}>
              Due This Week
            </div>
            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: 8,
                background: 'var(--amber-dim)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 14,
                color: 'var(--amber-light)',
              }}
            >
              📚
            </div>
          </div>
          <div className="display metric-card-num" style={{ fontSize: 26, fontWeight: 700, color: dueThisWeek > 0 ? 'var(--amber-light)' : 'var(--text)', margin: '6px 0 2px' }}>
            {dueThisWeek}
          </div>
          <div>
            <div style={{ fontSize: 11.5, color: overdueHw > 0 ? 'var(--red-light)' : 'var(--text-dim)', fontWeight: 600 }}>
              {overdueHw > 0 ? `⚠️ ${overdueHw} overdue` : dueThisWeek === 0 ? '✓ All cleared' : 'Active assignments'}
            </div>
            <div style={{ fontSize: 10.5, color: 'var(--text-faint)', marginTop: 2 }}>
              Assignments in next 7d
            </div>
          </div>
        </div>

        {/* Card 3: Upcoming Exams */}
        <div
          className="card card-interactive metric-card"
          onClick={() => setTab('exams')}
          style={{ cursor: 'pointer', borderTop: '3px solid var(--red)' }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ fontSize: 11, color: 'var(--text-faint)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.6px' }}>
              Upcoming Exams
            </div>
            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: 8,
                background: 'var(--red-dim)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 14,
                color: 'var(--red-light)',
              }}
            >
              📝
            </div>
          </div>
          <div className="display metric-card-num" style={{ fontSize: 26, fontWeight: 700, color: upcomingExams > 0 ? 'var(--red-light)' : 'var(--text)', margin: '6px 0 2px' }}>
            {upcomingExams}
          </div>
          <div>
            <div style={{ fontSize: 11.5, color: nextExam ? 'var(--red-light)' : 'var(--text-dim)', fontWeight: 600 }}>
              {nextExam ? `Next: in ${nextExam.days}d` : 'No upcoming exams'}
            </div>
            <div style={{ fontSize: 10.5, color: 'var(--text-faint)', marginTop: 2 }}>
              50% School / 50% Ministry
            </div>
          </div>
        </div>

        {/* Card 4: Study This Week */}
        <div
          className="card card-interactive metric-card"
          onClick={() => setTab('study')}
          style={{ cursor: 'pointer', borderTop: '3px solid var(--green)' }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ fontSize: 11, color: 'var(--text-faint)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.6px' }}>
              Study This Week
            </div>
            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: 8,
                background: 'var(--green-dim)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 14,
                color: 'var(--green-light)',
              }}
            >
              ⏱️
            </div>
          </div>
          <div className="display metric-card-num" style={{ fontSize: 26, fontWeight: 700, color: 'var(--green-light)', margin: '6px 0 2px' }}>
            {fmtMins(studyMinsWeek)}
          </div>
          <div>
            <div style={{ fontSize: 11.5, color: 'var(--green)', fontWeight: 600 }}>
              {Math.min(100, Math.round((studyMinsWeek / 840) * 100))}% of 14h Goal
            </div>
            <div style={{ fontSize: 10.5, color: 'var(--text-faint)', marginTop: 2 }}>
              Active logged sessions
            </div>
          </div>
        </div>

        {/* Card 5: Graduation Countdown */}
        <div
          className="card card-interactive metric-card"
          onClick={() => setTab('timeline')}
          style={{ cursor: 'pointer', borderTop: '3px solid var(--violet)' }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ fontSize: 11, color: 'var(--text-faint)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.6px' }}>
              Graduation
            </div>
            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: 8,
                background: 'var(--violet-dim)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 14,
                color: 'var(--violet-light)',
              }}
            >
              🎓
            </div>
          </div>
          <div className="display metric-card-num" style={{ fontSize: 26, fontWeight: 700, color: 'var(--violet-light)', margin: '6px 0 2px' }}>
            {daysToGrad} Days
          </div>
          <div>
            <div style={{ fontSize: 11.5, color: 'var(--violet-light)', fontWeight: 600 }}>
              July 02, 2027
            </div>
            <div style={{ fontSize: 10.5, color: 'var(--text-faint)', marginTop: 2 }}>
              Official UAE MOE Date
            </div>
          </div>
        </div>
      </div>

      {/* 3. BENTO COMMAND CENTER */}
      {dashboardView === 'bento' && (
        <div className="bento-grid">
          {/* Left Column: Smart Priority Queue & Subject Hub */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Smart Priority Queue Card */}
            <div className="card dashboard-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                <div>
                  <div style={{ fontSize: 16, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span>⚡</span>
                    <span>Smart Priority Queue</span>
                    <span
                      style={{
                        fontSize: 11,
                        background: allTasks.length > 0 ? 'var(--blue-dim)' : 'var(--green-dim)',
                        color: allTasks.length > 0 ? '#93C5FD' : 'var(--green-light)',
                        padding: '2px 8px',
                        borderRadius: 10,
                        fontWeight: 600,
                      }}
                    >
                      {allTasks.length} Active
                    </span>
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-faint)', marginTop: 2 }}>
                    Auto-ranked by submission urgency and MOE term weighting
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    onClick={() => openModal && openModal({ type: 'homework' })}
                    className="btn-ghost"
                    style={{ fontSize: 12, padding: '5px 12px', borderColor: 'var(--border-bright)' }}
                  >
                    + Add HW
                  </button>
                  <button
                    onClick={() => setTab('homework')}
                    className="btn-ghost"
                    style={{ fontSize: 12, padding: '5px 12px' }}
                  >
                    All HW ➔
                  </button>
                </div>
              </div>

              {/* Subject Filter Pills */}
              <div
                style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 10, marginBottom: 12 }}
                className="scrollbar-thin"
              >
                <button
                  onClick={() => setSelectedSubjFilter('all')}
                  style={{
                    background: selectedSubjFilter === 'all' ? 'var(--blue)' : 'var(--bg-elev)',
                    color: selectedSubjFilter === 'all' ? '#fff' : 'var(--text-dim)',
                    border: '1px solid var(--border-soft)',
                    borderRadius: 14,
                    padding: '4px 12px',
                    fontSize: 11.5,
                    fontWeight: 600,
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    transition: 'all 0.15s ease',
                  }}
                >
                  All Tasks ({allTasks.length})
                </button>
                {coreSubjects.map((s) => {
                  const count = allTasks.filter((t) => t.subject === s.key).length;
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
                        padding: '4px 12px',
                        fontSize: 11.5,
                        fontWeight: 600,
                        cursor: 'pointer',
                        whiteSpace: 'nowrap',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      {s.emoji} {s.label} {count > 0 ? `(${count})` : ''}
                    </button>
                  );
                })}
              </div>

              {/* Task Items OR High-Impact Pre-Med Advantage Hub */}
              {filteredTasks.length === 0 ? (
                <div>
                  {/* Celebration Banner */}
                  <div
                    style={{
                      padding: '16px 18px',
                      background:
                        'linear-gradient(135deg, rgba(16,185,129,0.12) 0%, rgba(59,130,246,0.1) 100%)',
                      border: '1px solid rgba(16,185,129,0.25)',
                      borderRadius: 14,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 14,
                      marginBottom: 16,
                    }}
                  >
                    <div
                      style={{
                        width: 44,
                        height: 44,
                        borderRadius: 12,
                        background: 'rgba(16,185,129,0.2)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 22,
                        flexShrink: 0,
                      }}
                    >
                      🎉
                    </div>
                    <div>
                      <div style={{ fontSize: 14.5, fontWeight: 700, color: 'var(--text)' }}>
                        All Caught Up & Ahead of Schedule!
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--text-dim)', marginTop: 2, lineHeight: 1.4 }}>
                        Zero pending assignments. Use this clear schedule to reinforce high-yield Pre-Med concepts:
                      </div>
                    </div>
                  </div>

                  {/* 4 High-Impact Senior Actions */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
                    <div
                      className="advantage-card"
                      onClick={() => openModal && openModal({ type: 'study' })}
                      title="Log a Biology study session"
                    >
                      <span style={{ fontSize: 24 }}>🧬</span>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)' }}>
                          Review Biology Flashcards
                        </div>
                        <div style={{ fontSize: 11, color: 'var(--text-faint)', marginTop: 2 }}>
                          Mr. Mohammed · Cell & Genetics
                        </div>
                      </div>
                    </div>

                    <div
                      className="advantage-card"
                      onClick={() => setTab('ielts')}
                      title="Jump to IELTS Academic prep"
                    >
                      <span style={{ fontSize: 24 }}>🇬🇧</span>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)' }}>
                          Practice IELTS Task 2 Essay
                        </div>
                        <div style={{ fontSize: 11, color: 'var(--text-faint)', marginTop: 2 }}>
                          Target Band 7.5+ · 40m Drill
                        </div>
                      </div>
                    </div>

                    <div
                      className="advantage-card"
                      onClick={() => openModal && openModal({ type: 'study' })}
                      title="Log a Physics study session"
                    >
                      <span style={{ fontSize: 24 }}>⚡</span>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)' }}>
                          Physics Problem Set Drill
                        </div>
                        <div style={{ fontSize: 11, color: 'var(--text-faint)', marginTop: 2 }}>
                          Mr. Anas · School Assessment 1
                        </div>
                      </div>
                    </div>

                    <div
                      className="advantage-card"
                      onClick={() => openModal && openModal({ type: 'study' })}
                      title="Start deep work timer"
                    >
                      <span style={{ fontSize: 24 }}>⏱️</span>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)' }}>
                          Log Deep Study Session
                        </div>
                        <div style={{ fontSize: 11, color: 'var(--text-faint)', marginTop: 2 }}>
                          Advance your 14h weekly target
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Action Bar */}
                  <div
                    style={{
                      display: 'flex',
                      gap: 10,
                      alignItems: 'center',
                      justifyContent: 'flex-start',
                      flexWrap: 'wrap',
                      paddingTop: 10,
                      borderTop: '1px solid var(--border-soft)',
                    }}
                  >
                    <button
                      onClick={() => openModal && openModal({ type: 'homework' })}
                      className="btn-primary"
                      style={{ fontSize: 12.5, padding: '7px 14px' }}
                    >
                      + Add Homework
                    </button>
                    <button
                      onClick={openScanner}
                      className="btn-ghost"
                      style={{ fontSize: 12.5, padding: '7px 14px', borderColor: 'var(--blue)', color: 'var(--blue-light)' }}
                    >
                      📷 Scan Homework (AI Vision)
                    </button>
                    <button
                      onClick={() => openModal && openModal({ type: 'study' })}
                      className="btn-ghost"
                      style={{ fontSize: 12.5, padding: '7px 14px' }}
                    >
                      📖 + Log Study
                    </button>
                  </div>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {filteredTasks.map((t) => {
                    const isExam = t.kind === 'exam';
                    const subj = subjInfo(t.subject);
                    return (
                      <div
                        key={`${t.kind}-${t.id}`}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 12,
                          padding: '12px 16px',
                          background: 'var(--bg-elev)',
                          borderRadius: 12,
                          border: '1px solid var(--border-soft)',
                          borderLeft: `4px solid ${
                            t.days < 0
                              ? 'var(--red)'
                              : isExam
                              ? 'var(--red-light)'
                              : subj.color
                          }`,
                          transition: 'all 0.15s ease',
                        }}
                      >
                        {!isExam ? (
                          <input
                            type="checkbox"
                            checked={false}
                            onChange={() => toggleHomework(t.ref.id)}
                            style={{ width: 18, height: 18, cursor: 'pointer', accentColor: 'var(--green)' }}
                            title="Mark completed"
                          />
                        ) : (
                          <span style={{ fontSize: 18 }}>📝</span>
                        )}

                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                            <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>
                              {t.label}
                            </span>
                            {subj.teacher && (
                              <span
                                style={{
                                  fontSize: 10.5,
                                  color: 'var(--text-faint)',
                                  background: 'var(--card-hi)',
                                  padding: '1px 6px',
                                  borderRadius: 6,
                                }}
                              >
                                {subj.teacher}
                              </span>
                            )}
                          </div>
                          <div style={{ fontSize: 11.5, color: t.days < 0 ? 'var(--red-light)' : 'var(--text-faint)', marginTop: 3 }}>
                            {t.sub} {t.est ? `· ⏱️ ${t.est}m estimate` : ''}
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

            {/* Official UAE MOE Subjects & Teachers Quick Hub */}
            <div className="card dashboard-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span>🏫</span>
                    <span>UAE MOE Curriculum Subjects & Teachers</span>
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-faint)', marginTop: 2 }}>
                    Official Grade 12 Department Faculty · Class of 2027
                  </div>
                </div>
                <button onClick={() => setTab('grades')} className="btn-ghost" style={{ fontSize: 11.5, padding: '4px 10px' }}>
                  Grade Matrix ➔
                </button>
              </div>

              <div className="subject-hub-grid">
                {coreSubjects.map((s) => {
                  const term1Grade = calcTermGrade(data.grades?.[s.key]?.term1);
                  const hwCount = data.homework.filter((h) => h.subject === s.key && h.status !== 'completed').length;
                  return (
                    <div
                      key={s.key}
                      className="subject-hub-card"
                      onClick={() => {
                        setSelectedSubjFilter(s.key);
                      }}
                      style={{ borderLeft: `3px solid ${s.color}` }}
                      title={`Filter to ${s.label} (${s.teacher})`}
                    >
                      <div
                        style={{
                          width: 32,
                          height: 32,
                          borderRadius: 8,
                          background: 'var(--card-hi)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: 16,
                          flexShrink: 0,
                        }}
                      >
                        {s.emoji}
                      </div>
                      <div style={{ minWidth: 0, flex: 1 }}>
                        <div style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {s.label}
                        </div>
                        <div style={{ fontSize: 10.5, color: 'var(--text-dim)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {s.teacher}
                        </div>
                        <div style={{ fontSize: 10, marginTop: 2, fontWeight: 600, color: term1Grade != null ? (term1Grade >= 95 ? 'var(--green)' : 'var(--blue-light)') : hwCount > 0 ? 'var(--amber-light)' : 'var(--text-faint)' }}>
                          {term1Grade != null ? `${term1Grade.toFixed(0)}% T1` : hwCount > 0 ? `${hwCount} HW Pending` : '✓ On Track'}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Column: Mission Roadmap, Pre-Med/IELTS, Quick Launcher */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Interactive Senior Year Mission Box */}
            <div className="card dashboard-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 7 }}>
                    <span>🎯</span>
                    <span>{curMonth} Mission</span>
                  </div>
                  <div style={{ fontSize: 11.5, color: 'var(--text-dim)', marginTop: 1 }}>
                    {monthInfo.title}
                  </div>
                </div>
                <span
                  className="chip"
                  style={{
                    background: 'var(--blue-dim)',
                    color: '#93C5FD',
                    fontWeight: 600,
                    fontSize: 11,
                  }}
                >
                  {completedMissionPoints.length} / {monthInfo.points.length} Done
                </span>
              </div>

              {/* Progress bar */}
              <div style={{ marginBottom: 12 }}>
                <Bar
                  pct={Math.round((completedMissionPoints.length / monthInfo.points.length) * 100)}
                  color="var(--blue)"
                />
              </div>

              {/* Interactive Milestone Checkpoints */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {monthInfo.points.map((pt, i) => {
                  const isDone = completedMissionPoints.includes(i);
                  return (
                    <div
                      key={i}
                      className="mission-check-item"
                      onClick={() => toggleMissionPoint(i)}
                    >
                      <input
                        type="checkbox"
                        checked={isDone}
                        onChange={() => {}} // handled by parent div click
                        style={{ width: 16, height: 16, cursor: 'pointer', accentColor: 'var(--green)' }}
                      />
                      <span
                        style={{
                          fontSize: 12.5,
                          color: isDone ? 'var(--text-faint)' : 'var(--text)',
                          textDecoration: isDone ? 'line-through' : 'none',
                          flex: 1,
                        }}
                      >
                        {pt}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Pre-Med & IELTS Target Command Card */}
            <div
              className="card card-interactive dashboard-card"
              onClick={() => setTab('ielts')}
              style={{ cursor: 'pointer' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <div style={{ fontSize: 14.5, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span>🩺</span>
                  <span>Pre-Med & IELTS Progress</span>
                </div>
                <span
                  className="chip"
                  style={{
                    background: 'var(--violet-dim)',
                    color: 'var(--violet-light)',
                    fontWeight: 600,
                  }}
                >
                  Target 7.5+ Band
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8 }}>
                <span style={{ fontSize: 12, color: 'var(--text-dim)' }}>Overall Band Average:</span>
                <span style={{ fontSize: 16, fontWeight: 800, color: 'var(--text)' }}>
                  {ieltsAvg} <span style={{ fontSize: 12, color: 'var(--text-faint)', fontWeight: 500 }}>/ 9.0</span>
                </span>
              </div>

              <Bar pct={Math.min(100, Math.round((Number(ieltsAvg) / 7.5) * 100))} color="var(--violet)" />

              {/* 4 Skills Breakdown */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(4, 1fr)',
                  gap: 6,
                  marginTop: 12,
                  textAlign: 'center',
                }}
              >
                <div style={{ background: 'var(--bg-elev)', padding: '6px 4px', borderRadius: 8, border: '1px solid var(--border-soft)' }}>
                  <div style={{ fontSize: 10, color: 'var(--text-faint)' }}>LISTENING</div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--green-light)', marginTop: 2 }}>
                    {ieltsCurrent?.listening || '7.0'}
                  </div>
                </div>
                <div style={{ background: 'var(--bg-elev)', padding: '6px 4px', borderRadius: 8, border: '1px solid var(--border-soft)' }}>
                  <div style={{ fontSize: 10, color: 'var(--text-faint)' }}>READING</div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--green-light)', marginTop: 2 }}>
                    {ieltsCurrent?.reading || '7.0'}
                  </div>
                </div>
                <div style={{ background: 'var(--bg-elev)', padding: '6px 4px', borderRadius: 8, border: '1px solid var(--border-soft)' }}>
                  <div style={{ fontSize: 10, color: 'var(--text-faint)' }}>WRITING</div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--amber-light)', marginTop: 2 }}>
                    {ieltsCurrent?.writing || '6.0'}
                  </div>
                </div>
                <div style={{ background: 'var(--bg-elev)', padding: '6px 4px', borderRadius: 8, border: '1px solid var(--border-soft)' }}>
                  <div style={{ fontSize: 10, color: 'var(--text-faint)' }}>SPEAKING</div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--blue-light)', marginTop: 2 }}>
                    {ieltsCurrent?.speaking || '6.5'}
                  </div>
                </div>
              </div>

              <div style={{ fontSize: 11, color: 'var(--text-faint)', marginTop: 10, display: 'flex', justifyContent: 'space-between' }}>
                <span>🧬 Bio & Chem 95%+ Target</span>
                <span>🇩🇪 🇬🇧 🇮🇪 Target Countries</span>
              </div>
            </div>

            {/* Quick Action Dock */}
            <div className="card dashboard-card">
              <div style={{ fontSize: 14.5, fontWeight: 700, marginBottom: 12 }}>
                ⚡ Quick Action Launcher
              </div>

              {/* AI Vision Scanner Prominent Banner */}
              <button
                onClick={openScanner}
                className="btn-primary"
                style={{
                  width: '100%',
                  justifyContent: 'center',
                  padding: '11px 14px',
                  background: 'linear-gradient(135deg, var(--blue), var(--violet))',
                  fontSize: 13.5,
                  fontWeight: 700,
                  boxShadow: '0 6px 20px rgba(59,130,246,0.3)',
                  marginBottom: 10,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                }}
                title="Snap photo or upload PDF of homework sheet to auto-sort"
              >
                <span>📷</span>
                <span>Scan Homework (AI Vision OCR)</span>
              </button>

              <div className="quick-launcher-grid">
                <button
                  onClick={() => openModal && openModal({ type: 'homework' })}
                  className="quick-action-tile"
                >
                  <span style={{ fontSize: 16 }}>📚</span>
                  <span>+ Homework</span>
                </button>
                <button
                  onClick={() => openModal && openModal({ type: 'study' })}
                  className="quick-action-tile"
                >
                  <span style={{ fontSize: 16 }}>📖</span>
                  <span>+ Log Study</span>
                </button>
                <button
                  onClick={() => openModal && openModal({ type: 'exam' })}
                  className="quick-action-tile"
                >
                  <span style={{ fontSize: 16 }}>📝</span>
                  <span>+ Add Exam</span>
                </button>
                <button
                  onClick={() => openModal && openModal({ type: 'grade' })}
                  className="quick-action-tile"
                >
                  <span style={{ fontSize: 16 }}>📊</span>
                  <span>+ Record Grade</span>
                </button>
              </div>
            </div>

            {/* UAE MOE Key Dates Glance */}
            <div
              className="card card-interactive dashboard-card"
              onClick={() => setTab('calendar')}
              style={{ cursor: 'pointer', padding: '14px 18px' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: 11, color: 'var(--text-faint)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.6px' }}>
                    Next MOE Milestone
                  </div>
                  <div style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--text)', marginTop: 3 }}>
                    🍂 Mid-Term 1 Break
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--amber-light)', marginTop: 2 }}>
                    Oct 12 – Oct 18, 2026 (In 39 days)
                  </div>
                </div>
                <div style={{ fontSize: 24 }}>📅</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. DASHBOARD VIEW: FOCUS STREAM */}
      {dashboardView === 'focus' && (
        <div className="card dashboard-card" style={{ maxWidth: 760, margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <div>
              <div style={{ fontSize: 19, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
                <span>🎯</span>
                <span>Deep Work Focus Stream</span>
              </div>
              <div style={{ fontSize: 13, color: 'var(--text-dim)', marginTop: 2 }}>
                Distraction-free single-tasking flow: Finish tasks one by one
              </div>
            </div>
            <span className="chip" style={{ background: 'var(--green-dim)', color: 'var(--green-light)', fontWeight: 600 }}>
              Deep Focus Active
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {allTasks.length === 0 ? (
              <EmptyState
                icon="🎯"
                title="Focus Queue Clear!"
                text="You have completed all pending tasks for today. Great momentum!"
                actionText="Log Study Session"
                onAction={() => openModal && openModal({ type: 'study' })}
              />
            ) : (
              allTasks.slice(0, 10).map((t, idx) => (
                <div
                  key={t.id}
                  style={{
                    padding: '16px 18px',
                    borderRadius: 14,
                    background:
                      idx === 0
                        ? 'linear-gradient(135deg, rgba(59,130,246,0.12), rgba(139,92,246,0.12))'
                        : 'var(--bg-elev)',
                    border: idx === 0 ? '2px solid var(--blue)' : '1px solid var(--border-soft)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    boxShadow: idx === 0 ? '0 8px 24px rgba(59,130,246,0.2)' : 'none',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <div
                      style={{
                        width: 34,
                        height: 34,
                        borderRadius: 10,
                        background: idx === 0 ? 'var(--blue)' : 'var(--card-hi)',
                        color: idx === 0 ? '#fff' : 'var(--text-faint)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 15,
                        fontWeight: 700,
                      }}
                    >
                      #{idx + 1}
                    </div>
                    <div>
                      <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)' }}>
                        {t.label}
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--text-faint)', marginTop: 2 }}>
                        {t.sub} {t.est ? `· ⏱️ ${t.est} mins focus` : ''} · {subjInfo(t.subject).teacher}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: 8 }}>
                    {t.kind === 'homework' && (
                      <button
                        onClick={() => toggleHomework(t.ref.id)}
                        className="btn-primary"
                        style={{ fontSize: 12.5, padding: '7px 16px' }}
                      >
                        ✓ Mark Complete
                      </button>
                    )}
                    <button
                      onClick={() => openModal && openModal({ type: 'study' })}
                      className="btn-ghost"
                      style={{ fontSize: 12, padding: '7px 12px' }}
                      title="Start study timer for this task"
                    >
                      ⏱️ Log Session
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
