import { uid } from '../utils/helpers';

export const SUBJECTS = [
  { key: 'mathematics', label: 'Mathematics', emoji: '📐', color: '#9C87F5', teacher: 'Mr. Abdulaziz' },
  { key: 'physics', label: 'Physics', emoji: '⚡', color: '#F0A93F', teacher: 'Mr. Anas' },
  { key: 'chemistry', label: 'Chemistry', emoji: '🧪', color: '#5B8DEF', teacher: 'Mr. Shadi' },
  { key: 'biology', label: 'Biology', emoji: '🧬', color: '#3ED68C', teacher: 'Mr. Mohammed' },
  { key: 'english', label: 'English', emoji: '🇬🇧', color: '#4EA8DE', teacher: 'Mr. Haithem' },
  { key: 'arabic', label: 'Arabic', emoji: '📖', color: '#E07A5F', teacher: 'Mr. Hossam' },
  { key: 'islamic', label: 'Islamic Studies', emoji: '🕌', color: '#52B788', teacher: 'Mr. Ismail' },
  { key: 'social_studies', label: 'Social Studies', emoji: '🌍', color: '#DDA15E', teacher: 'Mr. Karam' },
  { key: 'other', label: 'Other', emoji: '📚', color: '#9AA6B8', teacher: '' },
];

export const subjInfo = (k) => SUBJECTS.find((s) => s.key === k) || SUBJECTS[SUBJECTS.length - 1];

export const PRIORITIES = {
  high: { label: 'High', color: 'var(--red)' },
  medium: { label: 'Medium', color: 'var(--amber)' },
  low: { label: 'Low', color: 'var(--green)' },
};

export const STATUSES = {
  not_started: { label: 'Not Started', color: 'var(--text-faint)' },
  in_progress: { label: 'In Progress', color: 'var(--blue)' },
  completed: { label: 'Completed', color: 'var(--green)' },
  overdue: { label: 'Overdue', color: 'var(--red)' },
};

export const TERMS = [
  { key: 'term1', label: 'Term 1', weight: 0.35, dates: 'Aug 31, 2026 – Dec 11, 2026' },
  { key: 'term2', label: 'Term 2', weight: 0.30, dates: 'Jan 04, 2027 – Apr 02, 2027' },
  { key: 'term3', label: 'Term 3', weight: 0.35, dates: 'Apr 12, 2027 – Jul 02, 2027' },
];

export const emptyTerm = () => ({ school1: null, school2: null, ministry: null });

// Official UAE Ministry of Education Approved Academic Calendar 2026-2027
export const UAE_MOE_CALENDAR_2026_2027 = [
  {
    key: 'start',
    eventEn: 'Start of Academic Year for Students',
    eventAr: 'بداية العام الدراسي للطلبة',
    startDate: '2026-08-31',
    endDate: '2026-08-31',
    type: 'milestone',
    emoji: '🎒',
    badge: 'Term 1 Start',
  },
  {
    key: 'term1_mid',
    eventEn: 'Term 1 Mid-Term Break',
    eventAr: 'إجازة منتصف الفصل الدراسي الأول',
    startDate: '2026-10-12',
    endDate: '2026-10-18',
    type: 'break',
    emoji: '🍂',
    badge: 'Mid-Term 1',
  },
  {
    key: 'winter_break',
    eventEn: 'Winter Break for Students',
    eventAr: 'إجازة الشتاء للطلبة',
    startDate: '2026-12-14',
    endDate: '2027-01-03',
    type: 'break',
    emoji: '❄️',
    badge: 'Winter Vacation',
  },
  {
    key: 'term2_start',
    eventEn: 'Term 2 Classes Resume',
    eventAr: 'استئناف الدراسة للفصل الدراسي الثاني',
    startDate: '2027-01-04',
    endDate: '2027-01-04',
    type: 'milestone',
    emoji: '📖',
    badge: 'Term 2 Start',
  },
  {
    key: 'spring_break',
    eventEn: 'Spring Break for Students',
    eventAr: 'إجازة الربيع للطلبة',
    startDate: '2027-04-05',
    endDate: '2027-04-11',
    type: 'break',
    emoji: '🌸',
    badge: 'Spring Vacation',
  },
  {
    key: 'term3_start',
    eventEn: 'Term 3 Classes Resume (Final Term)',
    eventAr: 'استئناف الدراسة للفصل الدراسي الثالث والأخير',
    startDate: '2027-04-12',
    endDate: '2027-04-12',
    type: 'milestone',
    emoji: '🚀',
    badge: 'Term 3 Start',
  },
  {
    key: 'graduation',
    eventEn: 'End of Academic Year & Official Graduation',
    eventAr: 'نهاية العام الدراسي للطلبة والتخرج الرسمي',
    startDate: '2027-07-02',
    endDate: '2027-07-02',
    type: 'graduation',
    emoji: '🎓',
    badge: 'Graduation Day',
  },
];

