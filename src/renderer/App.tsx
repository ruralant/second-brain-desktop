import { HashRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './providers/ThemeProvider';
import Layout from './components/Layout';
import FeedsPage from './pages/FeedsPage';
import FeedArticlesPage from './pages/FeedArticlesPage';
import ReadingListPage from './pages/ReadingListPage';
import TasksPage from './pages/TasksPage';
import SettingsPage from './pages/SettingsPage';

export default function App() {
  return (
    <ThemeProvider>
      <HashRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<FeedsPage />} />
            <Route path="/feed/:id" element={<FeedArticlesPage />} />
            <Route path="/reading-list" element={<ReadingListPage />} />
            <Route path="/tasks" element={<TasksPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Route>
        </Routes>
      </HashRouter>
    </ThemeProvider>
  );
}
