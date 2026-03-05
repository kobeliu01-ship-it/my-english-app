/**
 * 将 level4_scenes_11_20.json 追加到 level4.json 中 travel level 的 scenes 末尾
 *
 * 用法: node append_level4_scenes.js
 */

const fs   = require('fs');
const path = require('path');

const LEVEL4_PATH     = path.join(__dirname, 'src', 'data', 'level4.json');
const NEW_SCENES_PATH = path.join(__dirname, 'src', 'data', 'level4_scenes_11_20.json');
const BACKUP_PATH     = LEVEL4_PATH + '.bak';

const level4Data  = JSON.parse(fs.readFileSync(LEVEL4_PATH,     'utf-8'));
const newScenes   = JSON.parse(fs.readFileSync(NEW_SCENES_PATH, 'utf-8'));

const travel = level4Data.levels.find(l => l.id === 'travel');
if (!travel) {
  console.error('❌ 找不到 id 为 "travel" 的 Level 4！');
  process.exit(1);
}

const before = travel.scenes.length;

// 去重：跳过已存在的场景 id
const existingIds = new Set(travel.scenes.map(s => s.id));
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

// 备份
fs.copyFileSync(LEVEL4_PATH, BACKUP_PATH);
console.log(`📦 已备份原文件至 ${BACKUP_PATH}`);

// 追加
travel.scenes.push(...toAdd);
fs.writeFileSync(LEVEL4_PATH, JSON.stringify(level4Data, null, 2), 'utf-8');

console.log(`✅ 追加成功！Level 4 场景数: ${before} → ${travel.scenes.length}`);
console.log('   新增场景：');
toAdd.forEach((s, i) => console.log(`   ${before + i + 1}. ${s.id}  (${s.name})`));
