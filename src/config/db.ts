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
    console.log("addind mock data in instruments")
    
    await db.run(`INSERT INTO instruments (symbol, exchange, instrumentType, lastTradedPrice) VALUES 
      ('Bajaj', 'NSE', 'EQUITY', 2000),
      ('NIFTY50', 'NSE', 'INDEX', 4000),
      ('TCS', 'BSE', 'EQUITY', 2500),
      ('INFY', 'BSE', 'EQUITY', 1000)`);
    
    await db.run(`INSERT INTO users (id, cash) VALUES ('shiv_rajput', 1000000)`);

    console.log(" added mock dagta for testing.");
  }

  return db;
};

export const getDB = () => {
  if (!db) {
    throw new Error('db is not initialized');
  }
  return db;
};