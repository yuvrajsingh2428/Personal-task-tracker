
import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.join(process.cwd(), 'tracker.db');

let db: any;

export function getDb() {
    if (!db) {
        try {
            db = new Database(dbPath);
            db.pragma('journal_mode = WAL');

            // Sections
            db.exec(`
        CREATE TABLE IF NOT EXISTS sections (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          title TEXT NOT NULL,
          created_at TEXT DEFAULT CURRENT_TIMESTAMP
        );
      `);

            // Memory Rules (Principles)
            db.exec(`
        CREATE TABLE IF NOT EXISTS memory_rules (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          content TEXT NOT NULL,
          created_at TEXT DEFAULT CURRENT_TIMESTAMP
        );
      `);

            // Migrations
            const tasksInfo = db.prepare('PRAGMA table_info(tasks)').all();
            if (!tasksInfo.some((col: any) => col.name === 'section_id')) {
                db.exec(`ALTER TABLE tasks ADD COLUMN section_id INTEGER REFERENCES sections(id) ON DELETE SET NULL`);
            }

            const logsInfo = db.prepare('PRAGMA table_info(daily_logs)').all();
            if (!logsInfo.some((col: any) => col.name === 'tomorrow_intent')) {
                db.exec(`ALTER TABLE daily_logs ADD COLUMN tomorrow_intent TEXT`);
            }

            db.exec(`
        CREATE TABLE IF NOT EXISTS daily_logs (
          date TEXT PRIMARY KEY,
          tle_minutes INTEGER DEFAULT 0,
          note TEXT,
          tomorrow_intent TEXT
        );

        CREATE TABLE IF NOT EXISTS habits (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          title TEXT NOT NULL,
          priority INTEGER DEFAULT 1,
          is_archived INTEGER DEFAULT 0,
          created_at TEXT DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS tasks (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          date TEXT NOT NULL,
          title TEXT NOT NULL,
          completed INTEGER DEFAULT 0,
          priority INTEGER DEFAULT 1,
          note TEXT,
          habit_id INTEGER,
          section_id INTEGER,
          created_at TEXT DEFAULT CURRENT_TIMESTAMP
        );
      `);

            // Seed Defaults
            const secCount = db.prepare('SELECT count(*) as c FROM sections').get();
            if (secCount.c === 0) {
                db.prepare('INSERT INTO sections (title) VALUES (?)').run('Work');
                db.prepare('INSERT INTO sections (title) VALUES (?)').run('Personal');
            }

            // Seed Memory
            const memCount = db.prepare('SELECT count(*) as c FROM memory_rules').get();
            if (memCount.c === 0) {
                const insert = db.prepare('INSERT INTO memory_rules (content) VALUES (?)');
                insert.run('DSA: Minimum 1 problem daily');
                insert.run('Health is non-negotiable');
                insert.run('Consistency > Intensity');
            }

        } catch (err) {
            console.error("Failed to initialize database:", err);
            throw err;
        }
    }
    return db;
}
