"use strict";
const electron = require("electron");
const api = {
  feeds: {
    getAll: () => electron.ipcRenderer.invoke("feeds:getAll"),
    getById: (id) => electron.ipcRenderer.invoke("feeds:getById", id),
    add: (url, title, description) => electron.ipcRenderer.invoke("feeds:add", url, title, description),
    delete: (id) => electron.ipcRenderer.invoke("feeds:delete", id),
    updateLastFetched: (id) => electron.ipcRenderer.invoke("feeds:updateLastFetched", id),
    getArticleCount: (feedId) => electron.ipcRenderer.invoke("feeds:getArticleCount", feedId)
  },
  articles: {
    getByFeed: (feedId) => electron.ipcRenderer.invoke("articles:getByFeed", feedId),
    upsert: (feedId, articles) => electron.ipcRenderer.invoke("articles:upsert", feedId, articles),
    markAsRead: (id) => electron.ipcRenderer.invoke("articles:markAsRead", id),
    toggleSave: (id) => electron.ipcRenderer.invoke("articles:toggleSave", id),
    getSaved: () => electron.ipcRenderer.invoke("articles:getSaved")
  },
  tasks: {
    getAll: () => electron.ipcRenderer.invoke("tasks:getAll"),
    add: (title, categoryId, priority) => electron.ipcRenderer.invoke("tasks:add", title, categoryId, priority),
    toggle: (id) => electron.ipcRenderer.invoke("tasks:toggle", id),
    delete: (id) => electron.ipcRenderer.invoke("tasks:delete", id)
  },
  categories: {
    getAll: () => electron.ipcRenderer.invoke("categories:getAll"),
    add: (name, color) => electron.ipcRenderer.invoke("categories:add", name, color),
    delete: (id) => electron.ipcRenderer.invoke("categories:delete", id)
  },
  settings: {
    get: (key) => electron.ipcRenderer.invoke("settings:get", key),
    set: (key, value) => electron.ipcRenderer.invoke("settings:set", key, value)
  },
  shell: {
    openExternal: (url) => electron.ipcRenderer.invoke("shell:openExternal", url)
  },
  rss: {
    fetchAndParse: (url) => electron.ipcRenderer.invoke("rss:fetchAndParse", url),
    refresh: (feedId) => electron.ipcRenderer.invoke("rss:refresh", feedId)
  }
};
electron.contextBridge.exposeInMainWorld("api", api);
