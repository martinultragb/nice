import { useState, useEffect, useCallback, useRef } from 'react';
import { Pause, Play, RotateCcw, Timer } from 'lucide-react';

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

  // Reset when initialSeconds changes
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
    <div className={`w-full p-4 rounded-xl transition-all ${
      isComplete 
        ? 'bg-[#E8FBF0] border-2 border-[#07C160]' 
        : 'bg-white border border-gray-200'
    }`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Timer size={18} className={isComplete ? 'text-[#07C160]' : 'text-gray-500'} />
          <span className={`text-sm font-medium ${
            isComplete ? 'text-[#07C160]' : 'text-gray-700'
          }`}>
            {isComplete ? '休息结束！' : '组间休息'}
          </span>
        </div>
        <div className="flex gap-1">
          <button
            onClick={reset}
            className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500"
            title="重置"
          >
            <RotateCcw size={16} />
          </button>
          <button
            onClick={togglePause}
            className={`p-1.5 rounded-lg transition-colors ${
              isRunning 
                ? 'bg-yellow-100 text-yellow-600 hover:bg-yellow-200' 
                : 'bg-[#07C160] text-white hover:bg-[#06B357]'
            }`}
            title={isRunning ? '暂停' : '开始'}
          >
            {isRunning ? <Pause size={16} fill="currentColor" /> : <Play size={16} fill="currentColor" />}
          </button>
        </div>
      </div>

      <div className="relative">
        {/* Progress ring background */}
        <div className="w-32 h-32 mx-auto relative">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke={isComplete ? '#07C160' : '#E5E7EB'}
              strokeWidth="8"
              className="transition-colors"
            />
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke={isComplete ? '#07C160' : '#07C160'}
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray="283"
              strokeDashoffset={283 - (progress / 100) * 283}
              className="transition-all duration-1000"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className={`text-3xl font-bold ${
              isComplete ? 'text-[#07C160]' : 'text-gray-800'
            }`}>
              {formatTime(seconds)}
            </span>
          </div>
        </div>
      </div>

      {isComplete && (
        <div className="mt-3 text-center">
          <button
            onClick={start}
            className="px-4 py-2 bg-[#07C160] text-white text-sm font-medium rounded-lg hover:bg-[#06B357] transition-colors"
          >
            准备好下一组
          </button>
        </div>
      )}
    </div>
  );
}
