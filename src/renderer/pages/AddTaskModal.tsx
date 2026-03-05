import { useCallback, useEffect, useState } from 'react';
import { MdAdd } from 'react-icons/md';
import type { Category, Priority } from '@/shared/types';
import { CATEGORY_COLORS } from '../constants/theme';
import Modal from '../components/Modal';

const PRIORITIES: { value: Priority; label: string; color: string }[] = [
  { value: 1, label: 'Low', color: '#9CA3AF' },
  { value: 2, label: 'Medium', color: '#F59E0B' },
  { value: 3, label: 'High', color: '#EF4444' },
];

type AddTaskModalProps = {
  onClose: () => void;
  onAdded: () => void;
};

export default function AddTaskModal({ onClose, onAdded }: AddTaskModalProps) {
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState<Priority>(2);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [showNewCategory, setShowNewCategory] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    window.api.categories.getAll().then(setCategories);
  }, []);

  const handleCreateCategory = useCallback(async () => {
    const trimmed = newCategoryName.trim();
    if (!trimmed) return;
    try {
      const cat = await window.api.categories.add(trimmed, CATEGORY_COLORS[categories.length % CATEGORY_COLORS.length]);
      const updated = await window.api.categories.getAll();
      setCategories(updated);
      setSelectedCategory(cat.id);
      setNewCategoryName('');
      setShowNewCategory(false);
    } catch {
      setError('A category with that name already exists.');
    }
  }, [newCategoryName, categories.length]);

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const trimmed = title.trim();
    if (!trimmed) {
      setError('Please enter a task title.');
      return;
    }
    await window.api.tasks.add(trimmed, selectedCategory, priority);
    onAdded();
  };

  return (
    <Modal title="Add Task" onClose={onClose}>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* Title */}
        <div>
          <label className="label">Task Title</label>
          <input
            className="input"
            placeholder="What needs to be done?"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            autoFocus
          />
        </div>

        {/* Priority */}
        <div>
          <label className="label">Priority</label>
          <div style={{ display: 'flex', gap: 10 }}>
            {PRIORITIES.map((p) => (
              <button
                key={p.value}
                type="button"
                onClick={() => setPriority(p.value)}
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                  padding: '8px 10px',
                  borderRadius: 8,
                  border: `1.5px solid ${priority === p.value ? p.color : 'var(--color-input-border)'}`,
                  background: priority === p.value ? p.color + '15' : 'transparent',
                  color: 'var(--color-text)',
                  cursor: 'pointer',
                  fontSize: 13,
                  fontWeight: 500,
                  fontFamily: 'inherit',
                }}
              >
                <span style={{ width: 10, height: 10, borderRadius: 5, background: p.color }} />
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Category */}
        <div>
          <label className="label">Category</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            <button
              type="button"
              onClick={() => setSelectedCategory(null)}
              className={`filter-chip${selectedCategory === null ? ' active' : ''}`}
            >
              None
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '4px 12px',
                  borderRadius: 16,
                  border: `1.5px solid ${selectedCategory === cat.id ? cat.color : 'var(--color-input-border)'}`,
                  background: selectedCategory === cat.id ? cat.color + '15' : 'transparent',
                  color: 'var(--color-text)',
                  cursor: 'pointer',
                  fontSize: 13,
                  fontFamily: 'inherit',
                }}
              >
                <span style={{ width: 8, height: 8, borderRadius: 4, background: cat.color }} />
                {cat.name}
              </button>
            ))}
            <button
              type="button"
              onClick={() => setShowNewCategory(true)}
              className="filter-chip"
              style={{ borderStyle: 'dashed', border: '1.5px dashed var(--color-input-border)', opacity: 0.7 }}
            >
              <MdAdd size={14} /> New
            </button>
          </div>
        </div>

        {/* Inline new category */}
        {showNewCategory && (
          <div style={{ display: 'flex', gap: 8 }}>
            <input
              className="input"
              placeholder="Category name"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleCreateCategory(); } }}
              autoFocus
              style={{ flex: 1 }}
            />
            <button type="button" className="btn btn-primary" onClick={handleCreateCategory}>
              Add
            </button>
          </div>
        )}

        {error && <p style={{ color: '#EF4444', fontSize: 13 }}>{error}</p>}

        <button className="btn btn-primary" type="submit" style={{ padding: '10px 0', marginTop: 4 }}>
          Add Task
        </button>
      </form>
    </Modal>
  );
}
