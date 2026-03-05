import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, Volume2 } from "lucide-react";
import AIChatModal from "./AIChatModal";
import confetti from "canvas-confetti";

import FlipCard       from "./FlipCard";
import SceneImage     from "./SceneImage";
import WaveformRecorder from "./WaveformRecorder";
import ScoreModal     from "./ScoreModal";
import ComboDisplay   from "./ComboDisplay";
import { speak } from "../utils/speak";
import { scoreToStars } from "../utils/scoring";
import { playPerfect, playGood, playEncourage, playComboScale, playSurprise } from "../utils/soundEffects";
import { addEnergy } from "../utils/petStore";

const TAB_STYLE = {
  blue:   { active: "bg-blue-500 text-white",   inactive: "text-blue-500 bg-blue-50 hover:bg-blue-100" },
  orange: { active: "bg-orange-500 text-white", inactive: "text-orange-500 bg-orange-50 hover:bg-orange-100" },
  purple: { active: "bg-purple-500 text-white", inactive: "text-purple-500 bg-purple-50 hover:bg-purple-100" },
  green:  { active: "bg-emerald-500 text-white",inactive: "text-emerald-600 bg-emerald-50 hover:bg-emerald-100" },
};

function fireConfetti() {
  confetti({ particleCount: 160, spread: 75, origin: { y: 0.55 },
    colors: ["#FFD700","#FFA500","#FF6347","#4169E1","#32CD32","#FF69B4"] });
}

