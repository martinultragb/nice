const fs = require('fs');
const path = require('path');

const wxssPath = path.join(__dirname, 'dist', 'app.wxss');

if (fs.existsSync(wxssPath)) {
  let content = fs.readFileSync(wxssPath, 'utf8');
  
  // 移除 Tailwind CSS 注释
  content = content.replace(/^\s*!\*[\s\S]*?\*\//gm, '');
  
  // 移除所有反斜杠转义
  content = content.replace(/\\/g, '');
  
  // 清理多余的空白行
  content = content.replace(/\n\s*\n/g, '\n');
  
  fs.writeFileSync(wxssPath, content, 'utf8');
  console.log('✅ WXSS 文件已清理完成');
} else {
  console.error('❌ 未找到 app.wxss 文件');
}
