import { getDb } from "./client.js";

// Minimal schema for Protokoll-Modul (projects, meetings, tops, meeting_tops, project_firms, project_persons, meeting_participants)
const MIGRATIONS = [
  {
    id: 1,
    name: "init-protokoll",
    sql: `
    CREATE TABLE IF NOT EXISTS projects (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      number TEXT,
      city TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS meetings (
      id TEXT PRIMARY KEY,
      project_id TEXT NOT NULL,
      meeting_index INTEGER NOT NULL,
      title TEXT,
      is_closed INTEGER NOT NULL DEFAULT 0,
      pdf_show_ampel INTEGER,
      todo_snapshot_json TEXT,
      next_meeting_enabled INTEGER,
      next_meeting_date TEXT,
      next_meeting_time TEXT,
      next_meeting_place TEXT,
      next_meeting_extra TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS tops (
      id TEXT PRIMARY KEY,
      project_id TEXT NOT NULL,
      parent_top_id TEXT,
      level INTEGER NOT NULL,
      number INTEGER NOT NULL,
      title TEXT NOT NULL,
      is_hidden INTEGER NOT NULL DEFAULT 0,
      is_trashed INTEGER NOT NULL DEFAULT 0,
      removed_at TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
      FOREIGN KEY (parent_top_id) REFERENCES tops(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS meeting_tops (
      meeting_id TEXT NOT NULL,
      top_id TEXT NOT NULL,
      status TEXT,
      due_date TEXT,
      longtext TEXT,
      is_carried_over INTEGER NOT NULL DEFAULT 0,
      is_task INTEGER NOT NULL DEFAULT 0,
      is_decision INTEGER NOT NULL DEFAULT 0,
      completed_in_meeting_id TEXT,
      is_important INTEGER DEFAULT 0,
      is_touched INTEGER DEFAULT 0,
      responsible_kind TEXT,
      responsible_id TEXT,
      responsible_label TEXT,
      contact_kind TEXT,
      contact_person_id TEXT,
      contact_label TEXT,
      frozen_at TEXT,
      frozen_title TEXT,
      frozen_is_hidden INTEGER,
      frozen_parent_top_id TEXT,
      frozen_level INTEGER,
      frozen_number INTEGER,
      frozen_display_number TEXT,
      frozen_ampel_color TEXT,
      frozen_ampel_reason TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      PRIMARY KEY (meeting_id, top_id),
      FOREIGN KEY (meeting_id) REFERENCES meetings(id) ON DELETE CASCADE,
      FOREIGN KEY (top_id) REFERENCES tops(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS project_firms (
      id TEXT PRIMARY KEY,
      project_id TEXT NOT NULL,
      name TEXT NOT NULL,
      short_label TEXT,
      removed_at TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS project_persons (
      id TEXT PRIMARY KEY,
      project_id TEXT NOT NULL,
      name TEXT NOT NULL,
      removed_at TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS meeting_participants (
      meeting_id TEXT NOT NULL,
      kind TEXT NOT NULL, -- "firm" | "project_person"
      firm_id TEXT NOT NULL DEFAULT '',
      person_id TEXT NOT NULL DEFAULT '',
      is_present INTEGER NOT NULL DEFAULT 0,
      is_in_distribution INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      PRIMARY KEY (meeting_id, kind, firm_id, person_id),
      FOREIGN KEY (meeting_id) REFERENCES meetings(id) ON DELETE CASCADE,
      FOREIGN KEY (firm_id) REFERENCES project_firms(id) ON DELETE CASCADE,
      FOREIGN KEY (person_id) REFERENCES project_persons(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS migrations (
      id INTEGER PRIMARY KEY,
      name TEXT NOT NULL,
      applied_at TEXT NOT NULL
    );
    `,
  },
];

export function runMigrations() {
  const db = getDb();
  db.exec("CREATE TABLE IF NOT EXISTS migrations (id INTEGER PRIMARY KEY, name TEXT NOT NULL, applied_at TEXT NOT NULL)");
  const applied = new Set(db.prepare("SELECT id FROM migrations").all().map((r) => r.id));
  const now = new Date().toISOString();
  const tx = db.transaction(() => {
    MIGRATIONS.forEach((m) => {
      if (applied.has(m.id)) return;
      db.exec(m.sql);
      db.prepare("INSERT INTO migrations (id, name, applied_at) VALUES (?, ?, ?)").run(m.id, m.name, now);
    });
  });
  tx();
}