export const MONTHS = [
  'August',
  'September',
  'October',
  'November',
  'December',
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
];

export const MONTH_FOCUS = {
  August: {
    title: 'Senior Year Kickoff',
    points: [
      'Official UAE school start: August 31, 2026',
      'Meet subject teachers and collect syllabus',
      'Set study schedule and desk environment',
    ],
  },
  September: {
    title: 'Start Strong',
    points: [
      'Establish daily study routine',
      'Track every homework assignment',
      'Build continuous study habits',
      'Start IELTS preparation',
      'Research medical career options',
    ],
  },
  October: {
    title: 'Mid-Term & Momentum',
    points: [
      'Term 1 Mid-Term Break (Oct 12-18)',
      'School Exam 1 prep across all subjects',
      'Continue IELTS mock tests',
      'Start serious country research for medicine',
    ],
  },
  November: {
    title: 'Prepare for Ministry Finals',
    points: [
      'School Exam 2 completion',
      'Strong academic performance for 35% Term 1 weight',
      'Intensify IELTS prep before December test',
      'Build country and tuition comparison list',
    ],
  },
  December: {
    title: 'Winter Break & Milestones',
    points: [
      'Winter Break begins December 14, 2026',
      'Finish IELTS target (7.5+)',
      'Choose destination country for medicine',
      'Select target universities before 2027',
    ],
  },
  January: {
    title: 'Term 2 Begins',
    points: [
      'Classes resume January 4, 2027',
      'Confirm medical universities and requirements',
      'Start university application dossiers',
      'Target 30% weight in Term 2',
    ],
  },
  February: {
    title: 'Applications Groundwork',
    points: [
      'Refine personal statements and recommendation letters',
      'Maintain strong subject grades in School Exams',
      'Follow up on medical school deadlines',
    ],
  },
  March: {
    title: 'Spring Revision & Push',
    points: [
      'Term 2 Ministry examinations',
      'Finalize international applications',
      'Prepare for upcoming Spring Break',
    ],
  },
  April: {
    title: 'Spring Break & Term 3 Launch',
    points: [
      'Spring Break: April 5 - 11, 2027',
      'Term 3 begins April 12, 2027 (Final 35% weight)',
      'Begin intensive review of Grade 12 curriculum',
    ],
  },
  May: {
    title: 'Final Ministry Exam Season',
    points: [
      'Peak revision for Ministry Exit Examinations',
      'Master past papers in Physics, Chemistry, Biology & Math',
      'Prioritize sleep and mental readiness',
    ],
  },
  June: {
    title: 'Final Push to Graduation',
    points: [
      'Complete final graduation requirements',
      'Track incoming university admission offers',
      'Celebrate senior year achievements',
    ],
  },
  July: {
    title: 'Official Graduation Day',
    points: [
      'Official UAE Academic Year End: July 2, 2027',
      'Graduation ceremony and senior diploma celebration',
      'Finalize visa, medical school enrollment, and housing',
    ],
  },
};

