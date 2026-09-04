import React, { useState, useMemo } from 'react';
import { Bar } from '../common';
import { SUBJECTS, TERMS, emptyTerm } from '../../constants/data';
import { calcTermGrade, calcAnnualGrade, overallAverage } from '../../utils/helpers';

const GRADEABLE_SUBJECTS = SUBJECTS.filter((s) => s.key !== 'other');

export function GpaSimulator({ data, update, onExit }) {
  const [targetGpa, setTargetGpa] = useState(95.0);
  const [simMode, setSimMode] = useState('subject'); // 'subject' | 'global'

  // Global scenario sliders
  const [globalSchool, setGlobalSchool] = useState(19.0); // out of 20
  const [globalMinistry, setGlobalMinistry] = useState(94.0); // out of 100

  // Subject-by-subject simulation state (initialized with current grades or reasonable defaults)
  const [simGrades, setSimGrades] = useState(() => {
    const initial = {};
    GRADEABLE_SUBJECTS.forEach((s) => {
      const actual = data.grades?.[s.key] || {};
      initial[s.key] = {
        term1: {
          school1: actual.term1?.school1 ?? 19,
          school2: actual.term1?.school2 ?? 19,
          ministry: actual.term1?.ministry ?? 94,
        },
        term2: {
          school1: actual.term2?.school1 ?? 19,
          school2: actual.term2?.school2 ?? 19,
          ministry: actual.term2?.ministry ?? 94,
        },
        term3: {
          school1: actual.term3?.school1 ?? 19,
          school2: actual.term3?.school2 ?? 19,
          ministry: actual.term3?.ministry ?? 95,
        },
      };
    });
    return initial;
  });

  // Calculate actual baseline GPA
  const actualOverall = overallAverage(data.grades);

  // Calculate simulated overall GPA based on simMode
  const simOverall = useMemo(() => {
    if (simMode === 'global') {
      // (School1 + School2)/40 * 50% + Min/100 * 50%
      const schoolPct = ((globalSchool * 2) / 40) * 100;
      const termGrade = schoolPct * 0.5 + globalMinistry * 0.5;
      return termGrade; // Uniform across all 3 terms
    }

    return overallAverage(simGrades);
  }, [simMode, globalSchool, globalMinistry, simGrades]);

  const delta = actualOverall != null ? simOverall - actualOverall : null;
  const isTargetMet = simOverall >= targetGpa;

  const updateSimMark = (subjKey, termKey, field, val) => {
    setSimGrades((prev) => ({
      ...prev,
      [subjKey]: {
        ...prev[subjKey],
        [termKey]: {
          ...prev[subjKey][termKey],
          [field]: val === '' ? null : Number(val),
        },
      },
    }));
  };

  const resetToActual = () => {
    const reset = {};
    GRADEABLE_SUBJECTS.forEach((s) => {
      const actual = data.grades?.[s.key] || {};
      reset[s.key] = {
        term1: {
          school1: actual.term1?.school1 ?? null,
          school2: actual.term1?.school2 ?? null,
          ministry: actual.term1?.ministry ?? null,
        },
        term2: {
          school1: actual.term2?.school1 ?? null,
          school2: actual.term2?.school2 ?? null,
          ministry: actual.term2?.ministry ?? null,
        },
        term3: {
          school1: actual.term3?.school1 ?? null,
          school2: actual.term3?.school2 ?? null,
          ministry: actual.term3?.ministry ?? null,
        },
      };
    });
    setSimGrades(reset);
  };

  const applyOptimalPreMed = () => {
    const optimal = {};
    GRADEABLE_SUBJECTS.forEach((s) => {
      optimal[s.key] = {
        term1: { school1: 19.5, school2: 19, ministry: 96 },
        term2: { school1: 19, school2: 19.5, ministry: 95 },
        term3: { school1: 19.5, school2: 20, ministry: 97 },
      };
    });
    setSimGrades(optimal);
    setGlobalSchool(19.5);
    setGlobalMinistry(96);
  };

  const saveSimulationToBoard = () => {
    if (window.confirm('Save these simulated targets as your actual grades board?')) {
      update((d) => {
        d.grades = JSON.parse(JSON.stringify(simGrades));
      });
      alert('✓ Simulated grades applied to your real grades board!');
    }
  };

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Simulator Master Banner */}
      <div
        className="card"
        style={{
          padding: '22px 24px',
          background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.14), rgba(59, 130, 246, 0.16))',
          border: '1px solid var(--border-bright)',
          borderRadius: 16,
          boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16, marginBottom: 16 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 24 }}>🔮</span>
              <div className="display" style={{ fontSize: 22, fontWeight: 800 }}>
                Interactive "What-If" GPA Simulator
              </div>
              <span className="chip" style={{ background: 'var(--green-dim)', color: 'var(--green-light)', fontWeight: 700 }}>
                UAE MOE Formula
              </span>
            </div>
            <div style={{ fontSize: 12.5, color: 'var(--text-dim)', marginTop: 4 }}>
              Test marks on upcoming school exams & ministry exit exams to see your projected final Grade 12 Annual GPA in real time.
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <button
              onClick={applyOptimalPreMed}
              className="btn-ghost"
              style={{ fontSize: 12, borderColor: 'var(--green)', color: 'var(--green-light)' }}
              title="Fill realistic top-tier marks"
            >
              🌟 96%+ Pre-Med Preset
            </button>
            <button
              onClick={resetToActual}
              className="btn-ghost"
              style={{ fontSize: 12 }}
            >
              🔄 Reset
            </button>
            {onExit && (
              <button
                onClick={onExit}
                className="btn-ghost"
                style={{ fontSize: 12 }}
              >
                ← Back to Grades
              </button>
            )}
          </div>
        </div>

        {/* Live Forecast Metric Bar */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))',
            gap: 14,
            background: 'var(--bg-elev)',
            padding: 16,
            borderRadius: 12,
            border: '1px solid var(--border-soft)',
          }}
        >
          {/* Projected Annual GPA */}
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-faint)', textTransform: 'uppercase' }}>
              Projected Annual GPA
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginTop: 2 }}>
              <span
                className="display"
                style={{
                  fontSize: 34,
                  fontWeight: 800,
                  color: isTargetMet ? 'var(--green)' : 'var(--blue-light)',
                }}
              >
                {simOverall.toFixed(1)}%
              </span>
              {delta != null && delta !== 0 && (
                <span
                  style={{
                    fontSize: 13,
                    fontWeight: 700,
                    color: delta > 0 ? 'var(--green)' : 'var(--red)',
                  }}
                >
                  {delta > 0 ? `+${delta.toFixed(1)}%` : `${delta.toFixed(1)}%`}
                </span>
              )}
            </div>
          </div>

          {/* Current Baseline */}
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-faint)', textTransform: 'uppercase' }}>
              Current Actual Baseline
            </div>
            <div className="display" style={{ fontSize: 26, fontWeight: 700, color: 'var(--text-dim)', marginTop: 4 }}>
              {actualOverall != null ? `${actualOverall.toFixed(1)}%` : 'No marks yet'}
            </div>
          </div>

          {/* Target Goal */}
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-faint)', textTransform: 'uppercase' }}>
              Annual Goal: {targetGpa.toFixed(1)}%
            </div>
            <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
              {[95.0, 97.0, 98.5].map((t) => (
                <button
                  key={t}
                  onClick={() => setTargetGpa(t)}
                  style={{
                    padding: '4px 8px',
                    fontSize: 11.5,
                    fontWeight: 700,
                    borderRadius: 6,
                    border: targetGpa === t ? '1px solid var(--green)' : '1px solid var(--border)',
                    background: targetGpa === t ? 'var(--green-dim)' : 'var(--bg)',
                    color: targetGpa === t ? 'var(--green-light)' : 'var(--text-dim)',
                    cursor: 'pointer',
                  }}
                >
                  {t.toFixed(1)}%
                </button>
              ))}
            </div>
          </div>

          {/* Target Verdict */}
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-faint)', textTransform: 'uppercase' }}>
              Pre-Med Status
            </div>
            <div style={{ fontSize: 13, fontWeight: 700, marginTop: 6, color: isTargetMet ? 'var(--green)' : 'var(--amber)' }}>
              {isTargetMet ? (
                <span>✓ Meets Medical School Requirement (+{(simOverall - targetGpa).toFixed(1)}% cushion)</span>
              ) : (
                <span>⚠️ Need +{(targetGpa - simOverall).toFixed(1)}% more to secure 95%+</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mode Selector Toggle */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
        <div className="view-mode-toggle">
          <button
            className={`view-mode-btn ${simMode === 'subject' ? 'active' : ''}`}
            onClick={() => setSimMode('subject')}
          >
            <span>📚</span> Subject-by-Subject Simulator
          </button>
          <button
            className={`view-mode-btn ${simMode === 'global' ? 'active' : ''}`}
            onClick={() => setSimMode('global')}
          >
            <span>⚡</span> Quick Scenario Sliders
          </button>
        </div>

        {simMode === 'subject' && (
          <button
            onClick={saveSimulationToBoard}
            className="btn-ghost"
            style={{ fontSize: 12, borderColor: 'var(--blue)', color: 'var(--blue-light)' }}
            title="Save these simulated marks as your active board"
          >
            📋 Save Simulation to Real Board
          </button>
        )}
      </div>

      {/* SIMULATOR MODE 1: GLOBAL QUICK SLIDERS */}
      {simMode === 'global' && (
        <div className="card" style={{ padding: 24 }}>
          <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>
            ⚡ Global Marks Sensitivity Analysis
          </div>
          <div style={{ fontSize: 13, color: 'var(--text-dim)', marginBottom: 24, lineHeight: 1.6 }}>
            Adjust the two primary levers of the UAE ministerial grading system: <b>Continuous School Assessment (50%)</b> and <b>Ministry Exams (50%)</b> to see their joint effect on your annual average.
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24 }}>
            {/* Lever 1: School Exam Average (/20) */}
            <div style={{ background: 'var(--bg-elev)', padding: 18, borderRadius: 12, border: '1px solid var(--border-soft)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700 }}>🏫 Average School Exam Mark</div>
                  <div style={{ fontSize: 11.5, color: 'var(--text-faint)' }}>School 1 & School 2 (/20 each)</div>
                </div>
                <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--blue)' }}>
                  {globalSchool.toFixed(1)} / 20
                </div>
              </div>

              <input
                type="range"
                min="12.0"
                max="20.0"
                step="0.5"
                value={globalSchool}
                onChange={(e) => setGlobalSchool(Number(e.target.value))}
                style={{ width: '100%', accentColor: 'var(--blue)', cursor: 'pointer', marginBottom: 12 }}
              />

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11.5, color: 'var(--text-dim)' }}>
                <span>School Component (50%):</span>
                <b>{(((globalSchool * 2) / 40) * 50).toFixed(1)}% / 50%</b>
              </div>
            </div>

            {/* Lever 2: Ministry Exam Average (/100) */}
            <div style={{ background: 'var(--bg-elev)', padding: 18, borderRadius: 12, border: '1px solid var(--border-soft)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700 }}>🏛️ Average Ministry Exam Mark</div>
                  <div style={{ fontSize: 11.5, color: 'var(--text-faint)' }}>Official Term End Exam (/100)</div>
                </div>
                <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--green)' }}>
                  {globalMinistry.toFixed(1)} / 100
                </div>
              </div>

              <input
                type="range"
                min="65.0"
                max="100.0"
                step="1.0"
                value={globalMinistry}
                onChange={(e) => setGlobalMinistry(Number(e.target.value))}
                style={{ width: '100%', accentColor: 'var(--green)', cursor: 'pointer', marginBottom: 12 }}
              />

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11.5, color: 'var(--text-dim)' }}>
                <span>Ministry Component (50%):</span>
                <b>{(globalMinistry * 0.5).toFixed(1)}% / 50%</b>
              </div>
            </div>
          </div>

          {/* Mathematical Formula Breakdown */}
          <div
            style={{
              marginTop: 24,
              padding: 16,
              background: 'rgba(255,255,255,0.02)',
              borderRadius: 12,
              border: '1px solid var(--border-soft)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 14,
            }}
          >
            <div style={{ fontSize: 13 }}>
              <b>Formula Calculation</b>: ({globalSchool.toFixed(1)} × 2 / 40 × 50%) + ({globalMinistry.toFixed(1)} / 100 × 50%) ={' '}
              <b style={{ color: isTargetMet ? 'var(--green)' : 'var(--blue)' }}>{simOverall.toFixed(1)}%</b>
            </div>
            <div className="chip" style={{ background: isTargetMet ? 'var(--green-dim)' : 'var(--blue-dim)', color: isTargetMet ? 'var(--green-light)' : '#93C5FD', fontWeight: 700 }}>
              {isTargetMet ? '🎯 95%+ Target Achieved!' : 'Need higher Ministry exam score'}
            </div>
          </div>
        </div>
      )}

      {/* SIMULATOR MODE 2: SUBJECT-BY-SUBJECT DETAILED SLIDERS */}
      {simMode === 'subject' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Inverse Target Helper Note */}
          <div
            style={{
              padding: '12px 16px',
              background: 'var(--bg-elev)',
              borderRadius: 12,
              border: '1px solid var(--border-soft)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 10,
            }}
          >
            <div style={{ fontSize: 12.5, color: 'var(--text-dim)' }}>
              💡 <b>Strategy Tip</b>: If you secure <b>19.0 / 20</b> in both school exams (38/40 = 95%), you only need <b>95.0 / 100</b> in the Ministry Exam to guarantee a 95.0% in that subject!
            </div>
            <span className="chip" style={{ background: 'var(--blue-dim)', color: '#93C5FD', fontSize: 11 }}>
              Target: 95.0%
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: 14 }}>
            {GRADEABLE_SUBJECTS.map((subj) => {
              const subjSim = simGrades[subj.key];
              const simAnnual = calcAnnualGrade(subjSim);
              const actualAnnual = calcAnnualGrade(data.grades?.[subj.key]);

              // Calculate required ministry score for Term 1 to achieve 95%
              const t1School1 = subjSim?.term1?.school1 ?? 19;
              const t1School2 = subjSim?.term1?.school2 ?? 19;
              const t1SchoolPct = ((t1School1 + t1School2) / 40) * 100;
              // MinNeeded = (Target - SchoolPct * 0.5) / 0.5 = 2 * Target - SchoolPct
              const minNeededFor95 = Math.max(0, Math.min(100, Math.round(2 * 95 - t1SchoolPct)));

              return (
                <div
                  key={subj.key}
                  className="card"
                  style={{
                    padding: 18,
                    borderLeft: `5px solid ${subj.color || 'var(--blue)'}`,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 12,
                  }}
                >
                  {/* Subject Header */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 15, fontWeight: 700 }}>
                        <span>{subj.emoji}</span>
                        <span>{subj.label}</span>
                      </div>
                      <div style={{ fontSize: 11.5, color: 'var(--text-faint)', marginTop: 2 }}>
                        👨‍🏫 {subj.teacher}
                      </div>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <div
                        style={{
                          fontSize: 22,
                          fontWeight: 800,
                          color: simAnnual != null ? (simAnnual >= 95 ? 'var(--green)' : 'var(--blue-light)') : 'var(--text-faint)',
                        }}
                      >
                        {simAnnual != null ? `${simAnnual.toFixed(1)}%` : '—'}
                      </div>
                      <div style={{ fontSize: 10.5, color: 'var(--text-faint)', textTransform: 'uppercase' }}>
                        Simulated Annual
                      </div>
                    </div>
                  </div>

                  {/* Required Ministry Exam Callout */}
                  <div
                    style={{
                      padding: '8px 10px',
                      background: 'rgba(255,255,255,0.03)',
                      borderRadius: 8,
                      fontSize: 11.5,
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <span style={{ color: 'var(--text-dim)' }}>T1 Ministry Needed for 95%:</span>
                    <b style={{ color: minNeededFor95 <= 90 ? 'var(--green-light)' : 'var(--amber-light)' }}>
                      {minNeededFor95} / 100
                    </b>
                  </div>

                  {/* 3 Terms Simulation Inputs */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {TERMS.map((t) => {
                      const tData = subjSim?.[t.key] || {};
                      const tGrade = calcTermGrade(tData);

                      return (
                        <div
                          key={t.key}
                          style={{
                            padding: '8px 10px',
                            background: 'var(--bg-elev)',
                            borderRadius: 8,
                            border: '1px solid var(--border-soft)',
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                            <span style={{ fontSize: 12, fontWeight: 600 }}>{t.label} ({(t.weight * 100).toFixed(0)}%)</span>
                            <span style={{ fontSize: 12, fontWeight: 700, color: tGrade != null ? (tGrade >= 95 ? 'var(--green)' : 'var(--text)') : 'var(--text-faint)' }}>
                              {tGrade != null ? `${tGrade.toFixed(1)}%` : '—'}
                            </span>
                          </div>

                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6, textAlign: 'center' }}>
                            <div>
                              <div style={{ fontSize: 9, color: 'var(--text-faint)', marginBottom: 2 }}>SCH 1 (/20)</div>
                              <input
                                type="number"
                                min="0"
                                max="20"
                                step="0.5"
                                value={tData.school1 ?? ''}
                                onChange={(e) => updateSimMark(subj.key, t.key, 'school1', e.target.value)}
                                style={{ width: '100%', textAlign: 'center', fontSize: 12, padding: '4px 2px', fontWeight: 600 }}
                              />
                            </div>
                            <div>
                              <div style={{ fontSize: 9, color: 'var(--text-faint)', marginBottom: 2 }}>SCH 2 (/20)</div>
                              <input
                                type="number"
                                min="0"
                                max="20"
                                step="0.5"
                                value={tData.school2 ?? ''}
                                onChange={(e) => updateSimMark(subj.key, t.key, 'school2', e.target.value)}
                                style={{ width: '100%', textAlign: 'center', fontSize: 12, padding: '4px 2px', fontWeight: 600 }}
                              />
                            </div>
                            <div>
                              <div style={{ fontSize: 9, color: 'var(--text-faint)', marginBottom: 2 }}>MINISTRY (/100)</div>
                              <input
                                type="number"
                                min="0"
                                max="100"
                                step="1"
                                value={tData.ministry ?? ''}
                                onChange={(e) => updateSimMark(subj.key, t.key, 'ministry', e.target.value)}
                                style={{ width: '100%', textAlign: 'center', fontSize: 12, padding: '4px 2px', fontWeight: 600 }}
                              />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
