import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function GET() {
    try {
        const db = await getDb();

        // Ensure default categories exist
        const DEFAULTS = ['Revolt', 'TLE', 'Personal', 'Misc'];
        const existingRes = await db.execute('SELECT title FROM sections');
        const existingTitles = new Set(existingRes.rows.map((r: any) => r.title));

        for (const def of DEFAULTS) {
            if (!existingTitles.has(def)) {
                await db.execute({ sql: 'INSERT INTO sections (title) VALUES (?)', args: [def] });
            }
        }

        const res = await db.execute('SELECT * FROM sections');
        return NextResponse.json(res.rows);
    } catch (e) {
        return NextResponse.json({ error: 'Failed to fetch sections' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const { title } = await request.json();
        if (!title) return NextResponse.json({ error: 'Missing title' }, { status: 400 });

        const db = await getDb();
        const info = await db.execute({ sql: 'INSERT INTO sections (title) VALUES (?)', args: [title] });

        return NextResponse.json({ id: info.lastInsertRowid?.toString(), title });
    } catch (e) {
        return NextResponse.json({ error: 'Failed to create section' }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try {
        const { id } = await request.json();
        const db = await getDb();
        await db.execute({ sql: 'DELETE FROM sections WHERE id = ?', args: [id] });
        return NextResponse.json({ success: true });
    } catch (e) {
        return NextResponse.json({ error: 'Failed to delete' }, { status: 500 });
    }
}
