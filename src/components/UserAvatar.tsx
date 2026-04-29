import { cn } from "@/lib/utils";
import { getAvatarById } from "@/lib/avatars";
import { AvatarArt } from "./AvatarArt";

interface UserAvatarProps {
  name?: string | null;
  avatarId?: string | null;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  ring?: boolean;
}

const sizeClasses = {
  sm: "h-8 w-8",
  md: "h-10 w-10",
  lg: "h-14 w-14",
  xl: "h-20 w-20",
};

export function UserAvatar({ name: _name, avatarId, size = "md", className, ring = true }: UserAvatarProps) {
  const avatar = getAvatarById(avatarId);

  return (
    <div
      className={cn(
        "relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full shadow-card",
        sizeClasses[size],
        ring && "ring-2 ring-offset-2 ring-offset-background",
        className,
      )}
      style={{
        background: avatar.gradient,
        ...(ring
          ? {
              boxShadow: `0 0 0 1px hsl(${avatar.ring} / 0.4), 0 8px 24px -8px hsl(${avatar.ring} / 0.5)`,
              ["--tw-ring-color" as string]: `hsl(${avatar.ring} / 0.45)`,
            }
          : {}),
      }}
      aria-hidden={false}
    >
      <AvatarArt kind={avatar.id} />
    </div>
  );
}
