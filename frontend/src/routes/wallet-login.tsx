import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router"
import { useWalletAuth } from "@/hooks/useWalletAuth"

export const Route = createFileRoute("/wallet-login")({
  component: WalletLoginPage,
  beforeLoad: () => {
    const token = localStorage.getItem("wallet_token")
    if (token) throw redirect({ to: "/dashboard" })
  },
})

function WalletLoginPage() {
  const { connect, isLoading } = useWalletAuth()
  const navigate = useNavigate()
  const eth = (window as unknown as Record<string, unknown>).ethereum

  const handleConnect = async () => {
    await connect()
    const token = localStorage.getItem("wallet_token")
    if (token) navigate({ to: "/dashboard" })
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#020617] via-[#09090B] to-[#0F172A]">
      <div className="w-full max-w-md px-4">
        {/* Logo */}
        <div className="mb-10 text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl border border-cyan-400/20 bg-gradient-to-br from-cyan-500/20 to-blue-500/10 shadow-[0_0_40px_rgba(34,211,238,0.15)]">
            <span className="text-4xl">🚦</span>
          </div>
          <h1 className="mt-6 text-4xl font-black tracking-tight text-white">SmartTraffic AI</h1>
          <p className="mt-2 text-sm text-zinc-400">AI-powered traffic monitoring & license plate recognition</p>
        </div>

        {/* Card */}
        <div className="overflow-hidden rounded-3xl border border-white/10 bg-zinc-950 p-8 shadow-2xl">
          <h2 className="text-xl font-semibold text-white">Đăng nhập bằng ví MetaMask</h2>
          <p className="mt-2 text-sm text-zinc-400">Kết nối ví để bắt đầu giám sát giao thông</p>

          <div className="mt-8 space-y-4">
            {eth ? (
              <button
                type="button"
                onClick={handleConnect}
                disabled={isLoading}
                className="flex w-full items-center justify-center gap-3 rounded-2xl bg-orange-500 px-6 py-4 text-base font-semibold text-white transition hover:bg-orange-400 disabled:opacity-60"
              >
                {isLoading ? (
                  <span className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                ) : (
                  <span className="text-2xl">🦊</span>
                )}
                {isLoading ? "Đang xác thực..." : "Connect MetaMask"}
              </button>
            ) : (
              <a
                href="https://metamask.io"
                target="_blank"
                rel="noreferrer"
                className="flex w-full items-center justify-center gap-3 rounded-2xl border border-white/10 bg-zinc-800 px-6 py-4 text-base font-semibold text-zinc-300"
              >
                <span className="text-2xl">🦊</span>
                Cài MetaMask
              </a>
            )}
          </div>

          <p className="mt-6 text-center text-xs text-zinc-600">
            Cần MATIC trên Polygon để thanh toán gói Pro
          </p>
          <p className="mt-2 text-center text-xs text-zinc-600">
            Chưa có MetaMask?{" "}
            <a href="https://metamask.io" target="_blank" rel="noreferrer" className="text-cyan-400 underline">
              Cài tại đây →
            </a>
          </p>
        </div>

        <p className="mt-6 text-center text-xs text-zinc-600">
          Hoặc{" "}
          <a href="/login" className="text-cyan-400 underline">
            đăng nhập bằng email
          </a>
        </p>
      </div>
    </div>
  )
}
