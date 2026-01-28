
import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function POST(request: Request) {
    try {
        const { content } = await request.json();
        if (!content) return NextResponse.json({ error: 'Missing content' }, { status: 400 });

        const db = getDb();
        const info = db.prepare('INSERT INTO memory_rules (content) VALUES (?)').run(content);
        return NextResponse.json({ id: info.lastInsertRowid, content });
    } catch (e) {
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try {
        const { id } = await request.json();
        const db = getDb();
        db.prepare('DELETE FROM memory_rules WHERE id = ?').run(id);
        return NextResponse.json({ success: true });
    } catch (e) {
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}
