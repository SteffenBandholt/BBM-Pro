/**
 * SQLite client bootstrap (Node-only).
 *
 * Integration gap: renderer/UI still uses localStorage-backed repos.
 * Switch to this client by importing the sqlite repos (see repos/*.js) from a Node/Electron context.
 */
import Database from "better-sqlite3";
import path from "node:path";
import fs from "node:fs";
import os from "node:os";

const DB_FILE = path.join(os.homedir(), ".bbmpro", "bbmpro.db");

function ensureDir() {
  const dir = path.dirname(DB_FILE);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

let dbInstance = null;

export function getDb() {
  if (dbInstance) return dbInstance;
  ensureDir();
  dbInstance = new Database(DB_FILE);
  dbInstance.pragma("foreign_keys = ON");
  return dbInstance;
}
