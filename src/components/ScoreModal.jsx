import { motion, AnimatePresence } from "framer-motion";
import { Star, RefreshCw, CheckCircle } from "lucide-react";
import { scoreLabel, scoreToStars, getHighlightedWords } from "../utils/scoring";
import { getEnergy, getPetStage } from "../utils/petStore";

const PET = ["🥚", "🌱", "🐉"];

export default function ScoreModal({ result, failCount = 0, onRetry, onConfirm }) {
  if (!result) return null;

  const { score, transcript, targetText, audioURL } = result;
  const { text, color }  = scoreLabel(score);
  const stars            = scoreToStars(score);
  const failed           = score < 60;
  const petEmoji         = PET[getPetStage(getEnergy())];
  const showHighlight    = failCount >= 2;

  return (
    <AnimatePresence>
      <motion.div
        key="backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 pb-4 px-4"
      >
        <motion.div
          initial={{ y: "100%", opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: "100%", opacity: 0 }}
          transition={{ type: "spring", damping: 28, stiffness: 320 }}
          className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl"
        >
          {/* ── Score or pet encouragement ── */}
          {failed ? (
            <div className="flex flex-col items-center gap-3 mb-4">
              <motion.div
                animate={{ y: [0, -16, 0, -10, 0] }}
                transition={{ duration: 0.75, times: [0, 0.3, 0.5, 0.75, 1] }}
                className="text-5xl select-none leading-none"
              >
                {petEmoji}
              </motion.div>
              <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl px-5 py-2.5 text-center">
                <p className="text-amber-700 font-black text-sm">Almost there! 💪</p>
                <p className="text-amber-600 text-xs font-medium mt-0.5">Try again with me!</p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center mb-4">
              <motion.p
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 300, delay: 0.05 }}
                className="text-7xl font-black leading-none"
                style={{ color }}
              >
                {score}
              </motion.p>
              <p className="text-sm font-bold mt-1" style={{ color }}>{text}</p>
            </div>
          )}

          {/* Stars */}
          <div className="flex justify-center gap-2 mb-4">
            {[1, 2, 3].map((n) => (
              <motion.div
                key={n}
                initial={{ scale: 0, rotate: -30 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.15 + n * 0.1, type: "spring", stiffness: 400 }}
              >
                <Star
                  size={32}
                  fill={n <= stars ? "#fbbf24" : "none"}
                  className={n <= stars ? "text-yellow-400" : "text-gray-200"}
                />
              </motion.div>
            ))}
          </div>

          {/* Transcript comparison */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-gray-50 rounded-2xl p-4 mb-4 text-sm space-y-2"
          >
            <div className="flex gap-2">
              <span className="text-gray-400 shrink-0 w-10">你说：</span>
              <span className="text-gray-700 font-medium">
                {transcript || "(未识别，请换用 Chrome)"}
              </span>
            </div>
            <div className="flex gap-2">
              <span className="text-gray-400 shrink-0 w-10">目标：</span>
              <span className="font-semibold leading-snug">
                {showHighlight
                  ? getHighlightedWords(targetText).map((item, i) => (
                      <span key={i}>
                        {i > 0 && " "}
                        {item.isKey ? (
                          <mark
                            style={{
                              background: "#fef08a",
                              color: "#92400e",
                              borderRadius: 4,
                              padding: "1px 3px",
                              fontWeight: 800,
                            }}
                          >
                            {item.word}
                          </mark>
                        ) : (
                          <span className="text-green-600">{item.word}</span>
                        )}
                      </span>
                    ))
                  : <span className="text-green-600">{targetText}</span>
                }
              </span>
            </div>
            {showHighlight && (
              <motion.p
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.55 }}
                className="text-xs text-amber-600 font-medium flex items-center gap-1"
              >
                💡 重点练习高亮单词！
              </motion.p>
            )}
          </motion.div>

          {/* Playback */}
          {audioURL && (
            <audio controls src={audioURL} className="w-full h-10 rounded-xl mb-4" />
          )}

          {/* Buttons */}
          <div className="flex gap-3">
            <button
              onClick={onRetry}
              className="flex-1 py-3 rounded-2xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-sm flex items-center justify-center gap-1.5 transition active:scale-95"
            >
              <RefreshCw size={15} />
              再来一次
            </button>
            <button
              onClick={onConfirm}
              className={`flex-1 py-3 rounded-2xl text-white font-semibold text-sm flex items-center justify-center gap-1.5 transition active:scale-95
                ${stars > 0 ? "bg-green-500 hover:bg-green-600" : "bg-orange-400 hover:bg-orange-500"}`}
            >
              <CheckCircle size={15} />
              {stars > 0 ? "确认提交" : "跳过本题"}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
