import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import bcrypt from 'bcryptjs';
import { SignJWT } from 'jose';
import { cookies } from 'next/headers';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'dev-secret-key-change-me');

export async function POST(request: Request) {
    try {
        const { name, email, password } = await request.json();

        if (!email || !password || !name) {
            return NextResponse.json({ error: 'Name, email, and password required' }, { status: 400 });
        }

        const db = await getDb();

        // Check if user exists
        const existing = await db.execute({ sql: 'SELECT * FROM users WHERE email = ?', args: [email] });
        if (existing.rows.length > 0) {
            return NextResponse.json({ error: 'User already exists' }, { status: 400 });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        try {
            const res = await db.execute({
                sql: 'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
                args: [name, email, hashedPassword]
            });

            // Create JWT
            const token = await new SignJWT({ uid: res.lastInsertRowid?.toString(), email })
                .setProtectedHeader({ alg: 'HS256' })
                .setExpirationTime('30d')
                .sign(JWT_SECRET);

            (await cookies()).set('token', token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                path: '/',
                maxAge: 60 * 60 * 24 * 30 // 30 days
            });

            return NextResponse.json({ success: true });
        } catch (dbError) {
            console.error(dbError);
            return NextResponse.json({ error: 'Database error' }, { status: 500 });
        }

    } catch (e) {
        console.error(e);
        return NextResponse.json({ error: 'Internal error' }, { status: 500 });
    }
}
