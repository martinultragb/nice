import { NavLink } from 'react-router-dom';
import { Dumbbell, ClipboardList, BarChart3, Settings } from 'lucide-react';

const navItems = [
  { path: '/', icon: Dumbbell, label: '训练' },
  { path: '/templates', icon: ClipboardList, label: '模板' },
  { path: '/records', icon: BarChart3, label: '记录' },
  { path: '/admin', icon: Settings, label: '管理' },
];

export default function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 shadow-lg z-40">
      <div className="max-w-md mx-auto flex justify-around items-center h-16">
        {navItems.map(({ path, icon: Icon, label }) => (
          <NavLink
            key={path}
            to={path}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center w-16 h-full transition-all duration-200 ${
                isActive ? 'text-orange-500' : 'text-gray-400'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Icon
                  size={24}
                  className={`mb-1 transition-transform duration-200 ${
                    isActive ? 'scale-110' : ''
                  }`}
                />
                <span className="text-xs font-medium">{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
