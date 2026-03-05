import { useState } from 'react';
import Modal from '../components/Modal';

type AddFeedModalProps = {
  onClose: () => void;
  onAdded: () => void;
};

export default function AddFeedModal({ onClose, onAdded }: AddFeedModalProps) {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const trimmed = url.trim();
    if (!trimmed) {
      setError('Please enter a feed URL.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const parsed = await window.api.rss.fetchAndParse(trimmed);
      const newFeed = await window.api.feeds.add(trimmed, parsed.title, parsed.description);
      await window.api.articles.upsert(newFeed.id, parsed.articles);
      onAdded();
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      if (message.includes('UNIQUE constraint')) {
        setError('This feed URL has already been added.');
      } else {
        setError(message || 'Could not add the feed. Please check the URL and try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal title="Add Feed" onClose={onClose}>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div>
          <label className="label">Feed URL</label>
          <input
            className="input"
            placeholder="https://example.com/feed.xml"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            autoFocus
            disabled={loading}
          />
          <p style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginTop: 6 }}>
            Enter an RSS or Atom feed URL. The app will automatically detect the feed title and articles.
          </p>
        </div>

        {error && (
          <p style={{ color: '#EF4444', fontSize: 13 }}>{error}</p>
        )}

        <button className="btn btn-primary" type="submit" disabled={loading} style={{ marginTop: 8, padding: '10px 0' }}>
          {loading ? <span className="spinner" /> : 'Add Feed'}
        </button>
      </form>
    </Modal>
  );
}
