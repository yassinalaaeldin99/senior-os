import { useState, useEffect, useRef } from 'react';
import { STORAGE_KEY, defaultData, SUBJECTS, emptyTerm, DEFAULT_MILESTONES } from '../constants/data';
import { fetchCloudData, saveCloudData } from '../services/supabase';

export function useStore() {
  const [data, setData] = useState(null);
  const [ready, setReady] = useState(false);
  const [syncStatus, setSyncStatus] = useState('local'); // 'local' | 'syncing' | 'synced' | 'error'
  const isInitialCloudSyncDone = useRef(false);

  // Migrate state to latest schema and official UAE MOE dates
  function migrateState(d) {
    if (!d) return d;

    // Migrate grades from old array format to structured term format
    if (Array.isArray(d.grades)) {
      const mkSubj = () => ({ term1: emptyTerm(), term2: emptyTerm(), term3: emptyTerm() });
      d.grades = Object.fromEntries(
        SUBJECTS.filter((s) => s.key !== 'other').map((s) => [s.key, mkSubj()])
      );
    }
    SUBJECTS.filter((s) => s.key !== 'other').forEach((s) => {
      if (!d.grades[s.key]) {
        d.grades[s.key] = { term1: emptyTerm(), term2: emptyTerm(), term3: emptyTerm() };
      }
    });

    // Update settings with official UAE Ministry of Education calendar dates
    if (!d.settings) d.settings = {};
    if (!d.settings.yearStart || d.settings.yearStart === '2026-09-01') {
      d.settings.yearStart = '2026-08-31';
    }
    if (!d.settings.graduation || d.settings.graduation === '2027-06-15' || d.settings.graduation === '2027-06-25') {
      d.settings.graduation = '2027-07-02';
    }

    // Ensure official milestones exist
    if (!d.milestones || d.milestones.length < 8) {
      d.milestones = DEFAULT_MILESTONES.map((m) => ({ ...m, done: false }));
    }

    return d;
  }

  // 1. Initial Load: Load local storage first for instant render
  useEffect(() => {
    (async () => {
      let localState = null;
      try {
        if (typeof window !== 'undefined' && window.storage && typeof window.storage.get === 'function') {
          const res = await window.storage.get(STORAGE_KEY);
          if (res && res.value) localState = JSON.parse(res.value);
        }
        if (!localState && typeof localStorage !== 'undefined') {
          const local = localStorage.getItem(STORAGE_KEY);
          if (local) localState = JSON.parse(local);
        }
      } catch (e) {
        console.warn('Local read error:', e);
      }

      const activeState = localState ? migrateState(localState) : defaultData();
      setData(activeState);
      setReady(true);

      // 2. Cloud Sync: Fetch from Supabase in background
      try {
        setSyncStatus('syncing');
        const cloudRes = await fetchCloudData();
        if (cloudRes.success) {
          if (cloudRes.data) {
            // Cloud has data — merge into active state
            const cloudMigrated = migrateState(cloudRes.data);
            setData(cloudMigrated);
            setSyncStatus('synced');
            if (typeof localStorage !== 'undefined') {
              localStorage.setItem(STORAGE_KEY, JSON.stringify(cloudMigrated));
            }
          } else {
            // Cloud is empty, push local state up to Supabase!
            await saveCloudData(activeState);
            setSyncStatus('synced');
          }
        } else {
          setSyncStatus('local');
        }
      } catch (err) {
        console.warn('Initial cloud sync error:', err);
        setSyncStatus('local');
      } finally {
        isInitialCloudSyncDone.current = true;
      }
    })();
  }, []);

  // 3. Save to localStorage immediately and debounce save to Supabase
  useEffect(() => {
    if (!ready || !data) return;

    // Instant local save
    const serialized = JSON.stringify(data);
    if (typeof localStorage !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_KEY, serialized);
      } catch (e) {}
    }

    // Debounced cloud save
    if (isInitialCloudSyncDone.current) {
      setSyncStatus('syncing');
      const t = setTimeout(async () => {
        try {
          const res = await saveCloudData(data);
          setSyncStatus(res.success ? 'synced' : 'local');
        } catch (err) {
          setSyncStatus('local');
        }
      }, 800);
      return () => clearTimeout(t);
    }
  }, [data, ready]);

  return [data, setData, ready, syncStatus];
}
