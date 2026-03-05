import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import { speak } from "../utils/speak";
import { getEnergy, getPetStage } from "../utils/petStore";

const PETS = [
  { emoji: "🥚", label: "宠物蛋" },
  { emoji: "🌱", label: "小芽芽" },
  { emoji: "🐉", label: "小龙龙" },
];

// Per-stage idle animation
const STAGE_ANIMATE = [
  { animate: { scale: [1, 1.09, 1] },             transition: { repeat: Infinity, duration: 1.8, ease: "easeInOut" } },
  { animate: { y: [0, -7, 0], rotate: [-4, 4, 0] }, transition: { repeat: Infinity, duration: 2.0, ease: "easeInOut" } },
  { animate: { y: [0, -12, 0], x: [0, 5, -5, 0] }, transition: { repeat: Infinity, duration: 2.8, ease: "easeInOut" } },
];

// Energy progress toward next evolution stage
function getEnergyProgress(energy, stage) {
  if (stage === 0) return { current: energy,     max: 5  };
  if (stage === 1) return { current: energy - 5, max: 10 };
  return                   { current: 1,          max: 1  }; // Stage 2: always full
}

const IDLE_LINES = [
  "I'm hungry! Let's say some words!",
  "Hey! Come practice with me!",
  "Wanna play? Let's talk!",
];

