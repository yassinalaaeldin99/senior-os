import { useState } from 'react';
import { Modal, Field } from '../common';
import { SUBJECTS, PRIORITIES, COUNTRY_LIB, subjInfo } from '../../constants/data';
import { uid, todayISO } from '../../utils/helpers';

function defaultForm(type) {
  const defaultSubj = 'mathematics';
  const defaultTeacher = 'Mr. Abdulaziz';
  const base = {
    subject: defaultSubj,
    teacher: defaultTeacher,
    date: todayISO(),
    dueDate: todayISO(),
    assignedDate: todayISO(),
    priority: 'medium',
    estMinutes: 30,
    durationMinutes: 30,
    method: 'Revision',
    maxGrade: 100,
    weight: 1,
    term: 'Term 1',
    difficulty: 'Medium',
    targetGrade: 95,
    skill: 'Reading',
    name: '',
    score: 5,
  };
  return base;
}

function SubjectSelect({ value, onChange }) {
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)}>
      {SUBJECTS.map((s) => (
        <option key={s.key} value={s.key}>
          {s.emoji} {s.label}
        </option>
      ))}
    </select>
  );
}

function PrioritySelect({ value, onChange }) {
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)}>
      {Object.entries(PRIORITIES).map(([k, v]) => (
        <option key={k} value={k}>
          {v.label}
        </option>
      ))}
    </select>
  );
}

