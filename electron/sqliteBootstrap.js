import { runMigrations as runSqliteMigrations } from '../src/node-sqlite/migrations.js';

export function runMigrations() {
  runSqliteMigrations();
}