export default function FloatingPet() {
  const [energy,   setEnergy]   = useState(getEnergy);
  const [idle,     setIdle]     = useState(false);
  const [idleMode, setIdleMode] = useState("sleep"); // "sleep" | "wave"
  const [isHit,    setIsHit]    = useState(false);   // squash-stretch trigger
  const timerRef = useRef(null);
  const cycleRef = useRef(null);

  const stage = getPetStage(energy);
  const pet   = PETS[stage];

  const { current: energyCurrent, max: energyMax } = getEnergyProgress(energy, stage);
  const dotsFilled = Math.round((energyCurrent / energyMax) * 5);
  const nearEvo    = stage < 2 && energyCurrent >= energyMax - 1; // one away from evolving

  // ── Idle timer ────────────────────────────────────────────────────
  function resetIdle() {
    setIdle(false);
    clearTimeout(timerRef.current);
    clearInterval(cycleRef.current);

    timerRef.current = setTimeout(() => {
      setIdle(true);
      setIdleMode("sleep");
      speak(IDLE_LINES[Math.floor(Math.random() * IDLE_LINES.length)]);

      // Cycle sleep ↔ wave every 3.5s
      cycleRef.current = setInterval(() => {
        setIdleMode((m) => (m === "sleep" ? "wave" : "sleep"));
      }, 3500);
    }, 60_000);
  }

  useEffect(() => {
    resetIdle();
    const evts = ["click", "touchstart", "keydown", "mousemove"];
    evts.forEach((e) => document.addEventListener(e, resetIdle, { passive: true }));
    return () => {
      clearTimeout(timerRef.current);
      clearInterval(cycleRef.current);
      evts.forEach((e) => document.removeEventListener(e, resetIdle));
    };
  }, []);

  // Poll energy from localStorage (updates when returning from ScenePage)
  useEffect(() => {
    const id = setInterval(() => setEnergy(getEnergy()), 1500);
    return () => clearInterval(id);
  }, []);

  // Listen for energy-ball landing → squash-stretch + confetti
  useEffect(() => {
    function onHit() {
      setIsHit(true);
      confetti({
        particleCount: 36,
        spread: 62,
        origin: {
          x: (window.innerWidth - 33) / window.innerWidth,
          y: 116 / window.innerHeight,
        },
        colors: ["#FFD700", "#FF6B6B", "#6BCB77", "#4D96FF", "#FFD93D", "#C77DFF"],
        startVelocity: 20,
        gravity: 1.4,
        scalar: 0.72,
      });
      setTimeout(() => setIsHit(false), 700);
    }
    document.addEventListener("pet:energyHit", onHit);
    return () => document.removeEventListener("pet:energyHit", onHit);
  }, []);

  // ── Compute current animation ─────────────────────────────────────
  let petAnimate, petTransition;
  if (idle && idleMode === "sleep") {
    petAnimate   = { rotate: [0, 6, -4, 4, 0], y: [0, 4, 0] };
    petTransition = { repeat: Infinity, duration: 2.2, ease: "easeInOut" };
  } else if (idle && idleMode === "wave") {
    petAnimate   = { rotate: [0, 22, -6, 22, 0] };
    petTransition = { repeat: Infinity, duration: 1.0, ease: "easeInOut" };
  } else {
    petAnimate   = STAGE_ANIMATE[stage].animate;
    petTransition = STAGE_ANIMATE[stage].transition;
  }

  return (
    <div className="fixed z-30 flex flex-col items-end" style={{ right: 12, top: 95 }}>

      {/* Speech bubble (idle only) */}
      <AnimatePresence>
        {idle && (
          <motion.div
            key="bubble"
            initial={{ opacity: 0, scale: 0.8, x: 6 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ type: "spring", stiffness: 400, damping: 22 }}
            className="relative mb-2 bg-white px-3 py-2 shadow-lg"
            style={{ borderRadius: 14, border: "2px solid #fde68a", maxWidth: 160 }}
          >
            <p className="text-xs font-bold text-gray-700 leading-snug">
              {idleMode === "sleep" ? "💤 Zzz..." : "👋 Let's go!"}
            </p>
            {/* Tail pointing right → toward pet */}
            <div
              className="absolute top-3 -right-[7px] w-3 h-3 bg-white rotate-45"
              style={{ borderTop: "2px solid #fde68a", borderRight: "2px solid #fde68a" }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Pet button */}
      <motion.button
        onClick={resetIdle}
        animate={isHit
          ? { scaleX: [1, 1.48, 0.62, 1.24, 0.88, 1], scaleY: [1, 0.62, 1.44, 0.88, 1.14, 1] }
          : petAnimate}
        transition={isHit
          ? { duration: 0.68, times: [0, 0.18, 0.40, 0.62, 0.80, 1], ease: "easeOut" }
          : petTransition}
        className="flex flex-col items-center gap-0.5"
        style={{ background: "none", border: "none", padding: 0, cursor: "pointer" }}
      >
        {/* Pet emoji — wrapped for glow overlay */}
        <div className="relative">
          <span
            className="leading-none select-none"
            style={{
              fontSize: 42,
              filter: "drop-shadow(0 4px 10px rgba(0,0,0,0.22))",
            }}
          >
            {pet.emoji}
          </span>

          {/* Golden glow + crack sparkle when one energy away from next stage */}
          {nearEvo && (
            <>
              <motion.div
                className="absolute -inset-2 rounded-full pointer-events-none"
                animate={{
                  boxShadow: [
                    "0 0 0px 0px rgba(251,191,36,0)",
                    "0 0 18px 8px rgba(251,191,36,0.68)",
                    "0 0 0px 0px rgba(251,191,36,0)",
                  ],
                }}
                transition={{ repeat: Infinity, duration: 1.3, ease: "easeInOut" }}
              />
              <motion.span
                className="absolute -top-1 -right-1 select-none pointer-events-none"
                animate={{ rotate: [0, 18, -12, 0], scale: [1, 1.4, 1] }}
                transition={{ repeat: Infinity, duration: 1.0, ease: "easeInOut", delay: 0.2 }}
                style={{ fontSize: 11 }}
              >
                ✨
              </motion.span>
            </>
          )}
        </div>

        {/* Energy dot bar (5 segments) */}
        <div className="flex gap-0.5 mt-0.5">
          {[0, 1, 2, 3, 4].map((i) => (
            <motion.div
              key={i}
              className="rounded-full"
              animate={{
                backgroundColor: i < dotsFilled
                  ? (stage === 2 ? "#10b981" : "#f59e0b")
                  : "#e5e7eb",
                scale: i < dotsFilled ? 1 : 0.75,
              }}
              transition={{ duration: 0.3 }}
              style={{ width: 5, height: 5 }}
            />
          ))}
        </div>
        <p className="leading-none text-gray-400" style={{ fontSize: 7 }}>
          {stage === 2 ? "MAX ✓" : `${energyCurrent}/${energyMax}`}
        </p>
      </motion.button>
    </div>
  );
}
