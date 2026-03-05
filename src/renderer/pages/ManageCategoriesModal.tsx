import { useCallback, useEffect, useState } from 'react';
import { MdAdd, MdDelete } from 'react-icons/md';
import type { Category } from '@/shared/types';
import { CATEGORY_COLORS } from '../constants/theme';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';

type ManageCategoriesModalProps = {
  onClose: () => void;
};

export default function ManageCategoriesModal({ onClose }: ManageCategoriesModalProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [name, setName] = useState('');
  const [selectedColor, setSelectedColor] = useState(CATEGORY_COLORS[0]);
  const [deletingCat, setDeletingCat] = useState<Category | null>(null);
  const [error, setError] = useState('');

  const reload = useCallback(async () => {
    setCategories(await window.api.categories.getAll());
  }, []);

  useEffect(() => { reload(); }, [reload]);

  const handleAdd = useCallback(async () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    try {
      await window.api.categories.add(trimmed, selectedColor);
      setName('');
      setSelectedColor(CATEGORY_COLORS[(categories.length + 1) % CATEGORY_COLORS.length]);
      setError('');
      await reload();
    } catch {
      setError('A category with that name already exists.');
    }
  }, [name, selectedColor, categories.length, reload]);

  const handleDelete = useCallback(async () => {
    if (!deletingCat) return;
    await window.api.categories.delete(deletingCat.id);
    setDeletingCat(null);
    await reload();
  }, [deletingCat, reload]);

  return (
    <>
      <Modal title="Categories" onClose={onClose}>
        {/* Add new category */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 20 }}>
          <input
            className="input"
            placeholder="New category name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') handleAdd(); }}
          />
          <div className="color-palette">
            {CATEGORY_COLORS.map((color) => (
              <button
                key={color}
                type="button"
                className={`color-swatch${selectedColor === color ? ' selected' : ''}`}
                style={{ background: color }}
                onClick={() => setSelectedColor(color)}
              />
            ))}
          </div>
          {error && <p style={{ color: '#EF4444', fontSize: 13 }}>{error}</p>}
          <button className="btn btn-primary" onClick={handleAdd}>
            <MdAdd size={18} />
            Add Category
          </button>
        </div>

        {/* Category list */}
        {categories.length === 0 ? (
          <p style={{ color: 'var(--color-text-secondary)', textAlign: 'center', padding: '24px 0' }}>
            No categories yet. Create one above.
          </p>
        ) : (
          <div style={{ borderTop: '1px solid var(--color-border)' }}>
            {categories.map((cat, index) => (
              <div key={cat.id}>
                {index > 0 && <div style={{ height: 1, background: 'var(--color-border)' }} />}
                <div style={{ display: 'flex', alignItems: 'center', padding: '12px 0' }}>
                  <span style={{
                    width: 16, height: 16, borderRadius: 8,
                    background: cat.color, marginRight: 12, flexShrink: 0,
                  }} />
                  <span style={{ flex: 1, fontSize: 15 }}>{cat.name}</span>
                  <button className="btn-icon" onClick={() => setDeletingCat(cat)}>
                    <MdDelete size={18} color="var(--color-icon)" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Modal>

      {deletingCat && (
        <ConfirmDialog
          title="Delete Category"
          message={`Remove "${deletingCat.name}"? Tasks using this category will have no category assigned.`}
          onConfirm={handleDelete}
          onCancel={() => setDeletingCat(null)}
        />
      )}
    </>
  );
}
