import { useState } from 'react';
import { PageHeader, SectionTitle, EmptyState, Bar } from '../common';

export function Medicine({ data, update, openModal }) {
  const [viewMode, setViewMode] = useState('cards'); // 'cards' | 'table'
  const m = data.medicine;

  const decide = (type, id) =>
    update((d) => {
      if (type === 'country')
        d.medicine.decidedCountry = d.medicine.countries.find((c) => c.id === id) || null;
      else
        d.medicine.decidedUniversity = d.medicine.universities.find((u) => u.id === id) || null;
    });

  const removeCountry = (id) =>
    update((d) => {
      d.medicine.countries = d.medicine.countries.filter((c) => c.id !== id);
      if (d.medicine.decidedCountry?.id === id) d.medicine.decidedCountry = null;
    });

  const removeUni = (id) =>
    update((d) => {
      d.medicine.universities = d.medicine.universities.filter((u) => u.id !== id);
      if (d.medicine.decidedUniversity?.id === id) d.medicine.decidedUniversity = null;
    });

  return (
    <div className="fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <div className="display" style={{ fontSize: 24, fontWeight: 700 }}>
            Medicine Career & Study Abroad
          </div>
          <div style={{ fontSize: 12.5, color: 'var(--text-dim)', marginTop: 2 }}>
            Country research, tuition benchmarks, language requirements, and target med schools
          </div>
        </div>

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
            <span>📋</span> Comparison Matrix
          </button>
        </div>
      </div>

      {/* Target Status Banner */}
      {m.decidedCountry || m.decidedUniversity ? (
        <div
          className="card"
          style={{
            padding: '20px 24px',
            marginBottom: 24,
            borderLeft: '4px solid var(--green)',
            background: 'linear-gradient(135deg, var(--card), var(--card-hi))',
          }}
        >
          <div style={{ fontSize: 11, color: 'var(--green-light)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: 6 }}>
            ★ Confirmed Target Selection
          </div>
          <div style={{ display: 'flex', gap: 36, flexWrap: 'wrap' }}>
            {m.decidedCountry && (
              <div>
                <div className="display" style={{ fontSize: 22, fontWeight: 700 }}>
                  {m.decidedCountry.flag} {m.decidedCountry.name}
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-faint)', marginTop: 2 }}>
                  Selected Study Destination
                </div>
              </div>
            )}
            {m.decidedUniversity && (
              <div>
                <div className="display" style={{ fontSize: 22, fontWeight: 700 }}>
                  🩺 {m.decidedUniversity.name}
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-faint)', marginTop: 2 }}>
                  Target Medical University
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div
          className="card"
          style={{ padding: '16px 20px', marginBottom: 24, color: 'var(--text-dim)', fontSize: 13 }}
        >
          Target Status: Country is <b style={{ color: 'var(--amber-light)' }}>Undecided</b> · Target University is <b style={{ color: 'var(--amber-light)' }}>Undecided</b>. (Aim to finalize before December winter break).
        </div>
      )}

      {/* Countries Section Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
        <SectionTitle style={{ marginBottom: 0 }}>🌍 Country Options & Criteria</SectionTitle>
        <button onClick={() => openModal({ type: 'country' })} className="btn-primary" style={{ padding: '6px 12px', fontSize: 12 }}>
          + Add Country
        </button>
      </div>

      {/* VIEW 1: COUNTRY CARDS */}
      {viewMode === 'cards' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16, marginBottom: 28 }}>
          {m.countries.length === 0 && <EmptyState icon="🌍" text="No countries added yet." />}
          {m.countries.map((c) => {
            const isTarget = m.decidedCountry?.id === c.id;
            return (
              <div
                key={c.id}
                className="card card-interactive"
                style={{
                  padding: 18,
                  border: isTarget ? '2px solid var(--green)' : '1px solid var(--border-soft)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 12,
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ fontSize: 16, fontWeight: 700 }}>
                    {c.flag} {c.name}
                  </div>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button
                      onClick={() => decide('country', c.id)}
                      className={isTarget ? 'btn-primary' : 'btn-ghost'}
                      style={{ padding: '4px 9px', fontSize: 11 }}
                    >
                      {isTarget ? '★ Target' : 'Set Target'}
                    </button>
                    <button
                      onClick={() => removeCountry(c.id)}
                      className="btn-ghost"
                      style={{ padding: '4px 8px', fontSize: 11 }}
                    >
                      ✕
                    </button>
                  </div>
                </div>

                <div style={{ fontSize: 12.5, color: 'var(--text-dim)', lineHeight: 1.6, background: 'var(--bg-elev)', padding: '10px 12px', borderRadius: 8 }}>
                  <div>💰 Tuition: <b>{c.tuition || '—'}</b></div>
                  <div>⏳ Length: <b>{c.length || '6 years'}</b></div>
                  <div>🗣️ Language: <b>{c.language || 'English'}</b></div>
                </div>

                {c.score != null && (
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 4, color: 'var(--text-faint)' }}>
                      <span>Fit Score</span>
                      <span style={{ fontWeight: 700 }}>{c.score}/10</span>
                    </div>
                    <Bar pct={c.score * 10} color="var(--violet)" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* VIEW 2: COUNTRY COMPARISON TABLE */}
      {viewMode === 'table' && (
        <div className="card" style={{ padding: 12, marginBottom: 28, overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Country</th>
                <th>Estimated Tuition</th>
                <th>Program Duration</th>
                <th>Teaching Language</th>
                <th>Personal Fit Score</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {m.countries.map((c) => {
                const isTarget = m.decidedCountry?.id === c.id;
                return (
                  <tr key={c.id}>
                    <td>
                      <span style={{ fontWeight: 700, fontSize: 14 }}>
                        {c.flag} {c.name}
                      </span>
                    </td>
                    <td>{c.tuition || '—'}</td>
                    <td>{c.length || '6 years'}</td>
                    <td>{c.language || 'English'}</td>
                    <td>
                      <span className="chip" style={{ background: 'var(--violet-dim)', color: '#C4B5FD', fontWeight: 700 }}>
                        {c.score}/10
                      </span>
                    </td>
                    <td>
                      {isTarget ? (
                        <span className="chip" style={{ background: 'var(--green-dim)', color: 'var(--green)', fontWeight: 700 }}>
                          ★ Target Country
                        </span>
                      ) : (
                        <button
                          onClick={() => decide('country', c.id)}
                          className="btn-ghost"
                          style={{ padding: '3px 8px', fontSize: 11 }}
                        >
                          Select
                        </button>
                      )}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button onClick={() => removeCountry(c.id)} className="btn-ghost" style={{ padding: '3px 8px', fontSize: 11 }}>
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

      {/* Universities Section */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
        <SectionTitle style={{ marginBottom: 0 }}>🩺 Medical Universities</SectionTitle>
        <button onClick={() => openModal({ type: 'university' })} className="btn-primary" style={{ padding: '6px 12px', fontSize: 12 }}>
          + Add University
        </button>
      </div>

      <div className="card" style={{ padding: 8 }}>
        {m.universities.length === 0 && <EmptyState icon="🩺" text="No universities added yet." />}
        {m.universities.map((u) => {
          const isTargetUni = m.decidedUniversity?.id === u.id;
          return (
            <div
              key={u.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 14px',
                borderBottom: '1px solid var(--border-soft)',
                background: isTargetUni ? 'var(--card-hi)' : 'transparent',
                borderRadius: 8,
              }}
            >
              <div>
                <div style={{ fontSize: 14, fontWeight: 600 }}>
                  {u.name} {isTargetUni && <span style={{ color: 'var(--green)', marginLeft: 6 }}>★ (Target)</span>}
                </div>
                <div style={{ fontSize: 11.5, color: 'var(--text-faint)', marginTop: 3 }}>
                  🌍 {u.country} · 📍 {u.location || 'Location'} · ⏰ Deadline: {u.deadline || 'Rolling'}
                </div>
              </div>

              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <button
                  onClick={() => decide('university', u.id)}
                  className={isTargetUni ? 'btn-primary' : 'btn-ghost'}
                  style={{ padding: '4px 10px', fontSize: 11.5 }}
                >
                  {isTargetUni ? '★ Primary Target' : 'Set as Target'}
                </button>
                {u.website && (
                  <a
                    href={u.website}
                    target="_blank"
                    rel="noreferrer"
                    className="btn-ghost"
                    style={{ padding: '4px 10px', fontSize: 11.5, textDecoration: 'none' }}
                  >
                    Portal ↗
                  </a>
                )}
                <button
                  onClick={() => removeUni(u.id)}
                  className="btn-ghost"
                  style={{ padding: '4px 8px', fontSize: 11 }}
                >
                  ✕
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
