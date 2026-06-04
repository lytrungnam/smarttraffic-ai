import { createFileRoute, useSearch } from "@tanstack/react-router"
import { z } from "zod"
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
  const { demo } = useSearch({ from: "/mobile-camera" })
  const token = localStorage.getItem("access_token") ?? ""

  if (token || demo === "1") {
    return <MobileCameraStream token={token} cameraId={99} />
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
          <a
            href="/login"
            className="flex w-full items-center justify-center gap-3 rounded-2xl bg-cyan-500 py-4 text-base font-semibold text-black transition hover:bg-cyan-400"
          >
            Đăng nhập tài khoản
          </a>

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
