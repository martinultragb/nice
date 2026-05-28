import { useState } from 'react';
import { View, Text, Button } from '@tarojs/components';
import userStore from '../../store/userStore';

export default function Login() {
  const [isLoading, setIsLoading] = useState(false);

  const handleWechatLogin = async () => {
    setIsLoading(true);
    const result = await userStore.loginWithWechat();
    setIsLoading(false);

    if (result.success) {
      wx.showToast({ title: '登录成功', icon: 'success' });
      setTimeout(() => {
        wx.switchTab({ url: '/pages/home/index' });
      }, 1500);
    } else {
      wx.showToast({ title: result.message || '登录失败', icon: 'none' });
    }
  };

  const handleQuickLogin = async () => {
    setIsLoading(true);
    const result = await userStore.login();
    setIsLoading(false);

    if (result.success) {
      wx.showToast({ title: '登录成功', icon: 'success' });
      setTimeout(() => {
        wx.switchTab({ url: '/pages/home/index' });
      }, 1500);
    } else {
      wx.showToast({ title: result.message || '登录失败', icon: 'none' });
    }
  };

  return (
    <View className="min-h-screen bg-gradient-to-b from-primary to-primary-dark flex flex-col items-center justify-center px-6">
      <View className="text-center mb-12">
        <View className="w-24 h-24 mx-auto mb-6 bg-white/20 rounded-full flex items-center justify-center">
          <Text className="text-5xl">💪</Text>
        </View>
        <Text className="text-2xl font-bold text-white mb-2">健身记录</Text>
        <Text className="text-white/70 text-sm">记录每一次训练，见证更好的自己</Text>
      </View>

      <View className="w-full space-y-4">
        <Button
          className="w-full py-4 bg-white text-primary font-semibold rounded-xl shadow-lg"
          onClick={handleWechatLogin}
          loading={isLoading}
        >
          <View className="flex items-center justify-center gap-3">
            <Text className="text-xl">📱</Text>
            <Text>微信快速登录</Text>
          </View>
        </Button>

        <Button
          className="w-full py-4 bg-white/10 text-white font-semibold rounded-xl border border-white/30"
          onClick={handleQuickLogin}
          loading={isLoading}
        >
          <View className="flex items-center justify-center gap-3">
            <Text className="text-xl">⚡</Text>
            <Text>快速登录体验</Text>
          </View>
        </Button>
      </View>

      <View className="mt-16 text-center">
        <Text className="text-white/50 text-xs">
          登录即表示同意《用户协议》和《隐私政策》
        </Text>
      </View>
    </View>
  );
}
