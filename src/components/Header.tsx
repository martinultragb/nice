import { useLocation } from 'react-router-dom';

const pageTitles: Record<string, string> = {
  '/': '训练',
  '/templates': '训练模板',
  '/records': '训练记录',
  '/stats': '数据统计',
  '/admin': '动作库管理'
};

export default function Header() {
  const location = useLocation();
  const title = pageTitles[location.pathname] || '健身记录';

  return (
    <div className="sticky top-0 z-40 bg-white border-b border-gray-100">
      <div className="h-12 flex items-center justify-center">
        <span className="text-base font-semibold text-gray-800">{title}</span>
      </div>
    </div>
  );
}
