export const uid = () => Math.random().toString(36).slice(2, 10);

export const todayISO = () => new Date().toISOString().slice(0, 10);

export const fmtDate = (iso) => {
  if (!iso) return '—';
  const d = new Date(iso + 'T00:00:00');
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
};

export const daysBetween = (a, b) =>
  Math.round((new Date(b + 'T00:00:00') - new Date(a + 'T00:00:00')) / 86400000);

export const startOfWeek = (d) => {
  const dt = new Date(d);
  const day = dt.getDay();
  const diff = (day === 0 ? -6 : 1) - day;
  dt.setDate(dt.getDate() + diff);
  return dt.toISOString().slice(0, 10);
};

export const timeOfDay = () => {
  const h = new Date().getHours();
  return h < 12 ? 'morning' : h < 18 ? 'afternoon' : 'evening';
};

export const fmtMins = (m) => {
  const h = Math.floor(m / 60);
  const mm = m % 60;
  return h > 0 ? `${h}h ${mm}m` : `${mm}m`;
};

/**
 * UAE Grading System:
 * Each term: school component (2 exams × /20 = /40, scaled to /100) × 50%
 *          + ministry exam (/100) × 50%
 * Annual = Term1 × 35% + Term2 × 30% + Term3 × 35%
 */
export const calcTermGrade = (term) => {
  if (!term) return null;
  const { school1, school2, ministry } = term;
  const hasSchool = school1 != null || school2 != null;
  const hasMinistry = ministry != null;
  if (!hasSchool && !hasMinistry) return null;
  // School: two exams each /20, total /40, scaled to /100
  const schoolTotal = (Number(school1) || 0) + (Number(school2) || 0);
  const schoolPct = (schoolTotal / 40) * 100;
  const ministryPct = Number(ministry) || 0;
  if (hasSchool && hasMinistry) return schoolPct * 0.5 + ministryPct * 0.5;
  if (hasSchool) return schoolPct; // only school entered so far
  return ministryPct; // only ministry entered
};

export const calcAnnualGrade = (subjGrades) => {
  if (!subjGrades) return null;
  const weights = [0.35, 0.30, 0.35];
  const termKeys = ['term1', 'term2', 'term3'];
  let num = 0, den = 0;
  termKeys.forEach((k, i) => {
    const tg = calcTermGrade(subjGrades[k]);
    if (tg != null) { num += tg * weights[i]; den += weights[i]; }
  });
  return den > 0 ? num / den : null;
};

/** Overall average across all subjects */
export const overallAverage = (grades) => {
  if (!grades || typeof grades !== 'object') return null;
  const vals = Object.values(grades).map(calcAnnualGrade).filter((v) => v != null);
  return vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : null;
};

export const currentSeniorMonth = (yearStart) => {
  const now = new Date();
  const idx = now.getMonth(); // 0=Jan
  const map = {
    7: 'August',
    8: 'September',
    9: 'October',
    10: 'November',
    11: 'December',
    0: 'January',
    1: 'February',
    2: 'March',
    3: 'April',
    4: 'May',
    5: 'June',
    6: 'July',
  };
  return map[idx] || 'September';
};

export const monthProgress = (monthName, yearStart) => {
  const yearMap = {
    August: 2026,
    September: 2026,
    October: 2026,
    November: 2026,
    December: 2026,
    January: 2027,
    February: 2027,
    March: 2027,
    April: 2027,
    May: 2027,
    June: 2027,
    July: 2027,
  };
  const monthIdx = {
    August: 7,
    September: 8,
    October: 9,
    November: 10,
    December: 11,
    January: 0,
    February: 1,
    March: 2,
    April: 3,
    May: 4,
    June: 5,
    July: 6,
  };
  const y = yearMap[monthName];
  const mi = monthIdx[monthName];
  if (y === undefined || mi === undefined) return 0;
  const start = new Date(y, mi, 1);
  const end = new Date(y, mi + 1, 1);
  const now = new Date();
  if (now < start) return 0;
  if (now >= end) return 100;
  return Math.round(((now - start) / (end - start)) * 100);
};

export const pctDone = (homework) => {
  if (!homework || !homework.length) return '—';
  const done = homework.filter((h) => h.status === 'completed').length;
  return Math.round((done / homework.length) * 100) + '%';
};
