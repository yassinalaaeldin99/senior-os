import React, { useState } from 'react';
import { PageHeader, Bar } from '../common';
import { SUBJECTS, TERMS, emptyTerm } from '../../constants/data';
import { calcTermGrade, calcAnnualGrade, overallAverage } from '../../utils/helpers';

const GRADEABLE_SUBJECTS = SUBJECTS.filter((s) => s.key !== 'other');

function GradeInput({ value, max, onChange, placeholder }) {
  return (
    <input
      type="number"
      min="0"
      max={max}
      step="0.5"
      value={value ?? ''}
      onChange={(e) => {
        const v = e.target.value;
        onChange(v === '' ? null : Number(v));
      }}
      placeholder={placeholder || `/${max}`}
      style={{
        width: 62,
        textAlign: 'center',
        fontSize: 12.5,
        padding: '5px 4px',
        fontWeight: 600,
        borderRadius: 8,
      }}
    />
  );
}

function TermRow({ term, termData, subjectKey, update }) {
  const tg = calcTermGrade(termData);
  const setField = (field, val) => {
    update((d) => {
      if (!d.grades[subjectKey]) {
        d.grades[subjectKey] = { term1: emptyTerm(), term2: emptyTerm(), term3: emptyTerm() };
      }
      if (!d.grades[subjectKey][term.key]) {
        d.grades[subjectKey][term.key] = emptyTerm();
      }
      d.grades[subjectKey][term.key][field] = val;
    });
  };

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '95px 1fr 1fr 1fr 85px',
        gap: 8,
        alignItems: 'center',
        padding: '9px 10px',
        background: 'var(--bg-elev)',
        borderRadius: 10,
        marginBottom: 6,
        border: '1px solid var(--border-soft)',
      }}
    >
      <div>
        <div style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--text)' }}>
          {term.label}
        </div>
        <div style={{ fontSize: 10.5, color: 'var(--text-faint)', fontWeight: 500 }}>
          Weight: {(term.weight * 100).toFixed(0)}%
        </div>
      </div>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 9.5, color: 'var(--text-faint)', marginBottom: 2, fontWeight: 600 }}>
          SCH 1 (/20)
        </div>
        <GradeInput value={termData?.school1} max={20} onChange={(v) => setField('school1', v)} />
      </div>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 9.5, color: 'var(--text-faint)', marginBottom: 2, fontWeight: 600 }}>
          SCH 2 (/20)
        </div>
        <GradeInput value={termData?.school2} max={20} onChange={(v) => setField('school2', v)} />
      </div>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 9.5, color: 'var(--text-faint)', marginBottom: 2, fontWeight: 600 }}>
          MINISTRY (/100)
        </div>
        <GradeInput value={termData?.ministry} max={100} onChange={(v) => setField('ministry', v)} />
      </div>
      <div
        style={{
          textAlign: 'right',
          paddingRight: 4,
          fontSize: 14,
          fontWeight: 700,
          color:
            tg != null
              ? tg >= 90
                ? 'var(--green)'
                : tg >= 75
                ? 'var(--amber)'
                : 'var(--red)'
              : 'var(--text-faint)',
        }}
      >
        {tg != null ? `${tg.toFixed(1)}%` : '—'}
      </div>
    </div>
  );
}

function SubjectCard({ subj, subjGrades, update }) {
  const annual = calcAnnualGrade(subjGrades);
  const target = 95;

  return (
    <div className="card" style={{ padding: 18, display: 'flex', flexDirection: 'column', gap: 12 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 16, fontWeight: 700 }}>
            <span>{subj.emoji}</span>
            <span>{subj.label}</span>
          </div>
          {subj.teacher && (
            <div style={{ fontSize: 11.5, color: 'var(--text-faint)', marginTop: 2 }}>
              👨‍🏫 {subj.teacher}
            </div>
          )}
        </div>
        <div style={{ textAlign: 'right' }}>
          <div
            className="display"
            style={{
              fontSize: 24,
              fontWeight: 700,
              color: annual != null ? (annual >= 90 ? 'var(--green)' : 'var(--blue)') : 'var(--text-faint)',
            }}
          >
            {annual != null ? `${annual.toFixed(1)}%` : '—'}
          </div>
          <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-faint)', textTransform: 'uppercase' }}>
            Annual Score
          </div>
        </div>
      </div>

      {/* Term rows */}
      <div>
        {TERMS.map((t) => (
          <TermRow
            key={t.key}
            term={t}
            termData={subjGrades?.[t.key]}
            subjectKey={subj.key}
            update={update}
          />
        ))}
      </div>

      {/* Progress bar */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 5 }}>
          <span style={{ color: 'var(--text-faint)' }}>Annual Progress</span>
          <span style={{ fontWeight: 600, color: 'var(--text-dim)' }}>
            {annual != null ? `${annual.toFixed(1)}% / 100%` : 'No marks yet'}
          </span>
        </div>
        <Bar pct={annual || 0} color={subj.color || 'var(--blue)'} />
      </div>

      {annual != null && (
        <div
          style={{
            fontSize: 11.5,
            fontWeight: 600,
            color: annual >= target ? 'var(--green)' : 'var(--amber)',
            textAlign: 'right',
          }}
        >
          {annual >= target ? '✓ On track for 95%+' : `Need +${(target - annual).toFixed(1)}% for 95% target`}
        </div>
      )}
    </div>
  );
}

