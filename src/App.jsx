import { useState, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";

import levelsData        from "./data/levels.json";
import level3Data        from "./data/level3.json";
import level4Data        from "./data/level4.json";
import level5Data        from "./data/level5.json";
import occupationsData   from "./data/occupations.json";
import { loadState, saveState } from "./utils/gameState";

import HomePage           from "./components/HomePage";
import LevelMapPage       from "./components/LevelMapPage";
import ScenePage          from "./components/ScenePage";
import BadgeModal         from "./components/BadgeModal";
import DreamJobIslandPage from "./components/DreamJobIslandPage";
import StickerModal       from "./components/StickerModal";
import FloatingPet        from "./components/FloatingPet";

const BADGE_KEY = "badge_outdoor_explorer";

// Dreamy background decorations — floated over page at ~8% opacity for a magical layer
const BG_DECOS = [
  { emoji: "☁️", size: 44, opacity: 0.11, s: { left: "3%",   top: "7%"  }, a: { x: [0,14,0], y: [0,-6,0]              }, dur: 8            },
  { emoji: "⭐",  size: 18, opacity: 0.09, s: { left: "78%",  top: "4%"  }, a: { rotate: [0,360]                       }, dur: 12           },
  { emoji: "🌙",  size: 22, opacity: 0.08, s: { right: "6%",  top: "16%" }, a: { y: [0,-10,0]                          }, dur: 6,  delay: 1  },
  { emoji: "☁️", size: 26, opacity: 0.08, s: { left: "12%",  top: "53%" }, a: { x: [0,11,0]                           }, dur: 9,  delay: 2  },
  { emoji: "✨",  size: 15, opacity: 0.10, s: { right: "10%", top: "38%" }, a: { scale: [1,1.3,1], rotate: [0,180,0]   }, dur: 5,  delay: 0.5},
  { emoji: "🌟",  size: 14, opacity: 0.07, s: { left: "44%",  top: "86%" }, a: { rotate: [0,-360]                      }, dur: 14           },
  { emoji: "☁️", size: 20, opacity: 0.07, s: { right: "4%",  top: "70%" }, a: { x: [0,-10,0]                          }, dur: 7,  delay: 3  },
  { emoji: "💫",  size: 13, opacity: 0.09, s: { left: "24%",  top: "27%" }, a: { rotate: [0,360], scale: [1,1.2,1]     }, dur: 10, delay: 1.5},
];

// ── View stack ────────────────────────────────────────────────────────
// view: 'home' | 'levelMap' | 'scene' | 'dreamJob'

export default function App() {
  const [view,           setView]           = useState("home");
  const [currentLevelId, setCurrentLevelId] = useState(null);
  const [currentSceneId, setCurrentSceneId] = useState(null);
  const [gameState,      setGameState]      = useState(() => loadState());
  const [showBadge,      setShowBadge]      = useState(false);
  const [showSticker,    setShowSticker]    = useState(false);
  const [stickerMode,    setStickerMode]    = useState("celebrate");
  const [stickerJobId,   setStickerJobId]   = useState(null);
  const [fromIsland,     setFromIsland]     = useState(false);

  // Merge base levels with supplementary level files (level3, level4, level5, …)
  const levels = [
    ...levelsData.levels.map((l) =>
      l.id === "public" ? { ...l, scenes: level3Data.scenes } : l
    ),
    ...level4Data.levels,
    ...level5Data.levels,
  ];

  // Dream Job Island data (not merged into main levels array)
  const islandLevel  = occupationsData.level;
  const islandScenes = islandLevel.scenes;

  // ── Navigation ──────────────────────────────────────────────────────
  function goToLevel(levelId) {
    setCurrentLevelId(levelId);
    setView("levelMap");
  }

  function goToScene(sceneId) {
    setCurrentSceneId(sceneId);
    setView("scene");
  }

  function goToDreamJob() {
    setView("dreamJob");
  }

  function goToIslandScene(sceneId) {
    setCurrentSceneId(sceneId);
    setFromIsland(true);
    setView("scene");
  }

  function openStickerBook() {
    setStickerMode("book");
    setShowSticker(true);
  }

  function goBack() {
    if (view === "scene") {
      if (fromIsland) {
        setFromIsland(false);
        setView("dreamJob");
      } else {
        setView("levelMap");
      }
      return;
    }
    if (view === "levelMap") { setView("home");     return; }
    if (view === "dreamJob") { setView("home");     return; }
  }

  // ── Score update (called from ScenePage) ────────────────────────────
  const handleUpdateScore = useCallback(
    (key, data) => {
      setGameState((prev) => {
        const next = { ...prev, tabs: { ...prev.tabs, [key]: data } };
        saveState(next);
        return next;
      });
      // Level 2 completion badge: triggers on any tab of the final scene
      if (key.startsWith("perfect-day-out/") && data.bestScore >= 60) {
        if (!localStorage.getItem(BADGE_KEY)) {
          localStorage.setItem(BADGE_KEY, "1");
          setShowBadge(true);
        }
      }
      // Dream Job Island sticker: award only when ALL tabs of the scene score >= 60
      const sceneId = key.split("/")[0];
      const tabId   = key.split("/")[1];
      if (sceneId.startsWith("job-")) {
        const storageKey = "sticker_" + sceneId;
        if (!localStorage.getItem(storageKey)) {
          const scene = islandScenes.find((s) => s.id === sceneId);
          if (scene) {
            const allDone = scene.tabs.every((tab) => {
              if (tab.id === tabId) return data.bestScore >= 60;          // current tab
              return (gameState.tabs[sceneId + "/" + tab.id]?.bestScore ?? 0) >= 60; // previous
            });
            if (allDone) {
              localStorage.setItem(storageKey, "1");
              setStickerJobId(sceneId);
              setStickerMode("celebrate");
              setShowSticker(true);
            }
          }
        }
      }
    },
    [gameState, islandScenes]
  );

  // ── Derive current level / scene ────────────────────────────────────
  const currentLevel = levels.find((l) => l.id === currentLevelId) ?? null;
  const currentScene = fromIsland
    ? (islandScenes.find((s) => s.id === currentSceneId) ?? null)
    : (currentLevel?.scenes.find((s) => s.id === currentSceneId) ?? null);

  // Sticker scene lookup for StickerModal celebrate mode
  const stickerScene = stickerJobId
    ? islandScenes.find((s) => s.id === stickerJobId) ?? null
    : null;

  // ── Page transitions ────────────────────────────────────────────────
  return (
    <div className="overflow-x-hidden">

      {/* ── Dreamy background layer (z-2, below FloatingPet z-30 / modals z-50) ── */}
      <div
        className="fixed inset-0 overflow-hidden pointer-events-none"
        style={{ zIndex: 2 }}
        aria-hidden="true"
      >
        {BG_DECOS.map((d, i) => (
          <motion.span
            key={i}
            className="absolute select-none"
            style={{ ...d.s, fontSize: d.size, opacity: d.opacity }}
            animate={d.a}
            transition={{ repeat: Infinity, duration: d.dur, ease: "easeInOut", delay: d.delay ?? 0 }}
          >
            {d.emoji}
          </motion.span>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {view === "home" && (
          <motion.div
            key="home"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.25 }}
          >
            <HomePage
              levels={levels}
              gameState={gameState}
              onSelectLevel={goToLevel}
              onDreamJob={goToDreamJob}
            />
          </motion.div>
        )}

        {view === "levelMap" && currentLevel && (
          <motion.div
            key="levelMap"
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.25 }}
          >
            <LevelMapPage
              level={currentLevel}
              gameState={gameState}
              onSelectScene={goToScene}
              onBack={goBack}
            />
          </motion.div>
        )}

        {view === "scene" && currentScene && (
          <motion.div
            key="scene"
            initial={{ opacity: 0, x: 60 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 60 }}
            transition={{ duration: 0.25 }}
          >
            <ScenePage
              scene={currentScene}
              levelId={currentLevelId}
              gameState={gameState}
              onUpdateScore={handleUpdateScore}
              onBack={goBack}
            />
          </motion.div>
        )}

        {view === "dreamJob" && (
          <motion.div
            key="dreamJob"
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.25 }}
          >
            <DreamJobIslandPage
              scenes={islandScenes}
              gameState={gameState}
              onSelectScene={goToIslandScene}
              onBack={goBack}
              onOpenStickerBook={openStickerBook}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Global floating pet — always visible across all pages */}
      <FloatingPet />

      <BadgeModal show={showBadge} onClose={() => setShowBadge(false)} />

      <StickerModal
        mode={stickerMode}
        jobId={stickerJobId}
        jobEmoji={stickerScene?.emoji ?? null}
        jobNameEn={stickerScene?.nameEn ?? null}
        scenes={islandScenes}
        show={showSticker}
        onClose={() => setShowSticker(false)}
      />
    </div>
  );
}
