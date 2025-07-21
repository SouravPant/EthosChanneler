import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle as drizzleNeon } from 'drizzle-orm/neon-serverless';
import { drizzle as drizzleSQLite } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import ws from "ws";
import * as schemaPG from "@shared/schema";
import * as schemaSQLite from "@shared/schema-sqlite";
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import fs from 'fs';

neonConfig.webSocketConstructor = ws;

// Check if we're in development and PostgreSQL is not available
const isDevelopment = process.env.NODE_ENV === 'development';
const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

// Try to determine if we should use SQLite (for local development)
const useSQLite = isDevelopment && (
  !databaseUrl.includes('neon.tech') && 
  !databaseUrl.includes('postgres://') && 
  !databaseUrl.includes('postgresql://')
) || databaseUrl.includes('sqlite:');

let db: any;
let schema: any;

if (useSQLite || databaseUrl.includes('sqlite:')) {
  // Use SQLite for local development
  const dbPath = databaseUrl.includes('sqlite:') ? 
    databaseUrl.replace('sqlite:', '') : 
    './dev.db';
  
  const sqlite = new Database(dbPath);
  db = drizzleSQLite(sqlite, { schema: schemaSQLite });
  schema = schemaSQLite;
  
  // Create tables if they don't exist
  try {
    // Simple table creation for SQLite
    sqlite.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY,
        fid INTEGER NOT NULL UNIQUE,
        username TEXT NOT NULL UNIQUE,
        display_name TEXT NOT NULL,
        pfp_url TEXT,
        bio TEXT,
        ethos_address TEXT,
        credibility_score INTEGER DEFAULT 0 NOT NULL,
        vouches_received INTEGER DEFAULT 0 NOT NULL,
        vouches_given INTEGER DEFAULT 0 NOT NULL,
        reviews_given INTEGER DEFAULT 0 NOT NULL,
        network_size INTEGER DEFAULT 0 NOT NULL,
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
      
      CREATE TABLE IF NOT EXISTS vouches (
        id INTEGER PRIMARY KEY,
        voucher_id INTEGER NOT NULL REFERENCES users(id),
        vouchee_id INTEGER NOT NULL REFERENCES users(id),
        stake_amount REAL NOT NULL,
        reason TEXT,
        is_active INTEGER DEFAULT 1 NOT NULL,
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
      
      CREATE TABLE IF NOT EXISTS reviews (
        id INTEGER PRIMARY KEY,
        reviewer_id INTEGER NOT NULL REFERENCES users(id),
        reviewee_id INTEGER NOT NULL REFERENCES users(id),
        rating INTEGER NOT NULL,
        comment TEXT,
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
      
      CREATE TABLE IF NOT EXISTS activities (
        id INTEGER PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id),
        actor_id INTEGER REFERENCES users(id),
        type TEXT NOT NULL,
        description TEXT NOT NULL,
        score_change INTEGER DEFAULT 0 NOT NULL,
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
      
      CREATE TABLE IF NOT EXISTS connections (
        id INTEGER PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id),
        connected_user_id INTEGER NOT NULL REFERENCES users(id),
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('SQLite database initialized');
  } catch (error) {
    console.error('Error initializing SQLite database:', error);
  }
} else {
  // Use PostgreSQL/Neon for production
  try {
    const pool = new Pool({ connectionString: databaseUrl });
    db = drizzleNeon({ client: pool, schema: schemaPG });
    schema = schemaPG;
    console.log('Connected to PostgreSQL database');
  } catch (error) {
    console.error('Error connecting to PostgreSQL:', error);
    // Fallback to SQLite if PostgreSQL connection fails
    console.log('Falling back to SQLite...');
    const sqlite = new Database('./dev.db');
    db = drizzleSQLite(sqlite, { schema: schemaSQLite });
    schema = schemaSQLite;
  }
}

export { db, schema };