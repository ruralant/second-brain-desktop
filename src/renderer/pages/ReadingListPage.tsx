import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MdArrowBack, MdBookmark, MdBookmarkBorder } from 'react-icons/md';
import type { SavedArticle } from '@/shared/types';

export default function ReadingListPage() {
  const [articles, setArticles] = useState<SavedArticle[]>([]);
  const navigate = useNavigate();

  const loadArticles = useCallback(async () => {
    setArticles(await window.api.articles.getSaved());
  }, []);

  useEffect(() => { loadArticles(); }, [loadArticles]);

  const handleOpen = useCallback(async (article: SavedArticle) => {
    await window.api.articles.markAsRead(article.id);
    if (article.url) {
      window.api.shell.openExternal(article.url);
    }
  }, []);

  const handleUnsave = useCallback(async (article: SavedArticle) => {
    await window.api.articles.toggleSave(article.id);
    setArticles(prev => prev.filter(a => a.id !== article.id));
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
          <h1>Reading List</h1>
        </div>
      </div>

      <div className="page-body">
        {articles.length === 0 ? (
          <div className="empty-state">
            <MdBookmarkBorder size={48} />
            <p>No saved articles yet. Tap the bookmark icon on any article to save it here.</p>
          </div>
        ) : (
          articles.map((article, index) => (
            <div key={article.id}>
              {index > 0 && <div className="list-separator" />}
              <div className="list-item" onClick={() => handleOpen(article)} style={{ cursor: 'pointer' }}>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <span style={{ fontWeight: 600 }}>{article.title}</span>
                  <span style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>{article.feedTitle}</span>
                  {article.pubDate && (
                    <span style={{ fontSize: 12, color: 'var(--color-text-secondary)', opacity: 0.6 }}>
                      {formatDate(article.pubDate)}
                    </span>
                  )}
                </div>
                <button
                  className="btn-icon"
                  title="Remove from reading list"
                  onClick={(e) => { e.stopPropagation(); handleUnsave(article); }}
                >
                  <MdBookmark size={20} color="var(--color-tint)" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </>
  );
}
