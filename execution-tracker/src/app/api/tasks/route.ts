
import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

// Create Task (Ad-hoc) OR Habit
export async function POST(request: Request) {
    try {
        const { date, title, priority, type, section_id } = await request.json(); // Added section_id

        const db = getDb();

        if (type === 'habit') {
            const info = db.prepare('INSERT INTO habits (title, priority) VALUES (?, ?)').run(title, priority || 1);
            if (date) {
                db.prepare('INSERT INTO tasks (date, title, priority, habit_id, completed) VALUES (?, ?, ?, ?, 0)')
                    .run(date, title, priority || 1, info.lastInsertRowid);
            }
            return NextResponse.json({ success: true });
        } else {
            if (!date || !title) return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
            const info = db.prepare('INSERT INTO tasks (date, title, priority, section_id, completed) VALUES (?, ?, ?, ?, 0)')
                .run(date, title, priority || 1, section_id || null);
            return NextResponse.json({ id: info.lastInsertRowid, date, title, priority: priority || 1, section_id, completed: 0 });
        }
    } catch (e) {
        return NextResponse.json({ error: 'Failed to create' }, { status: 500 });
    }
}

// Update Task (Completion, Note, Priority)
export async function PATCH(request: Request) {
    try {
        const { id, completed, note, priority } = await request.json();
        if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

        const db = getDb();

        const updates = [];
        const params = [];

        if (completed !== undefined) { updates.push('completed = ?'); params.push(completed ? 1 : 0); }
        if (note !== undefined) { updates.push('note = ?'); params.push(note); }
        if (priority !== undefined) { updates.push('priority = ?'); params.push(priority); }

        params.push(id);

        db.prepare(`UPDATE tasks SET ${updates.join(', ')} WHERE id = ?`).run(...params);

        return NextResponse.json({ success: true });
    } catch (e) {
        return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
    }
}

// Delete Task (or Archive Habit)
export async function DELETE(request: Request) {
    try {
        const { id, is_habit_template } = await request.json();
        const db = getDb();

        if (is_habit_template) {
            db.prepare('UPDATE habits SET is_archived = 1 WHERE id = ?').run(id);
        } else {
            db.prepare('DELETE FROM tasks WHERE id = ?').run(id);
        }

        return NextResponse.json({ success: true });
    } catch (e) {
        return NextResponse.json({ error: 'Failed to delete' }, { status: 500 });
    }
}
