# SENIOR OS — Workspace Guidelines & Architecture

## Student Profile & Objectives
- **Student Name**: Yassin
- **Academic Year**: Grade 12 / Senior Year (Class of 2027)
- **Target Career**: Medicine / Pre-Med Study Abroad
- **Academic Goal**: 95%+ Annual GPA & IELTS Academic 7.5+ Band

## Official Curriculum Subjects & Teachers
Always maintain these exact subjects, teachers, and visual markers:
- 📐 **Mathematics**: Mr. Abdulaziz (`#9C87F5`, `mathematics`)
- ⚡ **Physics**: Mr. Anas (`#F0A93F`, `physics`)
- 🧪 **Chemistry**: Mr. Shadi (`#5B8DEF`, `chemistry`)
- 🧬 **Biology**: Mr. Mohammed (`#3ED68C`, `biology`)
- 🇬🇧 **English**: Mr. Haithem (`#4EA8DE`, `english`)
- 📖 **Arabic**: Mr. Hossam (`#E07A5F`, `arabic`)
- 🕌 **Islamic Studies**: Mr. Ismail (`#52B788`, `islamic`)
- 🌍 **Social Studies**: Mr. Karam (`#DDA15E`, `social_studies`)
- 📚 **Other**: (`#9AA6B8`, `other`)

## Official UAE Ministry of Education (MOE) Academic Calendar (2026–2027)
Decreed by the UAE Ministry of Education for government and private schools:
1. **School Year Starts (بداية العام الدراسي للطلبة)**: August 31, 2026 (`2026-08-31`)
2. **Term 1 Mid-Term Break (إجازة منتصف الفصل الدراسي الأول)**: October 12 – 18, 2026 (`2026-10-12` – `2026-10-18`)
3. **Winter Break (إجازة الشتاء للطلبة)**: December 14, 2026 – January 03, 2027 (`2026-12-14` – `2027-01-03`)
   - *Term 2 Resumes*: January 04, 2027 (`2027-01-04`)
4. **Spring Break (إجازة الربيع للطلبة)**: April 05 – 11, 2027 (`2027-04-05` – `2027-04-11`)
   - *Term 3 Resumes*: April 12, 2027 (`2027-04-12`)
5. **End of Academic Year & Graduation (نهاية العام الدراسي والتخرج)**: July 02, 2027 (`2027-07-02`)

## UAE Ministerial Grading System (Weights & Formula)
- **3 Terms Structure**:
  - **Term 1**: 35% of Annual Grade
  - **Term 2**: 30% of Annual Grade
  - **Term 3**: 35% of Annual Grade
- **Within Each Term**:
  - Continuous School Assessments: 2 School Exams (/20 each, total /40 scaled to /100) = **50% of Term**
  - Official Ministry Exam (/100) = **50% of Term**
  - Term Grade = `(School 1 + School 2) / 40 × 50% + Ministry Exam / 100 × 50%`
- **Annual Grade Formula**:
  - Annual Grade = `(Term 1 × 0.35) + (Term 2 × 0.30) + (Term 3 × 0.35)`

## Design System & UI Principles
- **Layout**: Hybrid Layout — sticky top glassmorphic header bar (with breadcrumbs, live GPA badge, pending HW, next exam countdown, and quick search launcher) paired with a categorized left navigation rail.
- **Theme**: Deep Obsidian Dark Mode (`#080C14`, `#0D131F`, `#121A2A`) by default, with glowing accent borders (`rgba(255,255,255,0.07)`), glassmorphism, and responsive design.
- **Separate View Modes**: Every primary tab must provide dedicated segmented view modes (e.g. Cards View, Table/Matrix View, Kanban Board, Analytics).
- **SENIOR AI Mentor**: Embedded assistant powered by Gemini Flash Lite with sub-second streaming and automated planner actions (`add_homework`, `add_exam`, `add_study`, `add_goal`, `add_university`, `add_country`).

## Tech Stack & Conventions
- **Framework**: React 18, Vite, vanilla ES modules
- **Build & Quality**: Always verify changes compile with `npm run build` with zero errors.
- **Persistence**: Safe browser `localStorage` under `senior-os-data-v1` with fallback migration.
