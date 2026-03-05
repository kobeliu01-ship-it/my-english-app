import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";

const EMOJI_RAIN = ["🌿", "🌳", "🦋", "⭐", "🌟", "✨", "🏅", "🎉", "🌈", "🐾"];

function fireOutdoorConfetti() {
  // Green & gold burst
  confetti({
    particleCount: 120,
    spread: 80,
    origin: { y: 0.5 },
    colors: ["#22c55e", "#fbbf24", "#ffffff", "#86efac", "#fde68a"],
  });
  setTimeout(() => {
    confetti({
      particleCount: 80,
      angle: 60,
      spread: 55,
      origin: { x: 0, y: 0.6 },
      colors: ["#22c55e", "#fbbf24", "#ffffff"],
    });
    confetti({
      particleCount: 80,
      angle: 120,
      spread: 55,
      origin: { x: 1, y: 0.6 },
      colors: ["#22c55e", "#fbbf24", "#ffffff"],
    });
  }, 300);
}

export default function BadgeModal({ show, onClose }) {
  useEffect(() => {
    if (show) fireOutdoorConfetti();
  }, [show]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4"
        >
          {/* Floating emoji rain */}
          {EMOJI_RAIN.map((e, i) => (
            <motion.span
              key={i}
              initial={{ y: "110vh", x: `${(i / EMOJI_RAIN.length) * 100}vw`, opacity: 1 }}
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
            {/* Gold-bordered badge */}
            <div
              className="w-full rounded-3xl p-1"
              style={{
                background: "linear-gradient(135deg, #fbbf24, #f59e0b, #fde68a, #f59e0b, #fbbf24)",
              }}
            >
              <div className="bg-gradient-to-b from-emerald-50 to-white rounded-[22px] px-6 py-7 flex flex-col items-center gap-4 shadow-2xl">

                {/* Compass / tree icon */}
                <motion.div
                  animate={{ rotate: [0, -6, 6, -6, 0], scale: [1, 1.15, 1] }}
                  transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
                  className="text-[72px] leading-none drop-shadow-lg"
                >
                  🧭
                </motion.div>

                {/* Gold ribbon */}
                <div
                  className="px-5 py-1 rounded-full text-xs font-black tracking-widest uppercase text-amber-900"
                  style={{ background: "linear-gradient(90deg, #fde68a, #fbbf24, #fde68a)" }}
                >
                  Level 2 Complete
                </div>

                {/* Title */}
                <div>
                  <h2 className="text-2xl font-black text-emerald-700 leading-tight">
                    Outdoor Explorer
                  </h2>
                  <p className="text-emerald-500 text-xs font-semibold mt-0.5 tracking-wide">
                    户外探险家勋章
                  </p>
                </div>

                {/* Stars */}
                <div className="flex gap-1 text-2xl">
                  {["⭐","⭐","⭐","⭐","⭐"].map((s, i) => (
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

                {/* Message */}
                <p className="text-gray-600 text-sm leading-relaxed px-2">
                  🎉 <strong>Congratulations!</strong><br />
                  You are a brave<br />
                  <span className="text-emerald-600 font-bold text-base">Outdoor Explorer!</span>
                </p>

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
                    background: "linear-gradient(90deg, #22c55e, #16a34a)",
                    boxShadow: "0 4px 15px rgba(34,197,94,0.4)",
                  }}
                >
                  继续探索世界！🌍
                </motion.button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
