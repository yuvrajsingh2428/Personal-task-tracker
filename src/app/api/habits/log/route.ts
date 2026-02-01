import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function POST(request: Request) {
    try {
        const { date, habit_id, completed, time_spent, note } = await request.json();

        const db = await getDb();

        // Check if log exists
        const existing = await db.execute({
            sql: 'SELECT id, completed FROM habit_logs WHERE habit_id = ? AND date = ?',
            args: [habit_id, date]
        });

        if (existing.rows.length > 0) {
            // Update
            const updates = [];
            const args = [];

            // Current completed status in DB
            const wasCompleted = existing.rows[0].completed;

            if (completed !== undefined) {
                updates.push('completed = ?');
                args.push(completed ? 1 : 0);

                // Streak Logic (Approximate/Naive)
                // Only update streak if completion status CHANGES
                if (!!completed !== !!wasCompleted) {
                    try {
                        if (completed) {
                            await db.execute({ sql: 'UPDATE habits SET streak = streak + 1 WHERE id = ?', args: [habit_id] });
                        } else {
                            await db.execute({ sql: 'UPDATE habits SET streak = MAX(0, streak - 1) WHERE id = ?', args: [habit_id] });
                        }
                    } catch (err) {
                        console.error("Streak update failed (column might be missing)", err);
                    }
                }
            }
            if (time_spent !== undefined) { updates.push('time_spent = ?'); args.push(time_spent); }
            if (note !== undefined) { updates.push('note = ?'); args.push(note); }

            args.push(existing.rows[0].id);

            if (updates.length > 0) {
                await db.execute({
                    sql: `UPDATE habit_logs SET ${updates.join(', ')} WHERE id = ?`,
                    args: args
                });
            }
        } else {
            // Insert
            await db.execute({
                sql: 'INSERT INTO habit_logs (habit_id, date, completed, time_spent, note) VALUES (?, ?, ?, ?, ?)',
                args: [habit_id, date, completed ? 1 : 0, time_spent || 0, note || '']
            });

            // Streak Logic for First Insert
            if (completed) {
                try {
                    await db.execute({ sql: 'UPDATE habits SET streak = streak + 1 WHERE id = ?', args: [habit_id] });
                } catch (err) { /* ignore */ }
            }
        }

        return NextResponse.json({ success: true });
    } catch (e) {
        console.error(e);
        return NextResponse.json({ error: 'Failed to update habit log' }, { status: 500 });
    }
}
