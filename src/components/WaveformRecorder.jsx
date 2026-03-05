import { useState, useRef, useEffect } from "react";
import { motion, useMotionValue } from "framer-motion";
import { calculateScore } from "../utils/scoring";

// Average energy for a frequency sub-band (0–1)
function avgBand(data, start, end) {
  let s = 0;
  for (let i = start; i < end; i++) s += data[i];
  return s / (end - start) / 255;
}

const BAR_COLOR = {
  blue: "#3b82f6", orange: "#f97316", purple: "#a855f7", green: "#10b981",
};

// phase: 'idle' | 'recording' | 'recognizing' | 'done'
export default function WaveformRecorder({ targetText, color, onResult, done, lenient = false }) {
  const [phase,     setPhase]     = useState("idle");
  const [micOk,     setMicOk]     = useState(null);   // null=unknown, true, false
  const [replayUrl, setReplayUrl] = useState(null);

  const canvasRef           = useRef(null);
  const mediaRecorderRef    = useRef(null);
  const chunksRef           = useRef([]);
  const animFrameRef        = useRef(null);
  const analyserRef         = useRef(null);
  const audioCtxRef         = useRef(null);
  const recognitionRef      = useRef(null);
  const pendingRef          = useRef({ audioURL: null, score: null, transcript: null });
  const pendingStopRef      = useRef(false);
  const recognitionTimerRef = useRef(null);

  // MotionValues for volume-reactive rings — updated in rAF without re-renders
  const r0s = useMotionValue(1.0);
  const r1s = useMotionValue(1.3);
  const r2s = useMotionValue(1.8);
  const r0o = useMotionValue(0.12);
  const r1o = useMotionValue(0.08);
  const r2o = useMotionValue(0.06);

  // ── Check mic permission on mount ────────────────────────────────
  useEffect(() => {
    navigator.permissions?.query({ name: "microphone" }).then((result) => {
      setMicOk(result.state !== "denied");
      result.onchange = () => setMicOk(result.state !== "denied");
    }).catch(() => setMicOk(true)); // can't query → assume OK, will fail gracefully
    return () => {
      cancelAnimationFrame(animFrameRef.current);
      clearTimeout(recognitionTimerRef.current);
      audioCtxRef.current?.close();
    };
  }, []);

  // ── Fire result when both audio + score are ready ─────────────────
  function tryFireResult() {
    const { audioURL, score, transcript } = pendingRef.current;
    if (audioURL !== null && score !== null) {
      clearTimeout(recognitionTimerRef.current);
      setReplayUrl(audioURL);
      onResult({ audioURL, score, transcript: transcript ?? "" });
      pendingRef.current = { audioURL: null, score: null, transcript: null };
      setPhase("idle");
    }
  }

  // ── Speech Recognition ────────────────────────────────────────────
  function startRecognition() {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) {
      console.warn("[recognition] 不支持 SpeechRecognition，跳过识别");
      pendingRef.current.score      = 50;
      pendingRef.current.transcript = "";
      tryFireResult();
      return;
    }
    const r = new SR();
    r.lang           = "en-US";
    r.continuous     = false;
    r.interimResults = false;

    r.onresult = (e) => {
      const text = e.results[0][0].transcript;
      console.log("[recognition] 识别结果:", text);
      pendingRef.current.score      = calculateScore(text, targetText, lenient);
      pendingRef.current.transcript = text;
      tryFireResult();
    };
    r.onerror = (e) => {
      console.error("[recognition] 错误:", e.error);
      pendingRef.current.score      = 50;
      pendingRef.current.transcript = "";
      tryFireResult();
    };
    r.start();
    recognitionRef.current = r;

    // 5s fallback timeout
    recognitionTimerRef.current = setTimeout(() => {
      if (pendingRef.current.score === null) {
        console.warn("[recognition] 超时，使用默认分数");
        pendingRef.current.score      = 50;
        pendingRef.current.transcript = "";
        tryFireResult();
      }
    }, 5000);
  }

  // ── Canvas waveform ───────────────────────────────────────────────
  function drawWaveform() {
    const canvas   = canvasRef.current;
    const analyser = analyserRef.current;
    if (!canvas || !analyser) return;
    const ctx  = canvas.getContext("2d");
    const data = new Uint8Array(analyser.frequencyBinCount);
    analyser.getByteFrequencyData(data);

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const bw = canvas.width / data.length;
    const bc = BAR_COLOR[color] ?? BAR_COLOR.blue;
    data.forEach((v, i) => {
      const h = (v / 255) * canvas.height;
      ctx.shadowBlur  = 5;
      ctx.shadowColor = bc;
      ctx.fillStyle   = bc;
      ctx.fillRect(i * bw, canvas.height - h, bw - 1, h);
    });
    ctx.shadowBlur = 0;

    // Volume-reactive rings: split into low / mid / high bands + random jitter
    const bins = data.length;
    const v0   = avgBand(data, 0, (bins / 3) | 0);
    const v1   = avgBand(data, (bins / 3) | 0, ((2 * bins) / 3) | 0);
    const v2   = avgBand(data, ((2 * bins) / 3) | 0, bins);
    const jit  = () => (Math.random() - 0.5) * 0.22;
    r0s.set(Math.max(1.0, 1.0 + v0 * 2.2 + jit()));
    r1s.set(Math.max(1.3, 1.3 + v1 * 1.8 + jit()));
    r2s.set(Math.max(1.8, 1.8 + v2 * 1.4 + jit()));
    r0o.set(Math.min(0.85, 0.12 + v0 * 0.75));
    r1o.set(Math.min(0.65, 0.08 + v1 * 0.60));
    r2o.set(Math.min(0.45, 0.06 + v2 * 0.45));

    animFrameRef.current = requestAnimationFrame(drawWaveform);
  }

  // ── Start recording ───────────────────────────────────────────────
  async function startRecording() {
    if (phase !== "idle") return;
    pendingStopRef.current = false;
    pendingRef.current     = { audioURL: null, score: null, transcript: null };
    console.log("[recorder] 请求麦克风...");

    let stream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setMicOk(true);
      console.log("[recorder] 授权成功");
    } catch (err) {
      console.error("[recorder] getUserMedia 失败:", err.name, err.message);
      setMicOk(false);
      const msg =
        err.name === "NotAllowedError"
          ? "麦克风权限被拒绝（Permission Denied）\n\n请点击地址栏旁的锁 🔒 → 允许麦克风"
          : err.name === "NotFoundError"
          ? "未检测到麦克风设备，请检查连接"
          : `录音失败：${err.name} - ${err.message}`;
      alert(msg);
      return;
    }

    if (pendingStopRef.current) {
      stream.getTracks().forEach((t) => t.stop());
      return;
    }

    // Waveform analyser
    const ac = new AudioContext();
    audioCtxRef.current = ac;
    const analyser = ac.createAnalyser();
    analyser.fftSize = 128;
    ac.createMediaStreamSource(stream).connect(analyser);
    analyserRef.current = analyser;

    // MediaRecorder
    const mr = new MediaRecorder(stream);
    mediaRecorderRef.current = mr;
    chunksRef.current = [];
    mr.ondataavailable = (e) => chunksRef.current.push(e.data);
    mr.onstop = () => {
      console.log("[recorder] MediaRecorder stopped, chunks:", chunksRef.current.length);
      const blob = new Blob(chunksRef.current, { type: "audio/webm" });
      pendingRef.current.audioURL = URL.createObjectURL(blob);
      stream.getTracks().forEach((t) => t.stop());
      ac.close();
      tryFireResult();
    };
    mr.start();
    console.log("[recorder] 开始录音, state:", mr.state);

    startRecognition();
    setPhase("recording");
    drawWaveform();

    if (pendingStopRef.current) stopRecording();
  }

  // ── Stop recording ────────────────────────────────────────────────
  function stopRecording() {
    pendingStopRef.current = true;
    console.log("[recorder] 停止, MediaRecorder state:", mediaRecorderRef.current?.state);

    if (mediaRecorderRef.current?.state === "recording") {
      mediaRecorderRef.current.stop();
    }
    recognitionRef.current?.stop();
    cancelAnimationFrame(animFrameRef.current);

    const canvas = canvasRef.current;
    if (canvas) canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);

    setPhase("recognizing");
  }

  // ── Already completed ─────────────────────────────────────────────
  if (done) {
    return (
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="flex flex-col items-center gap-2 py-4"
      >
        <motion.span
          animate={{ rotate: [0, -15, 15, -10, 10, 0], scale: [1, 1.35, 1] }}
          transition={{ duration: 0.75, delay: 0.15 }}
          className="select-none leading-none"
          style={{ fontSize: 52 }}
        >
          🎊
        </motion.span>
        <p className="font-black text-green-500 text-base">本维度已通关！</p>
        <p className="text-gray-400 text-xs">太棒了！继续挑战下一关 🚀</p>
      </motion.div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-3">
      {/* Target */}
      <p className="text-xs text-gray-400 text-center px-2">
        跟读：
        <span className="font-semibold text-gray-600">"{targetText}"</span>
      </p>

      {/* Mic permission warning */}
      {micOk === false && (
        <p className="text-xs text-red-500 bg-red-50 rounded-xl px-3 py-2 text-center">
          ⚠️ 麦克风权限未授权，请点击地址栏 🔒 → 允许麦克风
        </p>
      )}

      {/* Waveform */}
      <canvas
        ref={canvasRef}
        width={280}
        height={48}
        className={`rounded-xl transition-opacity duration-300 ${
          phase === "recording" ? "opacity-100" : "opacity-0"
        }`}
        style={{ background: "#f3f4f6" }}
      />

      {/* Record button with ripple rings */}
      {phase !== "recognizing" ? (
        <div className="relative flex items-center justify-center" style={{ width: 88, height: 88 }}>
          {/* Volume-reactive ripple rings — driven by live frequency bands, no re-renders */}
          {phase === "recording" && (
            <>
              <motion.div className="absolute rounded-full border-[3px] border-red-400"  style={{ inset: 0, scale: r0s, opacity: r0o }} />
              <motion.div className="absolute rounded-full border-[2px] border-red-300"  style={{ inset: 0, scale: r1s, opacity: r1o }} />
              <motion.div className="absolute rounded-full border-[2px] border-rose-200" style={{ inset: 0, scale: r2s, opacity: r2o }} />
            </>
          )}

          <motion.button
            onMouseDown={startRecording}
            onMouseUp={stopRecording}
            onTouchStart={(e) => { e.preventDefault(); startRecording(); }}
            onTouchEnd={stopRecording}
            whileTap={{ scale: 0.88 }}
            animate={
              phase === "recording"
                ? { scale: [1, 1.08, 1], transition: { repeat: Infinity, duration: 0.8 } }
                : { scale: 1 }
            }
            className={`relative z-10 w-20 h-20 rounded-full text-3xl shadow-lg text-white transition-colors
              ${phase === "recording" ? "bg-red-500" : "bg-gray-800 hover:bg-gray-700"}`}
          >
            {phase === "recording" ? "⏹" : "🎤"}
          </motion.button>
        </div>
      ) : (
        <div className="relative flex items-center justify-center w-20 h-20">
          {/* Scanning pulse rings */}
          {[0, 1].map((i) => (
            <motion.div
              key={i}
              className="absolute rounded-full border-2 border-blue-300/60"
              style={{ inset: 0 }}
              initial={{ scale: 1, opacity: 0.6 }}
              animate={{ scale: 2.2, opacity: 0 }}
              transition={{ repeat: Infinity, duration: 1.2, delay: i * 0.55, ease: "easeOut" }}
            />
          ))}
          <div className="relative z-10 w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center">
            <motion.span
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1.2, ease: "linear" }}
              style={{ fontSize: 28 }}
            >
              🧠
            </motion.span>
          </div>
        </div>
      )}

      {/* Status text */}
      {phase === "recording" ? (
        <motion.p
          animate={{ opacity: [1, 0.4, 1] }}
          transition={{ repeat: Infinity, duration: 1 }}
          className="text-sm font-semibold text-red-500 flex items-center gap-1.5"
        >
          <span className="w-2 h-2 rounded-full bg-red-500 inline-block" />
          正在录音…松开即停
        </motion.p>
      ) : phase === "recognizing" ? (
        <p className="text-sm text-blue-500 font-medium">🧠 正在识别语音…</p>
      ) : (
        <p className="text-xs text-gray-400">按住开始录音</p>
      )}

      {/* Replay last recording */}
      {replayUrl && phase === "idle" && (
        <div className="flex items-center gap-2 w-full">
          <span className="text-xs text-gray-400 shrink-0">上次录音：</span>
          <audio controls src={replayUrl} className="flex-1 h-8 rounded-xl" />
        </div>
      )}
    </div>
  );
}
