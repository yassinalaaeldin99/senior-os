import React, { useState, useEffect, useMemo, useRef } from 'react';
import { STORAGE_KEY_THEME } from '../constants/data';
import { overallAverage, daysBetween, todayISO } from '../utils/helpers';

export default function Layout({
  children,
  data,
  syncStatus = 'local',
  currentTab,
  setTab,
  setAiOpen,
  setModal,
  quickAddOpen,
  setQuickAddOpen,
}) {
  const [commandOpen, setCommandOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [canInstall, setCanInstall] = useState(false);
  const searchInputRef = useRef(null);

  // Listen for PWA install prompt
  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setCanInstall(true);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallApp = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setCanInstall(false);
      setDeferredPrompt(null);
    }
  };

  // Theme state
  useEffect(() => {
    const stored = typeof localStorage !== 'undefined' && localStorage.getItem(STORAGE_KEY_THEME);
    const theme = stored || 'dark'; // Dark theme default
    document.documentElement.setAttribute('data-theme', theme);
  }, []);

  const toggleTheme = () => {
    const current = document.documentElement.getAttribute('data-theme') || 'dark';
    const next = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(STORAGE_KEY_THEME, next);
    }
  };

  const isDark = typeof document !== 'undefined' && document.documentElement.getAttribute('data-theme') !== 'light';

  // Global Ctrl+K / Cmd+K listener for Command Palette
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setCommandOpen((v) => !v);
      }
      if (e.key === 'Escape') {
        setCommandOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    if (commandOpen && searchInputRef.current) {
      setTimeout(() => searchInputRef.current?.focus(), 50);
    } else {
      setSearchQuery('');
    }
  }, [commandOpen]);

  // Navigation structure organized by sections
  const NAV_SECTIONS = [
    {
      title: 'Overview',
      items: [
        { key: 'dashboard', label: 'Dashboard', icon: '🏠' },
        { key: 'calendar', label: 'Calendar', icon: '📅' },
        { key: 'timeline', label: 'Timeline & Plan', icon: '🗓️' },
      ],
    },
    {
      title: 'Academics',
      items: [
        { key: 'homework', label: 'Homework', icon: '📚', badgeKey: 'hw' },
        { key: 'exams', label: 'Exams', icon: '📝', badgeKey: 'exams' },
        { key: 'study', label: 'Study Logger', icon: '📖' },
        { key: 'grades', label: 'Grades & GPA', icon: '📊', badgeKey: 'grades' },
      ],
    },
    {
      title: 'Vision & Goals',
      items: [
        { key: 'goals', label: 'Goals', icon: '🎯' },
        { key: 'ielts', label: 'IELTS Prep', icon: '🇬🇧' },
        { key: 'medicine', label: 'Medicine Plan', icon: '🩺' },
      ],
    },
    {
      title: 'Preferences',
      items: [{ key: 'settings', label: 'Settings', icon: '⚙️' }],
    },
  ];

  // Quick stats for top bar
  const stats = useMemo(() => {
    if (!data) return { avg: null, pendingHw: 0, nextExam: null };
    const today = todayISO();
    const avg = overallAverage(data.grades);
    const pendingHw = (data.homework || []).filter((h) => h.status !== 'completed').length;
    const upcomingExams = (data.exams || [])
      .filter((e) => daysBetween(today, e.date) >= 0)
      .sort((a, b) => a.date.localeCompare(b.date));
    const nextExam = upcomingExams.length > 0 ? {
      name: upcomingExams[0].name,
      days: daysBetween(today, upcomingExams[0].date),
    } : null;

    return { avg, pendingHw, nextExam };
  }, [data]);

  // Current tab info
  const activeTabMeta = useMemo(() => {
    for (const section of NAV_SECTIONS) {
      for (const item of section.items) {
        if (item.key === currentTab) {
          return { section: section.title, ...item };
        }
      }
    }
    return { section: 'Overview', label: 'Dashboard', icon: '🏠' };
  }, [currentTab]);

  // Command palette options
  const COMMAND_ITEMS = [
    { type: 'nav', key: 'dashboard', label: 'Dashboard', icon: '🏠', cat: 'Navigation' },
    { type: 'nav', key: 'homework', label: 'Homework & Tasks', icon: '📚', cat: 'Navigation' },
    { type: 'nav', key: 'calendar', label: 'Academic Calendar', icon: '📅', cat: 'Navigation' },
    { type: 'nav', key: 'exams', label: 'Exams & Quizzes', icon: '📝', cat: 'Navigation' },
    { type: 'nav', key: 'study', label: 'Study Logger', icon: '📖', cat: 'Navigation' },
    { type: 'nav', key: 'grades', label: 'Grades & GPA', icon: '📊', cat: 'Navigation' },
    { type: 'nav', key: 'goals', label: 'Goals & Targets', icon: '🎯', cat: 'Navigation' },
    { type: 'nav', key: 'ielts', label: 'IELTS Academic Prep', icon: '🇬🇧', cat: 'Navigation' },
    { type: 'nav', key: 'medicine', label: 'Medicine Study Plan', icon: '🩺', cat: 'Navigation' },
    { type: 'nav', key: 'timeline', label: 'Timeline & MOE Plan', icon: '🗓️', cat: 'Navigation' },
    { type: 'nav', key: 'settings', label: 'Settings & Backups', icon: '⚙️', cat: 'Navigation' },
    { type: 'action', action: () => setAiOpen(true), label: 'Ask SENIOR AI Mentor', icon: '✦', cat: 'Actions' },
    { type: 'action', action: () => setModal({ type: 'homework' }), label: 'Add New Homework', icon: '➕', cat: 'Actions' },
    { type: 'action', action: () => setModal({ type: 'exam' }), label: 'Schedule New Exam', icon: '➕', cat: 'Actions' },
    { type: 'action', action: () => setModal({ type: 'study' }), label: 'Log Study Session', icon: '➕', cat: 'Actions' },
    { type: 'action', action: () => setModal({ type: 'grade' }), label: 'Record New Grade', icon: '➕', cat: 'Actions' },
    { type: 'action', action: toggleTheme, label: 'Toggle Light / Dark Mode', icon: '🌓', cat: 'Actions' },
    { type: 'action', action: () => (canInstall ? handleInstallApp() : setTab('settings')), label: 'Install App (PWA)', icon: '📲', cat: 'App' },
  ];

  const filteredCommands = useMemo(() => {
    if (!searchQuery.trim()) return COMMAND_ITEMS;
    const q = searchQuery.toLowerCase();
    return COMMAND_ITEMS.filter((item) =>
      item.label.toLowerCase().includes(q) || item.cat.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg)' }}>
      {/* Sidebar Rail */}
      <aside
        style={{
          width: 240,
          background: 'var(--bg-elev)',
          borderRight: '1px solid var(--border-soft)',
          display: 'flex',
          flexDirection: 'column',
          position: 'sticky',
          top: 0,
          height: '100vh',
          flexShrink: 0,
          zIndex: 30,
          overflowY: 'auto',
        }}
        className="scrollbar-thin"
      >
        {/* Brand Header */}
        <div style={{ padding: '22px 18px 18px', borderBottom: '1px solid var(--border-soft)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                width: 34,
                height: 34,
                borderRadius: 10,
                background: 'linear-gradient(135deg, var(--blue), var(--violet))',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                fontSize: 16,
                fontWeight: 700,
                boxShadow: '0 4px 12px var(--blue-dim)',
              }}
            >
              ✦
            </div>
            <div>
              <div className="display" style={{ fontSize: 19, fontWeight: 700, letterSpacing: '.4px', lineHeight: 1.1 }}>
                SENIOR<span style={{ color: 'var(--blue)' }}>OS</span>
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-faint)', marginTop: 2, fontWeight: 500 }}>
                Class of 2027 · Med Track
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Categories */}
        <div style={{ padding: '16px 12px', flex: 1, display: 'flex', flexDirection: 'column', gap: 18 }}>
          {NAV_SECTIONS.map((section) => (
            <div key={section.title}>
              <div
                style={{
                  fontSize: 10.5,
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  color: 'var(--text-faint)',
                  letterSpacing: '0.8px',
                  padding: '0 10px 6px',
                }}
              >
                {section.title}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {section.items.map((item) => {
                  const isActive = currentTab === item.key;
                  let badge = null;
                  if (item.badgeKey === 'hw' && stats.pendingHw > 0) {
                    badge = stats.pendingHw;
                  } else if (item.badgeKey === 'exams' && stats.nextExam) {
                    badge = `${stats.nextExam.days}d`;
                  } else if (item.badgeKey === 'grades' && stats.avg != null) {
                    badge = `${stats.avg.toFixed(0)}%`;
                  }

                  return (
                    <div
                      key={item.key}
                      className={`nav-item ${isActive ? 'active' : ''}`}
                      onClick={() => setTab(item.key)}
                      style={{ justifyContent: 'space-between' }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span style={{ fontSize: 15 }}>{item.icon}</span>
                        <span>{item.label}</span>
                      </div>
                      {badge && (
                        <span
                          style={{
                            fontSize: 10.5,
                            fontWeight: 700,
                            padding: '2px 7px',
                            borderRadius: 12,
                            background: isActive ? 'var(--blue)' : 'var(--bg)',
                            color: isActive ? '#fff' : 'var(--text-faint)',
                            border: '1px solid var(--border)',
                          }}
                        >
                          {badge}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Sidebar Footer / AI Card */}
        <div style={{ padding: 12, borderTop: '1px solid var(--border-soft)' }}>
          {/* Ask SENIOR Card */}
          <div
            onClick={() => setAiOpen(true)}
            style={{
              padding: '12px 14px',
              borderRadius: 12,
              background: 'linear-gradient(135deg, rgba(59,130,246,0.12), rgba(139,92,246,0.12))',
              border: '1px solid rgba(59,130,246,0.3)',
              cursor: 'pointer',
              marginBottom: 10,
              transition: 'all 0.2s ease',
            }}
            className="card-interactive"
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12.5, fontWeight: 700, color: 'var(--text)' }}>
                <span style={{ color: 'var(--blue-light)' }}>✦</span> Ask SENIOR AI
              </div>
              <span
                style={{
                  width: 7,
                  height: 7,
                  borderRadius: '50%',
                  background: 'var(--green)',
                  boxShadow: '0 0 8px var(--green)',
                }}
              />
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-dim)', lineHeight: 1.3 }}>
              Mentor · 2026–2027 Context
            </div>
          </div>

          {/* Theme Switcher & User Profile Pill */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '4px 6px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
              <div
                style={{
                  width: 26,
                  height: 26,
                  borderRadius: '50%',
                  background: 'var(--card-hi)',
                  border: '1px solid var(--border)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 12,
                  fontWeight: 600,
                }}
              >
                Y
              </div>
              <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text)' }}>
                {data?.settings?.name || 'Yassin'}
              </div>
            </div>
            <button
              onClick={toggleTheme}
              className="btn-ghost"
              style={{ padding: '4px 8px', fontSize: 11 }}
              title="Toggle Theme"
            >
              {isDark ? '🌙' : '☀️'}
            </button>
          </div>
        </div>
      </aside>

      {/* Main App Container with Top Header Bar */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* Top Hybrid Header Bar */}
        <header
          style={{
            position: 'sticky',
            top: 0,
            zIndex: 20,
            background: 'var(--glass)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            borderBottom: '1px solid var(--border-soft)',
            padding: '12px 32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 16,
          }}
        >
          {/* Breadcrumb / Current Tab info */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 18 }}>{activeTabMeta.icon}</span>
            <div>
              <div style={{ fontSize: 11, color: 'var(--text-faint)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.6px' }}>
                SENIOR OS · {activeTabMeta.section}
              </div>
              <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)' }}>
                {activeTabMeta.label}
              </div>
            </div>
          </div>

          {/* Center Search / Command Launcher Pill */}
          <div
            onClick={() => setCommandOpen(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '6px 14px',
              background: 'var(--bg-elev)',
              border: '1px solid var(--border)',
              borderRadius: 20,
              cursor: 'pointer',
              color: 'var(--text-dim)',
              fontSize: 12,
              minWidth: 220,
              justifyContent: 'space-between',
            }}
            className="card-interactive"
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span>🔍</span>
              <span>Search or jump to...</span>
            </div>
            <span
              style={{
                fontSize: 10,
                fontWeight: 700,
                background: 'var(--card-hi)',
                padding: '2px 6px',
                borderRadius: 6,
                border: '1px solid var(--border-soft)',
              }}
            >
              Ctrl K
            </span>
          </div>

          {/* Center Glance Stats */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            {stats.avg != null && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '4px 11px',
                  background: 'var(--bg-elev)',
                  border: '1px solid var(--border)',
                  borderRadius: 20,
                  fontSize: 12,
                }}
              >
                <span style={{ color: 'var(--text-faint)' }}>GPA:</span>
                <span style={{ fontWeight: 700, color: stats.avg >= 90 ? 'var(--green)' : 'var(--blue)' }}>
                  {stats.avg.toFixed(1)}%
                </span>
              </div>
            )}

            {stats.pendingHw > 0 && (
              <div
                onClick={() => setTab('homework')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '4px 11px',
                  background: 'var(--amber-dim)',
                  border: '1px solid rgba(245,158,11,0.3)',
                  borderRadius: 20,
                  fontSize: 12,
                  color: 'var(--amber-light)',
                  cursor: 'pointer',
                }}
              >
                <span>📚</span>
                <span style={{ fontWeight: 600 }}>{stats.pendingHw} HW Due</span>
              </div>
            )}

            {stats.nextExam && (
              <div
                onClick={() => setTab('exams')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '4px 11px',
                  background: 'var(--red-dim)',
                  border: '1px solid rgba(239,68,68,0.3)',
                  borderRadius: 20,
                  fontSize: 12,
                  color: 'var(--red-light)',
                  cursor: 'pointer',
                }}
              >
                <span>📝</span>
                <span style={{ fontWeight: 600 }}>
                  {stats.nextExam.name} ({stats.nextExam.days === 0 ? 'Today' : `in ${stats.nextExam.days}d`})
                </span>
              </div>
            )}

            {/* Cloud Sync Status Pill */}
            <div
              onClick={() => setTab('settings')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '4px 11px',
                background:
                  syncStatus === 'synced'
                    ? 'var(--green-dim)'
                    : syncStatus === 'syncing'
                    ? 'var(--blue-dim)'
                    : 'var(--bg-elev)',
                border: `1px solid ${
                  syncStatus === 'synced' ? 'rgba(16,185,129,0.3)' : 'var(--border)'
                }`,
                borderRadius: 20,
                fontSize: 12,
                cursor: 'pointer',
                color:
                  syncStatus === 'synced'
                    ? 'var(--green)'
                    : syncStatus === 'syncing'
                    ? '#93C5FD'
                    : 'var(--text-faint)',
                fontWeight: 600,
              }}
              title="Cloud Database status (click to configure in Settings)"
            >
              <span>{syncStatus === 'synced' ? '☁️' : syncStatus === 'syncing' ? '🔄' : '💾'}</span>
              <span>{syncStatus === 'synced' ? 'Cloud Synced' : syncStatus === 'syncing' ? 'Syncing…' : 'Local Only'}</span>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {canInstall && (
              <button
                onClick={handleInstallApp}
                className="btn-ghost"
                style={{
                  padding: '7px 12px',
                  fontSize: 12.5,
                  borderColor: 'var(--blue)',
                  color: 'var(--blue-light)',
                  background: 'var(--blue-dim)',
                  fontWeight: 600,
                }}
                title="Install SENIOR OS to your desktop or home screen"
              >
                <span>📲</span>
                <span>Install App</span>
              </button>
            )}

            <button
              onClick={() => setQuickAddOpen((v) => !v)}
              className="btn-ghost"
              style={{ padding: '7px 13px', fontSize: 12.5 }}
            >
              <span>+</span>
              <span>Quick Add</span>
            </button>

            <button
              onClick={() => setAiOpen(true)}
              className="btn-primary"
              style={{
                padding: '7px 14px',
                fontSize: 12.5,
                background: 'linear-gradient(135deg, var(--blue), var(--violet))',
              }}
            >
              <span>✦</span>
              <span>Ask SENIOR</span>
            </button>
          </div>
        </header>

        {/* Content Body */}
        <main
          style={{
            flex: 1,
            padding: '24px 32px 100px',
            maxWidth: 1300,
            width: '100%',
            margin: '0 auto',
          }}
        >
          {children}
        </main>
      </div>

      {/* Global Command Palette (Ctrl+K) */}
      {commandOpen && (
        <div
          className="modal-overlay"
          onClick={() => setCommandOpen(false)}
          style={{ zIndex: 9999 }}
        >
          <div
            className="card-hi fade-in"
            style={{
              width: 520,
              maxWidth: '92vw',
              padding: 0,
              borderRadius: 16,
              overflow: 'hidden',
              boxShadow: '0 24px 60px rgba(0,0,0,0.7)',
              border: '1px solid var(--border-bright)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '14px 18px', borderBottom: '1px solid var(--border-soft)' }}>
              <span style={{ fontSize: 18, color: 'var(--blue)' }}>🔍</span>
              <input
                ref={searchInputRef}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Type a command or jump to page..."
                style={{
                  flex: 1,
                  background: 'transparent',
                  border: 'none',
                  fontSize: 15,
                  color: 'var(--text)',
                  padding: 0,
                  boxShadow: 'none',
                }}
              />
              <span style={{ fontSize: 11, background: 'var(--bg-elev)', padding: '3px 7px', borderRadius: 6, color: 'var(--text-faint)' }}>
                ESC
              </span>
            </div>

            <div style={{ maxHeight: 360, overflowY: 'auto', padding: 8 }} className="scrollbar-thin">
              {filteredCommands.length === 0 ? (
                <div style={{ padding: '24px 16px', textAlign: 'center', color: 'var(--text-faint)', fontSize: 13 }}>
                  No matching commands or pages.
                </div>
              ) : (
                filteredCommands.map((item, idx) => (
                  <div
                    key={idx}
                    className="nav-item"
                    onClick={() => {
                      if (item.type === 'nav') {
                        setTab(item.key);
                      } else if (item.type === 'action') {
                        item.action();
                      }
                      setCommandOpen(false);
                    }}
                    style={{
                      padding: '10px 14px',
                      borderRadius: 10,
                      justifyContent: 'space-between',
                      marginBottom: 2,
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <span style={{ fontSize: 16 }}>{item.icon}</span>
                      <span style={{ fontSize: 13.5, fontWeight: 500 }}>{item.label}</span>
                    </div>
                    <span style={{ fontSize: 11, color: 'var(--text-faint)', textTransform: 'uppercase', fontWeight: 600 }}>
                      {item.cat}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
