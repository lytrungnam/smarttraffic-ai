import { useState } from "react"
import { useWalletAuth } from "@/hooks/useWalletAuth"
import UpgradeModal from "./UpgradeModal"

export default function UsageBanner() {
  const { isConnected, plan, remainingMinutes } = useWalletAuth()
  const [open, setOpen] = useState(false)

  if (!isConnected || plan === "pro") return null

  const mins = remainingMinutes ?? 0
  const exhausted = mins <= 0
  const warning = !exhausted && mins < 30

  const hours = Math.floor(mins / 60)
  const minLeft = mins % 60
  const timeStr = hours > 0 ? `${hours} giờ ${minLeft} phút` : `${mins} phút`

  let bg = "bg-cyan-500/10 border-cyan-500/20"
  let text = "text-cyan-300"
  let icon = "⏱"
  let message = `Free Plan: còn ${timeStr} hôm nay`
  let btnLabel = "⚡ Nâng cấp"

  if (warning) {
    bg = "bg-yellow-500/10 border-yellow-500/30"
    text = "text-yellow-300"
    icon = "⚠️"
    message = `Còn ${timeStr} hôm nay! Nâng cấp để dùng 24/7`
    btnLabel = "⚡ Nâng cấp ngay"
  }

  if (exhausted) {
    bg = "bg-red-500/10 border-red-500/30"
    text = "text-red-300"
    icon = "🔒"
    message = "Hết 2 giờ hôm nay. Reset lúc 00:00"
    btnLabel = "⚡ Nâng cấp để tiếp tục"
  }

  return (
    <>
      <UpgradeModal open={open} onClose={() => setOpen(false)} reason="time_limit" />

      <div className={`flex items-center justify-between border px-4 py-2 text-sm ${bg} ${text}`}>
        <span>
          {icon}{" "}
          {warning ? (
            <span className="animate-pulse font-semibold">{message}</span>
          ) : (
            <span className="font-semibold">{message}</span>
          )}
        </span>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="ml-4 rounded-full border border-current px-3 py-1 text-xs font-semibold transition hover:opacity-80"
        >
          {btnLabel}
        </button>
      </div>
    </>
  )
}
