import { createFileRoute, useSearch } from "@tanstack/react-router"
import { z } from "zod"
import { useWalletAuth } from "@/hooks/useWalletAuth"
import MobileCameraStream from "@/components/Mobile/MobileCameraStream"

const searchSchema = z.object({
  demo: z.string().optional(),
})

export const Route = createFileRoute("/mobile-camera")({
  validateSearch: searchSchema,
  component: MobileCameraPage,
  head: () => ({
    meta: [
      { title: "Mobile Camera — SmartTraffic AI" },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no",
      },
    ],
  }),
})

function MobileCameraPage() {
  const { isConnected, getToken, connect, isLoading } = useWalletAuth()
  const { demo } = useSearch({ from: "/mobile-camera" })
  const eth = (window as unknown as Record<string, unknown>).ethereum

  // Demo mode hoặc đã xác thực → vào thẳng stream
  if (isConnected || demo === "1") {
    return <MobileCameraStream token={getToken()} cameraId={99} />
  }

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-gradient-to-br from-[#020617] via-[#09090B] to-[#0F172A] p-5 text-white">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-cyan-400/20 bg-gradient-to-br from-cyan-500/20 to-blue-500/10">
            <span className="text-3xl">🚦</span>
          </div>
          <h1 className="text-2xl font-black text-white">SmartTraffic AI</h1>
          <p className="mt-1 text-xs text-zinc-400">Mobile Camera Stream</p>
        </div>

        <div className="space-y-3">
          {/* MetaMask */}
          {eth ? (
            <button
              type="button"
              onClick={connect}
              disabled={isLoading}
              className="flex w-full items-center justify-center gap-3 rounded-2xl bg-orange-500 py-4 text-base font-semibold text-white transition hover:bg-orange-400 disabled:opacity-60"
            >
              {isLoading ? (
                <span className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : (
                <span className="text-2xl">🦊</span>
              )}
              {isLoading ? "Đang xác thực..." : "Đăng nhập MetaMask"}
            </button>
          ) : (
            <a
              href="https://metamask.app.link/dapp/smarttraffic.local"
              className="flex w-full items-center justify-center gap-3 rounded-2xl border border-orange-500/30 bg-orange-500/10 py-4 text-base font-semibold text-orange-400"
            >
              <span className="text-2xl">🦊</span>
              Mở MetaMask Mobile
            </a>
          )}

          {/* Demo mode */}
          <a
            href="/mobile-camera?demo=1"
            className="flex w-full items-center justify-center gap-3 rounded-2xl border border-white/10 bg-zinc-900 py-4 text-sm font-semibold text-zinc-300 transition hover:bg-zinc-800"
          >
            🎬 Chế độ Demo (không cần đăng nhập)
          </a>
        </div>

        <p className="mt-6 text-center text-xs text-zinc-600">
          Đảm bảo điện thoại và máy tính kết nối cùng WiFi
        </p>
      </div>
    </div>
  )
}
