
import { createClient } from '@libsql/client';
import path from 'path';

const url = process.env.TURSO_DATABASE_URL || `file:${path.join(process.cwd(), 'tracker_v2.db')}`;
const authToken = process.env.TURSO_AUTH_TOKEN;

const client = createClient({
    url,
    authToken,
});

async function migrate() {
    console.log('Running migration for Buying Categories...');
    try {
        await client.execute(`CREATE TABLE IF NOT EXISTS buying_categories (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL UNIQUE,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP
        )`);

        // Seed if empty
        const count = await client.execute('SELECT COUNT(*) as c FROM buying_categories');
        if (Number(count.rows[0].c) === 0) {
            const defaults = ['General', 'Coco 🐶', 'Bike 🏍️', 'Household 🏠', 'Health ❤️'];
            for (const d of defaults) {
                await client.execute({ sql: 'INSERT OR IGNORE INTO buying_categories (name) VALUES (?)', args: [d] });
            }
        }
        console.log('buying_categories table created/verified.');
    } catch (e) {
        console.error('Migration error:', e);
    }
}

migrate();
