
import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function GET() {
    const db = getDb();

    // Get all logs for summary
    const dailyLogs = db.prepare('SELECT * FROM daily_logs').all();
    // Get all tasks (archived or not) associated with dates to reconstruct history
    const tasks = db.prepare('SELECT * FROM tasks ORDER BY priority DESC').all();

    // We need to form a list of unique dates from both logs and tasks
    const dates = new Set([
        ...dailyLogs.map((l: any) => l.date),
        ...tasks.map((t: any) => t.date)
    ]);

    const history = Array.from(dates).sort().reverse().map(date => {
        const summary = dailyLogs.find((l: any) => l.date === date) || {};
        const dayTasks = tasks.filter((t: any) => t.date === date);

        return {
            date,
            note: summary.note || '',
            tle_minutes: summary.tle_minutes || 0,
            tasks: dayTasks
        };
    });

    return NextResponse.json(history);
}