export function QuickModal({ modal, data, update, onClose }) {
  const { type } = modal;
  const [form, setForm] = useState(() => defaultForm(type));
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const save = () => {
    update((d) => {
      if (type === 'homework') {
        d.homework.push({
          id: uid(),
          subject: form.subject,
          name: form.name,
          teacher: form.teacher,
          description: form.description,
          assignedDate: form.assignedDate || todayISO(),
          dueDate: form.dueDate || todayISO(),
          estMinutes: Number(form.estMinutes) || 30,
          priority: form.priority,
          status: 'not_started',
          notes: form.notes,
        });
      }
      if (type === 'exam') {
        d.exams.push({
          id: uid(),
          subject: form.subject,
          name: form.name,
          date: form.date || todayISO(),
          difficulty: form.difficulty,
          prepPercent: 0,
          targetGrade: form.targetGrade || 95,
          topics: (form.topics || '')
            .split(',')
            .map((t) => t.trim())
            .filter(Boolean)
            .map((t) => ({ name: t, done: false })),
        });
      }
      if (type === 'study') {
        d.study.push({
          id: uid(),
          subject: form.subject,
          topic: form.topic,
          date: form.date || todayISO(),
          startTime: form.startTime,
          durationMinutes: Number(form.durationMinutes) || 30,
          method: form.method,
          notes: form.notes,
        });
      }
      if (type === 'goal') {
        d.goals.year.push({ id: uid(), text: form.text, done: false });
      }
      if (type === 'ielts') {
        d.ielts.sessions.push({
          id: uid(),
          skill: form.skill,
          date: form.date || todayISO(),
          durationMinutes: Number(form.durationMinutes) || 30,
          notes: form.notes,
        });
      }
      if (type === 'country') {
        const lib = COUNTRY_LIB.find((c) => c.name === form.name);
        d.medicine.countries.push({
          id: uid(),
          name: form.name,
          flag: lib ? lib.flag : '🌍',
          tuition: form.tuition,
          length: form.length,
          language: form.language,
          score: Number(form.score) || 5,
        });
      }
      if (type === 'university') {
        d.medicine.universities.push({
          id: uid(),
          name: form.name,
          country: form.country,
          location: form.location,
          deadline: form.deadline,
          website: form.website,
        });
      }
      if (type === 'event') {
        d.milestones.push({
          id: uid(),
          name: form.name,
          date: form.date || todayISO(),
          emoji: '🗓️',
          done: false,
        });
      }
    });
    onClose();
  };

  const titles = {
    homework: 'Add homework',
    exam: 'Add exam',
    study: 'Log study session',
    grade: 'Add grade',
    goal: 'Add goal',
    ielts: 'Log IELTS session',
    country: 'Add country',
    university: 'Add university',
    event: 'Add important event',
  };

  return (
    <Modal title={titles[type] || 'Add'} onClose={onClose}>
      {type === 'homework' && (
        <>
          <Field label="Subject">
            <SubjectSelect
              value={form.subject}
              onChange={(v) => {
                const s = subjInfo(v);
                setForm((f) => ({
                  ...f,
                  subject: v,
                  teacher: s.teacher || f.teacher,
                }));
              }}
            />
          </Field>
          <Field label="Assignment name">
            <input style={{ width: '100%' }} value={form.name} onChange={(e) => set('name', e.target.value)} />
          </Field>
          <Field label="Teacher">
            <input style={{ width: '100%' }} value={form.teacher} onChange={(e) => set('teacher', e.target.value)} />
          </Field>
          <div style={{ display: 'flex', gap: 10 }}>
            <Field label="Due date">
              <input type="date" value={form.dueDate} onChange={(e) => set('dueDate', e.target.value)} />
            </Field>
            <Field label="Est. minutes">
              <input type="number" value={form.estMinutes} onChange={(e) => set('estMinutes', e.target.value)} />
            </Field>
          </div>
          <Field label="Priority">
            <PrioritySelect value={form.priority} onChange={(v) => set('priority', v)} />
          </Field>
          <Field label="Notes">
            <textarea
              style={{ width: '100%' }}
              rows={2}
              value={form.notes}
              onChange={(e) => set('notes', e.target.value)}
            />
          </Field>
        </>
      )}
      {type === 'exam' && (
        <>
          <Field label="Subject">
            <SubjectSelect value={form.subject} onChange={(v) => set('subject', v)} />
          </Field>
          <Field label="Exam name">
            <input style={{ width: '100%' }} value={form.name} onChange={(e) => set('name', e.target.value)} />
          </Field>
          <div style={{ display: 'flex', gap: 10 }}>
            <Field label="Date">
              <input type="date" value={form.date} onChange={(e) => set('date', e.target.value)} />
            </Field>
            <Field label="Target grade %">
              <input
                type="number"
                value={form.targetGrade}
                onChange={(e) => set('targetGrade', e.target.value)}
              />
            </Field>
          </div>
          <Field label="Difficulty">
            <select value={form.difficulty} onChange={(e) => set('difficulty', e.target.value)}>
              <option>Easy</option>
              <option>Medium</option>
              <option>Hard</option>
            </select>
          </Field>
          <Field label="Topics (comma separated)">
            <textarea
              style={{ width: '100%' }}
              rows={2}
              value={form.topics}
              onChange={(e) => set('topics', e.target.value)}
            />
          </Field>
        </>
      )}
      {type === 'study' && (
        <>
          <Field label="Subject">
            <SubjectSelect value={form.subject} onChange={(v) => set('subject', v)} />
          </Field>
          <Field label="Topic">
            <input style={{ width: '100%' }} value={form.topic} onChange={(e) => set('topic', e.target.value)} />
          </Field>
          <div style={{ display: 'flex', gap: 10 }}>
            <Field label="Date">
              <input type="date" value={form.date} onChange={(e) => set('date', e.target.value)} />
            </Field>
            <Field label="Duration (min)">
              <input
                type="number"
                value={form.durationMinutes}
                onChange={(e) => set('durationMinutes', e.target.value)}
              />
            </Field>
          </div>
          <Field label="Method">
            <select value={form.method} onChange={(e) => set('method', e.target.value)}>
              {[
                'Revision',
                'Practice questions',
                'Flashcards',
                'Past paper',
                'Reading',
                'Video',
                'Homework',
              ].map((m) => (
                <option key={m}>{m}</option>
              ))}
            </select>
          </Field>
          <Field label="Notes">
            <textarea
              style={{ width: '100%' }}
              rows={2}
              value={form.notes}
              onChange={(e) => set('notes', e.target.value)}
            />
          </Field>
        </>
      )}
      {type === 'goal' && (
        <Field label="Goal">
          <input style={{ width: '100%' }} value={form.text} onChange={(e) => set('text', e.target.value)} />
        </Field>
      )}
      {type === 'ielts' && (
        <>
          <Field label="Skill">
            <select value={form.skill} onChange={(e) => set('skill', e.target.value)}>
              {['Reading', 'Listening', 'Writing', 'Speaking', 'Vocabulary', 'Grammar', 'Mock test'].map(
                (m) => (
                  <option key={m}>{m}</option>
                )
              )}
            </select>
          </Field>
          <div style={{ display: 'flex', gap: 10 }}>
            <Field label="Date">
              <input type="date" value={form.date} onChange={(e) => set('date', e.target.value)} />
            </Field>
            <Field label="Duration (min)">
              <input
                type="number"
                value={form.durationMinutes}
                onChange={(e) => set('durationMinutes', e.target.value)}
              />
            </Field>
          </div>
          <Field label="Notes">
            <textarea
              style={{ width: '100%' }}
              rows={2}
              value={form.notes}
              onChange={(e) => set('notes', e.target.value)}
            />
          </Field>
        </>
      )}
      {type === 'country' && (
        <>
          <Field label="Country">
            <select value={form.name} onChange={(e) => set('name', e.target.value)}>
              {COUNTRY_LIB.map((c) => (
                <option key={c.name} value={c.name}>
                  {c.flag} {c.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Approx. tuition">
            <input style={{ width: '100%' }} value={form.tuition} onChange={(e) => set('tuition', e.target.value)} />
          </Field>
          <div style={{ display: 'flex', gap: 10 }}>
            <Field label="Program length">
              <input value={form.length} onChange={(e) => set('length', e.target.value)} />
            </Field>
            <Field label="Language">
              <input value={form.language} onChange={(e) => set('language', e.target.value)} />
            </Field>
          </div>
          <Field label="Personal score (1–10)">
            <input
              type="number"
              min="1"
              max="10"
              value={form.score}
              onChange={(e) => set('score', e.target.value)}
            />
          </Field>
        </>
      )}
      {type === 'university' && (
        <>
          <Field label="University name">
            <input style={{ width: '100%' }} value={form.name} onChange={(e) => set('name', e.target.value)} />
          </Field>
          <div style={{ display: 'flex', gap: 10 }}>
            <Field label="Country">
              <input value={form.country} onChange={(e) => set('country', e.target.value)} />
            </Field>
            <Field label="Location">
              <input value={form.location} onChange={(e) => set('location', e.target.value)} />
            </Field>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <Field label="Application deadline">
              <input type="date" value={form.deadline} onChange={(e) => set('deadline', e.target.value)} />
            </Field>
            <Field label="Official website">
              <input value={form.website} onChange={(e) => set('website', e.target.value)} />
            </Field>
          </div>
        </>
      )}
      {type === 'event' && (
        <>
          <Field label="Event name">
            <input style={{ width: '100%' }} value={form.name} onChange={(e) => set('name', e.target.value)} />
          </Field>
          <Field label="Date">
            <input type="date" value={form.date} onChange={(e) => set('date', e.target.value)} />
          </Field>
        </>
      )}
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 16 }}>
        <button className="btn-ghost" onClick={onClose}>
          Cancel
        </button>
        <button className="btn-primary" onClick={save}>
          Save
        </button>
      </div>
    </Modal>
  );
}
