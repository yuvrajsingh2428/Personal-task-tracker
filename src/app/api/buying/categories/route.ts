import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function GET() {
    try {
        const db = await getDb();
        const rs = await db.execute('SELECT * FROM buying_categories ORDER BY created_at ASC');
        return NextResponse.json(rs.rows);
    } catch (e) {
        return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const { name } = await req.json();
        const db = await getDb();
        await db.execute({
            sql: 'INSERT INTO buying_categories (name) VALUES (?)',
            args: [name]
        });
        return NextResponse.json({ success: true });
    } catch (e) {
        return NextResponse.json({ error: 'Failed to create' }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    try {
        const { id } = await req.json();
        const db = await getDb();
        await db.execute({
            sql: 'DELETE FROM buying_categories WHERE id = ?',
            args: [id]
        });
        return NextResponse.json({ success: true });
    } catch (e) {
        return NextResponse.json({ error: 'Failed to delete' }, { status: 500 });
    }
}
