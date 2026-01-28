
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
    const token = request.cookies.get('auth_token')
    const { pathname } = request.nextUrl

    // If user is on login page and has token, redirect to today
    if (pathname === '/login' && token?.value === 'valid_session') {
        return NextResponse.redirect(new URL('/today', request.url))
    }

    // If user is on protected pages and has no token, redirect to login
    // Also protect root / to redirect to login
    if ((pathname.startsWith('/today') || pathname.startsWith('/history') || pathname === '/') && token?.value !== 'valid_session') {
        return NextResponse.redirect(new URL('/login', request.url))
    }

    // Default root redirect
    if (pathname === '/' && token?.value === 'valid_session') {
        return NextResponse.redirect(new URL('/today', request.url))
    }

    return NextResponse.next()
}

export const config = {
    matcher: ['/', '/login', '/today/:path*', '/history/:path*'],
}