export function Grades({ data, update }) {
  const [viewMode, setViewMode] = useState('cards'); // 'cards' | 'table' | 'analytics'
  const overall = overallAverage(data.grades);

  // Analytics computation
  const rankedSubjects = GRADEABLE_SUBJECTS.map((s) => {
    const annual = calcAnnualGrade(data.grades?.[s.key]);
    return { ...s, annual };
  }).sort((a, b) => (b.annual || 0) - (a.annual || 0));

  return (
    <div className="fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <div className="display" style={{ fontSize: 24, fontWeight: 700 }}>
            Academic Grades
          </div>
          <div style={{ fontSize: 12.5, color: 'var(--text-dim)', marginTop: 2 }}>
            3-Term Ministry Formula: T1 (35%) · T2 (30%) · T3 (35%)
          </div>
        </div>

        {/* View Mode Segmented Controls */}
        <div className="view-mode-toggle">
          <button
            className={`view-mode-btn ${viewMode === 'cards' ? 'active' : ''}`}
            onClick={() => setViewMode('cards')}
          >
            <span>🗂️</span> Cards View
          </button>
          <button
            className={`view-mode-btn ${viewMode === 'table' ? 'active' : ''}`}
            onClick={() => setViewMode('table')}
          >
            <span>📋</span> Matrix Table
          </button>
          <button
            className={`view-mode-btn ${viewMode === 'analytics' ? 'active' : ''}`}
            onClick={() => setViewMode('analytics')}
          >
            <span>📊</span> Analytics
          </button>
        </div>
      </div>

      {/* Overall Performance Banner */}
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
          border: '1px solid var(--border-bright)',
        }}
      >
        <div>
          <div style={{ fontSize: 11, color: 'var(--text-faint)', textTransform: 'uppercase', fontWeight: 600 }}>
            Cumulative GPA
          </div>
          <div className="display" style={{ fontSize: 32, fontWeight: 700, color: 'var(--blue)' }}>
            {overall != null ? `${overall.toFixed(1)}%` : '—'}
          </div>
        </div>

        <div style={{ borderLeft: '1px solid var(--border)', height: 42 }} />

        <div>
          <div style={{ fontSize: 11, color: 'var(--text-faint)', textTransform: 'uppercase', fontWeight: 600 }}>
            Official Weighting Rules
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-dim)', lineHeight: 1.5, marginTop: 2 }}>
            • <b>Term Grade</b> = (School 1 + School 2) / 40 × 50% + Ministry Exam / 100 × 50%
            <br />
            • <b>Annual Grade</b> = Term 1 (35%) + Term 2 (30%) + Term 3 (35%)
          </div>
        </div>

        <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
          <div style={{ fontSize: 11, color: 'var(--text-faint)', textTransform: 'uppercase', fontWeight: 600 }}>
            Target Status (95%+)
          </div>
          <div style={{ fontSize: 14, fontWeight: 700, color: overall != null && overall >= 95 ? 'var(--green)' : 'var(--amber)', marginTop: 4 }}>
            {overall != null ? (overall >= 95 ? '🌟 Exceeding Medical Standard' : '⚡ On Track · Push in Ministry Exams') : 'Enter grades to evaluate'}
          </div>
        </div>
      </div>

      {/* MODE 1: CARDS VIEW */}
      {viewMode === 'cards' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(440px, 1fr))', gap: 18 }}>
          {GRADEABLE_SUBJECTS.map((s) => (
            <SubjectCard
              key={s.key}
              subj={s}
              subjGrades={data.grades?.[s.key]}
              update={update}
            />
          ))}
        </div>
      )}

      {/* MODE 2: FULL DATA MATRIX TABLE */}
      {viewMode === 'table' && (
        <div className="card" style={{ padding: 16, overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ minWidth: 160 }}>Subject & Teacher</th>
                {TERMS.map((t) => (
                  <th key={t.key} colSpan={4} style={{ textAlign: 'center', borderLeft: '1px solid var(--border)' }}>
                    {t.label} ({(t.weight * 100).toFixed(0)}%)
                    <div style={{ fontSize: 9.5, color: 'var(--text-faint)', textTransform: 'none', marginTop: 2 }}>
                      Sch 1 (/20) · Sch 2 (/20) · Min (/100) · Total
                    </div>
                  </th>
                ))}
                <th style={{ textAlign: 'right', minWidth: 90, borderLeft: '2px solid var(--border)' }}>
                  Annual Grade
                </th>
              </tr>
            </thead>
            <tbody>
              {GRADEABLE_SUBJECTS.map((s) => {
                const subjGrades = data.grades?.[s.key];
                const annual = calcAnnualGrade(subjGrades);

                return (
                  <tr key={s.key}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontSize: 16 }}>{s.emoji}</span>
                        <div>
                          <div style={{ fontWeight: 600 }}>{s.label}</div>
                          <div style={{ fontSize: 11, color: 'var(--text-faint)' }}>{s.teacher}</div>
                        </div>
                      </div>
                    </td>

                    {/* Columns for each term */}
                    {TERMS.map((t) => {
                      const termData = subjGrades?.[t.key];
                      const tg = calcTermGrade(termData);
                      const setField = (f, val) => {
                        update((d) => {
                          if (!d.grades[s.key]) d.grades[s.key] = { term1: emptyTerm(), term2: emptyTerm(), term3: emptyTerm() };
                          if (!d.grades[s.key][t.key]) d.grades[s.key][t.key] = emptyTerm();
                          d.grades[s.key][t.key][f] = val;
                        });
                      };

                      return (
                        <React.Fragment key={t.key}>
                          <td style={{ borderLeft: '1px solid var(--border-soft)', textAlign: 'center', padding: '8px 4px' }}>
                            <GradeInput value={termData?.school1} max={20} onChange={(v) => setField('school1', v)} placeholder="S1" />
                          </td>
                          <td style={{ textAlign: 'center', padding: '8px 4px' }}>
                            <GradeInput value={termData?.school2} max={20} onChange={(v) => setField('school2', v)} placeholder="S2" />
                          </td>
                          <td style={{ textAlign: 'center', padding: '8px 4px' }}>
                            <GradeInput value={termData?.ministry} max={100} onChange={(v) => setField('ministry', v)} placeholder="Min" />
                          </td>
                          <td style={{ textAlign: 'center', fontWeight: 700, color: tg != null ? (tg >= 90 ? 'var(--green)' : 'var(--text)') : 'var(--text-faint)' }}>
                            {tg != null ? `${tg.toFixed(1)}%` : '—'}
                          </td>
                        </React.Fragment>
                      );
                    })}

                    <td style={{ borderLeft: '2px solid var(--border)', textAlign: 'right' }}>
                      <span
                        className="display"
                        style={{
                          fontSize: 16,
                          fontWeight: 700,
                          color: annual != null ? (annual >= 90 ? 'var(--green)' : 'var(--blue)') : 'var(--text-faint)',
                        }}
                      >
                        {annual != null ? `${annual.toFixed(1)}%` : '—'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* MODE 3: ANALYTICS VIEW */}
      {viewMode === 'analytics' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: 20 }}>
          {/* Subject Performance Ranking */}
          <div className="card" style={{ padding: 20 }}>
            <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 14 }}>
              🏆 Subject Performance Ranking
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {rankedSubjects.map((s, idx) => (
                <div key={s.key} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 24, fontSize: 12, fontWeight: 700, color: 'var(--text-faint)' }}>
                    #{idx + 1}
                  </div>
                  <div style={{ width: 130, fontSize: 13, fontWeight: 600 }}>
                    {s.emoji} {s.label}
                  </div>
                  <div style={{ flex: 1 }}>
                    <Bar pct={s.annual || 0} color={s.color || 'var(--blue)'} />
                  </div>
                  <div style={{ width: 60, textAlign: 'right', fontWeight: 700, fontSize: 13 }}>
                    {s.annual != null ? `${s.annual.toFixed(1)}%` : '—'}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Term Weight Impact Calculator */}
          <div className="card" style={{ padding: 20 }}>
            <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 12 }}>
              📐 Term Weight & Medical Target Strategy
            </div>
            <p style={{ fontSize: 12.5, color: 'var(--text-dim)', lineHeight: 1.6 }}>
              In senior year, Term 1 and Term 3 both carry <b>35%</b> each (70% total), while Term 2 carries <b>30%</b>.
              School exam weight accounts for 50% of each term, giving you direct control in continuous assessment.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 16 }}>
              {TERMS.map((t) => {
                const termAverage =
                  GRADEABLE_SUBJECTS.reduce((acc, s) => {
                    const tg = calcTermGrade(data.grades?.[s.key]?.[t.key]);
                    return tg != null ? acc + tg : acc;
                  }, 0) / GRADEABLE_SUBJECTS.length;

                return (
                  <div key={t.key} style={{ background: 'var(--bg-elev)', padding: '12px 14px', borderRadius: 10, border: '1px solid var(--border-soft)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <span style={{ fontWeight: 600, fontSize: 13 }}>{t.label}</span>
                      <span style={{ fontSize: 12, color: 'var(--blue)', fontWeight: 700 }}>
                        {(t.weight * 100).toFixed(0)}% of Year
                      </span>
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text-dim)' }}>
                      Current Term Average: <b>{termAverage > 0 ? `${termAverage.toFixed(1)}%` : 'In progress'}</b>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
