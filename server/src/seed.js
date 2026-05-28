const mongoose = require('mongoose');
require('dotenv').config();

const Exercise = require('./models/Exercise');

const defaultExercises = [
  { name: '杠铃卧推', muscleGroup: 'chest', description: '主要锻炼胸大肌', isDefault: true },
  { name: '哑铃卧推', muscleGroup: 'chest', description: '锻炼胸肌和肩部', isDefault: true },
  { name: '蝴蝶机夹胸', muscleGroup: 'chest', description: '孤立锻炼胸肌', isDefault: true },
  { name: '俯卧撑', muscleGroup: 'chest', description: '基础胸部训练', isDefault: true },
  { name: '双杠臂屈伸', muscleGroup: 'chest', description: '锻炼下胸和三头', isDefault: true },
  
  { name: '引体向上', muscleGroup: 'back', description: '锻炼背阔肌', isDefault: true },
  { name: '杠铃划船', muscleGroup: 'back', description: '锻炼背部厚度', isDefault: true },
  { name: '高位下拉', muscleGroup: 'back', description: '锻炼背阔肌宽度', isDefault: true },
  { name: '坐姿划船', muscleGroup: 'back', description: '锻炼中背部', isDefault: true },
  { name: '哑铃俯身划船', muscleGroup: 'back', description: '单手背部训练', isDefault: true },
  
  { name: '哑铃肩推', muscleGroup: 'shoulder', description: '锻炼三角肌', isDefault: true },
  { name: '侧平举', muscleGroup: 'shoulder', description: '锻炼肩中束', isDefault: true },
  { name: '前平举', muscleGroup: 'shoulder', description: '锻炼肩前束', isDefault: true },
  { name: '面拉', muscleGroup: 'shoulder', description: '锻炼后束和肩袖', isDefault: true },
  { name: '俯身侧平举', muscleGroup: 'shoulder', description: '锻炼肩后束', isDefault: true },
  
  { name: '杠铃弯举', muscleGroup: 'arm', description: '锻炼肱二头肌', isDefault: true },
  { name: '哑铃弯举', muscleGroup: 'arm', description: '单臂二头训练', isDefault: true },
  { name: '锤式弯举', muscleGroup: 'arm', description: '锻炼肱肌', isDefault: true },
  { name: '绳索下压', muscleGroup: 'arm', description: '锻炼肱三头肌', isDefault: true },
  { name: '仰卧臂屈伸', muscleGroup: 'arm', description: '锻炼三头肌', isDefault: true },
  { name: '窄距俯卧撑', muscleGroup: 'arm', description: '三头肌训练', isDefault: true },
  
  { name: '深蹲', muscleGroup: 'leg', description: '锻炼大腿和臀部', isDefault: true },
  { name: '硬拉', muscleGroup: 'leg', description: '锻炼腿后链和背部', isDefault: true },
  { name: '腿举', muscleGroup: 'leg', description: '锻炼股四头肌', isDefault: true },
  { name: '腿弯举', muscleGroup: 'leg', description: '锻炼腘绳肌', isDefault: true },
  { name: '腿伸展', muscleGroup: 'leg', description: '孤立股四头肌', isDefault: true },
  { name: '提踵', muscleGroup: 'leg', description: '锻炼小腿', isDefault: true },
  { name: '弓步蹲', muscleGroup: 'leg', description: '单腿训练', isDefault: true },
  
  { name: '平板支撑', muscleGroup: 'core', description: '核心稳定训练', isDefault: true },
  { name: '卷腹', muscleGroup: 'core', description: '腹直肌训练', isDefault: true },
  { name: '俄罗斯转体', muscleGroup: 'core', description: '腹斜肌训练', isDefault: true },
  { name: '死虫式', muscleGroup: 'core', description: '核心稳定训练', isDefault: true },
  { name: '鸟狗式', muscleGroup: 'core', description: '核心和平衡训练', isDefault: true },
  
  { name: '波比跳', muscleGroup: 'fullbody', description: '全身燃脂训练', isDefault: true },
  { name: '农夫行走', muscleGroup: 'fullbody', description: '功能性训练', isDefault: true },
  { name: '药球砸球', muscleGroup: 'fullbody', description: '爆发力训练', isDefault: true }
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('数据库连接成功');

    await Exercise.deleteMany({ isDefault: true });
    console.log('已清除默认动作');

    const result = await Exercise.insertMany(defaultExercises);
    console.log(`成功添加 ${result.length} 个默认动作`);

    await mongoose.connection.close();
    console.log('数据库连接已关闭');
    process.exit(0);
  } catch (error) {
    console.error('初始化失败:', error);
    process.exit(1);
  }
}

seed();
