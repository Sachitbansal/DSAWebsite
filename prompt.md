You are a senior full-stack engineer and product architect.

I want you to build a COMPLETE production-ready DSA Tracking Web App for hardcore LeetCode + Striver preparation.

The app should focus on:

* measuring actual DSA grind time
* increasing attention span
* tracking consistency
* identifying weak areas
* tracking revision cycles
* maintaining a mistake journal
* being FAST and distraction-free

This is NOT a social app.
This is a personal productivity + analytics system for competitive coding / interview prep.

---

## CORE PHILOSOPHY

The app should:

* be minimal
* extremely fast
* keyboard-friendly
* low dopamine UI
* dark mode first
* plain clean interface
* no unnecessary animations
* no bloat

Think:

* GitHub contribution graph
* Linear.app simplicity
* Notion modularity
* Obsidian knowledge management
* LeetCode analytics

The goal is:
"maximize daily focused DSA hours"

---

## TECH STACK

Frontend:

* Next.js latest (App Router)
* TypeScript
* TailwindCSS
* shadcn/ui
* Zustand for state if needed
* Recharts for analytics
* React Query if needed

Backend:

* Node.js
* Express OR Next.js API routes
* PostgreSQL
* Prisma ORM

Authentication:

* Simple email/password auth
* JWT or NextAuth
* Single-user optimized initially

Deployment:

* Dockerized fully
* Docker Compose setup
* Nginx reverse proxy ready
* Production environment ready

Database:

* PostgreSQL container

Other:

* REST API architecture
* Clean modular folder structure
* Reusable components
* Mobile responsive
* Proper loading states
* Error handling
* ENV support

---

## PRIMARY FEATURES

# 1. DAILY DSA TIMER SYSTEM

The MOST important feature.

I need:

* start session button
* pause session
* stop session
* session labels:

  * LeetCode
  * Striver
  * Revision
  * Contest
  * Notes
  * Debugging
  * Mock Interview

During timer:

* show elapsed time
* fullscreen focus mode
* optional ambient ticking sound later
* prevent distractions
* attention tracking feel

Store:

* start time
* end time
* duration
* tags
* notes

Need:

* total focused hours today
* weekly focused hours
* monthly focused hours
* average session length
* longest streak

---

# 2. GITHUB STYLE STREAK GRID

Need a contribution heatmap like GitHub.

Each day should show:

* total focused hours
* number of problems solved
* intensity coloring

Hover tooltip:

* hours studied
* problems solved
* revisions done

Need:

* current streak
* longest streak
* freeze streak logic optional

---

# 3. PROBLEM TRACKER

Ability to add solved problems.

Fields:

* problem name
* platform
* difficulty
* topic tags
* solved independently? (yes/no)
* time taken
* revision count
* confidence rating
* notes
* problem URL
* date solved

Need filters:

* by topic
* by difficulty
* by platform
* weak areas
* revision pending

Need search.

---

# 4. FAILURE / MISTAKE JOURNAL

MOST IMPORTANT SECTION.

For every difficult problem:
Store:

* what I initially thought
* where I got stuck
* wrong intuition
* correct intuition
* missed pattern
* implementation bug
* edge case missed
* learning outcome

Need:

* markdown support
* searchable
* taggable

Need AI-ready structure for future analytics.

---

# 5. ALGORITHM KNOWLEDGE BASE

Section for storing algorithm notes.

Categories:

* Graphs
* DP
* Trees
* Binary Search
* Greedy
* Number Theory
* DSU
* Segment Trees
* etc

Each algorithm page should support:

* markdown editor
* code snippets
* complexity table
* common tricks
* edge cases
* templates

Need clean sidebar navigation.

---

# 6. PATTERN RECOGNITION SYSTEM

Separate from algorithms.

Examples:

* binary search on answer
* prefix sum recognition
* DSU connectivity pattern
* interval merging patterns
* state compression DP patterns

Need:

* tagging
* examples
* linked problems

---

# 7. REVISION SYSTEM

Very important.

Every problem should support:

* revision status
* spaced repetition

Need automatic queues:

* revisit after 2 days
* 7 days
* 21 days

Dashboard should show:

* revision due today
* overdue revisions

---

# 8. ANALYTICS DASHBOARD

Need beautiful but simple analytics.

Include:

* total hours
* total problems
* problems by topic
* average solve time
* strongest topics
* weakest topics
* consistency graph
* focus trend
* revision completion rate

Charts:

* line charts
* heatmaps
* pie charts
* streak charts

Keep UI minimal.

---

# 9. DAILY REVIEW PAGE

At end of day:
User answers:

* what went well
* what wasted time
* what was difficult
* what to improve tomorrow

Store reflections.

---

# 10. FOCUS MODE

Dedicated distraction-free screen:

* large timer
* today goals
* current task
* black minimal UI
* no navigation clutter

Inspired by Pomodoro apps.

---

## DATABASE DESIGN

Design normalized schema for:

* users
* sessions
* problems
* revisions
* mistake_journal
* algorithm_notes
* patterns
* analytics
* daily_reviews

Use Prisma schema.

---

## UI REQUIREMENTS

* Dark mode default
* Minimal monochrome UI
* Fast transitions
* Clean typography
* No excessive gradients
* Keyboard shortcuts
* Responsive layout
* Mobile friendly

Pages:

* Dashboard
* Timer
* Problems
* Analytics
* Notes
* Mistake Journal
* Revisions
* Daily Review
* Settings

---

## DOCKER + DEPLOYMENT

Need COMPLETE Docker setup.

Generate:

* Dockerfile frontend
* Dockerfile backend
* docker-compose.yml
* nginx.conf
* production-ready setup
* environment examples

Need:

* PostgreSQL service
* persistent volumes
* proper networking
* health checks

Also include:

* deployment instructions for Ubuntu VPS
* commands for:

  * build
  * restart
  * logs
  * backup DB

Need optimized production build.

---

## CODE QUALITY

Requirements:

* clean architecture
* modular components
* scalable folder structure
* proper comments
* reusable hooks
* TypeScript everywhere
* API validation with Zod
* secure auth
* rate limiting basics
* proper error boundaries

---

## BONUS FEATURES (IF EASY)

* import LeetCode submissions later
* CSV export
* markdown rendering
* keyboard-first UX
* command palette
* PWA support
* offline caching
* session auto-resume

---

## IMPORTANT

DO NOT overengineer.

Prioritize:

1. simplicity
2. speed
3. focus
4. maintainability

The app should feel:

* serious
* focused
* productivity-first
* distraction-free

Build MVP first.
Then scalable structure.

Generate:

1. folder architecture
2. DB schema
3. API routes
4. UI structure
5. Docker setup
6. deployment steps
7. starter implementation
8. production recommendations

Do NOT just explain.
Actually generate the codebase structure and implementation.
