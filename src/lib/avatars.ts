// Predefined premium gradient avatars. Each entry is referenced by id and
// rendered as a CSS gradient so we don't depend on remote image hosting.
export interface PremiumAvatar {
  id: string;
  label: string;
  gradient: string;
  ring: string; // hsl color used for ring/glow
}

export const PREMIUM_AVATARS: PremiumAvatar[] = [
  { id: "aurora",  label: "Aurora",  gradient: "linear-gradient(135deg, #22d3a8 0%, #4ade80 50%, #a3e635 100%)", ring: "142 90% 55%" },
  { id: "nebula",  label: "Nebula",  gradient: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #ec4899 100%)", ring: "270 75% 65%" },
  { id: "ember",   label: "Ember",   gradient: "linear-gradient(135deg, #f59e0b 0%, #f97316 50%, #ef4444 100%)", ring: "20 95% 60%" },
  { id: "ocean",   label: "Ocean",   gradient: "linear-gradient(135deg, #0ea5e9 0%, #06b6d4 50%, #14b8a6 100%)", ring: "190 90% 55%" },
  { id: "rose",    label: "Rose",    gradient: "linear-gradient(135deg, #f43f5e 0%, #ec4899 50%, #a855f7 100%)", ring: "340 85% 60%" },
  { id: "obsidian",label: "Obsidian",gradient: "linear-gradient(135deg, #1e293b 0%, #334155 50%, #64748b 100%)", ring: "215 20% 55%" },
  { id: "gold",    label: "Gold",    gradient: "linear-gradient(135deg, #fde047 0%, #f59e0b 50%, #b45309 100%)", ring: "40 95% 55%" },
  { id: "mint",    label: "Mint",    gradient: "linear-gradient(135deg, #5eead4 0%, #34d399 50%, #10b981 100%)", ring: "160 75% 55%" },
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
