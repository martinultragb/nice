import { useState, useEffect } from 'react';
import { View, Text, Button, Input } from '@tarojs/components';

interface RestTimeSettingsProps {
  currentSeconds: number;
  onUpdate: (seconds: number) => void;
}

export default function RestTimeSettings({
  currentSeconds,
  onUpdate,
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
    <View>
      <Button
        style={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          gap: '8rpx',
          padding: '12rpx 24rpx',
          backgroundColor: '#f3f4f6',
          borderRadius: '16rpx',
          color: '#4b5563',
          fontSize: '24rpx',
          border: 'none'
        }}
        onClick={() => setIsOpen(true)}
      >
        <Text>⏱️</Text>
        <Text>休息 {formatSeconds(currentSeconds)}</Text>
        <Text>⚙️</Text>
      </Button>

      {isOpen && (
        <View style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 50,
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'center',
          backgroundColor: 'rgba(0,0,0,0.5)'
        }}>
          <View style={{
            width: '100%',
            maxWidth: '768rpx',
            backgroundColor: 'white',
            borderTopLeftRadius: '32rpx',
            borderTopRightRadius: '32rpx'
          }}>
            <View style={{
              padding: '40rpx',
              paddingTop: '32rpx',
              paddingBottom: '24rpx',
              borderBottom: '2rpx solid #f3f4f6'
            }}>
              <View style={{
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <Text style={{ fontSize: '32rpx', fontWeight: '500', color: '#1f2937' }}>
                  设置休息时间
                </Text>
                <Button
                  style={{
                    padding: '12rpx',
                    border: 'none',
                    backgroundColor: 'transparent'
                  }}
                  onClick={() => setIsOpen(false)}
                >
                  <Text style={{ color: '#6b7280', fontSize: '40rpx' }}>✕</Text>
                </Button>
              </View>
            </View>

            <View style={{ padding: '40rpx' }}>
              <View style={{ marginBottom: '32rpx' }}>
                <Text style={{
                  fontSize: '24rpx',
                  color: '#6b7280',
                  marginBottom: '16rpx',
                  display: 'block'
                }}>
                  预设选项
                </Text>
                <View style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: '16rpx'
                }}>
                  {presetOptions.map((option) => (
                    <Button
                      key={option.value}
                      style={{
                        padding: '16rpx',
                        borderRadius: '16rpx',
                        fontSize: '24rpx',
                        fontWeight: '500',
                        border: 'none',
                        backgroundColor: selectedSeconds === option.value ? '#07C160' : '#f3f4f6',
                        color: selectedSeconds === option.value ? 'white' : '#374151'
                      }}
                      onClick={() => setSelectedSeconds(option.value)}
                    >
                      {option.label}
                    </Button>
                  ))}
                </View>
              </View>

              <View style={{ marginBottom: '48rpx' }}>
                <Text style={{
                  fontSize: '24rpx',
                  color: '#6b7280',
                  marginBottom: '16rpx',
                  display: 'block'
                }}>
                  自定义时间 (秒)
                </Text>
                <View style={{
                  display: 'flex',
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: '16rpx'
                }}>
                  <Input
                    type="number"
                    style={{
                      flex: 1,
                      padding: '12rpx 24rpx',
                      border: '2rpx solid #e5e7eb',
                      borderRadius: '16rpx',
                      textAlign: 'center'
                    }}
                    value={selectedSeconds.toString()}
                    onInput={(e) => {
                      const value = parseInt(e.detail.value) || 10;
                      setSelectedSeconds(Math.min(Math.max(10, value), 600));
                    }}
                  />
                  <Text style={{ fontSize: '24rpx', color: '#6b7280' }}>秒</Text>
                </View>
              </View>

              <Button
                style={{
                  width: '100%',
                  padding: '24rpx',
                  backgroundColor: '#07C160',
                  color: 'white',
                  fontWeight: '500',
                  borderRadius: '16rpx',
                  border: 'none'
                }}
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