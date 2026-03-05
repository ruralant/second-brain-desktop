import { contextBridge, ipcRenderer } from 'electron';
import type { ElectronAPI } from '@/shared/types';

const api: ElectronAPI = {
  feeds: {
    getAll: () => ipcRenderer.invoke('feeds:getAll'),
    getById: (id) => ipcRenderer.invoke('feeds:getById', id),
    add: (url, title, description) => ipcRenderer.invoke('feeds:add', url, title, description),
    delete: (id) => ipcRenderer.invoke('feeds:delete', id),
    updateLastFetched: (id) => ipcRenderer.invoke('feeds:updateLastFetched', id),
    getArticleCount: (feedId) => ipcRenderer.invoke('feeds:getArticleCount', feedId),
  },
  articles: {
    getByFeed: (feedId) => ipcRenderer.invoke('articles:getByFeed', feedId),
    upsert: (feedId, articles) => ipcRenderer.invoke('articles:upsert', feedId, articles),
    markAsRead: (id) => ipcRenderer.invoke('articles:markAsRead', id),
    toggleSave: (id) => ipcRenderer.invoke('articles:toggleSave', id),
    getSaved: () => ipcRenderer.invoke('articles:getSaved'),
  },
  tasks: {
    getAll: () => ipcRenderer.invoke('tasks:getAll'),
    add: (title, categoryId, priority) => ipcRenderer.invoke('tasks:add', title, categoryId, priority),
    toggle: (id) => ipcRenderer.invoke('tasks:toggle', id),
    delete: (id) => ipcRenderer.invoke('tasks:delete', id),
  },
  categories: {
    getAll: () => ipcRenderer.invoke('categories:getAll'),
    add: (name, color) => ipcRenderer.invoke('categories:add', name, color),
    delete: (id) => ipcRenderer.invoke('categories:delete', id),
  },
  settings: {
    get: (key) => ipcRenderer.invoke('settings:get', key),
    set: (key, value) => ipcRenderer.invoke('settings:set', key, value),
  },
  shell: {
    openExternal: (url) => ipcRenderer.invoke('shell:openExternal', url),
  },
  rss: {
    fetchAndParse: (url) => ipcRenderer.invoke('rss:fetchAndParse', url),
    refresh: (feedId) => ipcRenderer.invoke('rss:refresh', feedId),
  },
};

contextBridge.exposeInMainWorld('api', api);
