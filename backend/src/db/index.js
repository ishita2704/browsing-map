import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';

const dbPath = process.env.DATABASE_PATH || './data/visits.db';
const dbDir = path.dirname(dbPath);

if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const db = new Database(dbPath);

db.pragma('journal_mode = WAL'); //WAL stands for Write-Ahead Logging to readers and writers to operate concurrently.
//sQLite requires no separate database server,
db.exec(`
  CREATE TABLE IF NOT EXISTS visits (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    url TEXT NOT NULL,
    domain TEXT NOT NULL,
    ip TEXT,
    latitude REAL,
    longitude REAL,
    country TEXT,
    country_code TEXT,
    city TEXT,
    geo_status TEXT NOT NULL DEFAULT 'pending',
    visited_at TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE INDEX IF NOT EXISTS idx_visits_visited_at ON visits(visited_at);
  CREATE INDEX IF NOT EXISTS idx_visits_country_code ON visits(country_code);
  CREATE INDEX IF NOT EXISTS idx_visits_geo_status ON visits(geo_status);
`);

export function insertVisit(visit) { //insert the visit into the database
  const stmt = db.prepare(`
    INSERT INTO visits (
      url, domain, ip, latitude, longitude,
      country, country_code, city, geo_status, visited_at
    ) VALUES (
      @url, @domain, @ip, @latitude, @longitude,
      @country, @country_code, @city, @geo_status, @visited_at
    )
  `);

  const result = stmt.run(visit); //run the insert statement
  return getVisitById(result.lastInsertRowid); //get the visit by id
}

export function getVisitById(id) { //get the visit by id
  return db.prepare('SELECT * FROM visits WHERE id = ?').get(id);
}

const PLOTTABLE_STATUSES = "'resolved', 'company_fallback'"; //statuses that can be plotted

export function getAllVisits({ start, end } = {}) { //get all the visits
  let query = `SELECT * FROM visits WHERE geo_status IN (${PLOTTABLE_STATUSES})`;
  const params = [];

  if (start) {
    query += ' AND visited_at >= ?';
    params.push(start);
  }
  if (end) {
    query += ' AND visited_at <= ?';
    params.push(end);
  }

  query += ' ORDER BY visited_at ASC';
  return db.prepare(query).all(...params);
}

export function getCountryStats({ start, end } = {}) { //get the country stats
  let query = `
    SELECT country, country_code, COUNT(*) as count
    FROM visits
    WHERE geo_status IN (${PLOTTABLE_STATUSES}) AND country_code IS NOT NULL
  `;
  const params = [];

  if (start) {
    query += ' AND visited_at >= ?';
    params.push(start);
  }
  if (end) {
    query += ' AND visited_at <= ?';
    params.push(end);
  }

  query += ' GROUP BY country_code ORDER BY count DESC';
  return db.prepare(query).all(...params);
}

export function getVisitBounds() { //get the min and max time and total visits
  return db.prepare(`
    SELECT MIN(visited_at) as min_time, MAX(visited_at) as max_time, COUNT(*) as total
    FROM visits
    WHERE geo_status IN (${PLOTTABLE_STATUSES})
  `).get();
}

export default db;
