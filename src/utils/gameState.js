const KEY = "englishApp_v4";

/** 开发模式：设为 true 解锁全部关卡，发布前改回 false */
const DEV_UNLOCK_ALL = true;

/** 读取游戏存档 */
export function loadState() {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : defaultState();
  } catch {
    return defaultState();
  }
}

/** 保存游戏存档 */
export function saveState(state) {
  localStorage.setItem(KEY, JSON.stringify(state));
}

function defaultState() {
  return {
    // key: "sceneId/tabId" → { bestScore, stars }
    tabs: {},
  };
}

/** 获取某个 scene 的最高分（取该 scene 所有 tab 最高分的平均；未录制的 tab 不参与） */
export function getSceneBestScore(state, sceneId) {
  const entries = Object.entries(state.tabs).filter(([k]) =>
    k.startsWith(`${sceneId}/`)
  );
  if (!entries.length) return 0;
  const sum = entries.reduce((acc, [, v]) => acc + (v.bestScore || 0), 0);
  return Math.round(sum / entries.length);
}

/** 某 scene 的所有 tab 获得的星星总数 */
export function getSceneTotalStars(state, sceneId) {
  return Object.entries(state.tabs)
    .filter(([k]) => k.startsWith(`${sceneId}/`))
    .reduce((acc, [, v]) => acc + (v.stars || 0), 0);
}

/** 判断某 scene 是否解锁（前一个 scene 的最高分 >= 60） */
export function isSceneUnlocked(state, scenes, sceneIndex) {
  if (DEV_UNLOCK_ALL) return true;
  if (sceneIndex === 0) return true;
  const prevScene = scenes[sceneIndex - 1];
  return getSceneBestScore(state, prevScene.id) >= 60;
}

/** 判断整个 level 是否解锁（前一个 level 前5个 scene 均通关） */
export function isLevelUnlocked(state, levels, levelIndex) {
  if (DEV_UNLOCK_ALL) return true;
  if (levelIndex === 0) return true;
  const prevLevel = levels[levelIndex - 1];
  if (!prevLevel.scenes.length) return false;
  // 前一个 level 前5关（或全部，若不足5关）通过即解锁
  const threshold = Math.min(5, prevLevel.scenes.length);
  return prevLevel.scenes
    .slice(0, threshold)
    .every((s) => getSceneBestScore(state, s.id) >= 60);
}
