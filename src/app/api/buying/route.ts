import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getUserId } from '@/lib/auth-util';

export async function GET() {
    const userId = await getUserId();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const db = await getDb();
        const rs = await db.execute({
            sql: 'SELECT * FROM buying_list WHERE user_id = ? ORDER BY created_at DESC',
            args: [userId]
        });
        return NextResponse.json(rs.rows);
    } catch (e) {
        return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
    }
}

export async function POST(req: Request) {
    const userId = await getUserId();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const { item, category, note } = await req.json();
        const db = await getDb();
        await db.execute({
            sql: 'INSERT INTO buying_list (user_id, item, category, note) VALUES (?, ?, ?, ?)',
            args: [userId, item, category || 'General', note || null]
        });
        return NextResponse.json({ success: true });
    } catch (e) {
        return NextResponse.json({ error: 'Failed to create' }, { status: 500 });
    }
}

export async function PATCH(req: Request) {
    const userId = await getUserId();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const { id, completed, note, item } = await req.json();
        const db = await getDb();

        if (completed !== undefined) {
            await db.execute({
                sql: 'UPDATE buying_list SET completed = ? WHERE id = ? AND user_id = ?',
                args: [completed ? 1 : 0, id, userId]
            });
        }

        if (item !== undefined) {
            await db.execute({
                sql: 'UPDATE buying_list SET item = ? WHERE id = ? AND user_id = ?',
                args: [item, id, userId]
            });
        }

        if (note !== undefined) {
            await db.execute({
                sql: 'UPDATE buying_list SET note = ? WHERE id = ? AND user_id = ?',
                args: [note, id, userId]
            });
        }
        return NextResponse.json({ success: true });
    } catch (e) {
        return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    const userId = await getUserId();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const { id } = await req.json();
        const db = await getDb();
        await db.execute({
            sql: 'DELETE FROM buying_list WHERE id = ? AND user_id = ?',
            args: [id, userId]
        });
        return NextResponse.json({ success: true });
    } catch (e) {
        return NextResponse.json({ error: 'Failed to delete' }, { status: 500 });
    }
}
