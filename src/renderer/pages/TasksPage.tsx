import { useCallback, useEffect, useState } from 'react';
import { MdChecklist, MdAdd, MdLabel, MdCheckCircle, MdRadioButtonUnchecked } from 'react-icons/md';
import type { Category, TaskWithCategory } from '@/shared/types';
import { PRIORITY_COLORS, PRIORITY_LABELS } from '../constants/theme';
import ConfirmDialog from '../components/ConfirmDialog';
import AddTaskModal from './AddTaskModal';
import ManageCategoriesModal from './ManageCategoriesModal';

export default function TasksPage() {
  const [tasks, setTasks] = useState<TaskWithCategory[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [filterCategory, setFilterCategory] = useState<number | null>(null);
  const [showCompleted, setShowCompleted] = useState(true);
  const [showAddTask, setShowAddTask] = useState(false);
  const [showCategories, setShowCategories] = useState(false);
  const [deletingTask, setDeletingTask] = useState<TaskWithCategory | null>(null);

  const loadData = useCallback(async () => {
    const [taskData, catData] = await Promise.all([
      window.api.tasks.getAll(),
      window.api.categories.getAll(),
    ]);
    setTasks(taskData);
    setCategories(catData);
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const handleToggle = useCallback(async (id: number) => {
    await window.api.tasks.toggle(id);
    await loadData();
  }, [loadData]);

  const handleDelete = useCallback(async () => {
    if (!deletingTask) return;
    await window.api.tasks.delete(deletingTask.id);
    setDeletingTask(null);
    await loadData();
  }, [deletingTask, loadData]);

  const filteredTasks = tasks.filter((task) => {
    if (!showCompleted && task.isCompleted) return false;
    if (filterCategory !== null && task.categoryId !== filterCategory) return false;
    return true;
  });

  return (
    <>
      <div className="page-header">
        <h1>Tasks</h1>
        <div className="page-header-actions">
          <button className="btn btn-ghost" onClick={() => setShowCategories(true)}>
            <MdLabel size={18} />
            Categories
          </button>
          <button className="btn btn-primary" onClick={() => setShowAddTask(true)}>
            <MdAdd size={18} />
            Add Task
          </button>
        </div>
      </div>

      {/* Filter bar */}
      {(categories.length > 0 || tasks.some(t => t.isCompleted)) && (
        <div className="filter-bar">
          <button
            className={`filter-chip${filterCategory === null ? ' active' : ''}`}
            onClick={() => setFilterCategory(null)}
          >
            All
          </button>
          {categories.map(cat => (
            <button
              key={cat.id}
              className={`filter-chip${filterCategory === cat.id ? ' active' : ''}`}
              onClick={() => setFilterCategory(cat.id)}
            >
              {cat.name}
            </button>
          ))}
          <div style={{ marginLeft: 'auto' }} />
          <button
            className="btn-icon"
            title={showCompleted ? 'Hide completed' : 'Show completed'}
            onClick={() => setShowCompleted(v => !v)}
            style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, color: 'var(--color-text-secondary)' }}
          >
            {showCompleted ? <MdCheckCircle size={18} /> : <MdRadioButtonUnchecked size={18} />}
            <span>Done</span>
          </button>
        </div>
      )}

      <div className="page-body">
        {filteredTasks.length === 0 ? (
          <div className="empty-state">
            <MdChecklist size={64} />
            <h2>No tasks yet</h2>
            <p>Add your first task to get organized</p>
            <button className="btn btn-primary" onClick={() => setShowAddTask(true)}>
              <MdAdd size={18} />
              Add Task
            </button>
          </div>
        ) : (
          filteredTasks.map((task, index) => (
            <div key={task.id}>
              {index > 0 && <div className="list-separator" />}
              <div className="list-item">
                <button
                  className="btn-icon"
                  onClick={() => handleToggle(task.id)}
                  style={{ marginRight: 12, color: task.isCompleted ? 'var(--color-tint)' : 'var(--color-icon)' }}
                >
                  {task.isCompleted ? <MdCheckCircle size={24} /> : <MdRadioButtonUnchecked size={24} />}
                </button>
                <div style={{ flex: 1 }}>
                  <div style={{
                    fontSize: 15,
                    textDecoration: task.isCompleted ? 'line-through' : 'none',
                    opacity: task.isCompleted ? 0.5 : 1,
                  }}>
                    {task.title}
                  </div>
                  <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                    {task.categoryName && (
                      <span
                        className="badge"
                        style={{ background: (task.categoryColor ?? '#6B7280') + '20' }}
                      >
                        <span style={{
                          width: 8, height: 8, borderRadius: 4,
                          background: task.categoryColor ?? '#6B7280',
                        }} />
                        {task.categoryName}
                      </span>
                    )}
                    <span
                      className="badge"
                      style={{
                        background: PRIORITY_COLORS[task.priority as 1 | 2 | 3] + '20',
                        color: PRIORITY_COLORS[task.priority as 1 | 2 | 3],
                        fontWeight: 600,
                      }}
                    >
                      {PRIORITY_LABELS[task.priority as 1 | 2 | 3]}
                    </span>
                  </div>
                </div>
                <button
                  className="btn-icon btn-danger"
                  title="Delete task"
                  onClick={() => setDeletingTask(task)}
                  style={{ fontSize: 13, padding: '4px 8px' }}
                >
                  ✕
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {showAddTask && (
        <AddTaskModal onClose={() => setShowAddTask(false)} onAdded={() => { setShowAddTask(false); loadData(); }} />
      )}

      {showCategories && (
        <ManageCategoriesModal onClose={() => { setShowCategories(false); loadData(); }} />
      )}

      {deletingTask && (
        <ConfirmDialog
          title="Delete Task"
          message={`Remove "${deletingTask.title}"?`}
          onConfirm={handleDelete}
          onCancel={() => setDeletingTask(null)}
        />
      )}
    </>
  );
}
