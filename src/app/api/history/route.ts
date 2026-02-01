import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function GET() {
    try {
        const db = await getDb();

        // Get all logs for summary
        const dailyLogsRes = await db.execute('SELECT * FROM daily_logs');
        const dailyLogs = dailyLogsRes.rows;

        // Get all tasks with section title
        const tasksRes = await db.execute(`
            SELECT t.*, s.title as section_title 
            FROM tasks t 
            LEFT JOIN sections s ON t.section_id = s.id 
            ORDER BY t.priority DESC
        `);
        const tasks = tasksRes.rows;

        // Form unique dates list
        const dates = new Set([
            ...dailyLogs.map((l: any) => l.date),
            ...tasks.map((t: any) => t.date)
        ]);

        const history = Array.from(dates).sort().reverse().map(date => {
            const summary: any = dailyLogs.find((l: any) => l.date === date) || {};
            const dayTasks = tasks.filter((t: any) => t.date === date);

            return {
                date,
                tasks: dayTasks,
                ...summary // Spread all daily_log fields (dsa_time, dsa_note, etc.)
            };
        });

        return NextResponse.json(history);
    } catch (e) {
        return NextResponse.json({ error: 'Failed to fetch history' }, { status: 500 });
    }
}
