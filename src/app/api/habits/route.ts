import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const date = searchParams.get('date');

        if (!date) return NextResponse.json({ error: 'Date required' }, { status: 400 });

        const db = await getDb();

        // Fetch habits and join with today's log
        const res = await db.execute({
            sql: `
                SELECT h.*, 
                       hl.id as log_id, 
                       hl.completed, 
                       hl.time_spent, 
                       hl.note as log_note 
                FROM habits h
                LEFT JOIN habit_logs hl ON h.id = hl.habit_id AND hl.date = ?
            `,
            args: [date]
        });

        // Convert BigInts in result rows if any
        return NextResponse.json(res.rows);
    } catch (e) {
        return NextResponse.json({ error: 'Failed to fetch habits' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    let body;
    try {
        body = await request.json();
    } catch (e) {
        return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
    }

    const { title, subtitle, icon, color, track_streak } = body;

    // Ensure defaults strictly
    const safeSubtitle = subtitle || '';
    const safeIcon = icon || '📍';
    const safeColor = color || 'purple';
    const safeTrackStreak = track_streak ? 1 : 0;

    try {
        const db = await getDb();
        console.log("Creating habit:", body);

        const res = await db.execute({
            sql: 'INSERT INTO habits (title, subtitle, icon, color, track_streak, streak) VALUES (?, ?, ?, ?, ?, 0)',
            args: [title, safeSubtitle, safeIcon, safeColor, safeTrackStreak]
        });
        return NextResponse.json({ success: true, id: Number(res.lastInsertRowid) });
    } catch (e: any) {
        console.error("Failed to create habit:", e);

        // Self-Healing
        const errString = JSON.stringify(e) + String(e.message) + String(e.cause);
        if (errString.includes('no column') || errString.includes('SQLITE_ERROR') || errString.includes('SQLITE_UNKNOWN')) {
            try {
                const db = await getDb();
                console.log("Auto-migrating missing columns...");
                try { await db.execute('ALTER TABLE habits ADD COLUMN subtitle TEXT'); } catch (err) { /* ignore */ }
                try { await db.execute('ALTER TABLE habits ADD COLUMN icon TEXT'); } catch (err) { /* ignore */ }
                try { await db.execute('ALTER TABLE habits ADD COLUMN color TEXT DEFAULT "purple"'); } catch (err) { /* ignore */ }
                try { await db.execute('ALTER TABLE habits ADD COLUMN streak INTEGER DEFAULT 0'); } catch (err) { /* ignore */ }
                try { await db.execute('ALTER TABLE habits ADD COLUMN track_streak BOOLEAN DEFAULT 0'); } catch (err) { /* ignore */ }

                // Retry Insert
                const res = await db.execute({
                    sql: 'INSERT INTO habits (title, subtitle, icon, color, track_streak, streak) VALUES (?, ?, ?, ?, ?, 0)',
                    args: [title, safeSubtitle, safeIcon, safeColor, safeTrackStreak]
                });
                return NextResponse.json({ success: true, id: Number(res.lastInsertRowid) });
            } catch (retryErr) {
                console.error("Retry failed:", retryErr);
                return NextResponse.json({ error: 'Failed to create habit after retry', details: String(retryErr) }, { status: 500 });
            }
        }

        return NextResponse.json({ error: 'Failed to create habit', details: e.message }, { status: 500 });
    }
}

export async function PUT(request: Request) {
    let body;
    try {
        body = await request.json();
    } catch (e) {
        return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
    }

    const { id, title, subtitle, icon, color, track_streak } = body;

    const performUpdate = async () => {
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
            await db.execute({
                sql: `UPDATE habits SET ${updates.join(', ')} WHERE id = ?`,
                args: args
            });
        }
    };

    try {
        await performUpdate();
        return NextResponse.json({ success: true });
    } catch (e: any) {
        console.error("PUT Failure:", e);
        // Self-Healing
        const errString = JSON.stringify(e) + String(e.message) + String(e.cause);
        if (errString.includes('no column') || errString.includes('SQLITE_ERROR') || errString.includes('SQLITE_UNKNOWN')) {
            try {
                const db = await getDb();
                console.log("Auto-migrating missing columns (PUT)...");
                try { await db.execute('ALTER TABLE habits ADD COLUMN subtitle TEXT'); } catch (err) { /* ignore */ }
                try { await db.execute('ALTER TABLE habits ADD COLUMN icon TEXT'); } catch (err) { /* ignore */ }
                try { await db.execute('ALTER TABLE habits ADD COLUMN color TEXT DEFAULT "purple"'); } catch (err) { /* ignore */ }
                try { await db.execute('ALTER TABLE habits ADD COLUMN streak INTEGER DEFAULT 0'); } catch (err) { /* ignore */ }
                try { await db.execute('ALTER TABLE habits ADD COLUMN track_streak BOOLEAN DEFAULT 0'); } catch (err) { /* ignore */ }

                await performUpdate();
                return NextResponse.json({ success: true });
            } catch (retryErr) {
                return NextResponse.json({ error: 'Failed to update habit', details: String(retryErr) }, { status: 500 });
            }
        }
        return NextResponse.json({ error: 'Failed to update habit' }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try {
        const { id } = await request.json();
        const db = await getDb();
        // Delete logs first manually to ensure integrity
        await db.execute({ sql: 'DELETE FROM habit_logs WHERE habit_id = ?', args: [id] });
        await db.execute({ sql: 'DELETE FROM habits WHERE id = ?', args: [id] });
        return NextResponse.json({ success: true });
    } catch (e) {
        console.error("Delete failed", e);
        return NextResponse.json({ error: 'Failed to delete habit' }, { status: 500 });
    }
}
