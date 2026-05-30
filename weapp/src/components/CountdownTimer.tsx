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
    <View style={{
      padding: '16px',
      borderRadius: '12px',
      backgroundColor: isComplete ? '#E8FBF0' : 'white',
      border: `2px solid ${isComplete ? '#07C160' : '#d1d5db'}`,
      marginBottom: '12px'
    }}>
      <View style={{
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '12px'
      }}>
        <View style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '8px' }}>
          <Text style={{ color: isComplete ? '#07C160' : '#6b7280' }}>⏱️</Text>
          <Text style={{
            fontSize: '14px',
            fontWeight: '500',
            color: isComplete ? '#07C160' : '#374151'
          }}>
            {isComplete ? '休息结束！' : '组间休息'}
          </Text>
        </View>
        <View style={{ display: 'flex', flexDirection: 'row', gap: '4px' }}>
          <Button
            size="mini"
            style={{
              padding: '6px',
              borderRadius: '8px',
              backgroundColor: 'transparent',
              border: 'none'
            }}
            onClick={reset}
          >
            <Text style={{ color: '#6b7280' }}>🔄</Text>
          </Button>
          <Button
            size="mini"
            style={{
              padding: '6px',
              borderRadius: '8px',
              backgroundColor: isRunning ? '#fef3c7' : '#07C160',
              color: isRunning ? '#d97706' : 'white',
              border: 'none'
            }}
            onClick={togglePause}
          >
            <Text>{isRunning ? '⏸️' : '▶️'}</Text>
          </Button>
        </View>
      </View>

      <View style={{ display: 'flex', justifyContent: 'center' }}>
        <View style={{
          width: '128px',
          height: '128px',
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <Text style={{
            fontSize: '30px',
            fontWeight: 'bold',
            color: isComplete ? '#07C160' : '#1f2937'
          }}>
            {formatTime(seconds)}
          </Text>
          <View style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: '8px',
            backgroundColor: '#e5e7eb',
            borderRadius: '9999px',
            overflow: 'hidden'
          }}>
            <View style={{
              height: '100%',
              backgroundColor: '#07C160',
              width: `${progress}%`,
              transition: 'width 1s'
            }} />
          </View>
        </View>
      </View>

      {isComplete && (
        <View style={{ marginTop: '12px', textAlign: 'center' }}>
          <Button
            style={{
              padding: '8px 16px',
              backgroundColor: '#07C160',
              color: 'white',
              fontSize: '14px',
              fontWeight: '500',
              borderRadius: '8px'
            }}
            onClick={start}
          >
            准备好下一组
          </Button>
        </View>
      )}
    </View>
  );
}
