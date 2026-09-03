import { useState, useEffect, useMemo, useRef } from 'react';
import { todayISO, daysBetween, overallAverage } from '../utils/helpers';

const STORAGE_KEY_THEME = 'senior_os_theme';

export function Layout({
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
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
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
        { key: 'ielts', label: 'IELTS Academic', icon: '🇬🇧' },
        { key: 'medicine', label: 'Medicine Track', icon: '🩺' },
      ],
    },
    {
      title: 'Preferences',
      items: [{ key: 'settings', label: 'Settings', icon: '⚙️' }],
    },
  ];

  // Calculate live badges
  const stats = useMemo(() => {
    const today = todayISO();
    const pendingHw = data.homework.filter((h) => h.status !== 'completed').length;
    const upcomingExams = data.exams.filter((e) => daysBetween(today, e.date) >= 0).length;
    const avg = overallAverage(data.grades);

    const nextExam = data.exams
      .map((e) => ({ ...e, days: daysBetween(today, e.date) }))
      .filter((e) => e.days >= 0)
      .sort((a, b) => a.days - b.days)[0];

    return { pendingHw, upcomingExams, avg, nextExam };
  }, [data]);

  // Find active item metadata for breadcrumbs
  const activeMeta = useMemo(() => {
    for (const sec of NAV_SECTIONS) {
      for (const it of sec.items) {
        if (it.key === currentTab) {
          return { section: sec.title, label: it.label, icon: it.icon };
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

  // Shared navigation items renderer
  const renderNavSectionItems = (onSelect) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
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
                badge = (
                  <span
                    style={{
                      fontSize: 10.5,
                      background: 'var(--amber-dim)',
                      color: 'var(--amber-light)',
                      padding: '2px 7px',
                      borderRadius: 10,
                      fontWeight: 600,
                    }}
                  >
                    {stats.pendingHw}
                  </span>
                );
              } else if (item.badgeKey === 'exams' && stats.upcomingExams > 0) {
                badge = (
                  <span
                    style={{
                      fontSize: 10.5,
                      background: 'var(--red-dim)',
                      color: 'var(--red-light)',
                      padding: '2px 7px',
                      borderRadius: 10,
                      fontWeight: 600,
                    }}
                  >
                    {stats.upcomingExams}
                  </span>
                );
              } else if (item.badgeKey === 'grades' && stats.avg != null) {
                badge = (
                  <span
                    style={{
                      fontSize: 10.5,
                      background: stats.avg >= 95 ? 'var(--green-dim)' : 'var(--blue-dim)',
                      color: stats.avg >= 95 ? 'var(--green)' : 'var(--blue-light)',
                      padding: '2px 7px',
                      borderRadius: 10,
                      fontWeight: 600,
                    }}
                  >
                    {stats.avg.toFixed(0)}%
                  </span>
                );
              }

              return (
                <div
                  key={item.key}
                  onClick={() => {
                    setTab(item.key);
                    if (onSelect) onSelect();
                  }}
                  className={`nav-item ${isActive ? 'active' : ''}`}
                >
                  <span style={{ fontSize: 16 }}>{item.icon}</span>
                  <span style={{ flex: 1, fontSize: 13 }}>{item.label}</span>
                  {badge}
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg)' }}>
      {/* Desktop Sidebar Rail */}
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
        className="desktop-sidebar scrollbar-thin"
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
        <div style={{ padding: '16px 12px', flex: 1 }}>
          {renderNavSectionItems()}
        </div>

        {/* AI Assistant Quick Pill */}
        <div style={{ padding: '12px 14px', borderTop: '1px solid var(--border-soft)' }}>
          <div
            onClick={() => setAiOpen(true)}
            className="card card-interactive"
            style={{
              padding: '10px 12px',
              background: 'linear-gradient(135deg, var(--bg-surface), var(--card-hi))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              cursor: 'pointer',
              border: '1px solid var(--border-bright)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 14, color: 'var(--blue)' }}>✦</span>
              <div>
                <div style={{ fontSize: 12, fontWeight: 600 }}>Ask SENIOR AI</div>
                <div style={{ fontSize: 10, color: 'var(--text-faint)' }}>Mentor · 2026-2027 Context</div>
              </div>
            </div>
            <span className="status-dot green" />
          </div>
        </div>

        {/* User Footer Profile & Theme Toggle */}
        <div
          style={{
            padding: '12px 14px',
            borderTop: '1px solid var(--border-soft)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: 12.5,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div
              style={{
                width: 26,
                height: 26,
                borderRadius: '50%',
                background: 'var(--blue-dim)',
                color: 'var(--blue-light)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: 11,
              }}
            >
              {(data.settings?.name || 'Y')[0]}
            </div>
            <span style={{ fontWeight: 600, color: 'var(--text-dim)' }}>
              {data.settings?.name || 'Yassin'}
            </span>
          </div>

          <button
            onClick={toggleTheme}
            className="btn-ghost"
            style={{ padding: '5px 9px', fontSize: 13 }}
            title="Toggle Light / Dark Mode"
          >
            {isDark ? '🌙' : '☀️'}
          </button>
        </div>
      </aside>

      {/* Main Workspace Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* Top Sticky Header Bar */}
        <header
          className="top-app-header"
          style={{
            position: 'sticky',
            top: 0,
            zIndex: 20,
            background: 'var(--glass)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            borderBottom: '1px solid var(--border-soft)',
            padding: '12px 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12,
          }}
        >
          {/* Left: Mobile hamburger & Breadcrumbs */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setMobileDrawerOpen(true)}
              className="mobile-only btn-ghost"
              style={{ padding: '6px 10px', fontSize: 16, minWidth: 36, minHeight: 36 }}
              aria-label="Open Navigation Menu"
            >
              ☰
            </button>

            {/* Breadcrumb Title */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
              <span style={{ fontSize: 17 }}>{activeMeta.icon}</span>
              <div style={{ lineHeight: 1.2 }}>
                <div
                  className="desktop-sidebar"
                  style={{ fontSize: 10.5, color: 'var(--text-faint)', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.4px' }}
                >
                  SENIOR OS · {activeMeta.section}
                </div>
                <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)' }}>
                  {activeMeta.label}
                </div>
              </div>
            </div>
          </div>

          {/* Center: Command Palette Trigger (Desktop only) */}
          <div
            onClick={() => setCommandOpen(true)}
            className="desktop-sidebar card-interactive"
            style={{
              padding: '6px 14px',
              borderRadius: 20,
              background: 'var(--bg-elev)',
              border: '1px solid var(--border)',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              fontSize: 12,
              color: 'var(--text-faint)',
              minWidth: 200,
              maxWidth: 320,
            }}
          >
            <span>🔍</span>
            <span style={{ flex: 1 }}>Search or jump to...</span>
            <kbd
              style={{
                background: 'var(--card)',
                padding: '2px 6px',
                borderRadius: 4,
                fontSize: 10,
                border: '1px solid var(--border)',
                fontWeight: 600,
              }}
            >
              Ctrl K
            </kbd>
          </div>

          {/* Right: Status Pills & Action Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            {/* Mobile Search Button */}
            <button
              onClick={() => setCommandOpen(true)}
              className="mobile-only btn-ghost"
              style={{ padding: '6px 8px', fontSize: 13, minWidth: 34, minHeight: 34 }}
              title="Search"
            >
              🔍
            </button>

            {/* Cloud Sync Status Pill */}
            <div
              onClick={() => setTab('settings')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '5px 10px',
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
                fontSize: 11.5,
                cursor: 'pointer',
                color:
                  syncStatus === 'synced'
                    ? 'var(--green)'
                    : syncStatus === 'syncing'
                    ? '#93C5FD'
                    : 'var(--text-faint)',
                fontWeight: 600,
              }}
              title="Cloud Database status"
            >
              <span>{syncStatus === 'synced' ? '☁️' : syncStatus === 'syncing' ? '🔄' : '💾'}</span>
              <span className="desktop-sidebar">{syncStatus === 'synced' ? 'Cloud Synced' : syncStatus === 'syncing' ? 'Syncing…' : 'Local'}</span>
            </div>

            {/* Install App Button */}
            {canInstall && (
              <button
                onClick={handleInstallApp}
                className="btn-ghost"
                style={{
                  padding: '6px 10px',
                  fontSize: 12,
                  borderColor: 'var(--blue)',
                  color: 'var(--blue-light)',
                  background: 'var(--blue-dim)',
                  fontWeight: 600,
                }}
                title="Install SENIOR OS to home screen"
              >
                <span>📲</span>
                <span className="desktop-sidebar">Install</span>
              </button>
            )}

            {/* Quick Add Button (Desktop) */}
            <button
              onClick={() => setQuickAddOpen((v) => !v)}
              className="desktop-sidebar btn-ghost"
              style={{ padding: '7px 13px', fontSize: 12.5 }}
            >
              <span>+</span>
              <span>Quick Add</span>
            </button>

            {/* Ask AI Button */}
            <button
              onClick={() => setAiOpen(true)}
              className="btn-primary"
              style={{
                padding: '6px 12px',
                fontSize: 12,
                background: 'linear-gradient(135deg, var(--blue), var(--violet))',
              }}
            >
              <span>✦</span>
              <span className="desktop-sidebar">Ask SENIOR</span>
            </button>
          </div>
        </header>

        {/* Content Body */}
        <main
          className="main-content"
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

      {/* Mobile Bottom Navigation Bar */}
      <nav
        className="mobile-only"
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          background: 'var(--glass)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          borderTop: '1px solid var(--border)',
          display: 'flex',
          justifyContent: 'space-around',
          alignItems: 'center',
          zIndex: 35,
          paddingBottom: 'max(6px, var(--safe-bottom))',
          paddingTop: 6,
          height: 'calc(58px + var(--safe-bottom))',
        }}
      >
        {[
          { key: 'dashboard', label: 'Home', icon: '🏠' },
          { key: 'homework', label: 'Tasks', icon: '📚' },
          { key: 'grades', label: 'GPA', icon: '📊' },
          { key: 'calendar', label: 'Calendar', icon: '📅' },
          { key: 'more', label: 'More', icon: '☰', isMore: true },
        ].map((tab) => {
          const isActive = tab.isMore ? mobileDrawerOpen : currentTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => {
                if (tab.isMore) setMobileDrawerOpen((v) => !v);
                else {
                  setTab(tab.key);
                  setMobileDrawerOpen(false);
                }
              }}
              style={{
                background: 'none',
                border: 'none',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 3,
                color: isActive ? 'var(--blue)' : 'var(--text-dim)',
                padding: '4px 8px',
                fontSize: 10.5,
                fontWeight: isActive ? 700 : 500,
                cursor: 'pointer',
                flex: 1,
                minHeight: 44,
              }}
            >
              <span style={{ fontSize: 18 }}>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Mobile Slide-Out Drawer Menu */}
      {mobileDrawerOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(5, 8, 15, 0.75)',
            backdropFilter: 'blur(6px)',
            WebkitBackdropFilter: 'blur(6px)',
            zIndex: 60,
            display: 'flex',
          }}
          onClick={() => setMobileDrawerOpen(false)}
        >
          <div
            className="slide-in-left scrollbar-thin"
            style={{
              width: 280,
              maxWidth: '84vw',
              height: '100%',
              background: 'var(--bg-elev)',
              borderRight: '1px solid var(--border)',
              display: 'flex',
              flexDirection: 'column',
              overflowY: 'auto',
              paddingBottom: 'calc(20px + var(--safe-bottom))',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drawer Header */}
            <div
              style={{
                padding: 'calc(16px + var(--safe-top)) 16px 14px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                borderBottom: '1px solid var(--border-soft)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div
                  style={{
                    width: 30,
                    height: 30,
                    borderRadius: 8,
                    background: 'linear-gradient(135deg, var(--blue), var(--violet))',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fff',
                    fontSize: 15,
                    fontWeight: 700,
                  }}
                >
                  ✦
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 16 }}>
                    SENIOR<span style={{ color: 'var(--blue)' }}>OS</span>
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-faint)' }}>Grade 12 · Class of 2027</div>
                </div>
              </div>
              <button
                onClick={() => setMobileDrawerOpen(false)}
                className="btn-ghost"
                style={{ padding: '6px 10px', fontSize: 14, minWidth: 36, minHeight: 36 }}
              >
                ✕
              </button>
            </div>

            {/* Navigation List */}
            <div style={{ padding: '16px 12px', flex: 1 }}>
              {renderNavSectionItems(() => setMobileDrawerOpen(false))}
            </div>

            {/* Drawer Theme & Profile Footer */}
            <div
              style={{
                padding: '12px 16px',
                borderTop: '1px solid var(--border-soft)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>
                👤 {data.settings?.name || 'Yassin'}
              </div>
              <button onClick={toggleTheme} className="btn-ghost" style={{ padding: '6px 10px', fontSize: 14 }}>
                {isDark ? '🌙' : '☀️'}
              </button>
            </div>
          </div>
        </div>
      )}

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

export default Layout;
