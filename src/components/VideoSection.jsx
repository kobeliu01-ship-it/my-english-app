import { useState } from "react";

export default function VideoSection({ src, fallback }) {
  const [error, setError] = useState(false);
  const videoSrc = error ? fallback : src;

  return (
    <div className="w-full max-w-sm mb-5 rounded-2xl overflow-hidden shadow-lg bg-black relative">
      <div className="relative w-full" style={{ paddingBottom: "56.25%" }}>
        <video
          key={videoSrc}
          className="absolute inset-0 w-full h-full object-cover"
          controls
          playsInline
          preload="metadata"
          onError={() => !error && setError(true)}
        >
          <source src={videoSrc} />
        </video>
        {/* Overlay label */}
        <div className="absolute top-3 left-3 bg-black/50 text-white text-xs px-2 py-1 rounded-full pointer-events-none">
          📽 场景示范
        </div>
      </div>
      {error && (
        <p className="text-center text-gray-400 text-xs py-1 bg-gray-900">
          演示视频 · 替换方式见下方说明
        </p>
      )}
    </div>
  );
}
