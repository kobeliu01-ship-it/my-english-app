import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";

// One curated reward per level slot
const REWARDS = [
  { emoji: "👑", name: "Golden Crown",    hint: "皇冠装饰已收入囊中！" },
  { emoji: "🦄", name: "Unicorn Pal",     hint: "独角兽宠物陪你练口语！" },
  { emoji: "🌈", name: "Rainbow Badge",   hint: "彩虹徽章超级稀有！" },
  { emoji: "🏆", name: "Champion Cup",    hint: "冠军奖杯属于你！" },
  { emoji: "🐉", name: "Baby Dragon",     hint: "小龙宝贝破壳而出！" },
  { emoji: "💎", name: "Diamond Gem",     hint: "钻石宝石闪闪发光！" },
  { emoji: "🌟", name: "Star Power",      hint: "星星能量注入宠物！" },
  { emoji: "🎩", name: "Magic Hat",       hint: "魔法帽变出无限可能！" },
  { emoji: "🚀", name: "Rocket Booster", hint: "火箭加速器让你起飞！" },
  { emoji: "🦋", name: "Butterfly Wing", hint: "蝴蝶翅膀翩翩飞翔！" },
];

// Burst positions for the explosion
const BURST = [
  { x: -80, y: -90 }, { x: 80, y: -85 }, { x: -110, y: -10 }, { x: 110, y: 0 },
  { x: -70, y: 80 },  { x: 70, y: 85 },  { x: 0, y: -115 },   { x: 0, y: 110 },
  { x: -45, y: -55 }, { x: 45, y: -60 },
];
const BURST_EMOJIS = ["💰", "⭐", "✨", "💫", "🌟", "🎊", "💰", "⭐", "✨", "💫"];

