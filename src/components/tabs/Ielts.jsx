import { useState } from 'react';
import { PageHeader, Bar, Chip, MiniStat, EmptyState } from '../common';
import { todayISO, daysBetween, fmtDate } from '../../utils/helpers';
import { IeltsMockModal } from '../modals/IeltsMockModal';

export function Ielts({ data, update, openModal }) {
  const [viewMode, setViewMode] = useState('overview'); // 'overview' | 'mocks' | 'sessions'
  const [mockModalOpen, setMockModalOpen] = useState(false);

  const i = data.ielts;
  const mockTests = i.mockTests || [];
  const sessions = i.sessions || [];

  const avg =
    (i.current.listening + i.current.reading + i.current.writing + i.current.speaking) / 4;
  const daysLeft = i.examDate ? daysBetween(todayISO(), i.examDate) : null;
  const target = i.target || 7.5;

  const setSkill = (skill, val) =>
    update((d) => {
      d.ielts.current[skill] = Number(val);
    });

  const removeSession = (id) =>
    update((d) => {
      d.ielts.sessions = d.ielts.sessions.filter((x) => x.id !== id);
    });

  const removeMock = (id) =>
    update((d) => {
      d.ielts.mockTests = (d.ielts.mockTests || []).filter((x) => x.id !== id);
    });

  const totalHrs = sessions.reduce((a, s) => a + Number(s.durationMinutes || 0), 0) / 60;
  const bestMock = mockTests.length
    ? Math.max(...mockTests.map((m) => Number(m.overall || 0)))
    : null;
  const avgMock = mockTests.length
    ? mockTests.reduce((a, m) => a + Number(m.overall || 0), 0) / mockTests.length
    : null;

  const sortedSessions = [...sessions].sort((a, b) => b.date.localeCompare(a.date));
  const sortedMocks = [...mockTests].sort((a, b) => b.date.localeCompare(a.date));
  const latestMock = sortedMocks[0] || null;

  return (
    <div className="fade-in">
      <div className="tab-header">
        <div>
          <div className="display" style={{ fontSize: 24, fontWeight: 700 }}>
            IELTS Academic Preparation
          </div>
          <div style={{ fontSize: 12.5, color: 'var(--text-dim)', marginTop: 2 }}>
            Band score tracking, 4-skill breakdown, and full mock examination logs
          </div>
        </div>

        <div className="tab-header-actions">
          <div className="view-mode-toggle">
            <button
              className={`view-mode-btn ${viewMode === 'overview' ? 'active' : ''}`}
              onClick={() => setViewMode('overview')}
            >
              <span>🇬🇧</span> Overview
            </button>
            <button
              className={`view-mode-btn ${viewMode === 'mocks' ? 'active' : ''}`}
              onClick={() => setViewMode('mocks')}
            >
              <span>📝</span> Mock Exams ({mockTests.length})
            </button>
            <button
              className={`view-mode-btn ${viewMode === 'sessions' ? 'active' : ''}`}
              onClick={() => setViewMode('sessions')}
            >
              <span>⏱️</span> Practice Log ({sortedSessions.length})
            </button>
          </div>

          <button
            onClick={() => setMockModalOpen(true)}
            className="btn-primary"
            style={{ background: 'linear-gradient(135deg, var(--blue), var(--violet))' }}
            title="Record a completed IELTS Mock Exam"
          >
            <span>📝</span> + Record Mock
          </button>
          <button
            onClick={() => openModal({ type: 'ielts' })}
            className="btn-ghost"
            title="Log general study or skill practice"
          >
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
            {target.toFixed(1)}
          </div>
        </div>

        <div style={{ borderLeft: '1px solid var(--border)', height: 42 }} />

        <div>
          <div style={{ fontSize: 11, color: 'var(--text-faint)', textTransform: 'uppercase', fontWeight: 600 }}>
            Mock Exams Logged
          </div>
          <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--text)' }}>
            {mockTests.length} Tests {bestMock != null ? `(Best: ${bestMock.toFixed(1)})` : ''}
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
        <div className="cards-grid">
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
            {/* Mock Test Benchmarks Box */}
            <div className="card" style={{ padding: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <div style={{ fontSize: 15, fontWeight: 700 }}>
                  📝 Mock Test Benchmarks
                </div>
                <button
                  onClick={() => setMockModalOpen(true)}
                  className="btn-ghost"
                  style={{ fontSize: 11.5, padding: '4px 10px', borderColor: 'var(--blue)', color: 'var(--blue-light)' }}
                >
                  + Record Mock
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: latestMock ? 14 : 0 }}>
                <div style={{ background: 'var(--bg-elev)', padding: '10px 12px', borderRadius: 10, textAlign: 'center' }}>
                  <div style={{ fontSize: 11, color: 'var(--text-faint)' }}>Total Mocks</div>
                  <div style={{ fontSize: 18, fontWeight: 700, marginTop: 2 }}>{mockTests.length}</div>
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

              {/* Latest Mock Card snippet */}
              {latestMock && (
                <div
                  style={{
                    padding: '10px 12px',
                    background: 'var(--bg-elev)',
                    borderRadius: 10,
                    border: '1px solid var(--border-soft)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <div>
                    <div style={{ fontSize: 11, color: 'var(--text-faint)' }}>Latest: {fmtDate(latestMock.date)}</div>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>{latestMock.title}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-dim)', marginTop: 2 }}>
                      L: {latestMock.listening} · R: {latestMock.reading} · W: {latestMock.writing} · S: {latestMock.speaking}
                    </div>
                  </div>
                  <div
                    style={{
                      fontSize: 18,
                      fontWeight: 800,
                      color: latestMock.overall >= target ? 'var(--green)' : 'var(--blue-light)',
                      padding: '4px 10px',
                      background: 'var(--bg)',
                      borderRadius: 8,
                    }}
                  >
                    {Number(latestMock.overall).toFixed(1)}
                  </div>
                </div>
              )}
            </div>

            {/* Recent Practice Sessions */}
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

      {/* VIEW 2: DEDICATED MOCK EXAMS VIEW */}
      {viewMode === 'mocks' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          {/* Top Mock Highlights */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
            <div className="card" style={{ padding: '14px 18px', textAlign: 'center' }}>
              <div style={{ fontSize: 11.5, color: 'var(--text-faint)', textTransform: 'uppercase', fontWeight: 600 }}>Total Mocks Taken</div>
              <div className="display" style={{ fontSize: 26, fontWeight: 800, marginTop: 4 }}>{mockTests.length}</div>
            </div>
            <div className="card" style={{ padding: '14px 18px', textAlign: 'center' }}>
              <div style={{ fontSize: 11.5, color: 'var(--text-faint)', textTransform: 'uppercase', fontWeight: 600 }}>Highest Mock Band</div>
              <div className="display" style={{ fontSize: 26, fontWeight: 800, color: 'var(--green)', marginTop: 4 }}>
                {bestMock != null ? bestMock.toFixed(1) : '—'}
              </div>
            </div>
            <div className="card" style={{ padding: '14px 18px', textAlign: 'center' }}>
              <div style={{ fontSize: 11.5, color: 'var(--text-faint)', textTransform: 'uppercase', fontWeight: 600 }}>Average Mock Band</div>
              <div className="display" style={{ fontSize: 26, fontWeight: 800, color: 'var(--blue)', marginTop: 4 }}>
                {avgMock != null ? avgMock.toFixed(1) : '—'}
              </div>
            </div>
            <div className="card" style={{ padding: '14px 18px', textAlign: 'center' }}>
              <div style={{ fontSize: 11.5, color: 'var(--text-faint)', textTransform: 'uppercase', fontWeight: 600 }}>Pre-Med Target</div>
              <div className="display" style={{ fontSize: 26, fontWeight: 800, color: '#A78BFA', marginTop: 4 }}>
                {target.toFixed(1)}+
              </div>
            </div>
          </div>

          {/* List of Mock Exams */}
          {sortedMocks.length === 0 ? (
            <div
              className="card"
              style={{
                padding: '48px 24px',
                textAlign: 'center',
                background: 'var(--bg-elev)',
                borderRadius: 16,
                border: '1px dashed var(--border-bright)',
              }}
            >
              <div style={{ fontSize: 44, marginBottom: 12 }}>📝</div>
              <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 6 }}>
                No IELTS Mock Exams Logged Yet
              </div>
              <div style={{ fontSize: 13, color: 'var(--text-dim)', maxWidth: 440, margin: '0 auto 20px', lineHeight: 1.5 }}>
                Record full practice tests from Cambridge IELTS 16–18, British Council, or IDP to track your path toward the 7.5+ Band required for top medical faculties abroad.
              </div>
              <button
                onClick={() => setMockModalOpen(true)}
                className="btn-primary"
                style={{ padding: '10px 22px', fontSize: 13.5 }}
              >
                📝 + Record First Mock Exam
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {sortedMocks.map((mock) => {
                const isMet = Number(mock.overall) >= target;

                return (
                  <div
                    key={mock.id}
                    className="card card-interactive"
                    style={{
                      padding: '16px 20px',
                      borderLeft: `5px solid ${isMet ? 'var(--green)' : 'var(--blue)'}`,
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      flexWrap: 'wrap',
                      gap: 16,
                    }}
                  >
                    <div style={{ flex: 1, minWidth: 220 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                        <div style={{ fontSize: 16, fontWeight: 700 }}>{mock.title}</div>
                        <span
                          className="chip"
                          style={{
                            background: isMet ? 'var(--green-dim)' : 'var(--blue-dim)',
                            color: isMet ? 'var(--green-light)' : 'var(--blue-light)',
                            fontWeight: 600,
                            fontSize: 11,
                          }}
                        >
                          {isMet ? '🩺 Target Met' : `🎯 ${(target - Number(mock.overall)).toFixed(1)} to 7.5`}
                        </span>
                      </div>

                      <div style={{ fontSize: 12, color: 'var(--text-faint)', marginBottom: 8 }}>
                        📅 Taken on {fmtDate(mock.date)}
                      </div>

                      {/* 4 Skill Chips */}
                      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                        <span className="chip" style={{ background: 'var(--bg-elev)', fontSize: 11.5 }}>
                          🎧 L: <b>{Number(mock.listening).toFixed(1)}</b>
                        </span>
                        <span className="chip" style={{ background: 'var(--bg-elev)', fontSize: 11.5 }}>
                          📖 R: <b>{Number(mock.reading).toFixed(1)}</b>
                        </span>
                        <span className="chip" style={{ background: 'var(--bg-elev)', fontSize: 11.5 }}>
                          ✍️ W: <b>{Number(mock.writing).toFixed(1)}</b>
                        </span>
                        <span className="chip" style={{ background: 'var(--bg-elev)', fontSize: 11.5 }}>
                          🗣️ S: <b>{Number(mock.speaking).toFixed(1)}</b>
                        </span>
                      </div>

                      {mock.notes && (
                        <div style={{ fontSize: 12, color: 'var(--text-dim)', marginTop: 8, fontStyle: 'italic' }}>
                          "{mock.notes}"
                        </div>
                      )}
                    </div>

                    {/* Overall Band Badge & Actions */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: 10.5, textTransform: 'uppercase', color: 'var(--text-faint)', fontWeight: 600 }}>Overall</div>
                        <div
                          style={{
                            fontSize: 28,
                            fontWeight: 800,
                            color: isMet ? 'var(--green)' : 'var(--blue-light)',
                            lineHeight: 1,
                            marginTop: 2,
                          }}
                        >
                          {Number(mock.overall).toFixed(1)}
                        </div>
                      </div>

                      <button
                        onClick={() => removeMock(mock.id)}
                        className="btn-ghost"
                        style={{ padding: '6px 10px', fontSize: 12, border: 'none', color: 'var(--red-light)' }}
                        title="Delete mock record"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* VIEW 3: ALL SESSIONS TABLE */}
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

      {/* Mock Exam Record Modal */}
      {mockModalOpen && (
        <IeltsMockModal
          data={data}
          update={update}
          onClose={() => setMockModalOpen(false)}
        />
      )}
    </div>
  );
}
