/**
 * 静默预热 TTS — 首次用户交互时调用，解除 Chrome autoplay 限制
 */
export function warmupSpeech() {
  if (!window.speechSynthesis) return;
  const utter = new SpeechSynthesisUtterance(" ");
  utter.volume = 0;
  window.speechSynthesis.speak(utter);
  console.log("[speak] TTS warmup fired");
}

/**
 * 调用 window.speechSynthesis 播放美式英语发音
 * 已处理 Chrome 首次 getVoices() 为空的问题
 */
export function speak(text) {
  console.log("[speak] 触发：", text);
  if (!window.speechSynthesis) {
    alert("您的浏览器不支持语音合成，请使用 Chrome 或 Edge。");
    return;
  }
  window.speechSynthesis.cancel();

  function doSpeak(isRetry = false) {
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = "en-US";
    utter.rate = 0.88;
    utter.pitch = 1;

    const voices = window.speechSynthesis.getVoices();
    const enVoice =
      voices.find((v) => v.lang === "en-US" && v.name.includes("Google")) ||
      voices.find((v) => v.lang === "en-US") ||
      voices.find((v) => v.lang.startsWith("en"));
    if (enVoice) utter.voice = enVoice;

    utter.onstart = () => console.log("[speak] 开始播放");
    utter.onerror = (e) => {
      console.warn("[speak] 错误:", e.error);
      if (e.error === "interrupted" && !isRetry) {
        console.log("[speak] interrupted，后台静默重试...");
        setTimeout(() => doSpeak(true), 120);
      } else if (e.error !== "interrupted") {
        alert(`发音失败：${e.error}\n请确保已点击过页面（Chrome 需要用户交互）`);
      }
    };

    window.speechSynthesis.speak(utter);
  }

  if (window.speechSynthesis.getVoices().length === 0) {
    window.speechSynthesis.onvoiceschanged = () => {
      window.speechSynthesis.onvoiceschanged = null;
      doSpeak();
    };
  } else {
    doSpeak();
  }
}
