
import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function GET() {
    const db = getDb();

    // Get last 7 days range
    const endDate = new Date().toISOString().split('T')[0];
    const d = new Date();
    d.setDate(d.getDate() - 6);
    const startDate = d.toISOString().split('T')[0];

    // Fetch completed tasks in range
    const tasks = db.prepare(`
    SELECT * FROM tasks 
    WHERE date >= ? AND date <= ? AND completed = 1
  `).all(startDate, endDate);

    // TLE Total
    const logs = db.prepare(`
    SELECT * FROM daily_logs 
    WHERE date >= ? AND date <= ?
  `).all(startDate, endDate);

    const stats = {
        dsa_problems: 0,
        gym_days: 0,
        dev_days: 0,
        total_tle: 0
    };

    // Logic: 
    // DSA -> Title contains "DSA", "LeetCode", "Problem"
    // Gym -> Title contains "Gym", "Workout"
    // Dev -> Title contains "Dev", "Playwright", "Code", "Backend"
    // TLE -> Sum from logs

    const dsaDays = new Set();
    const gymDays = new Set();
    const devDays = new Set();

    tasks.forEach((t: any) => {
        const title = t.title.toLowerCase();
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
}
