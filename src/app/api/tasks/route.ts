import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { date, title, priority, habit_id, section_id, note, estimated_time } = body;

        const db = await getDb();
        console.log("Creating Task:", { ...body }); // Log payload
        await db.execute({
            sql: 'INSERT INTO tasks (date, title, priority, habit_id, section_id, note, estimated_time, completed) VALUES (?, ?, ?, ?, ?, ?, ?, 0)',
            args: [date, title, priority, habit_id || null, section_id || null, note || null, estimated_time || null]
        });

        return NextResponse.json({ success: true });
    } catch (e) {
        console.error("POST /api/tasks Error:", e);
        return NextResponse.json({ error: String(e) }, { status: 500 });
    }
}

export async function PATCH(request: Request) {
    try {
        const body = await request.json();
        const { id, completed, title, priority, note, estimated_time } = body;

        if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

        const db = await getDb();

        if (completed !== undefined) {
            await db.execute({ sql: 'UPDATE tasks SET completed = ? WHERE id = ?', args: [completed ? 1 : 0, id] });
        }
        if (title !== undefined) {
            await db.execute({ sql: 'UPDATE tasks SET title = ? WHERE id = ?', args: [title, id] });
        }
        if (priority !== undefined) {
            await db.execute({ sql: 'UPDATE tasks SET priority = ? WHERE id = ?', args: [priority, id] });
        }
        if (note !== undefined) {
            await db.execute({ sql: 'UPDATE tasks SET note = ? WHERE id = ?', args: [note, id] });
        }
        if (estimated_time !== undefined) {
            await db.execute({ sql: 'UPDATE tasks SET estimated_time = ? WHERE id = ?', args: [estimated_time, id] });
        }

        return NextResponse.json({ success: true });
    } catch (e) {
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try {
        const body = await request.json();
        const { id, is_habit_template } = body;

        if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

        const db = await getDb();

        if (is_habit_template) {
            // Archive habit
            await db.execute({ sql: 'UPDATE habits SET is_archived = 1 WHERE id = ?', args: [id] });
            // Delete associated future tasks? logic handled in UI mostly, but here strictly archiving.
        } else {
            // Delete specific task
            await db.execute({ sql: 'DELETE FROM tasks WHERE id = ?', args: [id] });
        }

        return NextResponse.json({ success: true });
    } catch (e) {
        console.error(e);
        return NextResponse.json({ error: 'Failed to delete' }, { status: 500 });
    }
}
