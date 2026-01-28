
import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function POST(request: Request) {
    try {
        const { title } = await request.json();
        if (!title) return NextResponse.json({ error: 'Missing title' }, { status: 400 });

        const db = getDb();
        const info = db.prepare('INSERT INTO sections (title) VALUES (?)').run(title);

        return NextResponse.json({ id: info.lastInsertRowid, title });
    } catch (e) {
        return NextResponse.json({ error: 'Failed to create section' }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try {
        const { id } = await request.json();
        const db = getDb();
        db.prepare('DELETE FROM sections WHERE id = ?').run(id);
        return NextResponse.json({ success: true });
    } catch (e) {
        return NextResponse.json({ error: 'Failed to delete' }, { status: 500 });
    }
}
