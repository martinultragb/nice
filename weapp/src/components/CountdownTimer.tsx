import { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, Button } from '@tarojs/components';

interface CountdownTimerProps {
  initialSeconds: number;
  onComplete?: () => void;
  autoStart?: boolean;
  onReset?: () => void;
}

export default function CountdownTimer({
  initialSeconds = 60,
  onComplete,
  autoStart = true,
  onReset,
}: CountdownTimerProps) {
  const [seconds, setSeconds] = useState(initialSeconds);
  const [isRunning, setIsRunning] = useState(autoStart);
  const [isComplete, setIsComplete] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setSeconds(initialSeconds);
    setIsRunning(autoStart);
    setIsComplete(false);
    if (intervalRef.current) clearInterval(intervalRef.current);
  }, [initialSeconds, autoStart]);

  useEffect(() => {
    if (isRunning && seconds > 0) {
      intervalRef.current = setInterval(() => {
        setSeconds((prev) => {
          if (prev <= 1) {
            clearInterval(intervalRef.current!);
            setIsRunning(false);
            setIsComplete(true);
            onComplete?.();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning, onComplete]);

  const togglePause = useCallback(() => {
    setIsRunning(!isRunning);
  }, [isRunning]);

  const reset = useCallback(() => {
    setSeconds(initialSeconds);
    setIsRunning(false);
    setIsComplete(false);
    if (intervalRef.current) clearInterval(intervalRef.current);
    onReset?.();
  }, [initialSeconds, onReset]);

  const start = useCallback(() => {
    setIsRunning(true);
    setIsComplete(false);
  }, []);

  const formatTime = (totalSeconds: number): string => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = ((initialSeconds - seconds) / initialSeconds) * 100;

  return (
    <View className={`w-full p-4 rounded-xl transition-all ${
      isComplete 
        ? 'bg-[#E8FBF0] border-2 border-[#07C160]' 
        : 'bg-white border border-gray-200'
    }`}>
      <View className="flex items-center justify-between mb-3">
        <View className="flex items-center gap-2">
          <Text className={isComplete ? 'text-[#07C160]' : 'text-gray-500'}>⏱️</Text>
          <Text className={`text-sm font-medium ${
            isComplete ? 'text-[#07C160]' : 'text-gray-700'
          }`}>
            {isComplete ? '休息结束！' : '组间休息'}
          </Text>
        </View>
        <View className="flex gap-1">
          <Button
            size="mini"
            className="p-1.5 rounded-lg bg-transparent border-none"
            onClick={reset}
          >
            <Text className="text-gray-500">🔄</Text>
          </Button>
          <Button
            size="mini"
            className={`p-1.5 rounded-lg transition-colors border-none ${
              isRunning 
                ? 'bg-yellow-100 text-yellow-600' 
                : 'bg-[#07C160] text-white'
            }`}
            onClick={togglePause}
          >
            <Text>{isRunning ? '⏸️' : '▶️'}</Text>
          </Button>
        </View>
      </View>

      <View className="flex justify-center">
        <View className="relative w-32 h-32">
          {/* 使用简单的样式代替 SVG */}
          <View className="w-full h-full flex items-center justify-center">
            <Text className={`text-3xl font-bold ${
              isComplete ? 'text-[#07C160]' : 'text-gray-800'
            }`}>
              {formatTime(seconds)}
            </Text>
          </View>
          <View 
            className="absolute bottom-0 left-0 right-0 h-2 bg-gray-200 rounded-full overflow-hidden"
          >
            <View 
              className="h-full bg-[#07C160] transition-all duration-1000"
              style={{ width: `${progress}%` }}
            />
          </View>
        </View>
      </View>

      {isComplete && (
        <View className="mt-3 text-center">
          <Button
            className="px-4 py-2 bg-[#07C160] text-white text-sm font-medium rounded-lg"
            onClick={start}
          >
            准备好下一组
          </Button>
        </View>
      )}
    </View>
  );
}
