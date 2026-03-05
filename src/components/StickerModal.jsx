import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import { playSticker } from "../utils/soundEffects";

function getStickerEarned(jobId) {
  return !!localStorage.getItem("sticker_" + jobId);
}

function fireTropicalConfetti() {
  confetti({
    particleCount: 120,
    spread: 80,
    origin: { y: 0.5 },
    colors: ["#f59e0b", "#ef4444", "#22c55e", "#3b82f6", "#a855f7", "#ffffff"],
  });
  setTimeout(() => {
    confetti({
      particleCount: 80,
      angle: 60,
      spread: 55,
      origin: { x: 0, y: 0.6 },
      colors: ["#f59e0b", "#fbbf24", "#ffffff"],
    });
    confetti({
      particleCount: 80,
      angle: 120,
      spread: 55,
      origin: { x: 1, y: 0.6 },
      colors: ["#f59e0b", "#fbbf24", "#ffffff"],
    });
  }, 300);
}

function CelebrateContent({ jobEmoji, jobNameEn, onClose }) {
  const emojiRain = Array.from({ length: 10 }, () => jobEmoji);

  return (
    <>
      {/* Emoji rain */}
      {emojiRain.map((e, i) => (
        <motion.span
          key={i}
          initial={{ y: "110vh", x: `${(i / emojiRain.length) * 100}vw`, opacity: 1 }}
          animate={{ y: "-10vh", opacity: [1, 1, 0] }}
          transition={{ duration: 2.5 + i * 0.2, delay: i * 0.12, ease: "easeOut" }}
          className="absolute text-3xl pointer-events-none"
        >
          {e}
        </motion.span>
      ))}

      {/* Badge card */}
      <motion.div
        initial={{ scale: 0.4, opacity: 0, rotate: -8 }}
        animate={{ scale: 1, opacity: 1, rotate: 0 }}
        exit={{ scale: 0.8, opacity: 0 }}
        transition={{ type: "spring", stiffness: 260, damping: 18, delay: 0.1 }}
        className="relative z-10 flex flex-col items-center gap-5 max-w-xs w-full text-center"
      >
        <div
          className="w-full rounded-3xl p-1"
          style={{
            background: "linear-gradient(135deg, #fbbf24, #f59e0b, #fde68a, #f59e0b, #fbbf24)",
          }}
        >
          <div className="bg-gradient-to-b from-amber-50 to-white rounded-[22px] px-6 py-7 flex flex-col items-center gap-4 shadow-2xl">

            {/* Job emoji */}
            <motion.div
              animate={{ rotate: [0, -6, 6, -6, 0], scale: [1, 1.15, 1] }}
              transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
              className="text-[72px] leading-none drop-shadow-lg"
            >
              {jobEmoji}
            </motion.div>

            {/* Gold ribbon */}
            <div
              className="px-5 py-1 rounded-full text-xs font-black tracking-widest uppercase text-amber-900"
              style={{ background: "linear-gradient(90deg, #fde68a, #fbbf24, #fde68a)" }}
            >
              New Sticker! 🌟
            </div>

            {/* Job name */}
            <div>
              <h2 className="text-2xl font-black text-amber-700 leading-tight">
                {jobNameEn}
              </h2>
              <p className="text-amber-500 text-xs font-semibold mt-0.5 tracking-wide">
                职业贴纸已解锁！
              </p>
            </div>

            {/* Stars */}
            <div className="flex gap-1 text-2xl">
              {["⭐", "⭐", "⭐"].map((s, i) => (
                <motion.span
                  key={i}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.5 + i * 0.1, type: "spring", stiffness: 300 }}
                >
                  {s}
                </motion.span>
              ))}
            </div>

            {/* Gold divider */}
            <div
              className="w-16 h-1 rounded-full"
              style={{ background: "linear-gradient(90deg, #fbbf24, #f59e0b)" }}
            />

            {/* Close button */}
            <motion.button
              whileTap={{ scale: 0.95 }}
              whileHover={{ scale: 1.04 }}
              onClick={onClose}
              className="w-full py-3 rounded-full font-black text-white text-base shadow-lg"
              style={{
                background: "linear-gradient(90deg, #f59e0b, #d97706)",
                boxShadow: "0 4px 15px rgba(245,158,11,0.4)",
              }}
            >
              继续探索！🌟
            </motion.button>
          </div>
        </div>
      </motion.div>
    </>
  );
}

