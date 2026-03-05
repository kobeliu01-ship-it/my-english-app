import { motion } from "framer-motion";

const labels = ["", "", "", "不错！", "很棒！", "完美！"];

export default function StarRating({ stars }) {
  if (stars == null) return null;
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center gap-1"
    >
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((n) => (
          <motion.span
            key={n}
            initial={{ scale: 0 }}
            animate={{ scale: n <= stars ? 1.2 : 0.8 }}
            transition={{ delay: n * 0.1, type: "spring", stiffness: 400 }}
            className={`text-2xl ${n <= stars ? "grayscale-0" : "grayscale opacity-30"}`}
          >
            ⭐
          </motion.span>
        ))}
      </div>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
        className="text-sm font-semibold text-yellow-600"
      >
        {labels[stars] ?? "继续加油！"}
      </motion.p>
    </motion.div>
  );
}
