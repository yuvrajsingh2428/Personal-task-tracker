import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import bcrypt from 'bcryptjs';
import { SignJWT } from 'jose';
import { cookies } from 'next/headers';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'dev-secret-key-change-me');

export async function POST(request: Request) {
    try {
        const { name, email, password } = await request.json();

        if (!email || !password || !name) {
            return NextResponse.json({ error: 'Name, email, and password required' }, { status: 400 });
        }

        if (password.length < 8) {
            return NextResponse.json({ error: 'Password must be at least 8 characters long' }, { status: 400 });
        }

        const db = await getDb();

        // Check if user exists
        const existing = await db.execute({ sql: 'SELECT * FROM users WHERE email = ?', args: [email] });
        if (existing.rows.length > 0) {
            return NextResponse.json({ error: 'User already exists' }, { status: 400 });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        try {
            const res = await db.execute({
                sql: 'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
                args: [name, email, hashedPassword]
            });
            const userId = Number(res.lastInsertRowid);

            // Seed Personal Default Data for the new user
            await db.batch([
                // 1. Habits
                {
                    sql: 'INSERT INTO habits (user_id, title, subtitle, icon, color, track_streak) VALUES (?, ?, ?, ?, ?, 1), (?, ?, ?, ?, ?, 1), (?, ?, ?, ?, ?, 1)',
                    args: [
                        userId, 'DSA', 'Solve 1 Problem', '🧩', 'purple',
                        userId, 'Learning', 'Dev / Playwright', '💻', 'amber',
                        userId, 'Gym', 'Health & Fitness', '💪', 'red'
                    ]
                },
                // 2. Sections
                { sql: 'INSERT INTO sections (user_id, title) VALUES (?, ?), (?, ?), (?, ?), (?, ?)', args: [userId, 'Work', userId, 'Personal', userId, 'Revolt', userId, 'TLE'] },
                // 3. Memory Rules
                {
                    sql: 'INSERT INTO memory_rules (user_id, content) VALUES (?, ?), (?, ?), (?, ?)',
                    args: [userId, 'DSA: Minimum 1 problem daily', userId, 'Health is non-negotiable', userId, 'Consistency > Intensity']
                },
                // 4. Workout Schedule
                {
                    sql: `INSERT INTO workout_schedule (user_id, day_index, day_name, focus_area, exercises) VALUES 
                        (?, 0, 'Sunday', 'Rest / Active Recovery', 'Light stretching, Walk'),
                        (?, 1, 'Monday', 'Chest Day', 'Bench Press, Flies, Push ups'),
                        (?, 2, 'Tuesday', 'Triceps', 'Pushdowns, Extensions, Dips'),
                        (?, 3, 'Wednesday', 'Back', 'Pullups, Rows, Lat Pulldowns'),
                        (?, 4, 'Thursday', 'Biceps', 'Curls, Hammer Curls'),
                        (?, 5, 'Friday', 'Shoulders', 'Overhead Press, Lateral Raises'),
                        (?, 6, 'Saturday', 'Leg Day', 'Squats, Lunges, Calf Raises')`,
                    args: [userId, userId, userId, userId, userId, userId, userId]
                }
            ], "write");

            // Create JWT
            const token = await new SignJWT({ uid: userId.toString(), email })
                .setProtectedHeader({ alg: 'HS256' })
                .setExpirationTime('30d')
                .sign(JWT_SECRET);

            (await cookies()).set('token', token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                path: '/',
                maxAge: 60 * 60 * 24 * 30 // 30 days
            });

            return NextResponse.json({ success: true });
        } catch (dbError) {
            console.error(dbError);
            return NextResponse.json({ error: 'Database error' }, { status: 500 });
        }

    } catch (e) {
        console.error(e);
        return NextResponse.json({ error: 'Internal error' }, { status: 500 });
    }
}
