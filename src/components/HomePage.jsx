import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getSceneBestScore, isLevelUnlocked } from "../utils/gameState";
import TreasureChestModal from "./TreasureChestModal";

// Random praise "blind box" taglines
const PRAISES = [
  "哇！你读得比小猫还准！🐱",
  "太棒了，能量球 +1！⚡",
  "你的发音让鹦鹉都嫉妒！🦜",
  "今天练习了，小龙龙开心啦！🐉",
  "口语小达人，就是你！🏆",
  "说得好！星星都在为你鼓掌！⭐",
  "每天开口，英语飞起！🚀",
  "你比昨天厉害多了！💪",
];

function countJobStickers() {
  return Object.keys(localStorage).filter((k) => k.startsWith("sticker_job-")).length;
}

// Cloud positions inside locked card fog
const FOG_CLOUDS = [
  { emoji: "☁️", fontSize: 32, style: { left: "4%",  top: "8%"  }, anim: { x: [0,  9, 0], y: [0, -4, 0] }, dur: 3.0 },
  { emoji: "⛅",  fontSize: 22, style: { right: "6%", top: "28%" }, anim: { x: [0, -7, 0], y: [0,  5, 0] }, dur: 3.5, delay: 0.6 },
  { emoji: "☁️", fontSize: 26, style: { left: "22%", bottom: "10%" }, anim: { x: [0,  6, 0], y: [0, -3, 0] }, dur: 2.8, delay: 1.2 },
];

function LevelCard({ level, levelIndex, levels, gameState, onClick }) {
  const unlocked = isLevelUnlocked(gameState, levels, levelIndex);
  const total    = level.scenes.length;
  const done     = level.scenes.filter(
    (s) => getSceneBestScore(gameState, s.id) >= 60
  ).length;
  const pct = total ? Math.round((done / total) * 100) : 0;

  return (
    <motion.button
      whileHover={unlocked ? { scale: 1.02 } : {}}
      whileTap={unlocked ? { scale: 0.97 } : {}}
      onClick={() => unlocked && onClick(level.id)}
      className={`w-full overflow-hidden text-left relative ${
        unlocked ? "cursor-pointer" : "cursor-default"
      }`}
      style={{
        borderRadius: 20,
        boxShadow: "0 4px 16px rgba(0,0,0,0.10), inset 0 1px 0 rgba(255,255,255,0.42)",
        border: "1px solid rgba(255,255,255,0.52)",
      }}
    >
      {/* Card gradient body */}
      <div
        className="p-3"
        style={{ background: `linear-gradient(135deg, ${level.bgFrom}, ${level.bgTo})` }}
      >
        {/* Icon row */}
        <div className="flex items-start justify-between mb-1">
          <span className="text-2xl leading-none">{level.emoji}</span>
        </div>

        {/* Name */}
        <h2 className="text-white text-sm font-black leading-tight">{level.name}</h2>
        <p className="text-white/65 text-xs mb-2 leading-tight">{level.nameEn}</p>

        {/* Progress (unlocked only) */}
        {unlocked && total > 0 ? (
          <div>
            <div className="flex justify-between text-white/75 mb-1" style={{ fontSize: 10 }}>
              <span>{done}/{total} 完成</span>
              <span>{pct}%</span>
            </div>
            <div className="w-full bg-white/20 rounded-full overflow-hidden" style={{ height: 5 }}>
              <motion.div
                className="h-full bg-white/80 rounded-full relative overflow-hidden"
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              >
                {/* Shimmer scan — sweeps across the filled portion */}
                <motion.span
                  className="absolute inset-0 rounded-full"
                  style={{
                    background:
                      "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.72) 50%, transparent 100%)",
                  }}
                  animate={{ x: ["-110%", "110%"] }}
                  transition={{ repeat: Infinity, duration: 1.9, ease: "linear", repeatDelay: 0.8 }}
                />
              </motion.div>
            </div>
          </div>
        ) : unlocked ? (
          <p className="text-white/55" style={{ fontSize: 10 }}>即将开放</p>
        ) : null}
      </div>

      {/* ── Fog / cloud overlay for locked cards ── */}
      {!unlocked && (
        <div
          className="absolute inset-0 z-10 flex items-center justify-center overflow-hidden"
          style={{ background: "rgba(236,244,255,0.82)" }}
        >
          {FOG_CLOUDS.map((c, i) => (
            <motion.span
              key={i}
              className="absolute select-none leading-none pointer-events-none"
              style={{ fontSize: c.fontSize, ...c.style }}
              animate={c.anim}
              transition={{
                repeat: Infinity,
                duration: c.dur,
                ease: "easeInOut",
                delay: c.delay ?? 0,
              }}
            >
              {c.emoji}
            </motion.span>
          ))}
          {/* Lock + label */}
          <div className="flex flex-col items-center gap-1 z-20 relative">
            <span style={{ fontSize: 20 }}>🔒</span>
            <p className="text-gray-500 font-bold text-center leading-tight" style={{ fontSize: 10 }}>
              完成上一关<br />解锁此级
            </p>
          </div>
        </div>
      )}
    </motion.button>
  );
}