export default function TreasureChestModal({ level, levelIndex, onClose }) {
  const [phase, setPhase] = useState("chest"); // "chest" | "burst" | "reward"
  const reward = REWARDS[levelIndex % REWARDS.length];

  function openChest() {
    setPhase("burst");
    confetti({
      particleCount: 220, spread: 110, origin: { y: 0.5 },
      colors: ["#FFD700", "#FFA500", "#FF6347", "#4169E1", "#32CD32", "#FF69B4"],
    });
    setTimeout(() => setPhase("reward"), 950);
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center px-6"
      style={{ background: "rgba(0,0,0,0.78)", backdropFilter: "blur(5px)" }}
    >
      <AnimatePresence mode="wait">

        {/* ── Phase 1: Treasure Chest ── */}
        {phase === "chest" && (
          <motion.div
            key="chest"
            initial={{ scale: 0.3, opacity: 0, rotate: -12 }}
            animate={{ scale: 1, opacity: 1, rotate: 0 }}
            exit={{ scale: 1.6, opacity: 0 }}
            transition={{ type: "spring", stiffness: 280, damping: 18 }}
            className="flex flex-col items-center gap-6 select-none"
          >
            <motion.p
              animate={{ y: [0, -5, 0] }}
              transition={{ repeat: Infinity, duration: 1.6, ease: "easeInOut" }}
              className="text-white font-black text-2xl text-center"
              style={{ textShadow: "0 0 20px rgba(255,215,0,0.9)" }}
            >
              🎉 {level.name} 全部完成！
            </motion.p>

            {/* Clickable chest */}
            <motion.button
              onClick={openChest}
              animate={{ scale: [1, 1.07, 1], rotate: [0, -2, 2, -1, 0] }}
              transition={{ repeat: Infinity, duration: 2.2, ease: "easeInOut" }}
              style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}
            >
              {/* CSS treasure chest */}
              <div className="relative" style={{ width: 140, height: 115 }}>
                {/* Outer glow */}
                <div className="absolute inset-0 rounded-xl"
                  style={{ boxShadow: "0 0 48px 16px rgba(251,191,36,0.70)" }} />

                {/* Lid */}
                <div className="absolute top-0 inset-x-0 flex flex-col items-center justify-end"
                  style={{
                    height: "44%",
                    background: "linear-gradient(180deg, #fbbf24 0%, #d97706 100%)",
                    border: "3px solid #fde68a",
                    borderRadius: "14px 14px 0 0",
                  }}>
                  {/* Lid stripe */}
                  <div className="w-3/4 h-1 rounded-full mb-2 opacity-50"
                    style={{ background: "repeating-linear-gradient(90deg,#fde68a 0,#fde68a 4px,transparent 4px,transparent 10px)" }} />
                  {/* Hinge dots */}
                  <div className="flex gap-4 pb-1">
                    {[0, 1, 2].map(i => (
                      <div key={i} className="rounded-full bg-yellow-100"
                        style={{ width: 10, height: 6 }} />
                    ))}
                  </div>
                </div>

                {/* Body */}
                <div className="absolute bottom-0 inset-x-0"
                  style={{
                    top: "44%",
                    background: "linear-gradient(180deg, #92400e 0%, #78350f 100%)",
                    border: "3px solid #fde68a",
                    borderTop: "none",
                    borderRadius: "0 0 14px 14px",
                  }}>
                  {/* Lock clasp */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="rounded-full border-2 border-yellow-300 bg-amber-600 flex items-center justify-center"
                      style={{ width: 34, height: 34 }}>
                      <span style={{ fontSize: 16 }}>🔐</span>
                    </div>
                  </div>
                  {/* Body stripes */}
                  <div className="absolute inset-x-3 top-1 bottom-2 opacity-20 rounded"
                    style={{ background: "repeating-linear-gradient(90deg,#fde68a 0,#fde68a 3px,transparent 3px,transparent 14px)" }} />
                </div>
              </div>
            </motion.button>

            <motion.p
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ repeat: Infinity, duration: 1.1 }}
              className="text-yellow-300 font-black text-sm"
            >
              👆 点击宝箱领取奖励！
            </motion.p>
          </motion.div>
        )}

        {/* ── Phase 2: Explosion burst ── */}
        {phase === "burst" && (
          <motion.div key="burst" className="relative flex items-center justify-center"
            style={{ width: 220, height: 220 }}>
            {BURST.map((pos, i) => (
              <motion.span key={i} className="absolute text-2xl pointer-events-none select-none"
                initial={{ x: 0, y: 0, opacity: 1, scale: 0 }}
                animate={{ x: pos.x, y: pos.y, opacity: 0, scale: 1.6 }}
                transition={{ duration: 0.85, ease: "easeOut", delay: i * 0.04 }}>
                {BURST_EMOJIS[i]}
              </motion.span>
            ))}
            <motion.span className="select-none"
              style={{ fontSize: 90, lineHeight: 1 }}
              animate={{ scale: [1, 2.2, 0], opacity: [1, 1, 0] }}
              transition={{ duration: 0.85 }}>
              💥
            </motion.span>
          </motion.div>
        )}

        {/* ── Phase 3: Reward card ── */}
        {phase === "reward" && (
          <motion.div key="reward"
            initial={{ scale: 0.4, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 260, damping: 18 }}
            className="flex flex-col items-center gap-5 w-full max-w-xs"
          >
            {/* Gold-bordered reward card */}
            <div className="w-full rounded-3xl p-[3px]"
              style={{ background: "linear-gradient(135deg,#fbbf24,#f59e0b,#fde68a,#f59e0b,#fbbf24)" }}>
              <div className="bg-gradient-to-b from-amber-50 to-white rounded-[22px] px-6 py-8
                              flex flex-col items-center gap-4 shadow-2xl">
                <motion.span
                  animate={{ rotate: [0, -8, 8, -6, 0], scale: [1, 1.18, 1] }}
                  transition={{ repeat: Infinity, duration: 2.6, ease: "easeInOut" }}
                  className="select-none leading-none"
                  style={{ fontSize: 84, filter: "drop-shadow(0 8px 18px rgba(0,0,0,0.25))" }}>
                  {reward.emoji}
                </motion.span>

                <div className="px-5 py-1.5 rounded-full text-xs font-black tracking-widest uppercase text-amber-900"
                  style={{ background: "linear-gradient(90deg,#fde68a,#fbbf24,#fde68a)" }}>
                  New Reward! ✨
                </div>

                <div className="text-center">
                  <h2 className="text-2xl font-black text-amber-700 leading-tight">{reward.name}</h2>
                  <p className="text-amber-500 text-sm mt-1 font-semibold">{reward.hint}</p>
                </div>

                <div className="flex gap-2 text-2xl">
                  {["⭐", "⭐", "⭐"].map((s, i) => (
                    <motion.span key={i}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.4 + i * 0.12, type: "spring", stiffness: 340 }}>
                      {s}
                    </motion.span>
                  ))}
                </div>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-full py-3.5 rounded-full font-black text-white text-base shadow-lg"
              style={{ background: "linear-gradient(90deg,#f59e0b,#d97706)", boxShadow: "0 4px 18px rgba(245,158,11,0.45)" }}>
              超酷！继续冒险 🚀
            </button>
          </motion.div>
        )}

      </AnimatePresence>
    </motion.div>
  );
}
