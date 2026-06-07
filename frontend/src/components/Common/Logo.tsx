import { Link } from "@tanstack/react-router"
import { CarFront } from "lucide-react"

import { cn } from "@/lib/utils"

interface LogoProps {
  variant?: "full" | "hero" | "icon" | "responsive"
  className?: string
  asLink?: boolean
}

export function Logo({
  variant = "full",
  className,
  asLink = true,
}: LogoProps) {
  const isFull = variant === "full"
  const isHero = variant === "hero"
  const isIcon = variant === "icon"

  const iconBox = (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center border border-cyan-400/20 bg-cyan-500/10 backdrop-blur-md",
        isHero
          ? "size-44 rounded-[2.5rem] shadow-[0_0_70px_rgba(34,211,238,0.32)] xl:size-52"
          : isFull
            ? "size-14 rounded-2xl shadow-[0_0_30px_rgba(34,211,238,0.2)]"
            : "size-10 rounded-2xl shadow-[0_0_20px_rgba(34,211,238,0.2)]",
      )}
    >
      <CarFront
        className={cn(
          "text-cyan-400 drop-shadow-[0_0_12px_rgba(34,211,238,0.7)]",
          isHero ? "size-24 xl:size-28" : isFull ? "size-7" : "size-5",
        )}
      />
    </div>
  )

  const textBlock = (
    <div
      className={cn(
        "flex flex-col leading-none",
        isHero && "items-center gap-4 text-center",
      )}
    >
      {/* Line 1: SmartTraffic AI */}
      <div
        className={cn(
          "flex items-baseline whitespace-nowrap",
          isHero ? "gap-3" : "gap-1",
        )}
      >
        <span
          className={cn(
            "font-['Playfair_Display'] font-bold tracking-wide text-white",
            isHero ? "text-5xl xl:text-7xl" : "text-[15px]",
          )}
        >
          Smart
        </span>
        <span
          className={cn(
            "font-['Playfair_Display'] font-bold tracking-wide text-cyan-400",
            isHero ? "text-5xl xl:text-7xl" : "text-[15px]",
          )}
        >
          Traffic
        </span>
        <span
          className={cn(
            "font-['Playfair_Display'] font-bold tracking-wider text-cyan-300",
            isHero ? "text-4xl xl:text-6xl" : "text-[13px]",
          )}
        >
          AI
        </span>
      </div>

      {/* Line 2: subtitle */}
      <span
        className={cn(
          "whitespace-nowrap text-gray-500",
          isHero
            ? "text-base font-semibold tracking-[0.35em] text-cyan-200/70 xl:text-xl xl:tracking-[0.45em]"
            : "mt-0.5 text-[9px] tracking-[0.25em]",
        )}
      >
        VEHICLE DETECTION SYSTEM
      </span>
    </div>
  )

  const content = isIcon ? (
    <div className={cn("flex items-center justify-center", className)}>
      {iconBox}
    </div>
  ) : (
    <div
      className={cn(
        "flex shrink-0 whitespace-nowrap",
        isHero
          ? "flex-col items-center justify-center gap-9"
          : "items-center gap-2",
        className,
      )}
    >
      {iconBox}
      {textBlock}
    </div>
  )

  if (!asLink) {
    return content
  }

  return <Link to="/">{content}</Link>
}
