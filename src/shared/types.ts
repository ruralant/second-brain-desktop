export type Feed = {
  id: number;
  title: string;
  url: string;
  description: string | null;
  lastFetchedAt: string | null;
  createdAt: string;
};

export type Article = {
  id: number;
  feedId: number;
  title: string;
  url: string;
  description: string | null;
  pubDate: string | null;
  isRead: number;
  isSaved: number;
  createdAt: string;
};

export type Category = {
  id: number;
  name: string;
  color: string;
  createdAt: string;
};

export type Priority = 1 | 2 | 3;

export type Task = {
  id: number;
  title: string;
  categoryId: number | null;
  priority: Priority;
  isCompleted: number;
  createdAt: string;
  completedAt: string | null;
};

export type TaskWithCategory = Task & {
  categoryName: string | null;
  categoryColor: string | null;
};

export type SavedArticle = Article & { feedTitle: string };

export interface ElectronAPI {
  feeds: {
    getAll(): Promise<Feed[]>;
    getById(id: number): Promise<Feed | null>;
    add(url: string, title: string, description: string | null): Promise<Feed>;
    delete(id: number): Promise<void>;
    updateLastFetched(id: number): Promise<void>;
    getArticleCount(feedId: number): Promise<number>;
  };
  articles: {
    getByFeed(feedId: number): Promise<Article[]>;
    upsert(feedId: number, articles: { title: string; url: string; description: string | null; pubDate: string | null }[]): Promise<void>;
    markAsRead(id: number): Promise<void>;
    toggleSave(id: number): Promise<void>;
    getSaved(): Promise<SavedArticle[]>;
  };
  tasks: {
    getAll(): Promise<TaskWithCategory[]>;
    add(title: string, categoryId: number | null, priority: number): Promise<Task>;
    toggle(id: number): Promise<void>;
    delete(id: number): Promise<void>;
  };
  categories: {
    getAll(): Promise<Category[]>;
    add(name: string, color: string): Promise<Category>;
    delete(id: number): Promise<void>;
  };
  settings: {
    get(key: string): Promise<string | null>;
    set(key: string, value: string): Promise<void>;
  };
  shell: {
    openExternal(url: string): Promise<void>;
  };
  rss: {
    fetchAndParse(url: string): Promise<{
      title: string;
      description: string | null;
      articles: { title: string; url: string; description: string | null; pubDate: string | null }[];
    }>;
    refresh(feedId: number): Promise<void>;
  };
}

declare global {
  interface Window {
    api: ElectronAPI;
  }
}
