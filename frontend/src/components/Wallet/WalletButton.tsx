import { LogOut, Settings, Zap } from "lucide-react"
import { useState } from "react"

import { useWalletAuth } from "@/hooks/useWalletAuth"
import UpgradeModal from "./UpgradeModal"

export default function WalletButton() {
  const {
    address, isConnected, isLoading,
    plan, cameraLimit, remainingMinutes,
    connect, disconnect, shortAddress,
  } = useWalletAuth()

  const [open, setOpen] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)

  const eth = (window as unknown as Record<string, unknown>).ethereum

  if (!isConnected) {
    return (
      <>
        {eth ? (
          <button
            type="button"
            onClick={connect}
            disabled={isLoading}
            className="inline-flex items-center gap-2 rounded-full bg-orange-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-orange-400 disabled:opacity-60"
          >
            {isLoading ? (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            ) : (
              "🦊"
            )}
            {isLoading ? "Đang xác thực..." : "Connect MetaMask"}
          </button>
        ) : (
          <a
            href="https://metamask.io"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-zinc-800 px-4 py-2 text-sm font-semibold text-zinc-400"
          >
            Cài MetaMask
          </a>
        )}
      </>
    )
  }

  return (
    <>
      <UpgradeModal open={open} onClose={() => setOpen(false)} reason="manual" />

      <div className="relative">
        <button
          type="button"
          onClick={() => setDropdownOpen((v) => !v)}
          className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-zinc-900 px-3 py-1.5 text-sm font-semibold text-white transition hover:bg-zinc-800"
        >
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-cyan-500 to-blue-500 text-xs font-bold">
            {address?.slice(2, 4).toUpperCase()}
          </span>
          <span>{address ? shortAddress(address) : ""}</span>

          {plan === "free" ? (
            <span className="rounded-full bg-zinc-700 px-2 py-0.5 text-xs text-zinc-300">
              Free · còn {remainingMinutes ?? 0}p hôm nay
            </span>
          ) : (
            <span className="rounded-full bg-cyan-500/20 px-2 py-0.5 text-xs text-cyan-400">
              Pro · {cameraLimit} cameras
            </span>
          )}
        </button>

        {dropdownOpen && (
          <div
            className="absolute right-0 top-10 z-50 w-48 overflow-hidden rounded-2xl border border-white/10 bg-zinc-900 shadow-2xl"
            onBlur={() => setDropdownOpen(false)}
          >
            {plan === "free" ? (
              <button
                type="button"
                onClick={() => { setOpen(true); setDropdownOpen(false) }}
                className="flex w-full items-center gap-2 px-4 py-3 text-sm font-semibold text-yellow-400 hover:bg-yellow-500/10"
              >
                <Zap className="h-4 w-4" />
                Nâng cấp Pro
              </button>
            ) : (
              <button
                type="button"
                onClick={() => { setOpen(true); setDropdownOpen(false) }}
                className="flex w-full items-center gap-2 px-4 py-3 text-sm font-semibold text-zinc-300 hover:bg-white/5"
              >
                <Settings className="h-4 w-4" />
                Quản lý gói
              </button>
            )}

            <div className="h-px bg-white/10" />

            <button
              type="button"
              onClick={() => { disconnect(); setDropdownOpen(false) }}
              className="flex w-full items-center gap-2 px-4 py-3 text-sm font-semibold text-red-400 hover:bg-red-500/10"
            >
              <LogOut className="h-4 w-4" />
              Disconnect
            </button>
          </div>
        )}
      </div>
    </>
  )
}
