import { motion } from "framer-motion";

// Per-level hero gradients — warm, child-friendly
const HERO_GRADIENTS = [
  ["#FF9FF3", "#F368E0", "#A29BFE"],
  ["#74B9FF", "#0984E3", "#81ECEC"],
  ["#55EFC4", "#00B894", "#FFEAA7"],
  ["#FDCB6E", "#E17055", "#FD79A8"],
  ["#A29BFE", "#6C5CE7", "#74B9FF"],
  ["#FD79A8", "#E84393", "#FDCB6E"],
];

function pickHero(text) {
  let h = 0;
  for (const c of text) h = (h * 31 + c.charCodeAt(0)) % HERO_GRADIENTS.length;
  return HERO_GRADIENTS[h];
}

// Collect all item emojis across tabs for the constellation
function collectEmojis(scene) {
  const all = [];
  for (const tab of scene.tabs ?? []) {
    for (const item of tab.items ?? []) {
      if (item.emoji && !all.includes(item.emoji)) all.push(item.emoji);
    }
  }
  return all;
}

// Fixed positions for up to 8 satellite emojis (% of container width/height)
const POSITIONS = [
  { left: "8%",  top: "12%" },
  { right: "8%", top: "10%" },
  { left: "6%",  bottom: "14%" },
  { right: "6%", bottom: "12%" },
  { left: "30%", top: "6%" },
  { right: "28%", bottom: "8%" },
  { left: "18%", top: "50%" },
  { right: "16%", top: "48%" },
];

export default function SceneImage({ scene }) {
  const [c1, c2, c3] = pickHero(scene.nameEn ?? scene.name ?? "");
  const satellites = collectEmojis(scene).slice(0, 8);

  return (
    <div
      className="w-full max-w-sm mb-5 relative overflow-hidden shadow-lg"
      style={{
        borderRadius: 20,
        height: 148,
        background: `linear-gradient(135deg, ${c1} 0%, ${c2} 55%, ${c3} 100%)`,
      }}
    >
      {/* Decorative blobs */}
      <div
        className="absolute rounded-full pointer-events-none"
        style={{
          width: 120, height: 120,
          top: -30, left: -30,
          background: "rgba(255,255,255,0.15)",
        }}
      />
      <div
        className="absolute rounded-full pointer-events-none"
        style={{
          width: 90, height: 90,
          bottom: -25, right: -20,
          background: "rgba(255,255,255,0.12)",
        }}
      />

      {/* Satellite emojis */}
      {satellites.map((emoji, i) => (
        <motion.span
          key={i}
          className="absolute pointer-events-none select-none leading-none"
          style={{ fontSize: 22, ...POSITIONS[i] }}
          animate={{ y: [0, -4, 0], rotate: [0, i % 2 === 0 ? 8 : -8, 0] }}
          transition={{
            repeat: Infinity,
            duration: 2.8 + i * 0.35,
            ease: "easeInOut",
            delay: i * 0.2,
          }}
        >
          {emoji}
        </motion.span>
      ))}

      {/* Central hero emoji */}
      <div className="absolute inset-0 flex items-center justify-center">
        <motion.span
          className="leading-none select-none"
          style={{
            fontSize: 68,
            filter: "drop-shadow(0 8px 18px rgba(0,0,0,0.28))",
          }}
          animate={{ scale: [1, 1.06, 1] }}
          transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
        >
          {scene.emoji}
        </motion.span>
      </div>

      {/* Bottom label */}
      <div
        className="absolute bottom-0 inset-x-0 px-4 py-2"
        style={{ background: "linear-gradient(to top, rgba(0,0,0,0.45), transparent)" }}
      >
        <span
          className="text-white font-black drop-shadow-sm"
          style={{ fontSize: 12 }}
        >
          {scene.emoji} {scene.nameEn}
        </span>
      </div>
    </div>
  );
}
