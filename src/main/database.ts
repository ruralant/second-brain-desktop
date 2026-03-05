import Database from 'better-sqlite3';
import { app } from 'electron';
import path from 'path';
import type { Feed, Article, Task, TaskWithCategory, Category, SavedArticle } from '@/shared/types';

const dbPath = path.join(app.getPath('userData'), 'second-brain.db');
let db: Database.Database;

export function initializeDatabase(): void {
  db = new Database(dbPath);
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');

  db.exec(`
    CREATE TABLE IF NOT EXISTS feeds (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      url TEXT NOT NULL UNIQUE,
      description TEXT,
      lastFetchedAt TEXT,
      createdAt TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS articles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      feedId INTEGER NOT NULL,
      title TEXT NOT NULL,
      url TEXT NOT NULL,
      description TEXT,
      pubDate TEXT,
      isRead INTEGER NOT NULL DEFAULT 0,
      isSaved INTEGER NOT NULL DEFAULT 0,
      createdAt TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (feedId) REFERENCES feeds(id) ON DELETE CASCADE,
      UNIQUE(feedId, url)
    );
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      color TEXT NOT NULL DEFAULT '#6B7280',
      createdAt TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS tasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      categoryId INTEGER,
      priority INTEGER NOT NULL DEFAULT 2,
      isCompleted INTEGER NOT NULL DEFAULT 0,
      createdAt TEXT NOT NULL DEFAULT (datetime('now')),
      completedAt TEXT,
      FOREIGN KEY (categoryId) REFERENCES categories(id) ON DELETE SET NULL
    );
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY NOT NULL,
      value TEXT NOT NULL
    );
  `);
}

// ── Feeds ──

export function getAllFeeds(): Feed[] {
  return db.prepare('SELECT * FROM feeds ORDER BY createdAt DESC').all() as Feed[];
}

export function getFeedById(id: number): Feed | null {
  return (db.prepare('SELECT * FROM feeds WHERE id = ?').get(id) as Feed) ?? null;
}

export function addFeed(url: string, title: string, description: string | null): Feed {
  const result = db.prepare('INSERT INTO feeds (url, title, description) VALUES (?, ?, ?)').run(url, title, description);
  return db.prepare('SELECT * FROM feeds WHERE id = ?').get(result.lastInsertRowid) as Feed;
}

export function deleteFeed(id: number): void {
  db.prepare('DELETE FROM feeds WHERE id = ?').run(id);
}

export function updateLastFetched(id: number): void {
  db.prepare("UPDATE feeds SET lastFetchedAt = datetime('now') WHERE id = ?").run(id);
}

export function getFeedArticleCount(feedId: number): number {
  const row = db.prepare('SELECT COUNT(*) as count FROM articles WHERE feedId = ?').get(feedId) as { count: number };
  return row?.count ?? 0;
}

// ── Articles ──

export function getArticlesByFeed(feedId: number): Article[] {
  return db.prepare(
    `SELECT id, feedId, title, url, description, pubDate, isRead, isSaved, createdAt
     FROM articles WHERE feedId = ? ORDER BY pubDate DESC, createdAt DESC`
  ).all(feedId) as Article[];
}

export function upsertArticles(
  feedId: number,
  articles: { title: string; url: string; description: string | null; pubDate: string | null }[]
): void {
  const stmt = db.prepare(
    `INSERT INTO articles (feedId, title, url, description, pubDate)
     VALUES (?, ?, ?, ?, ?)
     ON CONFLICT(feedId, url) DO UPDATE SET
       title = excluded.title,
       description = excluded.description,
       pubDate = excluded.pubDate`
  );

  const insertMany = db.transaction((items: typeof articles) => {
    for (const article of items) {
      stmt.run(feedId, article.title, article.url, article.description, article.pubDate);
    }
  });

  insertMany(articles);
}

export function markAsRead(id: number): void {
  db.prepare('UPDATE articles SET isRead = 1 WHERE id = ?').run(id);
}

export function toggleSaveArticle(id: number): void {
  db.prepare('UPDATE articles SET isSaved = CASE WHEN isSaved = 1 THEN 0 ELSE 1 END WHERE id = ?').run(id);
}

export function getSavedArticles(): SavedArticle[] {
  return db.prepare(
    `SELECT a.id, a.feedId, a.title, a.url, a.description, a.pubDate,
            a.isRead, a.isSaved, a.createdAt, f.title as feedTitle
     FROM articles a
     JOIN feeds f ON a.feedId = f.id
     WHERE a.isSaved = 1
     ORDER BY a.createdAt DESC`
  ).all() as SavedArticle[];
}

// ── Tasks ──

export function getAllTasks(): TaskWithCategory[] {
  return db.prepare(
    `SELECT t.id, t.title, t.categoryId, t.priority, t.isCompleted,
            t.createdAt, t.completedAt,
            c.name as categoryName, c.color as categoryColor
     FROM tasks t
     LEFT JOIN categories c ON t.categoryId = c.id
     ORDER BY t.isCompleted ASC, t.priority DESC, t.createdAt DESC`
  ).all() as TaskWithCategory[];
}

export function addTask(title: string, categoryId: number | null, priority: number): Task {
  const result = db.prepare('INSERT INTO tasks (title, categoryId, priority) VALUES (?, ?, ?)').run(title, categoryId, priority);
  return db.prepare('SELECT * FROM tasks WHERE id = ?').get(result.lastInsertRowid) as Task;
}

export function toggleTask(id: number): void {
  db.prepare(
    `UPDATE tasks SET
       isCompleted = CASE WHEN isCompleted = 0 THEN 1 ELSE 0 END,
       completedAt = CASE WHEN isCompleted = 0 THEN datetime('now') ELSE NULL END
     WHERE id = ?`
  ).run(id);
}

export function deleteTask(id: number): void {
  db.prepare('DELETE FROM tasks WHERE id = ?').run(id);
}

// ── Categories ──

export function getAllCategories(): Category[] {
  return db.prepare('SELECT * FROM categories ORDER BY name ASC').all() as Category[];
}

export function addCategory(name: string, color: string): Category {
  const result = db.prepare('INSERT INTO categories (name, color) VALUES (?, ?)').run(name, color);
  return db.prepare('SELECT * FROM categories WHERE id = ?').get(result.lastInsertRowid) as Category;
}

export function deleteCategory(id: number): void {
  db.prepare('DELETE FROM categories WHERE id = ?').run(id);
}

// ── Settings ──

export function getSetting(key: string): string | null {
  const row = db.prepare('SELECT value FROM settings WHERE key = ?').get(key) as { value: string } | undefined;
  return row?.value ?? null;
}

export function setSetting(key: string, value: string): void {
  db.prepare('INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value').run(key, value);
}
