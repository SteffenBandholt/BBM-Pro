import { getDb } from "./client.js";

function getTableColumns(db, tableName) {
  return db.prepare(`PRAGMA table_info(${tableName})`).all();
}

function getTableColumnNames(db, tableName) {
  return new Set(
    getTableColumns(db, tableName).map((column) => column.name),
  );
}

function ensureProjectsMetadataColumns(db) {
  const projectColumns = getTableColumnNames(db, "projects");

  if (!projectColumns.has("status")) {
    db.exec("ALTER TABLE projects ADD COLUMN status TEXT");
    projectColumns.add("status");
  }

  if (!projectColumns.has("description")) {
    db.exec("ALTER TABLE projects ADD COLUMN description TEXT");
    projectColumns.add("description");
  }

  if (!projectColumns.has("start_date")) {
    db.exec("ALTER TABLE projects ADD COLUMN start_date TEXT");
    projectColumns.add("start_date");
  }

  if (!projectColumns.has("end_date")) {
    db.exec("ALTER TABLE projects ADD COLUMN end_date TEXT");
    projectColumns.add("end_date");
  }

  db.exec(`
    UPDATE projects
    SET status = COALESCE(NULLIF(TRIM(COALESCE(status, '')), ''), 'geplant'),
        description = COALESCE(description, ''),
        start_date = COALESCE(start_date, ''),
        end_date = COALESCE(end_date, '');
  `);
}

function ensureFirmFlowTables(db) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS global_firms (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      short_label TEXT,
      removed_at TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
  `);

  const projectFirmColumns = getTableColumnNames(db, "project_firms");

  if (!projectFirmColumns.has("global_firm_id")) {
    db.exec("ALTER TABLE project_firms ADD COLUMN global_firm_id TEXT");
  }
}

function ensureFirmEmployeesTable(db) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS global_firm_employees (
      id TEXT PRIMARY KEY,
      global_firm_id TEXT NOT NULL,
      name TEXT NOT NULL,
      removed_at TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (global_firm_id) REFERENCES global_firms(id) ON DELETE CASCADE
    );
  `);
}

function ensureProjectFirmEmployeesTable(db) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS project_firm_employees (
      id TEXT PRIMARY KEY,
      project_firm_id TEXT NOT NULL,
      global_employee_id TEXT NOT NULL,
      removed_at TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (project_firm_id) REFERENCES project_firms(id) ON DELETE CASCADE,
      FOREIGN KEY (global_employee_id) REFERENCES global_firm_employees(id) ON DELETE CASCADE
    );
  `);
}

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
  {
    id: 2,
    name: "meetings-protocol-label",
    sql: `
    ALTER TABLE meetings ADD COLUMN protocol_label TEXT;
    UPDATE meetings SET protocol_label = 'Protokoll' WHERE protocol_label IS NULL OR TRIM(protocol_label) = '';
    `,
  },
  {
    id: 3,
    name: "projects-metadata-fields",
    run: ensureProjectsMetadataColumns,
  },
  {
    id: 4,
    name: "firms-flow",
    run: ensureFirmFlowTables,
  },
  {
    id: 6,
    name: "firm-employees",
    run: ensureFirmEmployeesTable,
  },
  {
    id: 7,
    name: "project-firm-employees",
    run: ensureProjectFirmEmployeesTable,
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
      try {
        if (typeof m.run === "function") {
          m.run(db);
        } else {
          db.exec(m.sql);
        }
      } catch (err) {
        console.error("[sqlite] migration failed", { id: m.id, name: m.name, err });
        throw err;
      }
      db.prepare("INSERT INTO migrations (id, name, applied_at) VALUES (?, ?, ?)").run(m.id, m.name, now);
    });
  });
  tx();
}
