
# Personal Execution Tracker

A minimalist, high-performance execution tracker built for speed and focus.

## Stack
- **Framework**: Next.js 16 (App Router)
- **Styling**: Tailwind CSS v4
- **Database**: SQLite (better-sqlite3)
- **Deployment**: Vercel-ready structure (requires external DB like Turso/Postgres for persistence on serverless)

## Features

### 1. Execution Mode (Today Page)
-   **Daily Habits**: Define recurring habits (e.g., DSA, Gym) that appear every day automatically.
-   **Ad-Hoc Tasks**: Add one-off tasks for the specific day.
-   **Priority System**: Label tasks as **HIGH**, **MED**, or **LOW**.
-   **Notes per Task**: Expand any task to add specific details or blockers.
-   **Daily Reflection**: A large text area for "What mattered today?".
-   **TLE Tracking**: Track "Time Limit Exceeded" minutes or deep work time.

### 2. History & Analytics
-   **Streak View**: visual timeline of past days.
-   **Progress Bars**: visual completion rate for each day.
-   **Retrospective**: click any day to see exactly what was done, what was skipped, and your reflection notes.

### 3. Responsive Design
-   **Desktop**: Full-width dedicated sidebar layout.
-   **Mobile**: Bottom navigation bar, touch-optimized targets, one-handed usage.

## Setup

1.  **Install**:
    ```bash
    npm install
    ```

2.  **Run**:
    ```bash
    npm run dev
    ```

3.  **Login**:
    -   Email: `user@example.com`
    -   Password: `password`

## Database Note
This app uses a local `tracker.db` SQLite file. 
-   **Locally**: Data persists indefinitely.
-   **On Vercel**: Data will reset on deployments. For production, switch `src/lib/db.ts` to use a cloud database provider.
