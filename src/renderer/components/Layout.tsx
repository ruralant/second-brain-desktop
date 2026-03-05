import { NavLink, Outlet } from 'react-router-dom';
import { MdRssFeed, MdChecklist, MdSettings } from 'react-icons/md';

export default function Layout() {
  return (
    <div className="app-layout">
      <aside className="sidebar">
        <nav className="sidebar-nav">
          <NavLink to="/" end className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}>
            <MdRssFeed size={20} />
            <span>Feeds</span>
          </NavLink>
          <NavLink to="/tasks" className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}>
            <MdChecklist size={20} />
            <span>Tasks</span>
          </NavLink>
          <NavLink to="/settings" className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}>
            <MdSettings size={20} />
            <span>Settings</span>
          </NavLink>
        </nav>
      </aside>
      <main className="content">
        <Outlet />
      </main>
    </div>
  );
}
