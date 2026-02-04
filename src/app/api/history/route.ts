import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getUserId } from '@/lib/auth-util';

export async function GET() {
    const userId = await getUserId();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const db = await getDb();

        // Get all logs for summary (Filtered by user_id)
        const dailyLogsRes = await db.execute({ sql: 'SELECT * FROM daily_logs WHERE user_id = ?', args: [userId] });
        const dailyLogs = dailyLogsRes.rows;

        // Get all tasks with section title (Filtered by user_id)
        const tasksRes = await db.execute({
            sql: `
            SELECT t.*, s.title as section_title 
            FROM tasks t 
            LEFT JOIN sections s ON t.section_id = s.id 
            WHERE t.user_id = ?
            ORDER BY t.priority DESC
        `, args: [userId]
        });
        const tasks = tasksRes.rows;

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
                ...summary
            };
        });

        return NextResponse.json(history);
    } catch (e) {
        return NextResponse.json({ error: 'Failed to fetch history' }, { status: 500 });
    }
}
