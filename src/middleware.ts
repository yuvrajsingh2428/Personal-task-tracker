import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'dev-secret-key-change-me');

export async function middleware(request: NextRequest) {
    const token = request.cookies.get('token')?.value;
    const { pathname } = request.nextUrl;

    // Paths that require auth
    const protectedPaths = ['/today', '/history'];
    const isProtected = protectedPaths.some(p => pathname.startsWith(p)) || pathname === '/';

    // Public paths (login/signup) - redirect to dashboard if logged in
    const isPublicAuth = ['/login', '/signup'].some(p => pathname.startsWith(p));

    if (isProtected) {
        if (!token) {
            return NextResponse.redirect(new URL('/login', request.url));
        }
        try {
            await jwtVerify(token, JWT_SECRET);
            return NextResponse.next();
        } catch (e) {
            // Invalid token
            return NextResponse.redirect(new URL('/login', request.url));
        }
    }

    if (isPublicAuth && token) {
        try {
            await jwtVerify(token, JWT_SECRET);
            return NextResponse.redirect(new URL('/today', request.url));
        } catch (e) {
            // Token invalid, allow access to login
            return NextResponse.next();
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
