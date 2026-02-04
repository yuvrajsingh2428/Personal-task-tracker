import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getUserId } from '@/lib/auth-util';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const date = searchParams.get('date');
        const userId = await getUserId();
        if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        if (!date) return NextResponse.json({ error: 'Date required' }, { status: 400 });

        const db = await getDb();

        const res = await db.execute({
            sql: `
                SELECT h.*, 
                       hl.id as log_id, 
                       hl.completed, 
                       hl.time_spent, 
                       hl.note as log_note 
                FROM habits h
                LEFT JOIN habit_logs hl ON h.id = hl.habit_id AND hl.date = ? AND hl.user_id = ?
                WHERE h.user_id = ?
            `,
            args: [date, userId, userId]
        });

        return NextResponse.json(res.rows);
    } catch (e) {
        return NextResponse.json({ error: 'Failed to fetch habits' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    const userId = await getUserId();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    let body;
    try {
        body = await request.json();
    } catch (e) {
        return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
    }

    const { title, subtitle, icon, color, track_streak } = body;
    const safeSubtitle = subtitle || '';
    const safeIcon = icon || '📍';
    const safeColor = color || 'purple';
    const safeTrackStreak = track_streak ? 1 : 0;

    try {
        const db = await getDb();
        const res = await db.execute({
            sql: 'INSERT INTO habits (user_id, title, subtitle, icon, color, track_streak, streak) VALUES (?, ?, ?, ?, ?, ?, 0)',
            args: [userId, title, safeSubtitle, safeIcon, safeColor, safeTrackStreak]
        });
        return NextResponse.json({ success: true, id: Number(res.lastInsertRowid) });
    } catch (e: any) {
        console.error("Failed to create habit:", e);
        return NextResponse.json({ error: 'Failed to create habit', details: e.message }, { status: 500 });
    }
}

export async function PUT(request: Request) {
    const userId = await getUserId();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    let body;
    try {
        body = await request.json();
    } catch (e) {
        return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
    }

    const { id, title, subtitle, icon, color, track_streak } = body;

    try {
        const db = await getDb();
        const updates = [];
        const args = [];

        if (title !== undefined) { updates.push('title = ?'); args.push(title); }
        if (subtitle !== undefined) { updates.push('subtitle = ?'); args.push(subtitle); }
        if (icon !== undefined) { updates.push('icon = ?'); args.push(icon); }
        if (color !== undefined) { updates.push('color = ?'); args.push(color); }
        if (track_streak !== undefined) { updates.push('track_streak = ?'); args.push(track_streak ? 1 : 0); }

        if (updates.length > 0) {
            args.push(id);
            args.push(userId);
            await db.execute({
                sql: `UPDATE habits SET ${updates.join(', ')} WHERE id = ? AND user_id = ?`,
                args: args
            });
        }
        return NextResponse.json({ success: true });
    } catch (e: any) {
        console.error("PUT Failure:", e);
        return NextResponse.json({ error: 'Failed to update habit' }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    const userId = await getUserId();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const { id } = await request.json();
        const db = await getDb();
        // Delete logs first manually to ensure integrity
        await db.execute({ sql: 'DELETE FROM habit_logs WHERE habit_id = ? AND user_id = ?', args: [id, userId] });
        await db.execute({ sql: 'DELETE FROM habits WHERE id = ? AND user_id = ?', args: [id, userId] });
        return NextResponse.json({ success: true });
    } catch (e) {
        console.error("Delete failed", e);
        return NextResponse.json({ error: 'Failed to delete habit' }, { status: 500 });
    }
}
