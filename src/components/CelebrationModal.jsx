import { motion, AnimatePresence } from "framer-motion";

const confetti = ["🎊", "🎉", "⭐", "🌟", "✨", "🏆", "🎊", "🎉"];

export default function CelebrationModal({ show, onClose }) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 px-4"
        >
          {/* Floating confetti */}
          {confetti.map((c, i) => (
            <motion.span
              key={i}
              initial={{ y: "100vh", x: `${(i / confetti.length) * 100}vw`, opacity: 1 }}
              animate={{ y: "-10vh", opacity: [1, 1, 0] }}
              transition={{ duration: 2 + i * 0.3, delay: i * 0.15, ease: "easeOut" }}
              className="absolute text-4xl pointer-events-none"
            >
              {c}
            </motion.span>
          ))}

          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="bg-white rounded-3xl p-8 flex flex-col items-center gap-4 shadow-2xl max-w-xs w-full text-center relative z-10"
          >
            <motion.div
              animate={{ rotate: [0, -10, 10, -10, 0], scale: [1, 1.2, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="text-7xl"
            >
              🏆
            </motion.div>

            <h2 className="text-2xl font-bold text-yellow-500">全部通关！</h2>
            <p className="text-gray-500 text-sm leading-relaxed">
              四个维度全部完成打卡<br />你的口语今天进步了！
            </p>

            <div className="flex gap-1 text-2xl">
              {["⭐", "⭐", "⭐", "⭐", "⭐"].map((s, i) => (
                <motion.span
                  key={i}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.3 + i * 0.1, type: "spring" }}
                >
                  {s}
                </motion.span>
              ))}
            </div>

            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={onClose}
              className="mt-2 px-10 py-3 rounded-full bg-gradient-to-r from-yellow-400 to-orange-400 text-white font-bold shadow-lg text-base"
            >
              继续加油！
            </motion.button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
