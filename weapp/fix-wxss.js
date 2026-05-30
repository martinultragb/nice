const fs = require('fs');
const path = require('path');

const wxssPath = path.join(__dirname, 'dist', 'app.wxss');

if (fs.existsSync(wxssPath)) {
  let content = fs.readFileSync(wxssPath, 'utf8');
  
  // 移除 Tailwind CSS 注释（第1行）
  const lines = content.split('\n');
  if (lines[0].startsWith('! tailwindcss') || lines[0].startsWith('/*')) {
    lines.shift();
  }
  
  // 移除包含通配符 * 的样式块（WXSS不支持）
  // 这会移除 *,::after,::before{...} 这样的样式
  content = lines.join('\n');
  content = content.replace(/\*\/,::after,::before\{[^}]*\}/g, '');
  
  // 移除单独出现的 * 选择器开头的样式块
  content = content.replace(/\*,::after,::before\{[^}]*\}/g, '');
  
  fs.writeFileSync(wxssPath, content, 'utf8');
  console.log('✅ WXSS 文件已清理完成');
  console.log('文件大小:', fs.statSync(wxssPath).size, '字节');
} else {
  console.error('❌ 未找到 app.wxss 文件');
}
