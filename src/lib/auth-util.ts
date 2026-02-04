import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'dev-secret-key-change-me');

export async function getUserId(): Promise<number | null> {
    try {
        const token = (await cookies()).get('token')?.value;
        if (!token) return null;

        const { payload } = await jwtVerify(token, JWT_SECRET);
        if (payload && payload.uid) {
            return parseInt(payload.uid as string);
        }
    } catch (e) {
        return null;
    }
    return null;
}