export default function ScenePage({ scene, levelId, gameState, onUpdateScore, onBack }) {
  const [activeTab,    setActiveTab]    = useState(0);
  const [prevTab,      setPrevTab]      = useState(0);
  const [selectedIdx,  setSelectedIdx]  = useState(0);
  const [pendingResult,setPendingResult]= useState(null);  // { audioURL, score, transcript, tabId }
  const [combo,        setCombo]        = useState(0);
  const [showCombo,    setShowCombo]    = useState(false);
  const [completedTabs,setCompletedTabs]= useState({});    // { tabId: true }
  const [flyingStar,   setFlyingStar]   = useState(false);
  const [energyBall,   setEnergyBall]   = useState(false);
  const [tabFailCounts,setTabFailCounts]= useState({});     // { tabId: number }
  const [showAI,       setShowAI]       = useState(false);

  const tabs = scene.tabs;
  const tab  = tabs[activeTab];

  // ── Progress bar data ─────────────────────────────────────────────
  const totalTabs   = tabs.length;
  const doneTabs    = Object.keys(completedTabs).length;
  const progressPct = Math.round((doneTabs / totalTabs) * 100);

  // ── Tab switch ────────────────────────────────────────────────────
  function switchTab(i) {
    setPrevTab(activeTab);
    setActiveTab(i);
    setSelectedIdx(0);
  }

  // ── Recording result from WaveformRecorder ────────────────────────
  function handleResult({ audioURL, score, transcript }) {
    const prevFail = tabFailCounts[tab.id] || 0;
    const newFail  = score < 60 ? prevFail + 1 : 0;
    if (score < 60) setTabFailCounts((prev) => ({ ...prev, [tab.id]: newFail }));
    setPendingResult({ audioURL, score, transcript, tabId: tab.id, failCount: newFail });
  }

  // ── User confirms score in ScoreModal ─────────────────────────────
  function handleConfirm() {
    if (!pendingResult) return;
    const { score, tabId } = pendingResult;
    const stars = scoreToStars(score);

    // Play sound
    if (score >= 95)     playPerfect();
    else if (score >= 80) playGood();
    else                  playEncourage();

    // Confetti on high score
    if (score >= 90) fireConfetti();

    // Combo tracking — counts every correct reading (≥60)
    const newCombo = score >= 60 ? combo + 1 : 0;
    setCombo(newCombo);
    if (newCombo >= 3) {
      playComboScale();                              // 叮叮叮 上升音阶
      setShowCombo(true);
      setTimeout(() => setShowCombo(false), 2600);
    }

    // Mark tab completed if passed — trigger star + energy ball + haptic + Yay!
    if (score >= 60) {
      setTabFailCounts((prev) => ({ ...prev, [tabId]: 0 }));
      setCompletedTabs((prev) => ({ ...prev, [tabId]: true }));
      setFlyingStar(true);
      setEnergyBall(true);
      addEnergy(1);
      // Surprise sound effect (random one of 3)
      setTimeout(() => playSurprise(), 180);
      // Haptic: two short success pulses
      navigator.vibrate?.([40, 25, 40]);
      setTimeout(() => speak("Yay! Great job!"), 420);
      setTimeout(() => setFlyingStar(false), 1300);
      // Dispatch at the moment the energy ball "lands" on the pet (matches 0.92s transition)
      setTimeout(() => document.dispatchEvent(new CustomEvent("pet:energyHit")), 920);
      setTimeout(() => setEnergyBall(false), 1000);
    }

    // Persist to parent (game state)
    const key = `${scene.id}/${tabId}`;
    const prev = gameState.tabs[key] || { bestScore: 0, stars: 0 };
    onUpdateScore(key, {
      bestScore: Math.max(prev.bestScore, score),
      stars:     Math.max(prev.stars, stars),
    });

    setPendingResult(null);
  }

  const direction = activeTab > prevTab ? 1 : -1;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center py-5 px-4">

      {/* ── Header ── */}
      <div className="w-full max-w-sm flex items-center gap-3 mb-4">
        <button
          onClick={onBack}
          className="p-2 rounded-full bg-white shadow hover:shadow-md transition"
        >
          <ChevronLeft size={20} className="text-gray-600" />
        </button>
        <div className="flex-1">
          <h1 className="text-lg font-black text-gray-800">
            {scene.emoji} {scene.name}
          </h1>
          <p className="text-gray-400 text-xs">{scene.nameEn}</p>
        </div>
        <button
          onClick={() => speak(scene.nameEn)}
          className="p-2 rounded-full bg-white shadow hover:shadow-md transition"
        >
          <Volume2 size={18} className="text-gray-500" />
        </button>
      </div>

      {/* ── Progress basket ── */}
      <div className="w-full max-w-sm mb-4">
        <div className="flex items-center gap-3 bg-white rounded-2xl px-4 py-3 shadow-sm">
          {/* Cartoon basket */}
          <motion.div
            className="relative flex-shrink-0"
            animate={doneTabs > 0 ? { rotate: [-6, 6, -4, 4, 0] } : {}}
            transition={{ duration: 0.55 }}
          >
            <span className="text-4xl select-none leading-none">🧺</span>
            {doneTabs > 0 && (
              <motion.span
                key={doneTabs}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 500, damping: 14 }}
                className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-amber-400
                           flex items-center justify-center text-white font-black leading-none"
                style={{ fontSize: 10 }}
              >
                {doneTabs}
              </motion.span>
            )}
          </motion.div>

          {/* Star slot per tab */}
          <div className="flex-1 flex items-center justify-around">
            {tabs.map((t) => (
              <div key={t.id} className="flex flex-col items-center gap-0.5">
                <motion.span
                  className="select-none leading-none"
                  style={{ fontSize: 22, opacity: completedTabs[t.id] ? 1 : 0.18 }}
                  animate={completedTabs[t.id] ? { scale: [1, 1.5, 1], rotate: [0, 360] } : {}}
                  transition={{ duration: 0.55, type: "spring" }}
                >
                  ⭐
                </motion.span>
                <span className="text-gray-400 font-medium leading-none" style={{ fontSize: 9 }}>
                  {t.label}
                </span>
              </div>
            ))}
          </div>

          {/* Count badge */}
          <span className="text-xs font-black text-gray-400 flex-shrink-0">
            {doneTabs}/{totalTabs}
          </span>
        </div>
      </div>

      {/* ── Scene hero image ── */}
      <SceneImage scene={scene} />

      {/* ── Tabs ── */}
      <div className="w-full max-w-sm flex gap-2 mb-4">
        {tabs.map((t, i) => {
          const s = TAB_STYLE[t.color] ?? TAB_STYLE.blue;
          return (
            <button
              key={t.id}
              onClick={() => switchTab(i)}
              className={`flex-1 py-2 rounded-xl text-xs font-semibold transition-all shadow-sm ${
                i === activeTab ? s.active + " shadow-md" : s.inactive
              }`}
            >
              {completedTabs[t.id] ? "✓ " : ""}{t.label}
            </button>
          );
        })}
      </div>

      {/* ── Tab content (animated slide) ── */}
      <div className="w-full max-w-sm overflow-hidden">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={tab.id}
            initial={{ x: direction * 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: direction * -50, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
          >
            {/* Hint */}
            <p className="text-[10px] text-gray-400 mb-3 uppercase tracking-wide font-medium">
              {tab.labelEn} · 点击卡片播放发音
            </p>

            {/* Flip cards — staggered popcorn entrance */}
            <div className="grid grid-cols-2 gap-3 mb-5">
              {tab.items.map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ scale: 0.3, opacity: 0, y: 18 }}
                  animate={{ scale: 1, opacity: 1, y: 0 }}
                  transition={{
                    delay: i * 0.09,
                    type: "spring",
                    stiffness: 380,
                    damping: 14,
                  }}
                >
                  <div
                    onClick={() => setSelectedIdx(i)}
                    className={`rounded-2xl transition-all ${
                      selectedIdx === i ? "ring-2 ring-offset-2 ring-white/80 ring-inset" : ""
                    }`}
                  >
                    <FlipCard item={item} onSpeak={speak} />
                    {selectedIdx === i && (
                      <p className="text-center text-[10px] text-gray-400 mt-1">
                        已选中用于录音
                      </p>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Recording section */}
            <div className="bg-white rounded-2xl shadow-sm p-5">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-semibold text-gray-700">🎙️ 跟读练习</h2>
                <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${
                  completedTabs[tab.id]
                    ? "bg-green-100 text-green-600"
                    : "bg-gray-100 text-gray-400"
                }`}>
                  {completedTabs[tab.id] ? "✓ 已通关" : tab.labelEn}
                </span>
              </div>

              <WaveformRecorder
                key={tab.id}
                targetText={tab.items[selectedIdx]?.text ?? tab.items[0].text}
                color={tab.color}
                onResult={handleResult}
                done={!!completedTabs[tab.id]}
                lenient={(tabFailCounts[tab.id] || 0) >= 2}
              />
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ── AI Practice button (Level 1 only, shows after all tabs done) ── */}
      <AnimatePresence>
        {doneTabs === totalTabs && levelId === "home-daily" && (
          <motion.div
            className="w-full max-w-sm mt-4"
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 380, damping: 20 }}
          >
            <motion.button
              onClick={() => setShowAI(true)}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.96 }}
              className="w-full py-4 rounded-2xl text-white font-black text-base shadow-lg relative overflow-hidden"
              style={{ background: "linear-gradient(135deg, #f97316, #ea580c)" }}
            >
              {/* Shimmer */}
              <motion.span
                className="absolute inset-0"
                style={{
                  background: "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.25) 50%, transparent 100%)",
                }}
                animate={{ x: ["-110%", "110%"] }}
                transition={{ repeat: Infinity, duration: 2.2, ease: "linear", repeatDelay: 0.6 }}
              />
              🤖 AI 口语练习
              <span className="ml-2 text-sm font-normal opacity-80">开口说英语！</span>
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Score modal ── */}
      {pendingResult && (
        <ScoreModal
          result={{ ...pendingResult, targetText: tab.items[selectedIdx]?.text ?? tab.items[0].text }}
          failCount={pendingResult.failCount}
          onRetry={() => setPendingResult(null)}
          onConfirm={handleConfirm}
        />
      )}

      {/* ── Combo display ── */}
      <ComboDisplay combo={combo} show={showCombo} />

      {/* ── Flying star into basket ── */}
      <AnimatePresence>
        {flyingStar && (
          <motion.div
            key="flyingStar"
            className="fixed z-50 pointer-events-none select-none"
            initial={{ top: "62%", left: "50%", translateX: "-50%", scale: 0.7, opacity: 1, rotate: 0 }}
            animate={{ top: "17%", left: "13%", translateX: "0%", scale: 2.2, opacity: [1, 1, 0], rotate: 720 }}
            transition={{ duration: 1.05, ease: [0.22, 1, 0.36, 1] }}
          >
            <span style={{ fontSize: 34, lineHeight: 1 }}>⭐</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── AI Chat Modal ── */}
      <AnimatePresence>
        {showAI && (
          <AIChatModal scene={scene} onClose={() => setShowAI(false)} />
        )}
      </AnimatePresence>

      {/* ── Energy ball → pet egg (top-right) ── */}
      <AnimatePresence>
        {energyBall && (
          <motion.div
            key="energyBall"
            className="fixed z-50 pointer-events-none select-none"
            initial={{ left: "50%", top: "62%", x: "-50%", scale: 1.2, opacity: 1 }}
            animate={{
              left: "calc(100% - 44px)",
              top: "118px",
              x: "0%",
              scale: 0.35,
              opacity: [1, 1, 0.8, 0],
            }}
            transition={{ duration: 0.92, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* Glowing gold orb */}
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: "50%",
                background: "radial-gradient(circle at 35% 35%, #fff7a1, #f59e0b 55%, #d97706)",
                boxShadow: "0 0 18px 6px rgba(251,191,36,0.7)",
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
