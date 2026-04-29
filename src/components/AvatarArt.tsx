import type { AvatarKind } from "@/lib/avatars";

// Inline SVG character art. All paths are stylized "chibi" head-and-shoulders
// portraits drawn on a 100x100 viewBox so they scale crisply in any avatar size.
// Colors are intentionally hard-coded per persona for an illustrated look — the
// surrounding UI provides the themed gradient background and ring.

interface ArtProps {
  kind: AvatarKind;
}

export function AvatarArt({ kind }: ArtProps) {
  return (
    <svg viewBox="0 0 100 100" className="h-full w-full" xmlns="http://www.w3.org/2000/svg">
      {ART[kind]}
    </svg>
  );
}

const ART: Record<AvatarKind, JSX.Element> = {
  ninja: (
    <g>
      {/* head */}
      <circle cx="50" cy="48" r="26" fill="#fde7c8" />
      {/* mask */}
      <path d="M22 46 Q50 60 78 46 L78 58 Q50 70 22 58 Z" fill="#0f172a" />
      <rect x="22" y="40" width="56" height="8" fill="#0f172a" />
      {/* hood */}
      <path d="M20 48 Q20 18 50 18 Q80 18 80 48 L74 44 Q72 28 50 26 Q28 28 26 44 Z" fill="#1e293b" />
      {/* headband */}
      <rect x="22" y="38" width="56" height="4" fill="#ef4444" />
      <circle cx="50" cy="40" r="2.5" fill="#fbbf24" />
      {/* eyes */}
      <ellipse cx="40" cy="48" rx="3" ry="2" fill="#0f172a" />
      <ellipse cx="60" cy="48" rx="3" ry="2" fill="#0f172a" />
      <circle cx="41" cy="47" r="1" fill="#fff" />
      <circle cx="61" cy="47" r="1" fill="#fff" />
      {/* shoulders */}
      <path d="M14 100 Q14 78 50 76 Q86 78 86 100 Z" fill="#0f172a" />
    </g>
  ),
  samurai: (
    <g>
      <circle cx="50" cy="50" r="26" fill="#f4d4a8" />
      {/* topknot hair */}
      <path d="M24 46 Q26 22 50 20 Q74 22 76 46 Q70 36 60 34 Q50 32 40 34 Q30 36 24 46 Z" fill="#1c0a0a" />
      <ellipse cx="50" cy="20" rx="6" ry="4" fill="#1c0a0a" />
      <rect x="48" y="10" width="4" height="12" fill="#1c0a0a" />
      {/* eyes */}
      <path d="M36 48 L44 50" stroke="#1c0a0a" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M56 50 L64 48" stroke="#1c0a0a" strokeWidth="2.5" strokeLinecap="round" />
      {/* face mark */}
      <path d="M44 60 Q50 64 56 60" stroke="#1c0a0a" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      {/* armor */}
      <path d="M18 100 Q18 76 50 74 Q82 76 82 100 Z" fill="#7f1d1d" />
      <path d="M30 80 L50 78 L70 80 L66 92 L50 90 L34 92 Z" fill="#fbbf24" />
      <circle cx="50" cy="84" r="3" fill="#7f1d1d" />
    </g>
  ),
  "anime-girl": (
    <g>
      {/* hair back */}
      <path d="M18 70 Q14 30 50 18 Q86 30 82 70 L78 86 L70 72 L60 88 L50 74 L40 88 L30 72 L22 86 Z" fill="#ec4899" />
      {/* face */}
      <ellipse cx="50" cy="52" rx="22" ry="24" fill="#fde7d3" />
      {/* hair front bangs */}
      <path d="M28 42 Q34 28 50 28 Q66 28 72 42 Q60 36 50 38 Q40 36 28 42 Z" fill="#ec4899" />
      {/* big eyes */}
      <ellipse cx="40" cy="54" rx="4.5" ry="6" fill="#fff" />
      <ellipse cx="60" cy="54" rx="4.5" ry="6" fill="#fff" />
      <ellipse cx="40" cy="55" rx="3" ry="4.5" fill="#7c3aed" />
      <ellipse cx="60" cy="55" rx="3" ry="4.5" fill="#7c3aed" />
      <circle cx="41" cy="53" r="1.2" fill="#fff" />
      <circle cx="61" cy="53" r="1.2" fill="#fff" />
      {/* blush */}
      <ellipse cx="36" cy="62" rx="3" ry="1.5" fill="#fb7185" opacity="0.6" />
      <ellipse cx="64" cy="62" rx="3" ry="1.5" fill="#fb7185" opacity="0.6" />
      {/* mouth */}
      <path d="M47 66 Q50 68 53 66" stroke="#be123c" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      {/* shoulders/uniform */}
      <path d="M16 100 Q16 80 50 78 Q84 80 84 100 Z" fill="#fff" />
      <path d="M40 80 L50 90 L60 80 L60 100 L40 100 Z" fill="#1e1b4b" />
    </g>
  ),
  "anime-boy": (
    <g>
      {/* hair back */}
      <path d="M22 56 Q22 22 50 20 Q78 22 78 56 L72 50 Q70 30 50 28 Q30 30 28 50 Z" fill="#1e3a8a" />
      {/* face */}
      <ellipse cx="50" cy="52" rx="22" ry="24" fill="#fde7d3" />
      {/* spiky bangs */}
      <path d="M28 44 L34 30 L40 42 L46 28 L52 42 L58 28 L64 42 L70 30 L72 44 Q60 38 50 40 Q40 38 28 44 Z" fill="#1e3a8a" />
      {/* eyes */}
      <ellipse cx="40" cy="54" rx="4" ry="5" fill="#fff" />
      <ellipse cx="60" cy="54" rx="4" ry="5" fill="#fff" />
      <ellipse cx="40" cy="55" rx="2.5" ry="3.8" fill="#0ea5e9" />
      <ellipse cx="60" cy="55" rx="2.5" ry="3.8" fill="#0ea5e9" />
      <circle cx="41" cy="53" r="1" fill="#fff" />
      <circle cx="61" cy="53" r="1" fill="#fff" />
      {/* mouth */}
      <path d="M46 66 L54 66" stroke="#7c2d12" strokeWidth="1.5" strokeLinecap="round" />
      {/* shoulders */}
      <path d="M16 100 Q16 80 50 78 Q84 80 84 100 Z" fill="#1e293b" />
      <path d="M44 80 L50 86 L56 80" stroke="#fff" strokeWidth="2" fill="none" />
    </g>
  ),
  fox: (
    <g>
      {/* ears */}
      <path d="M22 38 L30 14 L40 32 Z" fill="#ea580c" />
      <path d="M78 38 L70 14 L60 32 Z" fill="#ea580c" />
      <path d="M26 32 L30 20 L36 30 Z" fill="#fef3c7" />
      <path d="M74 32 L70 20 L64 30 Z" fill="#fef3c7" />
      {/* head */}
      <ellipse cx="50" cy="54" rx="28" ry="26" fill="#f97316" />
      {/* face mark */}
      <path d="M30 52 Q50 90 70 52 Q60 70 50 70 Q40 70 30 52 Z" fill="#fef3c7" />
      {/* eyes */}
      <ellipse cx="38" cy="52" rx="3" ry="4" fill="#0f172a" />
      <ellipse cx="62" cy="52" rx="3" ry="4" fill="#0f172a" />
      <circle cx="39" cy="51" r="1" fill="#fff" />
      <circle cx="63" cy="51" r="1" fill="#fff" />
      {/* nose & mouth */}
      <ellipse cx="50" cy="64" rx="3" ry="2" fill="#0f172a" />
      <path d="M50 66 L50 70 M50 70 Q46 72 44 70 M50 70 Q54 72 56 70" stroke="#0f172a" strokeWidth="1.2" fill="none" strokeLinecap="round" />
      {/* body */}
      <path d="M18 100 Q18 82 50 80 Q82 82 82 100 Z" fill="#ea580c" />
    </g>
  ),
  panda: (
    <g>
      {/* ears */}
      <circle cx="26" cy="28" r="10" fill="#0f172a" />
      <circle cx="74" cy="28" r="10" fill="#0f172a" />
      {/* head */}
      <ellipse cx="50" cy="52" rx="28" ry="26" fill="#f8fafc" />
      {/* eye patches */}
      <ellipse cx="38" cy="52" rx="7" ry="9" fill="#0f172a" transform="rotate(-15 38 52)" />
      <ellipse cx="62" cy="52" rx="7" ry="9" fill="#0f172a" transform="rotate(15 62 52)" />
      <circle cx="38" cy="52" r="2.5" fill="#fff" />
      <circle cx="62" cy="52" r="2.5" fill="#fff" />
      {/* nose */}
      <ellipse cx="50" cy="64" rx="3" ry="2" fill="#0f172a" />
      <path d="M50 66 L50 70 M50 70 Q46 72 44 70 M50 70 Q54 72 56 70" stroke="#0f172a" strokeWidth="1.2" fill="none" strokeLinecap="round" />
      {/* body */}
      <path d="M18 100 Q18 82 50 80 Q82 82 82 100 Z" fill="#0f172a" />
      <ellipse cx="50" cy="100" rx="22" ry="14" fill="#f8fafc" />
    </g>
  ),
  cat: (
    <g>
      {/* ears */}
      <path d="M22 38 L26 16 L40 30 Z" fill="#fbbf24" />
      <path d="M78 38 L74 16 L60 30 Z" fill="#fbbf24" />
      <path d="M26 34 L28 22 L36 30 Z" fill="#fb7185" />
      <path d="M74 34 L72 22 L64 30 Z" fill="#fb7185" />
      {/* head */}
      <ellipse cx="50" cy="54" rx="28" ry="26" fill="#fbbf24" />
      {/* stripes */}
      <path d="M30 38 L36 44 M70 38 L64 44 M50 32 L50 40" stroke="#d97706" strokeWidth="2" strokeLinecap="round" />
      {/* eyes (cat slit) */}
      <ellipse cx="38" cy="54" rx="4" ry="5" fill="#16a34a" />
      <ellipse cx="62" cy="54" rx="4" ry="5" fill="#16a34a" />
      <ellipse cx="38" cy="54" rx="0.8" ry="4" fill="#0f172a" />
      <ellipse cx="62" cy="54" rx="0.8" ry="4" fill="#0f172a" />
      {/* nose & mouth */}
      <path d="M47 64 L50 67 L53 64 Z" fill="#fb7185" />
      <path d="M50 67 L50 70 M50 70 Q46 72 44 70 M50 70 Q54 72 56 70" stroke="#0f172a" strokeWidth="1.2" fill="none" strokeLinecap="round" />
      {/* whiskers */}
      <path d="M28 62 L40 62 M28 66 L40 64 M60 62 L72 62 M60 64 L72 66" stroke="#0f172a" strokeWidth="0.8" />
      {/* body */}
      <path d="M18 100 Q18 82 50 80 Q82 82 82 100 Z" fill="#d97706" />
    </g>
  ),
  robot: (
    <g>
      {/* antenna */}
      <line x1="50" y1="10" x2="50" y2="22" stroke="#cbd5e1" strokeWidth="2" />
      <circle cx="50" cy="10" r="3" fill="#22d3ee" />
      {/* head */}
      <rect x="22" y="22" width="56" height="50" rx="10" fill="#cbd5e1" />
      <rect x="26" y="26" width="48" height="42" rx="8" fill="#475569" />
      {/* visor */}
      <rect x="30" y="38" width="40" height="14" rx="4" fill="#0f172a" />
      <circle cx="40" cy="45" r="3" fill="#22d3ee" />
      <circle cx="60" cy="45" r="3" fill="#22d3ee" />
      <circle cx="40" cy="45" r="1" fill="#fff" />
      <circle cx="60" cy="45" r="1" fill="#fff" />
      {/* mouth grid */}
      <rect x="40" y="58" width="20" height="4" rx="1" fill="#0f172a" />
      <line x1="44" y1="58" x2="44" y2="62" stroke="#22d3ee" />
      <line x1="50" y1="58" x2="50" y2="62" stroke="#22d3ee" />
      <line x1="56" y1="58" x2="56" y2="62" stroke="#22d3ee" />
      {/* neck & body */}
      <rect x="44" y="72" width="12" height="6" fill="#475569" />
      <path d="M14 100 Q14 78 50 76 Q86 78 86 100 Z" fill="#64748b" />
      <circle cx="50" cy="88" r="4" fill="#22d3ee" />
    </g>
  ),
  astronaut: (
    <g>
      {/* helmet */}
      <circle cx="50" cy="50" r="30" fill="#e2e8f0" />
      <circle cx="50" cy="50" r="25" fill="#0f172a" />
      {/* visor reflection */}
      <path d="M30 42 Q40 30 60 32 Q70 34 70 44 Q60 38 50 40 Q40 42 30 50 Z" fill="#60a5fa" opacity="0.5" />
      {/* face */}
      <ellipse cx="50" cy="54" rx="14" ry="12" fill="#fde7d3" />
      <circle cx="44" cy="52" r="1.8" fill="#0f172a" />
      <circle cx="56" cy="52" r="1.8" fill="#0f172a" />
      <path d="M46 60 Q50 62 54 60" stroke="#7c2d12" strokeWidth="1.2" fill="none" strokeLinecap="round" />
      {/* helmet rim */}
      <circle cx="50" cy="50" r="30" fill="none" stroke="#cbd5e1" strokeWidth="2" />
      <rect x="46" y="20" width="8" height="4" fill="#ef4444" />
      {/* suit */}
      <path d="M14 100 Q14 80 50 78 Q86 80 86 100 Z" fill="#f1f5f9" />
      <rect x="42" y="84" width="16" height="10" rx="2" fill="#475569" />
      <circle cx="46" cy="89" r="1.5" fill="#22c55e" />
      <circle cx="50" cy="89" r="1.5" fill="#ef4444" />
      <circle cx="54" cy="89" r="1.5" fill="#3b82f6" />
    </g>
  ),
  alien: (
    <g>
      {/* head */}
      <ellipse cx="50" cy="48" rx="28" ry="32" fill="#86efac" />
      <ellipse cx="50" cy="40" rx="22" ry="14" fill="#bbf7d0" opacity="0.6" />
      {/* big almond eyes */}
      <ellipse cx="38" cy="54" rx="6" ry="10" fill="#0f172a" transform="rotate(-15 38 54)" />
      <ellipse cx="62" cy="54" rx="6" ry="10" fill="#0f172a" transform="rotate(15 62 54)" />
      <circle cx="40" cy="50" r="1.5" fill="#fff" />
      <circle cx="64" cy="50" r="1.5" fill="#fff" />
      {/* mouth */}
      <path d="M44 70 Q50 74 56 70" stroke="#166534" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      {/* antennae */}
      <line x1="38" y1="20" x2="34" y2="8" stroke="#166534" strokeWidth="2" />
      <line x1="62" y1="20" x2="66" y2="8" stroke="#166534" strokeWidth="2" />
      <circle cx="34" cy="8" r="2.5" fill="#facc15" />
      <circle cx="66" cy="8" r="2.5" fill="#facc15" />
      {/* body */}
      <path d="M18 100 Q18 82 50 80 Q82 82 82 100 Z" fill="#16a34a" />
    </g>
  ),
  wizard: (
    <g>
      {/* hat */}
      <path d="M30 36 L50 4 L70 36 Z" fill="#4c1d95" />
      <ellipse cx="50" cy="36" rx="26" ry="5" fill="#3730a3" />
      <circle cx="50" cy="14" r="2" fill="#fde047" />
      <path d="M40 22 L42 20 L44 22 L42 24 Z" fill="#fde047" />
      <path d="M58 28 L60 26 L62 28 L60 30 Z" fill="#fde047" />
      {/* face */}
      <ellipse cx="50" cy="54" rx="22" ry="22" fill="#fde7d3" />
      {/* beard */}
      <path d="M30 60 Q30 90 50 92 Q70 90 70 60 Q60 70 50 70 Q40 70 30 60 Z" fill="#f1f5f9" />
      {/* eyes */}
      <circle cx="42" cy="54" r="2" fill="#0f172a" />
      <circle cx="58" cy="54" r="2" fill="#0f172a" />
      {/* nose */}
      <path d="M50 56 L48 64 L52 64 Z" fill="#fbbf24" opacity="0.5" />
      {/* eyebrows */}
      <path d="M36 48 Q42 44 48 50" stroke="#f1f5f9" strokeWidth="2" fill="none" strokeLinecap="round" />
      <path d="M52 50 Q58 44 64 48" stroke="#f1f5f9" strokeWidth="2" fill="none" strokeLinecap="round" />
      {/* robe */}
      <path d="M14 100 Q14 80 50 78 Q86 80 86 100 Z" fill="#4c1d95" />
      <circle cx="50" cy="92" r="3" fill="#fde047" />
    </g>
  ),
  knight: (
    <g>
      {/* helmet */}
      <path d="M22 30 Q22 16 50 14 Q78 16 78 30 L78 70 Q78 80 50 82 Q22 80 22 70 Z" fill="#cbd5e1" />
      <path d="M22 30 Q22 16 50 14 Q78 16 78 30 L78 70 Q78 80 50 82 Q22 80 22 70 Z" fill="none" stroke="#475569" strokeWidth="2" />
      {/* visor slit */}
      <rect x="28" y="46" width="44" height="6" rx="2" fill="#0f172a" />
      <line x1="36" y1="46" x2="36" y2="52" stroke="#cbd5e1" strokeWidth="1" />
      <line x1="50" y1="46" x2="50" y2="52" stroke="#cbd5e1" strokeWidth="1" />
      <line x1="64" y1="46" x2="64" y2="52" stroke="#cbd5e1" strokeWidth="1" />
      {/* breath holes */}
      <circle cx="42" cy="64" r="1.5" fill="#0f172a" />
      <circle cx="50" cy="64" r="1.5" fill="#0f172a" />
      <circle cx="58" cy="64" r="1.5" fill="#0f172a" />
      {/* plume */}
      <path d="M50 14 Q42 4 38 12 Q44 8 48 14 Z" fill="#dc2626" />
      <path d="M50 14 Q58 4 62 12 Q56 8 52 14 Z" fill="#dc2626" />
      {/* armor body */}
      <path d="M14 100 Q14 80 50 78 Q86 80 86 100 Z" fill="#94a3b8" />
      <path d="M40 84 L50 80 L60 84 L60 100 L40 100 Z" fill="#cbd5e1" />
      <path d="M50 84 L46 92 L50 96 L54 92 Z" fill="#dc2626" />
    </g>
  ),
};