// Unique gradient per job for colorful badges
const BADGE_GRADIENTS = [
  ["#e879f9", "#9333ea"], // dentist   - purple
  ["#fb923c", "#ea580c"], // chef      - orange
  ["#f87171", "#dc2626"], // firefighter - red
  ["#60a5fa", "#2563eb"], // police    - blue
  ["#818cf8", "#4f46e5"], // astronaut - indigo
  ["#f472b6", "#ec4899"], // dancer    - pink
  ["#34d399", "#059669"], // architect - emerald
  ["#a78bfa", "#7c3aed"], // vet       - violet
  ["#38bdf8", "#0284c7"], // pilot     - sky
  ["#86efac", "#16a34a"], // farmer    - green
];

function BookContent({ scenes, onClose }) {
  const earnedCount = scenes.filter((s) => getStickerEarned(s.id)).length;

  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.9, opacity: 0 }}
      transition={{ type: "spring", stiffness: 280, damping: 20 }}
      className="relative z-10 w-full max-w-sm bg-white rounded-3xl shadow-2xl overflow-hidden"
      style={{ maxHeight: "90vh", overflowY: "auto" }}
    >
      {/* Header */}
      <div
        className="px-6 py-5 text-center sticky top-0 z-10"
        style={{ background: "linear-gradient(135deg, #f59e0b, #d97706)" }}
      >
        <h2 className="text-xl font-black text-white">成就墙 · My Badges 🏅</h2>
        <div className="flex items-center justify-center gap-2 mt-1">
          <div className="h-1.5 flex-1 bg-white/20 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-white rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${(earnedCount / scenes.length) * 100}%` }}
              transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
            />
          </div>
          <span className="text-amber-100 text-xs font-bold whitespace-nowrap">
            {earnedCount} / {scenes.length}
          </span>
        </div>
      </div>

      {/* Badge grid — 2 columns */}
      <div className="grid grid-cols-2 gap-4 p-4">
        {scenes.map((scene, i) => {
          const isEarned = getStickerEarned(scene.id);
          const [from, to] = BADGE_GRADIENTS[i % BADGE_GRADIENTS.length];

          return (
            <motion.div
              key={scene.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05, type: "spring", stiffness: 300, damping: 22 }}
              className="flex flex-col items-center gap-2"
            >
              {/* Badge shield */}
              <div className="relative">
                {/* Outer ring */}
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center shadow-lg"
                  style={
                    isEarned
                      ? {
                          background: `linear-gradient(135deg, ${from}, ${to})`,
                          boxShadow: `0 4px 16px ${from}55`,
                        }
                      : {
                          background: "linear-gradient(135deg, #d1d5db, #9ca3af)",
                        }
                  }
                >
                  {isEarned ? (
                    <motion.span
                      animate={{ scale: [1, 1.12, 1] }}
                      transition={{ repeat: Infinity, duration: 2.2, delay: i * 0.15, ease: "easeInOut" }}
                      className="text-3xl"
                    >
                      {scene.emoji}
                    </motion.span>
                  ) : (
                    <span className="text-3xl" style={{ filter: "grayscale(1)", opacity: 0.25 }}>
                      {scene.emoji}
                    </span>
                  )}
                </div>

                {/* Star crown for earned */}
                {isEarned && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: i * 0.05 + 0.3, type: "spring", stiffness: 400 }}
                    className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-amber-400 flex items-center justify-center text-xs shadow"
                  >
                    ⭐
                  </motion.div>
                )}
              </div>

              {/* Label */}
              <p
                className={`text-xs font-black text-center leading-tight ${
                  isEarned ? "text-gray-700" : "text-gray-300"
                }`}
              >
                {scene.nameEn}
              </p>
              {!isEarned && (
                <p className="text-xs text-gray-300 -mt-1">未解锁</p>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Close button */}
      <div className="px-4 pb-5 pt-1">
        <motion.button
          whileTap={{ scale: 0.95 }}
          whileHover={{ scale: 1.02 }}
          onClick={onClose}
          className="w-full py-3 rounded-full font-black text-white text-base shadow-lg"
          style={{ background: "linear-gradient(90deg, #f59e0b, #d97706)" }}
        >
          关闭 ✕
        </motion.button>
      </div>
    </motion.div>
  );
}

export default function StickerModal({ mode, jobEmoji, jobNameEn, scenes, show, onClose }) {
  useEffect(() => {
    if (show && mode === "celebrate") {
      fireTropicalConfetti();
      playSticker();
    }
  }, [show, mode]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4"
        >
          {mode === "celebrate" ? (
            <CelebrateContent jobEmoji={jobEmoji} jobNameEn={jobNameEn} onClose={onClose} />
          ) : (
            <BookContent scenes={scenes} onClose={onClose} />
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
