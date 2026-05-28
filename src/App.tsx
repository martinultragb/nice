import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import TemplatesPage from './pages/TemplatesPage';
import RecordsPage from './pages/RecordsPage';
import StatsPage from './pages/StatsPage';
import AdminPage from './pages/AdminPage';
import BottomNav from './components/BottomNav';
import Header from './components/Header';

export default function App() {
  return (
    <Router>
      <div className="max-w-md mx-auto bg-[#F7F8FA] min-h-screen shadow-2xl flex flex-col">
        <Header />
        <div className="flex-1 overflow-y-auto">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/templates" element={<TemplatesPage />} />
            <Route path="/records" element={<RecordsPage />} />
            <Route path="/stats" element={<StatsPage />} />
            <Route path="/admin" element={<AdminPage />} />
          </Routes>
        </div>
        <BottomNav />
      </div>
    </Router>
  );
}
