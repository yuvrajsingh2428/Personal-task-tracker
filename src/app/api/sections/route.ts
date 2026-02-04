import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getUserId } from '@/lib/auth-util';

export async function GET() {
    const userId = await getUserId();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const db = await getDb();

        // Ensure default categories exist for this user
        const DEFAULTS = ['Revolt', 'TLE', 'Personal', 'Misc'];
        const existingRes = await db.execute({ sql: 'SELECT title FROM sections WHERE user_id = ?', args: [userId] });
        const existingTitles = new Set(existingRes.rows.map((r: any) => r.title));

        for (const def of DEFAULTS) {
            if (!existingTitles.has(def)) {
                await db.execute({ sql: 'INSERT INTO sections (user_id, title) VALUES (?, ?)', args: [userId, def] });
            }
        }

        const res = await db.execute({ sql: 'SELECT * FROM sections WHERE user_id = ?', args: [userId] });
        return NextResponse.json(res.rows);
    } catch (e) {
        return NextResponse.json({ error: 'Failed to fetch sections' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    const userId = await getUserId();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const { title } = await request.json();
        if (!title) return NextResponse.json({ error: 'Missing title' }, { status: 400 });

        const db = await getDb();
        const info = await db.execute({ sql: 'INSERT INTO sections (user_id, title) VALUES (?, ?)', args: [userId, title] });

        return NextResponse.json({ id: info.lastInsertRowid?.toString(), title });
    } catch (e) {
        return NextResponse.json({ error: 'Failed to create section' }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    const userId = await getUserId();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const { id } = await request.json();
        const db = await getDb();
        await db.execute({ sql: 'DELETE FROM sections WHERE id = ? AND user_id = ?', args: [id, userId] });
        return NextResponse.json({ success: true });
    } catch (e) {
        return NextResponse.json({ error: 'Failed to delete' }, { status: 500 });
    }
}
