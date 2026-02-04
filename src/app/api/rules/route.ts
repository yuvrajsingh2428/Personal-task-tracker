import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getUserId } from '@/lib/auth-util';

export async function POST(request: Request) {
    const userId = await getUserId();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const { content } = await request.json();
        if (!content) return NextResponse.json({ error: 'Missing content' }, { status: 400 });

        const db = await getDb();
        const info = await db.execute({ sql: 'INSERT INTO memory_rules (user_id, content) VALUES (?, ?)', args: [userId, content] });
        return NextResponse.json({ id: info.lastInsertRowid?.toString(), content });
    } catch (e) {
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    const userId = await getUserId();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const { id } = await request.json();
        const db = await getDb();
        await db.execute({ sql: 'DELETE FROM memory_rules WHERE id = ? AND user_id = ?', args: [id, userId] });
        return NextResponse.json({ success: true });
    } catch (e) {
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}
