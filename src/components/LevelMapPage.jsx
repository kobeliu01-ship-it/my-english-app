import { motion } from "framer-motion";
import { ChevronLeft, Lock, Star, CheckCircle } from "lucide-react";
import {
  getSceneBestScore,
  getSceneTotalStars,
  isSceneUnlocked,
} from "../utils/gameState";
import { warmupSpeech } from "../utils/speak";

// Glowing footprint connector between two scene nodes
function FootprintConnector({ passed }) {
  return (
    <div className="flex flex-col items-center py-1" style={{ height: 38 }}>
      {[0, 1].map((i) => (
        <motion.span
          key={i}
          className="leading-none select-none pointer-events-none"
          style={{
            fontSize: 15,
            display: "block",
            opacity: passed ? 1 : 0.18,
            filter: passed
              ? "drop-shadow(0 0 5px #fbbf24) drop-shadow(0 0 10px #f59e0b)"
              : "none",
            transform: `rotate(${i % 2 === 0 ? 14 : -14}deg) translateX(${i % 2 === 0 ? -8 : 8}px)`,
          }}
          animate={passed ? { opacity: [0.45, 1, 0.45] } : {}}
          transition={{
            repeat: Infinity,
            duration: 2.2,
            delay: i * 0.55,
            ease: "easeInOut",
          }}
        >
          👣
        </motion.span>
      ))}
    </div>
  );
}

function SceneNode({ scene, sceneIndex, scenes, gameState, onSelect }) {
  const unlocked   = isSceneUnlocked(gameState, scenes, sceneIndex);
  const bestScore  = getSceneBestScore(gameState, scene.id);
  const passed     = bestScore >= 60;
  const totalStars = getSceneTotalStars(gameState, scene.id);
  const stars      = Math.min(Math.round(totalStars / scene.tabs.length), 3);
  const isLeft     = sceneIndex % 2 === 0;

  const colorMap = {
    blue:   { bg: "from-blue-400 to-blue-600" },
    orange: { bg: "from-orange-400 to-orange-600" },
    purple: { bg: "from-purple-400 to-purple-600" },
    green:  { bg: "from-emerald-400 to-emerald-600" },
  };

  return (
    <div className={`flex ${isLeft ? "justify-start pl-4" : "justify-end pr-4"}`}>
      <motion.button
        whileHover={unlocked ? { scale: 1.06 } : {}}
        whileTap={unlocked ? { scale: 0.94 } : {}}
        onClick={() => { if (unlocked) { warmupSpeech(); onSelect(scene.id); } }}
        className={`flex flex-col items-center gap-1.5 ${
          unlocked ? "cursor-pointer" : "cursor-default"
        }`}
      >
        {/* Stars above node */}
        <div className="flex gap-0.5 h-5">
          {unlocked && passed && [1, 2, 3].map((n) => (
            <Star
              key={n}
              size={14}
              fill={n <= stars ? "#fbbf24" : "none"}
              className={n <= stars ? "text-yellow-400" : "text-gray-300"}
            />
          ))}
        </div>

        {/* Circle node */}
        <div
          className={`relative w-20 h-20 rounded-full flex items-center justify-center text-3xl shadow-xl
            transition-all duration-300
            ${!unlocked
              ? "bg-gray-200 text-gray-400"
              : passed
              ? `bg-gradient-to-br ${colorMap.blue.bg} ring-4 ring-white`
              : "bg-white ring-4 ring-blue-200"
            }`}
        >
          {!unlocked ? <Lock size={28} className="text-gray-400" /> : scene.emoji}

          {/* Checkmark badge */}
          {passed && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -bottom-1 -right-1"
            >
              <CheckCircle size={22} fill="#22c55e" className="text-white" />
            </motion.div>
          )}

          {/* Glow ring for passed nodes */}
          {passed && (
            <motion.div
              className="absolute inset-0 rounded-full"
              animate={{ boxShadow: ["0 0 0px 0px #fbbf2440", "0 0 16px 6px #fbbf2455", "0 0 0px 0px #fbbf2440"] }}
              transition={{ repeat: Infinity, duration: 2.4, ease: "easeInOut" }}
            />
          )}
        </div>

        {/* Label */}
        <div className="text-center">
          <p className={`text-sm font-bold ${unlocked ? "text-gray-700" : "text-gray-400"}`}>
            {scene.name}
          </p>
          <p className="text-gray-400 text-[10px]">{scene.nameEn}</p>
          {unlocked && bestScore > 0 && (
            <p className={`text-[10px] font-semibold ${
              passed ? "text-green-500" : "text-orange-400"
            }`}>
              最高 {bestScore}分
            </p>
          )}
          {unlocked && bestScore === 0 && (
            <p className="text-[10px] text-blue-400">点击开始 →</p>
          )}
        </div>
      </motion.button>
    </div>
  );
}

export default function LevelMapPage({ level, gameState, onSelectScene, onBack }) {
  const scenes = level.scenes;

  return (
    <div
      className="min-h-screen flex flex-col items-center py-6 px-4"
      style={{ background: `linear-gradient(160deg, ${level.bgFrom}22, #f0f9ff)` }}
    >
      {/* Header */}
      <div className="w-full max-w-sm flex items-center gap-3 mb-6">
        <button
          onClick={onBack}
          className="p-2 rounded-full bg-white/70 hover:bg-white shadow transition"
        >
          <ChevronLeft size={20} className="text-gray-600" />
        </button>
        <div>
          <h1 className="text-xl font-black text-gray-800">
            {level.emoji} {level.name}
          </h1>
          <p className="text-gray-400 text-xs">{level.nameEn} · 关卡地图</p>
        </div>
      </div>

      {/* Map — footprint path replaces dashed line */}
      <div className="w-full max-w-sm">
        <div className="flex flex-col relative z-10 py-4">
          {scenes.map((scene, i) => (
            <div key={scene.id}>
              {/* Footprint connector above each node (except first) */}
              {i > 0 && (
                <FootprintConnector
                  passed={getSceneBestScore(gameState, scenes[i - 1].id) >= 60}
                />
              )}

              <motion.div
                initial={{ opacity: 0, x: i % 2 === 0 ? -30 : 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.08, duration: 0.35 }}
              >
                <SceneNode
                  scene={scene}
                  sceneIndex={i}
                  scenes={scenes}
                  gameState={gameState}
                  onSelect={onSelectScene}
                />
              </motion.div>
            </div>
          ))}
        </div>
      </div>

      {!scenes.length && (
        <p className="text-gray-400 text-sm mt-16">暂无关卡数据，敬请期待 🚧</p>
      )}
    </div>
  );
}
