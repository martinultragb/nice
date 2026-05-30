export default defineAppConfig({
  pages: [
    'pages/home/index',
    'pages/templates/index',
    'pages/records/index',
    'pages/stats/index',
    'pages/admin/index'
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#fff',
    navigationBarTitleText: '健身记录',
    navigationBarTextStyle: 'black'
  },
  tabBar: {
    color: '#8C8C8C',
    selectedColor: '#07C160',
    backgroundColor: '#ffffff',
    borderStyle: 'black',
    list: [
      {
        pagePath: 'pages/home/index',
        text: '训练',
        iconPath: 'assets/dumbbell.png',
        selectedIconPath: 'assets/dumbbell-active.png'
      },
      {
        pagePath: 'pages/templates/index',
        text: '模板',
        iconPath: 'assets/clipboard.png',
        selectedIconPath: 'assets/clipboard-active.png'
      },
      {
        pagePath: 'pages/records/index',
        text: '记录',
        iconPath: 'assets/chart.png',
        selectedIconPath: 'assets/chart-active.png'
      },
      {
        pagePath: 'pages/admin/index',
        text: '管理',
        iconPath: 'assets/settings.png',
        selectedIconPath: 'assets/settings-active.png'
      }
    ]
  },
  permission: {
    'scope.userLocation': {
      desc: '你的位置信息将用于记录运动轨迹'
    }
  }
})
