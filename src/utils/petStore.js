const KEY = "petEnergy";

export const getEnergy = () =>
  parseInt(localStorage.getItem(KEY) || "0", 10);

export const addEnergy = (n = 1) => {
  const next = getEnergy() + n;
  localStorage.setItem(KEY, String(next));
  return next;
};

// 🥚 0-4  →  🌱 5-14  →  🐉 15+
export const getPetStage = (energy) =>
  energy >= 15 ? 2 : energy >= 5 ? 1 : 0;