export const DEFAULT_MILESTONES = [
  { id: 'm1', name: 'Academic Year Starts (MOE Approved)', date: '2026-08-31', emoji: '🎒', official: true },
  { id: 'm2', name: 'Term 1 Mid-Term Break (Oct 12 - 18)', date: '2026-10-12', emoji: '🍂', official: true },
  { id: 'm3', name: 'Winter Break Begins (Term 1 Ends)', date: '2026-12-14', emoji: '❄️', official: true },
  { id: 'm4', name: 'IELTS Completed Target', date: '2026-12-20', emoji: '🇬🇧' },
  { id: 'm5', name: 'Medical Country Selected', date: '2026-12-27', emoji: '🌍' },
  { id: 'm6', name: 'Medical University Selected', date: '2027-01-03', emoji: '🩺' },
  { id: 'm7', name: 'Term 2 Begins (Classes Resume)', date: '2027-01-04', emoji: '📖', official: true },
  { id: 'm8', name: 'University Applications Submitted', date: '2027-03-01', emoji: '📝' },
  { id: 'm9', name: 'Spring Break (Apr 05 - 11)', date: '2027-04-05', emoji: '🌸', official: true },
  { id: 'm10', name: 'Term 3 Begins (Final Term)', date: '2027-04-12', emoji: '🚀', official: true },
  { id: 'm11', name: 'End of Academic Year & Graduation', date: '2027-07-02', emoji: '🎓', official: true },
];

export const COUNTRY_LIB = [
  { name: 'Germany', flag: '🇩🇪' },
  { name: 'UK', flag: '🇬🇧' },
  { name: 'UAE', flag: '🇦🇪' },
  { name: 'Egypt', flag: '🇪🇬' },
  { name: 'Hungary', flag: '🇭🇺' },
  { name: 'Ireland', flag: '🇮🇪' },
  { name: 'Australia', flag: '🇦🇺' },
  { name: 'Canada', flag: '🇨🇦' },
  { name: 'USA', flag: '🇺🇸' },
  { name: 'Poland', flag: '🇵🇱' },
  { name: 'Czech Republic', flag: '🇨🇿' },
  { name: 'Netherlands', flag: '🇳🇱' },
];

export const STORAGE_KEY_THEME = 'senior-os-theme';
export const STORAGE_KEY = 'senior-os-data-v1';

export const defaultData = () => {
  const mkSubjGrades = () => ({
    term1: emptyTerm(),
    term2: emptyTerm(),
    term3: emptyTerm(),
  });
  return {
    homework: [],
    exams: [],
    study: [],
    grades: Object.fromEntries(
      SUBJECTS.filter((s) => s.key !== 'other').map((s) => [s.key, mkSubjGrades()])
    ),
    goals: {
      year: [
        { id: uid(), text: 'Graduate Senior Year with 95%+', done: false },
        { id: uid(), text: 'Excellent Mathematics grade (Mr. Abdulaziz)', done: false },
        { id: uid(), text: 'Excellent Physics grade (Mr. Anas)', done: false },
        { id: uid(), text: 'Excellent Chemistry grade (Mr. Shadi)', done: false },
        { id: uid(), text: 'Excellent Biology grade (Mr. Mohammed)', done: false },
        { id: uid(), text: 'Excellent English grade (Mr. Haithem)', done: false },
        { id: uid(), text: 'Excellent Arabic grade (Mr. Hossam)', done: false },
        { id: uid(), text: 'Excellent Islamic Studies grade (Mr. Ismail)', done: false },
        { id: uid(), text: 'Excellent Social Studies grade (Mr. Karam)', done: false },
        { id: uid(), text: 'IELTS 7.5+', done: false },
        { id: uid(), text: 'Choose medical-study country', done: false },
        { id: uid(), text: 'Choose target university', done: false },
      ],
      monthly: {},
      weekly: [],
    },
    ielts: {
      target: 7.5,
      current: { listening: 7.0, reading: 7.0, writing: 6.0, speaking: 6.5 },
      examDate: '2026-12-15',
      sessions: [],
      mockTests: [],
    },
    medicine: {
      countries: [],
      universities: [],
      decidedCountry: null,
      decidedUniversity: null,
    },
    milestones: DEFAULT_MILESTONES.map((m) => ({ ...m, done: false })),
    settings: {
      name: 'Yassin',
      yearStart: '2026-08-31',
      graduation: '2027-07-02',
    },
  };
};
