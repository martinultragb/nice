import { useState, useEffect } from 'react';
import { Settings, Clock } from 'lucide-react';

interface RestTimeSettingsProps {
  currentSeconds: number;
  onUpdate: (seconds: number) => void;
  className?: string;
}

export default function RestTimeSettings({
  currentSeconds,
  onUpdate,
  className = '',
}: RestTimeSettingsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedSeconds, setSelectedSeconds] = useState(currentSeconds);

  useEffect(() => {
    setSelectedSeconds(currentSeconds);
  }, [currentSeconds]);

  const presetOptions = [
    { label: '30秒', value: 30 },
    { label: '1分钟', value: 60 },
    { label: '1分30秒', value: 90 },
    { label: '2分钟', value: 120 },
    { label: '2分30秒', value: 150 },
    { label: '3分钟', value: 180 },
  ];

  const formatSeconds = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (mins === 0) return `${secs}秒`;
    if (secs === 0) return `${mins}分钟`;
    return `${mins}分${secs}秒`;
  };

  const handleSave = () => {
    onUpdate(selectedSeconds);
    setIsOpen(false);
  };

  return (
    <div className={className}>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-lg text-gray-600 text-sm hover:bg-gray-200 transition-colors"
      >
        <Clock size={14} />
        <span>休息 {formatSeconds(currentSeconds)}</span>
        <Settings size={14} />
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50">
          <div className="w-full max-w-md bg-white rounded-t-2xl">
            <div className="px-5 pt-4 pb-3 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-medium text-gray-800">设置休息时间</h2>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5"
                >
                  <Settings size={20} className="text-gray-500 rotate-45" />
                </button>
              </div>
            </div>

            <div className="p-5">
              <div className="mb-4">
                <p className="text-xs text-gray-500 mb-2">预设选项</p>
                <div className="grid grid-cols-3 gap-2">
                  {presetOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setSelectedSeconds(option.value)}
                      className={`py-2 rounded-lg text-sm font-medium transition-colors ${
                        selectedSeconds === option.value
                          ? 'bg-[#07C160] text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-6">
                <p className="text-xs text-gray-500 mb-2">自定义时间 (秒)</p>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="10"
                    max="600"
                    value={selectedSeconds}
                    onChange={(e) => {
                      const value = parseInt(e.target.value) || 10;
                      setSelectedSeconds(Math.min(Math.max(10, value), 600));
                    }}
                    className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-center focus:outline-none focus:border-[#07C160]"
                  />
                  <span className="text-gray-500 text-sm">秒</span>
                </div>
              </div>

              <button
                onClick={handleSave}
                className="w-full py-3 bg-[#07C160] text-white font-medium rounded-lg hover:bg-[#06B357] transition-colors"
              >
                保存设置
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
