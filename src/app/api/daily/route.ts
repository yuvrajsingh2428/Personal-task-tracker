
import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');

    if (!date) return NextResponse.json({ error: 'Date required' }, { status: 400 });

    const db = getDb();

    // 1. Get Daily Summary (including tomorrow_intent)
    let summary = db.prepare('SELECT * FROM daily_logs WHERE date = ?').get(date);
    if (!summary) summary = { date, tle_minutes: 0, note: '', tomorrow_intent: '' };

    // 2. Habits Logic (Ensure they exist for today)
    const habits = db.prepare('SELECT * FROM habits WHERE is_archived = 0').all();
    const existingHabitTasks = db.prepare('SELECT habit_id FROM tasks WHERE date = ? AND habit_id IS NOT NULL').all(date);
    const existingIds = new Set(existingHabitTasks.map((t: any) => t.habit_id));

    const insertTask = db.prepare('INSERT INTO tasks (date, title, priority, habit_id, completed) VALUES (?, ?, ?, ?, 0)');
    const transaction = db.transaction(() => {
        habits.forEach((h: any) => {
            if (!existingIds.has(h.id)) {
                insertTask.run(date, h.title, h.priority, h.id);
            }
        });
    });
    transaction();

    // 3. FETCH TASKS (Including Carry-over)
    const tasks = db.prepare(`
    SELECT t.*, s.title as section_title 
    FROM tasks t
    LEFT JOIN sections s ON t.section_id = s.id
    WHERE 
      (t.date = ?) 
      OR 
      (t.date < ? AND t.completed = 0)
    ORDER BY t.priority DESC, t.id ASC
  `).all(date, date);

    // 4. Fetch Aux Data
    const sections = db.prepare('SELECT * FROM sections').all();
    const rules = db.prepare('SELECT * FROM memory_rules').all();

    return NextResponse.json({ ...summary, tasks, sections, rules });
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { date, tle_minutes, note, tomorrow_intent } = body;

        if (!date) return NextResponse.json({ error: 'Date required' }, { status: 400 });

        const db = getDb();

        // Dynamic update set
        // Check if row exists first to handle partial updates cleanly or use Upsert

        db.prepare(`
      INSERT INTO daily_logs (date, tle_minutes, note, tomorrow_intent)
      VALUES (@date, @tle_minutes, @note, @tomorrow_intent)
      ON CONFLICT(date) DO UPDATE SET
        tle_minutes = COALESCE(@tle_minutes, tle_minutes),
        note = COALESCE(@note, note),
        tomorrow_intent = COALESCE(@tomorrow_intent, tomorrow_intent)
    `).run({
            date,
            tle_minutes: tle_minutes !== undefined ? tle_minutes : null,
            note: note !== undefined ? note : null,
            tomorrow_intent: tomorrow_intent !== undefined ? tomorrow_intent : null
        });

        return NextResponse.json({ success: true });
    } catch (e) {
        return NextResponse.json({ error: 'Failed to save summary' }, { status: 500 });
    }
}
