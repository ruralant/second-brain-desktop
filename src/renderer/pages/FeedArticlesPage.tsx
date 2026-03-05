import { useCallback, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MdArrowBack, MdRefresh, MdBookmark, MdBookmarkBorder, MdArticle } from 'react-icons/md';
import type { Article, Feed } from '@/shared/types';

export default function FeedArticlesPage() {
  const { id } = useParams<{ id: string }>();
  const feedId = Number(id);
  const navigate = useNavigate();
  const [feed, setFeed] = useState<Feed | null>(null);
  const [articles, setArticles] = useState<Article[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    const [feedData, articleData] = await Promise.all([
      window.api.feeds.getById(feedId),
      window.api.articles.getByFeed(feedId),
    ]);
    setFeed(feedData);
    setArticles(articleData);
  }, [feedId]);

  useEffect(() => { loadData(); }, [loadData]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await window.api.rss.refresh(feedId);
      await loadData();
    } catch {
      // silently fail
    } finally {
      setRefreshing(false);
    }
  }, [feedId, loadData]);

  const handleOpenArticle = useCallback(async (article: Article) => {
    await window.api.articles.markAsRead(article.id);
    setArticles(prev => prev.map(a => a.id === article.id ? { ...a, isRead: 1 } : a));
    if (article.url) {
      window.api.shell.openExternal(article.url);
    }
  }, []);

  const handleToggleSave = useCallback(async (article: Article) => {
    await window.api.articles.toggleSave(article.id);
    setArticles(prev => prev.map(a => a.id === article.id ? { ...a, isSaved: a.isSaved ? 0 : 1 } : a));
  }, []);

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '';
    try {
      return new Date(dateStr).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  return (
    <>
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button className="btn-icon" onClick={() => navigate('/')}>
            <MdArrowBack size={20} />
          </button>
          <h1>{feed?.title ?? 'Articles'}</h1>
        </div>
        <div className="page-header-actions">
          <button className="btn-icon" title="Refresh" onClick={handleRefresh} disabled={refreshing}>
            <MdRefresh size={20} style={refreshing ? { animation: 'spin 1s linear infinite' } : undefined} />
          </button>
        </div>
      </div>

      <div className="page-body">
        {articles.length === 0 ? (
          <div className="empty-state">
            <MdArticle size={48} />
            <p>No articles found. Try refreshing.</p>
          </div>
        ) : (
          articles.map((article, index) => (
            <div key={article.id}>
              {index > 0 && <div className="list-separator" />}
              <div className="list-item" onClick={() => handleOpenArticle(article)} style={{ cursor: 'pointer' }}>
                <div style={{ flex: 1, gap: 4, display: 'flex', flexDirection: 'column' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    {!article.isRead && (
                      <span style={{ width: 8, height: 8, borderRadius: 4, background: 'var(--color-tint)', flexShrink: 0 }} />
                    )}
                    <span style={{ fontWeight: 600, opacity: article.isRead ? 0.6 : 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {article.title}
                    </span>
                  </div>
                  {article.description && (
                    <div style={{ fontSize: 13, color: 'var(--color-text-secondary)', marginLeft: article.isRead ? 0 : 16, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {article.description}
                    </div>
                  )}
                  {article.pubDate && (
                    <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', opacity: 0.6, marginLeft: article.isRead ? 0 : 16 }}>
                      {formatDate(article.pubDate)}
                    </div>
                  )}
                </div>
                <button
                  className="btn-icon"
                  title={article.isSaved ? 'Unsave' : 'Save to reading list'}
                  onClick={(e) => { e.stopPropagation(); handleToggleSave(article); }}
                >
                  {article.isSaved ? (
                    <MdBookmark size={20} color="var(--color-tint)" />
                  ) : (
                    <MdBookmarkBorder size={20} />
                  )}
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </>
  );
}
