import { useState, useCallback } from 'react';
import { useStore } from './hooks/useStore';
import Layout from './components/Layout';
import { Dashboard, Homework, CalendarPage, Exams, Study, Grades, Goals, Ielts, Medicine, Timeline, Settings } from './components/tabs';
import { QuickModal } from './components/modals/QuickModal';
import { AiPanel } from './components/modals/AiPanel';
import { ScannerModal } from './components/modals/ScannerModal';

export function App() {
  const [data, setData, ready, syncStatus] = useStore();
  const [tab, setTab] = useState('dashboard');
  const [quickAddOpen, setQuickAddOpen] = useState(false);
  const [modal, setModal] = useState(null); // {type, editing}
  const [aiOpen, setAiOpen] = useState(false);
  const [scannerOpen, setScannerOpen] = useState(false);

  const update = useCallback(
    (fn) => {
      setData((prev) => {
        const next = JSON.parse(JSON.stringify(prev));
        fn(next);
        return next;
      });
    },
    [setData]
  );

  if (!ready || !data) {
    return (
      <div
        style={{
          height: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--text-dim)',
          background: 'var(--bg)',
          fontSize: 15,
          fontWeight: 500,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 20 }}>✦</span> Loading SENIOR OS…
        </div>
      </div>
    );
  }

  return (
    <>
      <Layout
        data={data}
        syncStatus={syncStatus}
        currentTab={tab}
        setTab={setTab}
        setAiOpen={setAiOpen}
        setModal={setModal}
        openScanner={() => setScannerOpen(true)}
        quickAddOpen={quickAddOpen}
        setQuickAddOpen={setQuickAddOpen}
      >
        {tab === 'dashboard' && (
          <Dashboard
            data={data}
            update={update}
            setTab={setTab}
            openModal={setModal}
            setAiOpen={setAiOpen}
            openScanner={() => setScannerOpen(true)}
          />
        )}
        {tab === 'homework' && (
          <Homework
            data={data}
            update={update}
            openModal={setModal}
            openScanner={() => setScannerOpen(true)}
          />
        )}
        {tab === 'calendar' && <CalendarPage data={data} />}
        {tab === 'exams' && <Exams data={data} update={update} openModal={setModal} />}
        {tab === 'study' && <Study data={data} update={update} openModal={setModal} />}
        {tab === 'grades' && <Grades data={data} update={update} openModal={setModal} />}
        {tab === 'goals' && <Goals data={data} update={update} />}
        {tab === 'ielts' && <Ielts data={data} update={update} openModal={setModal} />}
        {tab === 'medicine' && <Medicine data={data} update={update} openModal={setModal} />}
        {tab === 'timeline' && <Timeline data={data} update={update} />}
        {tab === 'settings' && <Settings data={data} update={update} syncStatus={syncStatus} />}
      </Layout>

      {/* Quick add floating button */}
      <div className="quick-add-btn-wrap">
        {quickAddOpen && (
          <div
            className="card-hi fade-in"
            style={{
              position: 'absolute',
              bottom: 64,
              right: 0,
              width: 230,
              padding: 8,
              border: '1px solid var(--border-bright)',
              borderRadius: 14,
              boxShadow: '0 12px 36px rgba(0,0,0,0.5)',
            }}
          >
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-faint)', padding: '6px 10px', textTransform: 'uppercase', letterSpacing: 0.6 }}>
              Quick Create
            </div>
            {[
              { t: 'scanner', l: '📷 Scan Homework (AI)', i: '📸', highlight: true },
              { t: 'homework', l: 'Homework Assignment', i: '📚' },
              { t: 'exam', l: 'Upcoming Exam', i: '📝' },
              { t: 'study', l: 'Study Session', i: '📖' },
              { t: 'grade', l: 'Grade Entry', i: '📊' },
              { t: 'goal', l: 'Academic Goal', i: '🎯' },
              { t: 'ielts', l: 'IELTS Practice', i: '🇬🇧' },
              { t: 'university', l: 'Med University', i: '🩺' },
              { t: 'event', l: 'Key Milestone', i: '🗓️' },
            ].map((o) => (
              <div
                key={o.t}
                className="nav-item"
                style={{
                  borderRadius: 8,
                  padding: '8px 10px',
                  background: o.highlight ? 'linear-gradient(90deg, rgba(59,130,246,0.15), rgba(139,92,246,0.15))' : 'transparent',
                  border: o.highlight ? '1px solid var(--blue-glow)' : 'none',
                }}
                onClick={() => {
                  if (o.t === 'scanner') {
                    setScannerOpen(true);
                  } else {
                    setModal({ type: o.t });
                  }
                  setQuickAddOpen(false);
                }}
              >
                <span style={{ fontSize: 16 }}>{o.i}</span>
                <span style={{ fontWeight: o.highlight ? 700 : 500, color: o.highlight ? '#93C5FD' : 'inherit' }}>
                  {o.l}
                </span>
              </div>
            ))}
          </div>
        )}
        <button
          onClick={() => setQuickAddOpen((v) => !v)}
          className="btn-primary"
          style={{
            width: 54,
            height: 54,
            borderRadius: '50%',
            fontSize: 24,
            boxShadow: '0 8px 28px rgba(59, 130, 246, 0.45)',
            border: '2px solid rgba(255, 255, 255, 0.2)',
          }}
          title="Quick Create"
        >
          {quickAddOpen ? '✕' : '+'}
        </button>
      </div>

      {modal && <QuickModal modal={modal} data={data} update={update} onClose={() => setModal(null)} />}
      {scannerOpen && <ScannerModal data={data} update={update} onClose={() => setScannerOpen(false)} />}
      {aiOpen && <AiPanel data={data} update={update} onClose={() => setAiOpen(false)} />}
    </>
  );
}

export default App;
