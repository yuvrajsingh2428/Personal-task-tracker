import { createClient } from '@libsql/client';
import fs from 'fs';
import path from 'path';

// Manual env parsing
const envFile = fs.readFileSync(path.join(process.cwd(), '.env'), 'utf8');
const env: { [key: string]: string } = {};
envFile.split('\n').forEach(line => {
    const [key, ...value] = line.split('=');
    if (key && value) {
        env[key.trim()] = value.join('=').trim().replace(/^"(.*)"$/, '$1');
    }
});

const url = env.TURSO_DATABASE_URL;
const authToken = env.TURSO_AUTH_TOKEN;

if (!url || !authToken) {
    console.error("Missing TURSO env vars!");
    process.exit(1);
}

const client = createClient({ url, authToken });

async function clean() {
    console.log(`Cleaning test data in ${url}...`);

    // Clean Tasks
    try {
        const resTasks = await client.execute("DELETE FROM tasks");
        console.log(`Deleted ${resTasks.rowsAffected} tasks.`);
    } catch (e) {
        console.warn("Could not delete tasks (table might not exist yet)");
    }

    // Clean Sections (Categories)
    try {
        const resSections = await client.execute("DELETE FROM sections");
        console.log(`Deleted ${resSections.rowsAffected} sections.`);
    } catch (e) {
        console.warn("Could not delete sections");
    }

    // Clean Buying List
    try {
        const resBuying = await client.execute("DELETE FROM buying_list");
        console.log(`Deleted ${resBuying.rowsAffected} shopping items.`);
    } catch (e) {
        console.warn("Could not delete buying_list");
    }

    // Clean Habit Logs
    try {
        const resHabitLogs = await client.execute("DELETE FROM habit_logs");
        console.log(`Deleted ${resHabitLogs.rowsAffected} habit logs.`);
    } catch (e) {
        console.warn("Could not delete habit_logs");
    }

    // Reset streak counts for habits
    try {
        const resStreak = await client.execute("UPDATE habits SET streak = 0");
        console.log(`Reset streaks for habits.`);
    } catch (e) {
        console.warn("Could not reset streaks");
    }

    console.log("Database cleaned successfully!");
}

clean().catch(console.error);
