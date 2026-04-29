// Premium character avatars rendered as inline SVG. Each persona has a
// unique gradient background and an illustrated character (ninja, anime,
// robot, etc.). No remote assets — fully themeable and crisp at any size.

export type AvatarKind =
  | "ninja"
  | "samurai"
  | "anime-girl"
  | "anime-boy"
  | "fox"
  | "panda"
  | "cat"
  | "robot"
  | "astronaut"
  | "wizard"
  | "knight"
  | "alien";

export interface PremiumAvatar {
  id: AvatarKind;
  label: string;
  gradient: string;
  ring: string; // hsl color used for ring/glow
  category: "Characters" | "Animals" | "Fantasy" | "Sci-Fi";
}

export const PREMIUM_AVATARS: PremiumAvatar[] = [
  { id: "ninja",       label: "Ninja",      category: "Characters", gradient: "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #ef4444 100%)", ring: "0 85% 60%" },
  { id: "samurai",     label: "Samurai",    category: "Characters", gradient: "linear-gradient(135deg, #7f1d1d 0%, #b91c1c 50%, #fbbf24 100%)", ring: "20 90% 55%" },
  { id: "anime-girl",  label: "Sakura",     category: "Characters", gradient: "linear-gradient(135deg, #fce7f3 0%, #f9a8d4 50%, #c084fc 100%)", ring: "320 85% 65%" },
  { id: "anime-boy",   label: "Hiro",       category: "Characters", gradient: "linear-gradient(135deg, #dbeafe 0%, #60a5fa 50%, #4f46e5 100%)", ring: "220 85% 60%" },
  { id: "fox",         label: "Kitsune",    category: "Animals",    gradient: "linear-gradient(135deg, #fed7aa 0%, #fb923c 50%, #c2410c 100%)", ring: "25 90% 55%" },
  { id: "panda",       label: "Panda",      category: "Animals",    gradient: "linear-gradient(135deg, #f1f5f9 0%, #cbd5e1 50%, #475569 100%)", ring: "215 20% 50%" },
  { id: "cat",         label: "Neko",       category: "Animals",    gradient: "linear-gradient(135deg, #fef3c7 0%, #fbbf24 50%, #d97706 100%)", ring: "40 95% 55%" },
  { id: "robot",       label: "Mecha",      category: "Sci-Fi",     gradient: "linear-gradient(135deg, #0ea5e9 0%, #06b6d4 50%, #14b8a6 100%)", ring: "190 90% 55%" },
  { id: "astronaut",   label: "Cosmo",      category: "Sci-Fi",     gradient: "linear-gradient(135deg, #1e1b4b 0%, #4f46e5 50%, #a855f7 100%)", ring: "260 80% 65%" },
  { id: "alien",       label: "Zorb",       category: "Sci-Fi",     gradient: "linear-gradient(135deg, #064e3b 0%, #10b981 50%, #84cc16 100%)", ring: "150 80% 50%" },
  { id: "wizard",      label: "Mage",       category: "Fantasy",    gradient: "linear-gradient(135deg, #1e1b4b 0%, #6d28d9 50%, #ec4899 100%)", ring: "280 80% 60%" },
  { id: "knight",      label: "Knight",     category: "Fantasy",    gradient: "linear-gradient(135deg, #334155 0%, #64748b 50%, #cbd5e1 100%)", ring: "215 25% 55%" },
];

export const getAvatarById = (id?: string | null) =>
  PREMIUM_AVATARS.find((a) => a.id === id) ?? PREMIUM_AVATARS[0];

export const getInitials = (name?: string | null) => {
  if (!name) return "U";
  return name
    .trim()
    .split(/\s+/)
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
};
