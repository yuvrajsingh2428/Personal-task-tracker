import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');

    if (!date) return NextResponse.json({ error: 'Date required' }, { status: 400 });

    try {
        const db = await getDb();

        // 1. Get Daily Summary
        const summaryRes = await db.execute({ sql: 'SELECT * FROM daily_logs WHERE date = ?', args: [date] });
        let summary: any = summaryRes.rows[0];
        if (!summary) summary = { date, tle_minutes: 0, note: '', tomorrow_intent: '', dsa_done: 0, dev_done: 0, gym_done: 0 };

        // 2. STREAK CALCULATION
        const historyRes = await db.execute('SELECT date, dsa_done, dev_done, gym_done FROM daily_logs ORDER BY date DESC LIMIT 100');
        const history = historyRes.rows as any[];

        const calcStreak = (field: string) => {
            let streak = 0;
            // Check today (if done, count it. if not, check yesterday)
            // Actually, simple streak: Count consecutive days starting from latest done.
            // But we want "Current Streak".
            // If I missed yesterday, streak is 0 (unless I did today).

            // Simple algo:
            // Find most recent day with status=1.
            // If that day is Today or Yesterday, start counting back.
            // If most recent is 2 days ago, streak is 0.

            const todayStr = new Date().toISOString().split('T')[0];
            const yesterdayDate = new Date(); yesterdayDate.setDate(yesterdayDate.getDate() - 1);
            const yesterdayStr = yesterdayDate.toISOString().split('T')[0];

            let streakStart = -1;

            // Look for start
            for (let i = 0; i < history.length; i++) {
                if (history[i][field]) {
                    // found a done day.
                    // is it recent enough?
                    if (history[i].date === todayStr || history[i].date === yesterdayStr) {
                        streakStart = i;
                        break;
                    } else {
                        return 0; // Broken streak
                    }
                }
            }

            if (streakStart === -1) return 0;

            // Count backwards
            streak = 1;
            let lastDate = new Date(history[streakStart].date);

            for (let i = streakStart + 1; i < history.length; i++) {
                if (history[i][field]) {
                    const currDate = new Date(history[i].date);
                    const diff = (lastDate.getTime() - currDate.getTime()) / (1000 * 3600 * 24);
                    if (diff >= 0.9 && diff <= 1.1) { // roughly 1 day
                        streak++;
                        lastDate = currDate;
                    } else {
                        break; // gap
                    }
                } else {
                    break; // not done
                }
            }
            return streak;
        };

        const streaks = {
            dsa: calcStreak('dsa_done'),
            dev: calcStreak('dev_done'),
            gym: calcStreak('gym_done')
        };

        // 3. GYM SCHEDULE
        const gymRes = await db.execute('SELECT * FROM workout_schedule ORDER BY day_index');

        // 4. HABITS & TASKS (Standard)
        const habitsRes = await db.execute('SELECT * FROM habits WHERE is_archived = 0');
        const habits = habitsRes.rows;

        const existingTasksRes = await db.execute({ sql: 'SELECT habit_id FROM tasks WHERE date = ? AND habit_id IS NOT NULL', args: [date] });
        const existingIds = new Set(existingTasksRes.rows.map((t: any) => t.habit_id));
        const newHabits = habits.filter((h: any) => !existingIds.has(h.id));
        if (newHabits.length > 0) {
            const batch = newHabits.map((h: any) => ({
                sql: 'INSERT INTO tasks (date, title, priority, habit_id, completed) VALUES (?, ?, ?, ?, 0)',
                args: [date, h.title, h.priority, h.id]
            }));
            if (batch.length > 0) await db.batch(batch, 'write');
        }

        const tasksRes = await db.execute({
            sql: `
            SELECT t.*, s.title as section_title 
            FROM tasks t
            LEFT JOIN sections s ON t.section_id = s.id
            WHERE (t.date = ?) OR (t.date < ? AND t.completed = 0)
            ORDER BY t.priority DESC, t.id ASC
            `,
            args: [date, date]
        });

        // 5. Aux Data
        const sectionsRes = await db.execute('SELECT * FROM sections');
        const rulesRes = await db.execute('SELECT * FROM memory_rules');

        return NextResponse.json({
            ...summary,
            tasks: tasksRes.rows,
            sections: sectionsRes.rows,
            rules: rulesRes.rows,
            streaks,
            workout_schedule: gymRes.rows
        });
    } catch (e) {
        console.error(e);
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { date, tle_minutes, note, tomorrow_intent } = body;

        if (!date) return NextResponse.json({ error: 'Date required' }, { status: 400 });

        const db = await getDb();

        await db.execute({
            sql: `
            INSERT INTO daily_logs (
                date, tle_minutes, note, tomorrow_intent, 
                dsa_done, dev_done, gym_done, work_done, secondary_work_mins, focus_done,
                dsa_time, dsa_note, dev_time, dev_note, gym_time, gym_note
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT(date) DO UPDATE SET
                tle_minutes = COALESCE(excluded.tle_minutes, daily_logs.tle_minutes),
                note = COALESCE(excluded.note, daily_logs.note),
                tomorrow_intent = COALESCE(excluded.tomorrow_intent, daily_logs.tomorrow_intent),
                dsa_done = COALESCE(excluded.dsa_done, daily_logs.dsa_done),
                dev_done = COALESCE(excluded.dev_done, daily_logs.dev_done),
                gym_done = COALESCE(excluded.gym_done, daily_logs.gym_done),
                work_done = COALESCE(excluded.work_done, daily_logs.work_done),
                secondary_work_mins = COALESCE(excluded.secondary_work_mins, daily_logs.secondary_work_mins),
                focus_done = COALESCE(excluded.focus_done, daily_logs.focus_done),
                dsa_time = COALESCE(excluded.dsa_time, daily_logs.dsa_time),
                dsa_note = COALESCE(excluded.dsa_note, daily_logs.dsa_note),
                dev_time = COALESCE(excluded.dev_time, daily_logs.dev_time),
                dev_note = COALESCE(excluded.dev_note, daily_logs.dev_note),
                gym_time = COALESCE(excluded.gym_time, daily_logs.gym_time),
                gym_note = COALESCE(excluded.gym_note, daily_logs.gym_note)
            `,
            args: [
                date,
                tle_minutes ?? null, note ?? null, tomorrow_intent ?? null,
                body.dsa_done ?? null, body.dev_done ?? null, body.gym_done ?? null,
                body.work_done ?? null, body.secondary_work_mins ?? null, body.focus_done ?? null,
                body.dsa_time ?? null, body.dsa_note ?? null,
                body.dev_time ?? null, body.dev_note ?? null,
                body.gym_time ?? null, body.gym_note ?? null
            ]
        });

        return NextResponse.json({ success: true });
    } catch (e) {
        console.error(e);
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}
