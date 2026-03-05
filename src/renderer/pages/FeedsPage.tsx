import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MdRssFeed, MdRefresh, MdAdd, MdChevronRight, MdBookmark } from 'react-icons/md';
import type { Feed } from '@/shared/types';
import ConfirmDialog from '../components/ConfirmDialog';
import AddFeedModal from './AddFeedModal';

type FeedWithCount = Feed & { articleCount: number };

export default function FeedsPage() {
  const [feeds, setFeeds] = useState<FeedWithCount[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [showAddFeed, setShowAddFeed] = useState(false);
  const [deletingFeed, setDeletingFeed] = useState<Feed | null>(null);
  const navigate = useNavigate();

  const loadFeeds = useCallback(async () => {
    const allFeeds = await window.api.feeds.getAll();
    const feedsWithCount = await Promise.all(
      allFeeds.map(async (feed) => ({
        ...feed,
        articleCount: await window.api.feeds.getArticleCount(feed.id),
      }))
    );
    setFeeds(feedsWithCount);
  }, []);

  useEffect(() => { loadFeeds(); }, [loadFeeds]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      const allFeeds = await window.api.feeds.getAll();
      await Promise.all(allFeeds.map((feed) => window.api.rss.refresh(feed.id)));
      await loadFeeds();
    } catch {
      // silently fail
    } finally {
      setRefreshing(false);
    }
  }, [loadFeeds]);

  const handleDelete = useCallback(async () => {
    if (!deletingFeed) return;
    await window.api.feeds.delete(deletingFeed.id);
    setDeletingFeed(null);
    await loadFeeds();
  }, [deletingFeed, loadFeeds]);

  const handleFeedAdded = useCallback(() => {
    setShowAddFeed(false);
    loadFeeds();
  }, [loadFeeds]);

  return (
    <>
      <div className="page-header">
        <h1>Feeds</h1>
        <div className="page-header-actions">
          <button className="btn-icon" title="Reading List" onClick={() => navigate('/reading-list')}>
            <MdBookmark size={20} />
          </button>
          <button className="btn-icon" title="Refresh all feeds" onClick={handleRefresh} disabled={refreshing}>
            <MdRefresh size={20} style={refreshing ? { animation: 'spin 1s linear infinite' } : undefined} />
          </button>
          <button className="btn btn-primary" onClick={() => setShowAddFeed(true)}>
            <MdAdd size={18} />
            Add Feed
          </button>
        </div>
      </div>

      <div className="page-body">
        {feeds.length === 0 ? (
          <div className="empty-state">
            <MdRssFeed size={64} />
            <h2>No feeds yet</h2>
            <p>Add your first RSS feed to start reading</p>
            <button className="btn btn-primary" onClick={() => setShowAddFeed(true)}>
              <MdAdd size={18} />
              Add Feed
            </button>
          </div>
        ) : (
          feeds.map((feed, index) => (
            <div key={feed.id}>
              {index > 0 && <div className="list-separator" />}
              <div
                className="list-item"
                onClick={() => navigate(`/feed/${feed.id}`)}
                style={{ cursor: 'pointer' }}
              >
                <div style={{ flex: 1, marginRight: 12 }}>
                  <div style={{ fontWeight: 600, marginBottom: 2 }}>{feed.title}</div>
                  {feed.description && (
                    <div style={{ fontSize: 13, color: 'var(--color-text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {feed.description}
                    </div>
                  )}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>{feed.articleCount}</span>
                  <button
                    className="btn-icon btn-danger"
                    title="Delete feed"
                    onClick={(e) => { e.stopPropagation(); setDeletingFeed(feed); }}
                    style={{ fontSize: 13, padding: '4px 8px' }}
                  >
                    ✕
                  </button>
                  <MdChevronRight size={18} color="var(--color-icon)" />
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {showAddFeed && (
        <AddFeedModal onClose={() => setShowAddFeed(false)} onAdded={handleFeedAdded} />
      )}

      {deletingFeed && (
        <ConfirmDialog
          title="Delete Feed"
          message={`Remove "${deletingFeed.title}" and all its articles?`}
          onConfirm={handleDelete}
          onCancel={() => setDeletingFeed(null)}
        />
      )}
    </>
  );
}
