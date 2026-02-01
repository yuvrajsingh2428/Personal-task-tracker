import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function GET() {
    try {
        const db = await getDb();
        const rs = await db.execute('SELECT * FROM buying_list ORDER BY created_at DESC');
        return NextResponse.json(rs.rows);
    } catch (e) {
        return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const { item, category } = await req.json();
        const db = await getDb();
        await db.execute({
            sql: 'INSERT INTO buying_list (item, category) VALUES (?, ?)',
            args: [item, category || 'General']
        });
        return NextResponse.json({ success: true });
    } catch (e) {
        return NextResponse.json({ error: 'Failed to create' }, { status: 500 });
    }
}

export async function PATCH(req: Request) {
    try {
        const { id, completed } = await req.json();
        const db = await getDb();
        await db.execute({
            sql: 'UPDATE buying_list SET completed = ? WHERE id = ?',
            args: [completed ? 1 : 0, id]
        });
        return NextResponse.json({ success: true });
    } catch (e) {
        return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    try {
        const { id } = await req.json();
        const db = await getDb();
        await db.execute({
            sql: 'DELETE FROM buying_list WHERE id = ?',
            args: [id]
        });
        return NextResponse.json({ success: true });
    } catch (e) {
        return NextResponse.json({ error: 'Failed to delete' }, { status: 500 });
    }
}
