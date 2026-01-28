
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const { email, password } = await request.json();

        // Hardcoded check
        if (email === 'user@example.com' && password === 'password') {
            const response = NextResponse.json({ success: true });
            response.cookies.set({
                name: 'auth_token',
                value: 'valid_session',
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 60 * 60 * 24 * 30, // 30 days
                path: '/',
            });
            return response;
        }

        return NextResponse.json({ success: false, message: 'Invalid credentials' }, { status: 401 });
    } catch (e) {
        return NextResponse.json({ success: false, message: 'Error' }, { status: 500 });
    }
}
