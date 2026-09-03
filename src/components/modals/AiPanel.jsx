import { useState, useEffect, useRef } from 'react';
import { askSeniorWithGeminiStream, buildContext } from '../../services/gemini';
import { uid, todayISO } from '../../utils/helpers';
import { COUNTRY_LIB } from '../../constants/data';

export { buildContext };

export function AiPanel({ data, update, onClose }) {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      text: `Hey ${data.settings?.name || 'Yassin'}! I'm SENIOR — your personal mentor for the year. Let's make this year count.\n\nHit me with whatever is on your mind: what to tackle first today, IELTS tips, comparing med schools, or just tell me to add homework and study blocks straight onto your board. What's the move?`,
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const boxRef = useRef(null);

  useEffect(() => {
    if (boxRef.current) {
      boxRef.current.scrollTop = boxRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const applyAction = (action, msgIndex) => {
    if (!update || !action) return;

    update((d) => {
      const actData = action.data || {};
      if (action.type === 'add_homework') {
        d.homework.push({
          id: uid(),
          name: actData.name || 'New assignment',
          subject: actData.subject || 'biology',
          teacher: actData.teacher || '',
          description: actData.description || '',
          assignedDate: actData.assignedDate || todayISO(),
          dueDate: actData.dueDate || todayISO(),
          estMinutes: Number(actData.estMinutes) || 30,
          priority: actData.priority || 'medium',
          status: 'not_started',
          notes: actData.notes || 'Added by SENIOR',
        });
      } else if (action.type === 'add_exam') {
        const topics = Array.isArray(actData.topics)
          ? actData.topics.map((t) => ({ name: String(t), done: false }))
          : [];
        d.exams.push({
          id: uid(),
          name: actData.name || 'New Exam',
          subject: actData.subject || 'biology',
          date: actData.date || todayISO(),
          difficulty: actData.difficulty || 'Medium',
          prepPercent: 0,
          targetGrade: Number(actData.targetGrade) || 95,
          topics,
        });
      } else if (action.type === 'add_study') {
        d.study.push({
          id: uid(),
          subject: actData.subject || 'biology',
          topic: actData.topic || 'Revision',
          date: actData.date || todayISO(),
          startTime: actData.startTime || '16:00',
          durationMinutes: Number(actData.durationMinutes) || 45,
          method: actData.method || 'Revision',
          notes: actData.notes || 'Logged via SENIOR',
        });
      } else if (action.type === 'add_goal') {
        const scope = actData.scope || 'weekly';
        if (scope === 'year') {
          d.goals.year.push({ id: uid(), text: actData.text, done: false });
        } else if (scope === 'weekly') {
          d.goals.weekly.push({ id: uid(), text: actData.text, done: false });
        } else {
          const m = actData.month || 'September';
          d.goals.monthly[m] = d.goals.monthly[m] || [];
          d.goals.monthly[m].push({ id: uid(), text: actData.text, done: false });
        }
      } else if (action.type === 'add_university') {
        d.medicine.universities.push({
          id: uid(),
          name: actData.name,
          country: actData.country || '',
          location: actData.location || '',
          deadline: actData.deadline || '',
          website: actData.website || '',
        });
      } else if (action.type === 'add_country') {
        const lib = COUNTRY_LIB.find((c) => c.name === actData.name);
        d.medicine.countries.push({
          id: uid(),
          name: actData.name,
          flag: lib ? lib.flag : '🌍',
          tuition: actData.tuition || '',
          length: actData.length || '6 years',
          language: actData.language || 'English',
          score: Number(actData.score) || 8,
        });
      }
    });

    setMessages((prev) =>
      prev.map((m, idx) => (idx === msgIndex ? { ...m, actionApplied: true } : m))
    );
  };

  const sendQuery = async (queryText) => {
    const q = (queryText || input).trim();
    if (!q || loading) return;
    setInput('');

    // Add user message and empty streaming assistant slot
    const userMsg = { role: 'user', text: q };
    const initialAssistantMsg = {
      role: 'assistant',
      text: '',
      isStreaming: true,
      action: null,
      actionApplied: false,
    };

    setMessages((m) => [...m, userMsg, initialAssistantMsg]);
    setLoading(true);

    try {
      const result = await askSeniorWithGeminiStream({
        query: q,
        data,
        history: [...messages, userMsg],
        onChunk: (chunkText) => {
          setMessages((prev) => {
            const last = prev[prev.length - 1];
            if (last && last.role === 'assistant') {
              return [
                ...prev.slice(0, -1),
                { ...last, text: chunkText, isStreaming: true },
              ];
            }
            return prev;
          });
        },
      });

      // Stream finalized
      setMessages((prev) => {
        const last = prev[prev.length - 1];
        if (last && last.role === 'assistant') {
          return [
            ...prev.slice(0, -1),
            {
              ...last,
              text: result.text,
              action: result.action,
              isStreaming: false,
            },
          ];
        }
        return prev;
      });
    } catch (e) {
      setMessages((prev) => {
        const last = prev[prev.length - 1];
        if (last && last.role === 'assistant') {
          return [
            ...prev.slice(0, -1),
            {
              ...last,
              text: `Whoops, hit a snag connecting: ${e.message || 'Check your internet or API key in Settings.'}`,
              isStreaming: false,
            },
          ];
        }
        return prev;
      });
    }
    setLoading(false);
  };

  const suggestions = [
    '⚡ What should I focus on right now?',
    '🎯 How do I bump my IELTS writing to 7.5?',
    '🩺 Compare medicine in Germany vs UK',
    '📝 Add Chemistry assignment due this Friday',
  ];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="card-hi fade-in modal-sheet"
        style={{
          width: 530,
          display: 'flex',
          flexDirection: 'column',
          padding: 0,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '14px 18px',
            borderBottom: '1px solid var(--border)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
            <span style={{ fontSize: 16 }}>✦</span>
            <div style={{ fontWeight: 600, fontSize: 14 }}>SENIOR Mentor</div>
            <span
              style={{
                fontSize: 11,
                background: 'var(--blue-dim)',
                color: '#C9D8FF',
                padding: '2px 9px',
                borderRadius: 12,
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: 5,
              }}
            >
              <span
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: '50%',
                  background: 'var(--green)',
                  display: 'inline-block',
                }}
              />
              Flash Lite · Live
            </span>
          </div>
          <button onClick={onClose} className="btn-ghost" style={{ padding: '4px 10px' }}>
            ✕
          </button>
        </div>

        {/* Message feed */}
        <div
          ref={boxRef}
          className="scrollbar-thin"
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: 16,
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
          }}
        >
          {messages.map((m, i) => (
            <div
              key={i}
              style={{
                alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
                maxWidth: '88%',
                background: m.role === 'user' ? 'var(--blue-dim)' : 'var(--bg-elev)',
                color: m.role === 'user' ? '#DCE7FF' : 'var(--text)',
                padding: '10px 14px',
                borderRadius: 12,
                fontSize: 13.5,
                lineHeight: 1.55,
                whiteSpace: 'pre-wrap',
                border: m.role === 'user' ? 'none' : '1px solid var(--border-soft)',
              }}
            >
              {m.role === 'assistant' && (
                <div
                  style={{
                    fontSize: 10.5,
                    fontWeight: 700,
                    color: 'var(--blue)',
                    marginBottom: 4,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                  }}
                >
                  ✦ SENIOR
                </div>
              )}

              <div>
                {m.text}
                {m.isStreaming && (
                  <span
                    style={{
                      display: 'inline-block',
                      width: 7,
                      height: 14,
                      background: 'var(--blue)',
                      marginLeft: 3,
                      verticalAlign: 'middle',
                      animation: 'fadeIn 0.6s infinite alternate',
                    }}
                  />
                )}
              </div>

              {/* Action Card if action proposed */}
              {m.action && (
                <div
                  style={{
                    marginTop: 12,
                    padding: '10px 12px',
                    background: 'var(--card)',
                    border: '1px solid var(--blue-dim)',
                    borderRadius: 9,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 6,
                  }}
                >
                  <div style={{ fontSize: 11.5, color: 'var(--text-dim)', fontWeight: 600 }}>
                    ⚡ Proposed Planner Action:
                  </div>
                  <div style={{ fontSize: 12.5 }}>
                    {m.action.type === 'add_homework' &&
                      `📚 Add Homework: ${m.action.data?.name || ''} (${m.action.data?.subject || ''}, due ${m.action.data?.dueDate || ''})`}
                    {m.action.type === 'add_exam' &&
                      `📝 Add Exam: ${m.action.data?.name || ''} (${m.action.data?.subject || ''}, on ${m.action.data?.date || ''})`}
                    {m.action.type === 'add_study' &&
                      `📖 Log Study: ${m.action.data?.topic || m.action.data?.subject || ''} (${m.action.data?.durationMinutes || 30} min)`}
                    {m.action.type === 'add_goal' && `🎯 Add Goal: ${m.action.data?.text || ''}`}
                    {m.action.type === 'add_university' &&
                      `🩺 Add University: ${m.action.data?.name || ''} (${m.action.data?.country || ''})`}
                    {m.action.type === 'add_country' &&
                      `🌍 Add Country: ${m.action.data?.name || ''}`}
                  </div>
                  <button
                    onClick={() => applyAction(m.action, i)}
                    disabled={m.actionApplied}
                    className="btn-primary"
                    style={{
                      marginTop: 4,
                      padding: '6px 14px',
                      fontSize: 12,
                      alignSelf: 'flex-start',
                      background: m.actionApplied ? 'var(--green-dim)' : 'var(--blue)',
                      color: m.actionApplied ? 'var(--green)' : '#fff',
                      cursor: m.actionApplied ? 'default' : 'pointer',
                    }}
                  >
                    {m.actionApplied ? '✓ Added to Planner' : '+ Apply to Planner'}
                  </button>
                </div>
              )}
            </div>
          ))}

          {loading && messages[messages.length - 1]?.text === '' && (
            <div
              style={{
                alignSelf: 'flex-start',
                color: 'var(--text-faint)',
                fontSize: 12.5,
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <span>✦</span> SENIOR is thinking…
            </div>
          )}
        </div>

        {/* Quick Suggestion Chips */}
        {messages.length <= 2 && !loading && (
          <div
            style={{
              padding: '0 14px 10px',
              display: 'flex',
              gap: 6,
              flexWrap: 'wrap',
            }}
          >
            {suggestions.map((s, i) => (
              <button
                key={i}
                onClick={() => sendQuery(s)}
                className="btn-ghost"
                style={{ fontSize: 11.5, padding: '5px 11px', borderRadius: 16 }}
              >
                {s}
              </button>
            ))}
          </div>
        )}

        {/* Input box */}
        <div style={{ display: 'flex', gap: 8, padding: 14, borderTop: '1px solid var(--border)' }}>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') sendQuery();
            }}
            placeholder="Ask anything or say 'Add Chemistry lab report due Friday'..."
            style={{ flex: 1 }}
          />
          <button className="btn-primary" onClick={() => sendQuery()} disabled={loading}>
            Ask
          </button>
        </div>
      </div>
    </div>
  );
}
