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
    <nav className="bg-white border-t border-gray-200">
      <div className="flex justify-around items-center h-14">
        {navItems.map(({ path, icon: Icon, label }) => (
          <NavLink
            key={path}
            to={path}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center flex-1 h-full transition-colors ${
                isActive ? 'text-[#07C160]' : 'text-[#8C8C8C]'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Icon
                  size={22}
                  strokeWidth={2.5}
                />
                <span className="text-[10px] mt-0.5">{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
