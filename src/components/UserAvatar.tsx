import { cn } from "@/lib/utils";
import { getAvatarById, getInitials } from "@/lib/avatars";

interface UserAvatarProps {
  name?: string | null;
  avatarId?: string | null;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  ring?: boolean;
}

const sizeClasses = {
  sm: "h-8 w-8 text-[11px]",
  md: "h-10 w-10 text-sm",
  lg: "h-14 w-14 text-base",
  xl: "h-20 w-20 text-2xl",
};

export function UserAvatar({ name, avatarId, size = "md", className, ring = true }: UserAvatarProps) {
  const avatar = getAvatarById(avatarId);
  const initials = getInitials(name);

  return (
    <div
      className={cn(
        "relative inline-flex shrink-0 items-center justify-center rounded-full font-semibold text-white shadow-card",
        sizeClasses[size],
        ring && "ring-2 ring-offset-2 ring-offset-background",
        className,
      )}
      style={{
        background: avatar.gradient,
        ...(ring ? { boxShadow: `0 0 0 1px hsl(${avatar.ring} / 0.4), 0 8px 24px -8px hsl(${avatar.ring} / 0.5)` } : {}),
        ...(ring ? ({ "--tw-ring-color": `hsl(${avatar.ring} / 0.45)` } as React.CSSProperties) : {}),
      }}
    >
      <span className="drop-shadow-sm">{initials}</span>
    </div>
  );
}
