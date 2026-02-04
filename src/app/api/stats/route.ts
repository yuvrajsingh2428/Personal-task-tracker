import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getUserId } from '@/lib/auth-util';

export async function GET() {
  const userId = await getUserId();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const db = await getDb();

    // Get last 7 days range
    const endDate = new Date().toISOString().split('T')[0];
    const d = new Date();
    d.setDate(d.getDate() - 6);
    const startDate = d.toISOString().split('T')[0];

    // Fetch completed tasks in range (Filtered by user_id)
    const [tasksRes, logsRes] = await Promise.all([
      db.execute({
        sql: `SELECT * FROM tasks WHERE date >= ? AND date <= ? AND completed = 1 AND user_id = ?`,
        args: [startDate, endDate, userId]
      }),
      db.execute({
        sql: `SELECT * FROM daily_logs WHERE date >= ? AND date <= ? AND user_id = ?`,
        args: [startDate, endDate, userId]
      })
    ]);

    const tasks = tasksRes.rows;
    const logs = logsRes.rows;

    const stats = {
      dsa_problems: 0,
      gym_days: 0,
      dev_days: 0,
      total_tle: 0
    };

    const dsaDays = new Set();
    const gymDays = new Set();
    const devDays = new Set();

    tasks.forEach((t: any) => {
      const title = (t.title || '').toLowerCase();
      if (title.includes('dsa') || title.includes('leetcode') || title.includes('problem')) dsaDays.add(t.date);
      if (title.includes('gym') || title.includes('workout')) gymDays.add(t.date);
      if (title.includes('dev') || title.includes('playwright') || title.includes('code') || title.includes('backend')) devDays.add(t.date);
    });

    stats.dsa_problems = dsaDays.size;
    stats.gym_days = gymDays.size;
    stats.dev_days = devDays.size;

    logs.forEach((l: any) => {
      stats.total_tle += (l.tle_minutes || 0);
    });

    return NextResponse.json(stats);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
