
import { createClient } from '@libsql/client';
import path from 'path';

const url = process.env.TURSO_DATABASE_URL || `file:${path.join(process.cwd(), 'tracker_v2.db')}`;
const authToken = process.env.TURSO_AUTH_TOKEN;

const client = createClient({
    url,
    authToken,
});

async function migrate() {
    console.log('Running migration...');
    try {
        await client.execute(`CREATE TABLE IF NOT EXISTS buying_list (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            item TEXT NOT NULL,
            category TEXT,
            completed INTEGER DEFAULT 0,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP
        )`);
        console.log('buying_list table created/verified.');
    } catch (e) {
        console.error('Migration error:', e);
    }
}

migrate();
