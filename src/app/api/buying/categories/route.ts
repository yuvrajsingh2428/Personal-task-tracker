import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getUserId } from '@/lib/auth-util';

export async function GET() {
    const userId = await getUserId();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const db = await getDb();
        const rs = await db.execute({
            sql: 'SELECT * FROM buying_categories WHERE user_id = ? ORDER BY created_at ASC',
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
        const { name } = await req.json();
        const db = await getDb();
        await db.execute({
            sql: 'INSERT INTO buying_categories (user_id, name) VALUES (?, ?)',
            args: [userId, name]
        });
        return NextResponse.json({ success: true });
    } catch (e) {
        return NextResponse.json({ error: 'Failed to create' }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    const userId = await getUserId();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const { id } = await req.json();
        const db = await getDb();
        await db.execute({
            sql: 'DELETE FROM buying_categories WHERE id = ? AND user_id = ?',
            args: [id, userId]
        });
        return NextResponse.json({ success: true });
    } catch (e) {
        return NextResponse.json({ error: 'Failed to delete' }, { status: 500 });
    }
}