export default function HomePage({ levels, gameState, onSelectLevel, onDreamJob }) {
  const [unboxTarget, setUnboxTarget] = useState(null); // { level, index }

  // Pick one random praise on each mount
  const [praise] = useState(() => PRAISES[Math.floor(Math.random() * PRAISES.length)]);

  // Red dot: show when new stickers have been earned since last island visit
  const [hasNewSticker, setHasNewSticker] = useState(() => {
    const total = countJobStickers();
    const seen  = parseInt(localStorage.getItem("dreamjob_seen") ?? "-1", 10);
    return total > 0 && total > seen;
  });

  function handleDreamJobClick() {
    localStorage.setItem("dreamjob_seen", String(countJobStickers()));
    setHasNewSticker(false);
    onDreamJob();
  }

  // Detect newly 100%-completed levels that haven't been unboxed yet
  useEffect(() => {
    for (let i = 0; i < levels.length; i++) {
      const level = levels[i];
      if (!isLevelUnlocked(gameState, levels, i)) continue;
      const total = level.scenes.length;
      if (!total) continue;
      const done = level.scenes.filter(
        (s) => getSceneBestScore(gameState, s.id) >= 60
      ).length;
      if (done === total && !localStorage.getItem(`unboxed_${level.id}`)) {
        setUnboxTarget({ level, index: i });
        break;
      }
    }
  }, [gameState, levels]);

  function handleUnboxClose() {
    if (unboxTarget) localStorage.setItem(`unboxed_${unboxTarget.level.id}`, "1");
    setUnboxTarget(null);
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-100 to-blue-50 flex flex-col items-center py-8 px-4">
      {/* Header */}
      <div className="w-full max-w-sm mb-6 text-center">
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-3xl font-black text-gray-800 mb-1">💬 口语打卡</h1>
          <p className="text-gray-400 text-sm">选择一个场景，开始今天的练习！</p>
        </motion.div>
      </div>

      {/* Level cards — two-column grid */}
      <div
        className="w-full max-w-sm"
        style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}
      >
        {levels.map((level, i) => (
          <motion.div
            key={level.id}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: i * 0.07 + 0.15, duration: 0.35 }}
          >
            <LevelCard
              level={level}
              levelIndex={i}
              levels={levels}
              gameState={gameState}
              onClick={onSelectLevel}
            />
          </motion.div>
        ))}
      </div>

      <p className="mt-8 text-gray-400 text-xs font-medium">{praise}</p>

      {/* Dream Job Island — fixed outer div for viewport position, relative button for badge */}
      <div className="fixed z-30" style={{ right: 10, top: "40%" }}>
        <motion.button
          className="relative flex flex-col items-center justify-center"
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ repeat: Infinity, duration: 2.4, ease: "easeInOut" }}
          onClick={handleDreamJobClick}
          style={{
            width: 58, height: 58,
            borderRadius: "50%",
            background: "linear-gradient(135deg, #f59e0b, #f97316)",
            boxShadow: "0 4px 20px rgba(245,158,11,0.50)",
          }}
        >
          <span style={{ fontSize: 22, lineHeight: 1 }}>🌟</span>
          <span className="text-white font-black leading-tight text-center" style={{ fontSize: 9, marginTop: 2 }}>
            职业岛
          </span>

          {/* Red notification dot — bounces when new stickers are available */}
          {hasNewSticker && (
            <motion.div
              className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500"
              animate={{ scale: [1, 1.4, 1] }}
              transition={{ repeat: Infinity, duration: 0.8, ease: "easeInOut" }}
              style={{ boxShadow: "0 0 6px rgba(239,68,68,0.7)" }}
            />
          )}
        </motion.button>
      </div>

      {/* Treasure chest unboxing ceremony */}
      <AnimatePresence>
        {unboxTarget && (
          <TreasureChestModal
            level={unboxTarget.level}
            levelIndex={unboxTarget.index}
            onClose={handleUnboxClose}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
