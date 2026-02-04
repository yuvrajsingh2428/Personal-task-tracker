
import { createClient } from '@libsql/client';
import path from 'path';
import fs from 'fs';

const envContent = fs.readFileSync('.env', 'utf-8');
const env: any = {};
envContent.split('\n').forEach(line => {
    const [key, ...value] = line.split('=');
    if (key && value) {
        env[key.trim()] = value.join('=').trim().replace(/"/g, '');
    }
});

const url = env.TURSO_DATABASE_URL || `file:${path.join(process.cwd(), 'tracker_v2.db')}`;
const authToken = env.TURSO_AUTH_TOKEN;

const client = createClient({ url, authToken });

async function fix() {
    console.log("Starting DB fix...");
    try {
        // Check columns
        const res = await client.execute("PRAGMA table_info(habit_logs)");
        const cols = res.rows.map(r => r.name);
        console.log("Current columns:", cols);

        if (!cols.includes('created_at')) {
            console.log("Adding created_at to habit_logs...");
            await client.execute("ALTER TABLE habit_logs ADD COLUMN created_at TEXT");
            console.log("Column added. Updating existing rows...");
            await client.execute("UPDATE habit_logs SET created_at = CURRENT_TIMESTAMP WHERE created_at IS NULL");
            console.log("Migration successful!");
        } else {
            console.log("created_at already exists.");
        }

        // Also check daily_logs migrations because they were also suspected
        const res2 = await client.execute("PRAGMA table_info(daily_logs)");
        const cols2 = res2.rows.map(r => r.name);
        if (!cols2.includes('dsa_done')) {
            console.log("Adding dsa_done to daily_logs...");
            await client.execute("ALTER TABLE daily_logs ADD COLUMN dsa_done INTEGER DEFAULT 0");
        }
        if (!cols2.includes('dev_done')) {
            console.log("Adding dev_done to daily_logs...");
            await client.execute("ALTER TABLE daily_logs ADD COLUMN dev_done INTEGER DEFAULT 0");
        }
        if (!cols2.includes('gym_done')) {
            console.log("Adding gym_done to daily_logs...");
            await client.execute("ALTER TABLE daily_logs ADD COLUMN gym_done INTEGER DEFAULT 0");
        }

        console.log("All fixes applied.");
    } catch (e) {
        console.error("FIX ERROR:", e);
    }
}

fix();
