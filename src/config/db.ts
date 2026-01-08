import sqlite3 from 'sqlite3';
import { open, Database } from 'sqlite';

let db: Database;

export const initDB = async () => {

  db = await open({
    filename: './bajajTrades.db',
    driver: sqlite3.Database
  });

  await db.exec(`
    CREATE TABLE IF NOT EXISTS instruments (
      symbol TEXT PRIMARY KEY,
      exchange TEXT,
      instrumentType TEXT,
      lastTradedPrice REAL
    );

    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      cash REAL
    );

    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      symbol TEXT,
      type TEXT,
      style TEXT,
      quantity INTEGER,
      price REAL,
      status TEXT,
      timestamp TEXT
    );

    CREATE TABLE IF NOT EXISTS portfolio (
      symbol TEXT PRIMARY KEY,
      quantity INTEGER,
      averagePrice REAL
    );
  `);

  const instruments = await db.all('SELECT * FROM instruments');
  if (instruments.length === 0) {
    await db.run(`INSERT INTO instruments (symbol, name, type, price) VALUES 
      ('RELIANCE', 'Reliance Industries', 'EQUITY', 2500),
      ('TCS', 'Tata Consultancy Svcs', 'EQUITY', 3400),
      ('INFY', 'Infosys', 'EQUITY', 1600)`);
    
    await db.run(`INSERT INTO users (id, cash) VALUES ('default_user', 100000)`);
    console.log("✅ Database initialized with seed data.");
  }

  return db;
};

export const getDB = () => {
  if (!db) {
    throw new Error('db is not initialized');
  }
  return db;
};