import { motion, AnimatePresence } from "framer-motion";

const RING_COLORS = ["#FF6B6B", "#FFD93D", "#6BCB77", "#4D96FF", "#C77DFF", "#FF6BC8"];

// Spark positions around center
const SPARKS = [
  { x: -90,  y: -70  },
  { x:  90,  y: -80  },
  { x: -110, y:  20  },
  { x:  110, y:  30  },
  { x: -60,  y:  90  },
  { x:  60,  y:  95  },
  { x:  0,   y: -110 },
  { x:  0,   y:  115 },
];
const SPARK_EMOJIS = ["✨", "⭐", "💫", "🌟", "✨", "⭐", "🌟", "💫"];

export default function ComboDisplay({ combo, show }) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          key={combo}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.15 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none"
        >
          {/* Frosted backdrop */}
          <div
            className="absolute inset-0"
            style={{ background: "rgba(0,0,0,0.30)", backdropFilter: "blur(3px)" }}
          />

          {/* Rainbow expanding rings */}
          {RING_COLORS.map((color, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full"
              style={{ width: 70, height: 70, border: `4px solid ${color}` }}
              initial={{ width: 70, height: 70, opacity: 0.9 }}
              animate={{ width: 380, height: 380, opacity: 0 }}
              transition={{ delay: i * 0.14, duration: 1.1, ease: "easeOut" }}
            />
          ))}

          {/* Star sparks */}
          {SPARKS.map((pos, i) => (
            <motion.span
              key={i}
              className="absolute pointer-events-none select-none"
              style={{ fontSize: 18 }}
              initial={{ x: 0, y: 0, opacity: 0, scale: 0 }}
              animate={{ x: pos.x, y: pos.y, opacity: [0, 1, 0], scale: [0, 1.2, 0] }}
              transition={{ delay: 0.12 + i * 0.06, duration: 0.7, ease: "easeOut" }}
            >
              {SPARK_EMOJIS[i]}
            </motion.span>
          ))}

          {/* Main card */}
          <motion.div
            className="relative z-10 flex flex-col items-center gap-2"
            initial={{ scale: 0.3, opacity: 0, rotate: -8 }}
            animate={{ scale: 1, opacity: 1, rotate: 0 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: "spring", stiffness: 340, damping: 16, delay: 0.05 }}
          >
            {/* Flame */}
            <motion.div
              animate={{ rotate: [-6, 6, -6, 6, 0], scale: [1, 1.2, 1] }}
              transition={{ duration: 0.55 }}
              className="text-7xl select-none"
            >
              🔥
            </motion.div>

            {/* "Combo x3!" rainbow text */}
            <motion.p
              animate={{ scale: [1, 1.08, 1] }}
              transition={{ repeat: Infinity, duration: 0.9, ease: "easeInOut" }}
              className="text-5xl font-black leading-none drop-shadow-lg"
              style={{
                background:
                  "linear-gradient(90deg,#FF6B6B,#FFD93D,#6BCB77,#4D96FF,#C77DFF,#FF6BC8)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Combo ×{combo}!
            </motion.p>

            {/* Sub label */}
            <motion.p
              initial={{ y: 12, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-white font-black text-base px-5 py-1.5 rounded-full"
              style={{
                background:
                  "linear-gradient(90deg,rgba(255,107,107,0.85),rgba(199,125,255,0.85))",
                boxShadow: "0 4px 20px rgba(199,125,255,0.5)",
              }}
            >
              {combo} 连击！太厉害了！🎉
            </motion.p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
