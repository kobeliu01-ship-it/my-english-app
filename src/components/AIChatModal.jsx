import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send } from "lucide-react";

// ── Mock replies per scene (falls back to GENERIC) ───────────────────────────
const SCENE_REPLIES = {
  "wake-up": [
    "Great job! Can you tell me what time you usually wake up?",
    "Excellent! Try saying: 'I wake up at seven o'clock.'",
    "Perfect pronunciation! What do you do right after waking up?",
    "Well done! Can you use 'alarm' in a sentence?",
  ],
  "breakfast": [
    "Awesome! What is your favorite breakfast food?",
    "Great! Try saying: 'I eat toast and eggs for breakfast.'",
    "Nice work! Can you name three breakfast items?",
    "Excellent! How do you say '牛奶' in English?",
  ],
  "getting-dressed": [
    "Well done! Can you describe what you are wearing today?",
    "Great job! Try: 'I put on my shirt and trousers.'",
    "Excellent! What colors are your clothes?",
    "Perfect! Can you name five clothing items?",
  ],
  "school-bag": [
    "Awesome! What is inside your school bag?",
    "Great! Try: 'I put my books and pencils in my bag.'",
    "Well done! Can you spell 'pencil case'?",
    "Excellent! How many things are in your bag today?",
  ],
};

const GENERIC_REPLIES = [
  "Great job! Can you say that again even louder?",
  "Excellent! Try using that word in a new sentence.",
  "Well done! You are doing amazing today! 🌟",
  "Perfect! Can you tell me more about this topic?",
  "Awesome work! Keep practicing — you are getting better!",
  "Nice! Now try to say the whole sentence without looking.",
  "Super! Can you think of another related word?",
  "Brilliant! Your English is improving so fast! 🚀",
];

function mockChat(scene, _userInput) {
  const pool = SCENE_REPLIES[scene.id] ?? GENERIC_REPLIES;
  const reply = pool[Math.floor(Math.random() * pool.length)];
  return new Promise((resolve) => setTimeout(() => resolve(reply), 1000));
}
// ─────────────────────────────────────────────────────────────────────────────

export default function AIChatModal({ scene, onClose }) {
  const greeting =
    `Hi there! 👋 I'm your English teacher!\n\n` +
    `Let's practice 【${scene.name}】together!\n` +
    `你可以用英语和我聊天，准备好了吗？ Ready? 🎉`;

  const [messages,  setMessages]  = useState([
    { role: "assistant", content: greeting },
  ]);
  const [input,    setInput]    = useState("");
  const [loading,  setLoading]  = useState(false);
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleSend() {
    if (!input.trim() || loading) return;

    const userText = input.trim();
    setInput("");

    setMessages((prev) => [...prev, { role: "user", content: userText }]);
    setLoading(true);

    const reply = await mockChat(scene, userText);

    setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
    setLoading(false);
  }

  return (
    <motion.div
      className="fixed inset-0 z-50 flex flex-col"
      initial={{ y: "100%" }}
      animate={{ y: 0 }}
      exit={{ y: "100%" }}
      transition={{ type: "spring", damping: 28, stiffness: 320 }}
      style={{
        background:
          "linear-gradient(160deg, #f97316 0%, #ea580c 60%, #c2410c 100%)",
      }}
    >
      {/* ── Header ── */}
      <div className="flex items-center gap-3 px-4 pt-8 pb-4">
        <motion.div
          className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center text-2xl flex-shrink-0"
          animate={{ rotate: [0, -8, 8, 0] }}
          transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
        >
          🤖
        </motion.div>
        <div className="flex-1">
          <h2 className="text-white font-black text-lg leading-tight">
            AI 口语练习
          </h2>
          <p className="text-white/70 text-xs mt-0.5">
            {scene.emoji} {scene.name} · {scene.nameEn}
          </p>
        </div>
        <button
          onClick={onClose}
          className="p-2 rounded-full bg-white/20 hover:bg-white/30 active:scale-95 transition"
        >
          <X size={20} className="text-white" />
        </button>
      </div>

      <div className="mx-4 mb-3 h-px bg-white/20 rounded-full" />

      {/* ── Message history ── */}
      <div className="flex-1 overflow-y-auto px-4 py-2 space-y-3">
        <AnimatePresence initial={false}>
          {messages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ scale: 0.85, opacity: 0, y: 8 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              transition={{ type: "spring", stiffness: 420, damping: 22 }}
              className={`flex items-end gap-2 ${
                msg.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              {msg.role === "assistant" && (
                <div className="w-8 h-8 rounded-xl bg-white/25 flex items-center justify-center text-base flex-shrink-0">
                  🤖
                </div>
              )}

              <div
                className={`max-w-[78%] px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap shadow-md ${
                  msg.role === "user"
                    ? "bg-white text-gray-800 rounded-2xl rounded-br-sm font-medium"
                    : "bg-white/20 text-white rounded-2xl rounded-bl-sm"
                }`}
              >
                {msg.content}
              </div>

              {msg.role === "user" && (
                <div className="w-8 h-8 rounded-xl bg-white/25 flex items-center justify-center text-base flex-shrink-0">
                  🧒
                </div>
              )}
            </motion.div>
          ))}

          {/* Typing indicator */}
          {loading && (
            <motion.div
              key="typing"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex items-end gap-2 justify-start"
            >
              <div className="w-8 h-8 rounded-xl bg-white/25 flex items-center justify-center text-base flex-shrink-0">
                🤖
              </div>
              <div className="bg-white/20 rounded-2xl rounded-bl-sm px-4 py-3 flex gap-1.5 items-center">
                {[0, 1, 2].map((i) => (
                  <motion.span
                    key={i}
                    className="w-2 h-2 rounded-full bg-white block"
                    animate={{ y: [0, -5, 0] }}
                    transition={{
                      repeat: Infinity,
                      duration: 0.7,
                      delay: i * 0.15,
                      ease: "easeInOut",
                    }}
                  />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div ref={endRef} />
      </div>

      {/* ── Input area ── */}
      <div className="px-4 pb-8 pt-3">
        <div
          className="flex gap-2 items-end rounded-2xl px-3 py-2"
          style={{
            background: "rgba(255,255,255,0.18)",
            backdropFilter: "blur(8px)",
          }}
        >
          <input
            className="flex-1 bg-transparent text-white placeholder-white/50 text-sm px-1 py-1.5 outline-none"
            placeholder="Type in English…"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSend();
            }}
            disabled={loading}
          />
          <motion.button
            onClick={handleSend}
            disabled={!input.trim() || loading}
            whileTap={{ scale: 0.88 }}
            className="p-2.5 rounded-xl bg-white disabled:opacity-40 transition flex-shrink-0"
          >
            <Send size={17} className="text-orange-500" />
          </motion.button>
        </div>
        <p
          className="text-white/40 text-center mt-2"
          style={{ fontSize: 10 }}
        >
          Enter 发送 · 完成所有练习后解锁
        </p>
      </div>
    </motion.div>
  );
}
