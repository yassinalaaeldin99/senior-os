import { useState } from 'react';
import { Modal } from '../common';
import { uid, todayISO, calcIeltsOverall } from '../../utils/helpers';

const PRESET_MOCKS = [
  'Cambridge 18 Academic - Test 1',
  'Cambridge 18 Academic - Test 2',
  'Cambridge 18 Academic - Test 3',
  'Cambridge 18 Academic - Test 4',
  'Cambridge 17 Academic - Test 1',
  'Cambridge 17 Academic - Test 2',
  'British Council Road to IELTS',
  'IDP Official Practice Test',
  'Custom Mock Exam',
];

const BAND_OPTIONS = [
  9.0, 8.5, 8.0, 7.5, 7.0, 6.5, 6.0, 5.5, 5.0, 4.5, 4.0, 3.5, 3.0,
];

export function IeltsMockModal({ data, update, onClose }) {
  const [title, setTitle] = useState(PRESET_MOCKS[0]);
  const [customTitle, setCustomTitle] = useState('');
  const [date, setDate] = useState(todayISO());
  const [listening, setListening] = useState(data.ielts.current?.listening || 7.0);
  const [reading, setReading] = useState(data.ielts.current?.reading || 7.0);
  const [writing, setWriting] = useState(data.ielts.current?.writing || 6.0);
  const [speaking, setSpeaking] = useState(data.ielts.current?.speaking || 6.5);
  const [notes, setNotes] = useState('');
  const [updateCurrent, setUpdateCurrent] = useState(true);

  const overall = calcIeltsOverall(listening, reading, writing, speaking);
  const target = data.ielts.target || 7.5;
  const isTargetMet = overall >= target;

  const handleSave = () => {
    const finalTitle = title === 'Custom Mock Exam' && customTitle.trim() ? customTitle.trim() : title;

    const mockItem = {
      id: uid(),
      title: finalTitle,
      date: date || todayISO(),
      listening: Number(listening),
      reading: Number(reading),
      writing: Number(writing),
      speaking: Number(speaking),
      overall: Number(overall),
      notes: notes.trim(),
    };

    update((d) => {
      d.ielts.mockTests = d.ielts.mockTests || [];
      d.ielts.mockTests.unshift(mockItem);

      if (updateCurrent) {
        d.ielts.current = {
          listening: Number(listening),
          reading: Number(reading),
          writing: Number(writing),
          speaking: Number(speaking),
        };
      }
    });

    onClose();
  };

  return (
    <Modal title="📝 Record IELTS Mock Exam" onClose={onClose} width={520}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* Mock Exam Source / Preset */}
        <div>
          <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-dim)', marginBottom: 6 }}>
            Mock Exam Paper / Source
          </label>
          <select
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            style={{ width: '100%', fontSize: 13, padding: '8px 10px', marginBottom: title === 'Custom Mock Exam' ? 8 : 0 }}
          >
            {PRESET_MOCKS.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
          {title === 'Custom Mock Exam' && (
            <input
              type="text"
              placeholder="e.g. Cambridge 16 Test 3 or Kaplan Full Mock"
              value={customTitle}
              onChange={(e) => setCustomTitle(e.target.value)}
              style={{ width: '100%', fontSize: 13, padding: '8px 10px' }}
            />
          )}
        </div>

        {/* Date Taken */}
        <div>
          <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-dim)', marginBottom: 6 }}>
            Date Taken
          </label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            style={{ width: '100%', fontSize: 13, padding: '7px 10px' }}
          />
        </div>

        {/* 4 Skill Score Selectors */}
        <div>
          <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-dim)', marginBottom: 8 }}>
            Individual Skill Bands (0.0 – 9.0)
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
            {/* Listening */}
            <div style={{ background: 'var(--bg-elev)', padding: '10px 12px', borderRadius: 10, border: '1px solid var(--border-soft)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <span style={{ fontSize: 13, fontWeight: 600 }}>🎧 Listening</span>
                <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--blue)' }}>{Number(listening).toFixed(1)}</span>
              </div>
              <select
                value={listening}
                onChange={(e) => setListening(Number(e.target.value))}
                style={{ width: '100%', fontSize: 12.5, padding: '5px' }}
              >
                {BAND_OPTIONS.map((b) => (
                  <option key={b} value={b}>Band {b.toFixed(1)}</option>
                ))}
              </select>
            </div>

            {/* Reading */}
            <div style={{ background: 'var(--bg-elev)', padding: '10px 12px', borderRadius: 10, border: '1px solid var(--border-soft)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <span style={{ fontSize: 13, fontWeight: 600 }}>📖 Reading</span>
                <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--blue)' }}>{Number(reading).toFixed(1)}</span>
              </div>
              <select
                value={reading}
                onChange={(e) => setReading(Number(e.target.value))}
                style={{ width: '100%', fontSize: 12.5, padding: '5px' }}
              >
                {BAND_OPTIONS.map((b) => (
                  <option key={b} value={b}>Band {b.toFixed(1)}</option>
                ))}
              </select>
            </div>

            {/* Writing */}
            <div style={{ background: 'var(--bg-elev)', padding: '10px 12px', borderRadius: 10, border: '1px solid var(--border-soft)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <span style={{ fontSize: 13, fontWeight: 600 }}>✍️ Writing</span>
                <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--blue)' }}>{Number(writing).toFixed(1)}</span>
              </div>
              <select
                value={writing}
                onChange={(e) => setWriting(Number(e.target.value))}
                style={{ width: '100%', fontSize: 12.5, padding: '5px' }}
              >
                {BAND_OPTIONS.map((b) => (
                  <option key={b} value={b}>Band {b.toFixed(1)}</option>
                ))}
              </select>
            </div>

            {/* Speaking */}
            <div style={{ background: 'var(--bg-elev)', padding: '10px 12px', borderRadius: 10, border: '1px solid var(--border-soft)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <span style={{ fontSize: 13, fontWeight: 600 }}>🗣️ Speaking</span>
                <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--blue)' }}>{Number(speaking).toFixed(1)}</span>
              </div>
              <select
                value={speaking}
                onChange={(e) => setSpeaking(Number(e.target.value))}
                style={{ width: '100%', fontSize: 12.5, padding: '5px' }}
              >
                {BAND_OPTIONS.map((b) => (
                  <option key={b} value={b}>Band {b.toFixed(1)}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Live Overall Band Score Banner */}
        <div
          style={{
            padding: '14px 16px',
            background: isTargetMet
              ? 'linear-gradient(135deg, rgba(16,185,129,0.15), rgba(59,130,246,0.15))'
              : 'linear-gradient(135deg, rgba(245,158,11,0.15), rgba(59,130,246,0.1))',
            border: isTargetMet ? '1px solid var(--green)' : '1px solid var(--amber)',
            borderRadius: 12,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-faint)', textTransform: 'uppercase' }}>
              Official Calculated Overall Band
            </div>
            <div style={{ fontSize: 12, color: isTargetMet ? 'var(--green-light)' : 'var(--amber-light)', marginTop: 2 }}>
              {isTargetMet
                ? '🩺 Pre-Med Admission Target Met (7.5+ Band)!'
                : `Target is ${target} (${(target - overall).toFixed(1)} band to go)`}
            </div>
          </div>
          <div style={{ fontSize: 28, fontWeight: 800, color: isTargetMet ? 'var(--green)' : 'var(--amber-light)' }}>
            {overall.toFixed(1)}
          </div>
        </div>

        {/* Notes / Reflection */}
        <div>
          <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-dim)', marginBottom: 6 }}>
            Reflections & Weak Points (Optional)
          </label>
          <textarea
            rows={2}
            placeholder="e.g. Reading passage 3 Matching Headings was difficult; Writing Task 2 timing was tight..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            style={{ width: '100%', fontSize: 12.5, padding: '8px 10px' }}
          />
        </div>

        {/* Checkbox to update current estimated skills */}
        <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: 'var(--text-dim)', cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={updateCurrent}
            onChange={(e) => setUpdateCurrent(e.target.checked)}
            style={{ accentColor: 'var(--blue)' }}
          />
          <span>Update my current estimated skills with these latest scores</span>
        </label>

        {/* Buttons */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 4 }}>
          <button type="button" onClick={onClose} className="btn-ghost" style={{ fontSize: 12.5 }}>
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="btn-primary"
            style={{
              fontSize: 13,
              fontWeight: 700,
              background: 'linear-gradient(135deg, var(--blue), var(--violet))',
              padding: '8px 18px',
            }}
          >
            ✓ Save Mock Exam
          </button>
        </div>
      </div>
    </Modal>
  );
}
