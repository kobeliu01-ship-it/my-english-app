/**
 * 将 level3_scenes_21_30.json 追加到 levels.json 中
 * Level 3 (id: "social") 的 scenes 数组末尾
 *
 * 用法: node append_level3_scenes.js
 */

const fs = require('fs');
const path = require('path');

const LEVELS_PATH = path.join(__dirname, 'src', 'data', 'levels.json');
const NEW_SCENES_PATH = path.join(__dirname, 'src', 'data', 'level3_scenes_21_30.json');
const BACKUP_PATH = LEVELS_PATH + '.bak';

// 读取文件
const levelsData = JSON.parse(fs.readFileSync(LEVELS_PATH, 'utf-8'));
const newScenes = JSON.parse(fs.readFileSync(NEW_SCENES_PATH, 'utf-8'));

// 找到 Level 3 (id: "social")
const level3 = levelsData.levels.find(l => l.id === 'social');
if (!level3) {
  console.error('❌ 找不到 id 为 "social" 的 Level 3！');
  process.exit(1);
}

const before = level3.scenes.length;

// 检查是否有重复 id，避免重复追加
const existingIds = new Set(level3.scenes.map(s => s.id));
const toAdd = newScenes.filter(s => {
  if (existingIds.has(s.id)) {
    console.warn(`⚠️  场景 "${s.id}" 已存在，跳过。`);
    return false;
  }
  return true;
});

if (toAdd.length === 0) {
  console.log('✅ 所有场景已存在，无需追加。');
  process.exit(0);
}

// 备份原文件
fs.copyFileSync(LEVELS_PATH, BACKUP_PATH);
console.log(`📦 已备份原文件至 ${BACKUP_PATH}`);

// 追加新场景
level3.scenes.push(...toAdd);

// 写回文件
fs.writeFileSync(LEVELS_PATH, JSON.stringify(levelsData, null, 2), 'utf-8');

const after = level3.scenes.length;
console.log(`✅ 追加成功！Level 3 场景数: ${before} → ${after}`);
console.log(`   新增场景 ID:`);
toAdd.forEach((s, i) => console.log(`   ${before + i + 1}. ${s.id} (${s.name})`));
