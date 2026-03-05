import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

// Candy-color gradient pairs
const GRADIENTS = [
  ["#FF9FF3", "#F368E0"],
  ["#74B9FF", "#0984E3"],
  ["#A29BFE", "#6C5CE7"],
  ["#55EFC4", "#00B894"],
  ["#FDCB6E", "#E17055"],
  ["#FD79A8", "#E84393"],
  ["#81ECEC", "#00CEC9"],
  ["#FFEAA7", "#FDCB6E"],
  ["#B8E994", "#78E08F"],
  ["#FDA7DF", "#D980FA"],
];

function pickGradient(text) {
  let h = 0;
  for (const c of text) h = (h * 31 + c.charCodeAt(0)) % GRADIENTS.length;
  return GRADIENTS[h];
}

// 8 directions at 45° intervals for sparkle burst
const SPARKLE_EMOJIS = ["✨", "⭐", "💫", "🌟", "✨", "💫", "⭐", "🌟"];
const BURST_ANGLES   = [0, 45, 90, 135, 180, 225, 270, 315];

function buildSparkles() {
  return BURST_ANGLES.map((deg, i) => {
    const rad  = (deg * Math.PI) / 180;
    const dist = 52 + Math.random() * 24;
    return {
      id:    i,
      x:     Math.cos(rad) * dist,
      y:     Math.sin(rad) * dist,
      emoji: SPARKLE_EMOJIS[i],
    };
  });
}

export default function FlipCard({ item, onSpeak }) {
  const [from, to]  = pickGradient(item.text);
  const [sparks, setSparks] = useState([]);

  function handleClick() {
    onSpeak(item.text);
    setSparks(buildSparkles());
    setTimeout(() => setSparks([]), 700);
  }

  return (
    // Outer wrapper: overflow-visible so sparks can escape card bounds
    <div className="relative" style={{ height: 190 }}>

      {/* Card */}
      <motion.div
        className="absolute inset-0 cursor-pointer select-none rounded-2xl shadow-md
                   overflow-hidden flex flex-col items-center justify-center"
        style={{
          background: `linear-gradient(145deg, ${from}, ${to})`,
          border: "1px solid rgba(255,255,255,0.52)",
          boxShadow: "inset 0 1px 0 rgba(255,255,255,0.38)",
        }}
        whileTap={{ scale: 0.82 }}
        transition={{ type: "spring", stiffness: 460, damping: 12 }}
        onClick={handleClick}
      >
        {/* Large emoji */}
        <span
          className="select-none leading-none"
          style={{
            fontSize: 72,
            filter: "drop-shadow(0 6px 12px rgba(0,0,0,0.22))",
          }}
        >
          {item.emoji}
        </span>

        {/* Word + translation */}
        <div className="mt-3 px-3 text-center">
          <p
            className="text-white font-black leading-tight"
            style={{ fontSize: 16, textShadow: "0 2px 8px rgba(0,0,0,0.25)" }}
          >
            {item.text}
          </p>
          <p className="text-white/80 font-semibold mt-0.5" style={{ fontSize: 12 }}>
            {item.hint}
          </p>
        </div>

        {/* Speaker badge */}
        <div
          className="absolute top-2 right-2 flex items-center justify-center"
          style={{ width: 28, height: 28, borderRadius: "50%", background: "rgba(255,255,255,0.30)" }}
        >
          <span style={{ fontSize: 13 }}>🔊</span>
        </div>

        {/* Decorative bubbles */}
        <div className="absolute -bottom-4 -left-4 rounded-full pointer-events-none"
          style={{ width: 80, height: 80, background: "rgba(255,255,255,0.12)" }} />
        <div className="absolute -top-3 -right-5 rounded-full pointer-events-none"
          style={{ width: 60, height: 60, background: "rgba(255,255,255,0.10)" }} />
      </motion.div>

      {/* Sparkle burst — lives outside overflow-hidden */}
      <AnimatePresence>
        {sparks.map((s) => (
          <motion.span
            key={s.id}
            className="absolute pointer-events-none select-none"
            style={{ left: "50%", top: "50%", zIndex: 20, fontSize: 15 }}
            initial={{ x: 0, y: 0, opacity: 1, scale: 0 }}
            animate={{ x: s.x, y: s.y, opacity: 0, scale: 1.4 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.62, ease: "easeOut" }}
          >
            {s.emoji}
          </motion.span>
        ))}
      </AnimatePresence>
    </div>
  );
}
