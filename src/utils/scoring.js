// 功能词（冠词、介词、代词等），不计入关键词匹配
const FUNCTION_WORDS = new Set([
  "a","an","the","i","to","of","and","or","but","in","on","at",
  "is","are","was","were","be","have","has","do","does","may",
  "some","want","me","my","you","your","it","its","this","that",
  "with","for","from","by","up","now","not","so","too","very",
]);

function normalize(s) {
  return s.toLowerCase().replace(/[.,?!'""`]/g, "").trim();
}

/**
 * 计算录音与目标文本的匹配分数 (0–100)
 * lenient=true 时给连续失败的孩子额外 +15 分鼓励
 */
export function calculateScore(transcript, target, lenient = false) {
  const t   = normalize(transcript);
  const ref = normalize(target);

  if (!t) return 0;

  // 完全一致
  if (t === ref) return lenient ? 100 : 100;

  const refWords = ref.split(/\s+/);
  const gotWords = t.split(/\s+/);

  // 内容词（非功能词）
  const content = refWords.filter((w) => !FUNCTION_WORDS.has(w));

  const allHit = refWords.filter((w) => gotWords.includes(w)).length;
  const contentHit = content.length
    ? content.filter((w) => gotWords.includes(w)).length
    : allHit;

  const allRatio     = allHit / refWords.length;
  const contentRatio = contentHit / (content.length || 1);

  // 细粒度评分
  let base;
  if (contentRatio >= 1.0 && allRatio >= 0.8) base = 95;  // 几乎完美
  else if (contentRatio >= 1.0)               base = 85;  // 关键词全对
  else if (contentRatio >= 0.8)               base = 78;  // 大部分关键词
  else if (contentRatio >= 0.6)               base = 68;  // 一半关键词
  else if (allRatio     >= 0.4)               base = 55;  // 部分匹配
  else if (allRatio     >  0)                 base = 40;  // 少量匹配
  else                                        base = 20;  // 基本没听清

  return lenient ? Math.min(100, base + 15) : base;
}

/** 返回目标文本中每个词及是否为关键内容词（用于高亮） */
export function getHighlightedWords(text) {
  return text.split(/\s+/).map((word) => ({
    word,
    isKey: !FUNCTION_WORDS.has(normalize(word)),
  }));
}

/** 分数 → 星星数 */
export function scoreToStars(score) {
  if (score >= 90) return 3;
  if (score >= 80) return 2;
  if (score >= 60) return 1;
  return 0;
}

/** 分数 → 文字标签 */
export function scoreLabel(score) {
  if (score >= 100) return { text: "Perfect! 完美！",     color: "#f59e0b" };
  if (score >= 90)  return { text: "Excellent! 太棒了！", color: "#10b981" };
  if (score >= 80)  return { text: "Great! 不错！",       color: "#3b82f6" };
  if (score >= 60)  return { text: "Good job! 加油！",    color: "#f97316" };
  return                   { text: "Try again! 再来！",   color: "#ef4444" };
}
