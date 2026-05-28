import { useState, useEffect } from 'react';
import { View, Text, Button, Input } from '@tarojs/components';

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
    <View className={className}>
      <Button
        className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-lg text-gray-600 text-sm border-none"
        onClick={() => setIsOpen(true)}
      >
        <Text>⏱️</Text>
        <Text>休息 {formatSeconds(currentSeconds)}</Text>
        <Text>⚙️</Text>
      </Button>

      {isOpen && (
        <View className="fixed inset-0 z-50 flex items-end justify-center bg-black/50">
          <View className="w-full max-w-md bg-white rounded-t-2xl">
            <View className="px-5 pt-4 pb-3 border-b border-gray-100">
              <View className="flex items-center justify-between">
                <Text className="text-lg font-medium text-gray-800">设置休息时间</Text>
                <Button
                  className="p-1.5 border-none bg-transparent"
                  onClick={() => setIsOpen(false)}
                >
                  <Text className="text-gray-500 text-xl">✕</Text>
                </Button>
              </View>
            </View>

            <View className="p-5">
              <View className="mb-4">
                <Text className="text-xs text-gray-500 mb-2 block">预设选项</Text>
                <View className="grid grid-cols-3 gap-2">
                  {presetOptions.map((option) => (
                    <Button
                      key={option.value}
                      className={`py-2 rounded-lg text-sm font-medium transition-colors border-none ${
                        selectedSeconds === option.value
                          ? 'bg-[#07C160] text-white'
                          : 'bg-gray-100 text-gray-700'
                      }`}
                      onClick={() => setSelectedSeconds(option.value)}
                    >
                      {option.label}
                    </Button>
                  ))}
                </View>
              </View>

              <View className="mb-6">
                <Text className="text-xs text-gray-500 mb-2 block">自定义时间 (秒)</Text>
                <View className="flex items-center gap-2">
                  <Input
                    type="number"
                    className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-center"
                    value={selectedSeconds.toString()}
                    onInput={(e) => {
                      const value = parseInt(e.detail.value) || 10;
                      setSelectedSeconds(Math.min(Math.max(10, value), 600));
                    }}
                  />
                  <Text className="text-gray-500 text-sm">秒</Text>
                </View>
              </View>

              <Button
                className="w-full py-3 bg-[#07C160] text-white font-medium rounded-lg border-none"
                onClick={handleSave}
              >
                保存设置
              </Button>
            </View>
          </View>
        </View>
      )}
    </View>
  );
}
