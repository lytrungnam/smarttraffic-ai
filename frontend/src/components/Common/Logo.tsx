import { Link } from "@tanstack/react-router"
import { CarFront } from "lucide-react"

import { cn } from "@/lib/utils"

interface LogoProps {
  variant?: "full" | "icon" | "responsive"
  className?: string
  asLink?: boolean
}

export function Logo({
  variant = "full",
  className,
  asLink = true,
}: LogoProps) {
  const isFull = variant === "full"
  const isIcon = variant === "icon"

  const iconBox = (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center rounded-2xl border border-cyan-400/20 bg-cyan-500/10 backdrop-blur-md",
        isFull
          ? "size-14 shadow-[0_0_30px_rgba(34,211,238,0.2)]"
          : "size-10 shadow-[0_0_20px_rgba(34,211,238,0.2)]",
      )}
    >
      <CarFront
        className={cn(
          "text-cyan-400 drop-shadow-[0_0_12px_rgba(34,211,238,0.7)]",
          isFull ? "size-7" : "size-5",
        )}
      />
    </div>
  )

  const textBlock = (
    <div className="flex flex-col leading-none">
      {/* Line 1: SmartTraffic AI */}
      <div className="flex items-baseline gap-1 whitespace-nowrap">
        <span className="font-['Playfair_Display'] text-[15px] font-bold tracking-wide text-white">
          Smart
        </span>
        <span className="font-['Playfair_Display'] text-[15px] font-bold tracking-wide text-cyan-400">
          Traffic
        </span>
        <span className="font-['Playfair_Display'] text-[13px] font-bold tracking-wider text-cyan-300">
          AI
        </span>
      </div>

      {/* Line 2: subtitle */}
      <span className="mt-0.5 whitespace-nowrap text-[9px] tracking-[0.25em] text-gray-500">
        VEHICLE DETECTION SYSTEM
      </span>
    </div>
  )

  const content = isIcon ? (
    <div className={cn("flex items-center justify-center", className)}>
      {iconBox}
    </div>
  ) : (
    <div className={cn("flex shrink-0 items-center gap-2 whitespace-nowrap", className)}>
      {iconBox}
      {textBlock}
    </div>
  )

  if (!asLink) {
    return content
  }

  return <Link to="/">{content}</Link>
}
