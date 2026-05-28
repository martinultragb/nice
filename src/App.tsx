import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import TemplatesPage from './pages/TemplatesPage';
import RecordsPage from './pages/RecordsPage';
import StatsPage from './pages/StatsPage';
import AdminPage from './pages/AdminPage';
import BottomNav from './components/BottomNav';

export default function App() {
  return (
    <Router>
      <div className="max-w-md mx-auto bg-gray-50 min-h-screen shadow-2xl">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/templates" element={<TemplatesPage />} />
          <Route path="/records" element={<RecordsPage />} />
          <Route path="/stats" element={<StatsPage />} />
          <Route path="/admin" element={<AdminPage />} />
        </Routes>
        <BottomNav />
      </div>
    </Router>
  );
}
