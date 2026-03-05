import { motion } from "framer-motion";
import { ChevronLeft, Star, Trophy } from "lucide-react";
import { getSceneTotalStars } from "../utils/gameState";

function getStickerEarned(jobId) {
  return !!localStorage.getItem("sticker_" + jobId);
}

const CARD_COLORS = [
  "bg-rose-100",
  "bg-sky-100",
  "bg-emerald-100",
  "bg-violet-100",
  "bg-amber-100",
  "bg-pink-100",
  "bg-teal-100",
  "bg-orange-100",
  "bg-indigo-100",
  "bg-lime-100",
];

export default function DreamJobIslandPage({
  scenes,
  gameState,
  onSelectScene,
  onBack,
  onOpenStickerBook,
}) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-400 via-orange-300 to-yellow-100">
      {/* Header */}
      <div className="sticky top-0 z-10 px-4 pt-safe">
        <div
          className="flex items-center gap-3 px-4 py-3 rounded-b-3xl shadow-md"
          style={{ background: "linear-gradient(135deg, #f59e0b, #d97706)" }}
        >
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={onBack}
            className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center text-white"
          >
            <ChevronLeft size={22} />
          </motion.button>
          <div className="flex-1">
            <h1 className="text-white font-black text-lg leading-tight">🌟 梦幻职业岛</h1>
            <p className="text-amber-100 text-xs">Dream Job Island · 自由探索，无需解锁</p>
          </div>
          {/* Achievement Wall button — top-right */}
          <motion.button
            whileTap={{ scale: 0.88 }}
            whileHover={{ scale: 1.08 }}
            onClick={onOpenStickerBook}
            className="flex flex-col items-center justify-center gap-0.5"
            style={{
              width: 44,
              height: 44,
              borderRadius: "50%",
              background: "rgba(255,255,255,0.22)",
              flexShrink: 0,
            }}
          >
            <Trophy size={18} className="text-white" />
            <span className="text-white font-bold leading-none" style={{ fontSize: 8 }}>成就</span>
          </motion.button>
        </div>
      </div>

      {/* Island decoration */}
      <div className="text-center py-4">
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-white/80 text-sm font-semibold"
        >
          选择一个职业，开始角色扮演！🎭
        </motion.p>
      </div>

      {/* Job cards grid */}
      <div className="grid grid-cols-2 gap-4 px-4 pb-28">
        {scenes.map((scene, i) => {
          const totalStars = getSceneTotalStars(gameState, scene.id);
          const earned = getStickerEarned(scene.id);

          return (
            <motion.button
              key={scene.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06, duration: 0.35 }}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => onSelectScene(scene.id)}
              className="relative bg-white rounded-2xl shadow-md overflow-hidden text-left"
            >
              {/* Sticker badge overlay */}
              {earned && (
                <motion.div
                  animate={{ scale: [1, 1.15, 1] }}
                  transition={{ repeat: Infinity, duration: 1.8, ease: "easeInOut" }}
                  className="absolute top-2 right-2 z-10 w-8 h-8 rounded-full flex items-center justify-center text-base shadow-lg"
                  style={{ background: "linear-gradient(135deg, #fbbf24, #f59e0b)" }}
                >
                  ⭐
                </motion.div>
              )}

              {/* Emoji top */}
              <div className={`${CARD_COLORS[i % CARD_COLORS.length]} flex items-center justify-center h-24`}>
                <motion.span
                  animate={{ rotate: [0, -5, 5, 0] }}
                  transition={{ repeat: Infinity, duration: 3 + i * 0.3, ease: "easeInOut" }}
                  className="text-5xl"
                >
                  {scene.emoji}
                </motion.span>
              </div>

              {/* Info bottom */}
              <div className="px-3 py-2.5">
                <p className="font-black text-gray-800 text-sm leading-tight">{scene.name}</p>
                <p className="text-gray-400 text-xs mt-0.5">{scene.nameEn}</p>
                {totalStars > 0 && (
                  <div className="flex items-center gap-0.5 mt-1.5">
                    {Array.from({ length: Math.min(totalStars, 6) }).map((_, k) => (
                      <Star key={k} size={10} fill="#fbbf24" className="text-yellow-400" />
                    ))}
                  </div>
                )}
              </div>
            </motion.button>
          );
        })}
      </div>

    </div>
  );
}
