import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getUserId } from '@/lib/auth-util';

export async function POST(request: Request) {
    const userId = await getUserId();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const { date, habit_id, completed, time_spent, note } = await request.json();

        const db = await getDb();

        // Check if log exists
        const existing = await db.execute({
            sql: 'SELECT id, completed FROM habit_logs WHERE habit_id = ? AND date = ? AND user_id = ?',
            args: [habit_id, date, userId]
        });

        if (existing.rows.length > 0) {
            // Update
            const updates = [];
            const args = [];
            const wasCompleted = existing.rows[0].completed;

            if (completed !== undefined) {
                updates.push('completed = ?');
                args.push(completed ? 1 : 0);

                if (!!completed !== !!wasCompleted) {
                    if (completed) {
                        await db.execute({ sql: 'UPDATE habits SET streak = streak + 1 WHERE id = ? AND user_id = ?', args: [habit_id, userId] });
                        updates.push('created_at = CURRENT_TIMESTAMP');
                    } else {
                        await db.execute({ sql: 'UPDATE habits SET streak = MAX(0, streak - 1) WHERE id = ? AND user_id = ?', args: [habit_id, userId] });
                    }
                }
            }
            if (time_spent !== undefined) { updates.push('time_spent = ?'); args.push(time_spent); }
            if (note !== undefined) { updates.push('note = ?'); args.push(note); }

            if (updates.length > 0) {
                args.push(existing.rows[0].id);
                args.push(userId);
                await db.execute({
                    sql: `UPDATE habit_logs SET ${updates.join(', ')} WHERE id = ? AND user_id = ?`,
                    args: args
                });
            }
        } else {
            // Insert
            await db.execute({
                sql: 'INSERT INTO habit_logs (user_id, habit_id, date, completed, time_spent, note) VALUES (?, ?, ?, ?, ?, ?)',
                args: [userId, habit_id, date, completed ? 1 : 0, time_spent || 0, note || '']
            });

            if (completed) {
                await db.execute({ sql: 'UPDATE habits SET streak = streak + 1 WHERE id = ? AND user_id = ?', args: [habit_id, userId] });
            }
        }

        return NextResponse.json({ success: true });
    } catch (e) {
        console.error(e);
        return NextResponse.json({ error: 'Failed to update habit log' }, { status: 500 });
    }
}
