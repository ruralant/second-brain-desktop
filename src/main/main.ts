import { app, BrowserWindow, ipcMain, shell } from 'electron';
import path from 'path';
import {
  initializeDatabase,
  getAllFeeds, getFeedById, addFeed, deleteFeed, updateLastFetched, getFeedArticleCount,
  getArticlesByFeed, upsertArticles, markAsRead, toggleSaveArticle, getSavedArticles,
  getAllTasks, addTask, toggleTask, deleteTask,
  getAllCategories, addCategory, deleteCategory,
  getSetting, setSetting,
} from './database';
import { fetchAndParseFeed } from '@/services/rss';

declare const MAIN_WINDOW_VITE_DEV_SERVER_URL: string | undefined;
declare const MAIN_WINDOW_VITE_NAME: string;

let mainWindow: BrowserWindow | null = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1000,
    height: 700,
    minWidth: 700,
    minHeight: 500,
    titleBarStyle: process.platform === 'darwin' ? 'hiddenInset' : 'default',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`));
  }
}

function registerIpcHandlers() {
  // ── Feeds ──
  ipcMain.handle('feeds:getAll', () => getAllFeeds());
  ipcMain.handle('feeds:getById', (_, id: number) => getFeedById(id));
  ipcMain.handle('feeds:add', (_, url: string, title: string, description: string | null) => addFeed(url, title, description));
  ipcMain.handle('feeds:delete', (_, id: number) => deleteFeed(id));
  ipcMain.handle('feeds:updateLastFetched', (_, id: number) => updateLastFetched(id));
  ipcMain.handle('feeds:getArticleCount', (_, feedId: number) => getFeedArticleCount(feedId));

  // ── Articles ──
  ipcMain.handle('articles:getByFeed', (_, feedId: number) => getArticlesByFeed(feedId));
  ipcMain.handle('articles:upsert', (_, feedId: number, articles) => upsertArticles(feedId, articles));
  ipcMain.handle('articles:markAsRead', (_, id: number) => markAsRead(id));
  ipcMain.handle('articles:toggleSave', (_, id: number) => toggleSaveArticle(id));
  ipcMain.handle('articles:getSaved', () => getSavedArticles());

  // ── Tasks ──
  ipcMain.handle('tasks:getAll', () => getAllTasks());
  ipcMain.handle('tasks:add', (_, title: string, categoryId: number | null, priority: number) => addTask(title, categoryId, priority));
  ipcMain.handle('tasks:toggle', (_, id: number) => toggleTask(id));
  ipcMain.handle('tasks:delete', (_, id: number) => deleteTask(id));

  // ── Categories ──
  ipcMain.handle('categories:getAll', () => getAllCategories());
  ipcMain.handle('categories:add', (_, name: string, color: string) => addCategory(name, color));
  ipcMain.handle('categories:delete', (_, id: number) => deleteCategory(id));

  // ── Settings ──
  ipcMain.handle('settings:get', (_, key: string) => getSetting(key));
  ipcMain.handle('settings:set', (_, key: string, value: string) => setSetting(key, value));

  // ── Shell ──
  ipcMain.handle('shell:openExternal', (_, url: string) => {
    // Only allow http/https URLs
    if (/^https?:\/\//i.test(url)) {
      return shell.openExternal(url);
    }
  });

  // ── RSS ──
  ipcMain.handle('rss:fetchAndParse', async (_, url: string) => {
    return fetchAndParseFeed(url);
  });
  ipcMain.handle('rss:refresh', async (_, feedId: number) => {
    const feed = getFeedById(feedId);
    if (!feed) throw new Error('Feed not found');
    const parsed = await fetchAndParseFeed(feed.url);
    upsertArticles(feedId, parsed.articles);
    updateLastFetched(feedId);
  });
}

app.whenReady().then(() => {
  initializeDatabase();
  registerIpcHandlers();
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
