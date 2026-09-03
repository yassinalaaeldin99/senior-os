---
name: senior-os
description: Maintain and enhance Senior OS for Yassin's Grade 12 pre-med track, verifying UAE Ministry of Education calendar dates, subjects, teachers, and 35/30/35% grading formula.
---

# Senior OS Assistant Skill

This skill guides the agent in maintaining, enhancing, and debugging Senior OS — a personal student operating system for Grade 12 Senior Year (Class of 2027) targeting medical school admissions in the UAE.

## Core Rules & References

1. **Subjects & Teachers**:
   - Always retain the 8 core subjects and their designated teachers:
     - Math: Mr. Abdulaziz
     - Physics: Mr. Anas
     - Chemistry: Mr. Shadi
     - Biology: Mr. Mohammed
     - English: Mr. Haithem
     - Arabic: Mr. Hossam
     - Islamic Studies: Mr. Ismail
     - Social Studies: Mr. Karam

2. **UAE Ministry of Education (MOE) 2026–2027 Calendar**:
   - School Year Starts: August 31, 2026 (`2026-08-31`)
   - Mid-Term 1 Break: October 12 – 18, 2026 (`2026-10-12`)
   - Winter Break: December 14, 2026 – January 03, 2027 (`2026-12-14`)
   - Term 2 Resumes: January 04, 2027 (`2027-01-04`)
   - Spring Break: April 05 – 11, 2027 (`2027-04-05`)
   - Term 3 Resumes: April 12, 2027 (`2027-04-12`)
   - Official Graduation / Year End: July 02, 2027 (`2027-07-02`)

3. **Grading System**:
   - 3 Terms: Term 1 (35%), Term 2 (30%), Term 3 (35%)
   - Each term: School Component (2 exams × /20 = /40, scaled to /100) × 50% + Ministry Exam (/100) × 50%
   - Target: 95%+ overall average for medical school admission

4. **UI Conventions**:
   - Hybrid Layout: sticky top bar with breadcrumbs and live GPA, homework, exam countdown pills; left sidebar rail with categorized sections.
   - Separate view modes for primary tabs (Cards, Table, Kanban, Analytics).
   - Deep obsidian dark theme with vibrant accents.
