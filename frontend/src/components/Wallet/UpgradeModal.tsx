import { X } from "lucide-react"
import { useState } from "react"
import { useWalletAuth } from "@/hooks/useWalletAuth"

const API = import.meta.env.VITE_API_URL ?? "http://localhost:8000"
const PAYMENT_WALLET = import.meta.env.VITE_PAYMENT_WALLET ?? "0x0000000000000000000000000000000000000000"
const POLYGON_CHAIN_ID = "0x89"

type Reason = "manual" | "time_limit" | "camera_limit"

type Props = {
  open: boolean
  onClose: () => void
  reason?: Reason
}

const REASON_MSG: Record<Reason, string> = {
  manual: "Nâng cấp để mở khóa toàn bộ tính năng",
  time_limit: "Bạn đã dùng hết 2 giờ hôm nay",
  camera_limit: "Bạn đã dùng hết số camera cho phép",
}

const PLANS = [
  {
    key: "free",
    label: "Free",
    price: "Miễn phí",
    cameras: 1,
    time: "2 giờ/ngày",
    history: "24 giờ",
    exportCsv: false,
    support: "-",
    cameraCount: 0,
    matic: 0,
  },
  {
    key: "pro3",
    label: "Pro 3 Cameras",
    price: "2 MATIC/tháng",
    cameras: 3,
    time: "24/7",
    history: "30 ngày",
    exportCsv: true,
    support: "Email",
    cameraCount: 3,
    matic: 2,
  },
  {
    key: "pro5",
    label: "Pro 5 Cameras",
    price: "4 MATIC/tháng",
    cameras: 5,
    time: "24/7",
    history: "30 ngày",
    exportCsv: true,
    support: "Email",
    cameraCount: 5,
    matic: 4,
  },
]

export default function UpgradeModal({ open, onClose, reason = "manual" }: Props) {
  const { address, plan, cameraLimit, refreshStatus, getToken } = useWalletAuth()
  const [loading, setLoading] = useState<number | null>(null)
  const [txHash, setTxHash] = useState<string | null>(null)
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null)

  if (!open) return null

  const showToast = (msg: string, ok: boolean) => {
    setToast({ msg, ok })
    setTimeout(() => setToast(null), 5000)
  }

  const handlePurchase = async (cameraCount: number, matic: number) => {
    const eth = (window as unknown as Record<string, unknown>).ethereum
    if (!eth || !address) return

    // Confirm
    const confirmed = window.confirm(
      `Gửi ${matic} MATIC từ ví ${address} đến hệ thống?`
    )
    if (!confirmed) return

    setLoading(cameraCount)
    try {
      // Switch to Polygon
      await (eth as { request: (o: unknown) => Promise<void> }).request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: POLYGON_CHAIN_ID }],
      })

      // Send transaction
      const valueWei = BigInt(Math.round(matic * 1e18))
      const hash = await (eth as { request: (o: unknown) => Promise<string> }).request({
        method: "eth_sendTransaction",
        params: [{
          from: address,
          to: PAYMENT_WALLET,
          value: `0x${valueWei.toString(16)}`,
          chainId: POLYGON_CHAIN_ID,
        }],
      })
      setTxHash(hash)

      // Verify on backend
      const token = getToken()
      const res = await fetch(`${API}/api/v1/payment/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ tx_hash: hash, camera_count: cameraCount }),
      })
      const data = await res.json()

      if (!res.ok) throw new Error(data.detail ?? "Lỗi xác minh")

      await refreshStatus()
      showToast(`🎉 Nâng cấp thành công! Bạn có ${cameraCount} cameras, dùng 24/7`, true)
      setTimeout(onClose, 2000)
    } catch (err: unknown) {
      showToast((err as Error).message ?? "Giao dịch thất bại", false)
    } finally {
      setLoading(null)
    }
  }

  const currentKey = plan === "pro"
    ? (cameraLimit === 5 ? "pro5" : "pro3")
    : "free"

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="relative w-full max-w-3xl overflow-hidden rounded-3xl border border-white/10 bg-zinc-950 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 px-6 py-5">
          <div>
            <h2 className="text-xl font-semibold text-white">Nâng cấp gói</h2>
            <p className="mt-1 text-sm text-zinc-400">{REASON_MSG[reason]}</p>
          </div>
          <button type="button" onClick={onClose} className="rounded-xl p-2 text-zinc-400 hover:bg-zinc-800">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto p-6">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-zinc-400">
                <th className="pb-4 pr-4 font-semibold">Tính năng</th>
                {PLANS.map((p) => (
                  <th key={p.key} className="pb-4 px-4 font-semibold text-white">{p.label}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {[
                ["Giá", (p: typeof PLANS[0]) => p.price],
                ["Số camera", (p: typeof PLANS[0]) => String(p.cameras)],
                ["Thời gian sử dụng", (p: typeof PLANS[0]) => p.time],
                ["Lịch sử", (p: typeof PLANS[0]) => p.history],
                ["Export CSV", (p: typeof PLANS[0]) => p.exportCsv ? "✅" : "❌"],
                ["Hỗ trợ", (p: typeof PLANS[0]) => p.support],
              ].map(([label, getter]) => (
                <tr key={String(label)}>
                  <td className="py-3 pr-4 text-zinc-400">{String(label)}</td>
                  {PLANS.map((p) => (
                    <td key={p.key} className="px-4 py-3 text-zinc-200">
                      {(getter as (p: typeof PLANS[0]) => string)(p)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>

          {/* Action buttons */}
          <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
            {PLANS.map((p) => {
              const isCurrent = p.key === currentKey
              return (
                <div key={p.key} className="flex justify-center">
                  {isCurrent ? (
                    <button type="button" disabled className="min-h-[44px] w-full rounded-full border border-white/10 bg-zinc-800 px-4 py-2.5 text-sm font-semibold text-zinc-500 cursor-not-allowed">
                      Gói hiện tại
                    </button>
                  ) : p.cameraCount === 0 ? (
                    <div />
                  ) : (
                    <button
                      type="button"
                      disabled={loading !== null}
                      onClick={() => handlePurchase(p.cameraCount, p.matic)}
                      className="min-h-[44px] w-full rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 px-4 py-2.5 text-sm font-semibold text-black transition hover:opacity-90 disabled:opacity-60"
                    >
                      {loading === p.cameraCount ? "Đang xử lý..." : `Chọn ${p.label}`}
                    </button>
                  )}
                </div>
              )
            })}
          </div>

          {txHash && (
            <p className="mt-4 text-center text-xs text-zinc-500">
              Tx:{" "}
              <a
                href={`https://polygonscan.com/tx/${txHash}`}
                target="_blank"
                rel="noreferrer"
                className="text-cyan-400 underline"
              >
                {txHash.slice(0, 20)}...
              </a>
            </p>
          )}
        </div>

        {/* Toast */}
        {toast && (
          <div className={`mx-6 mb-4 rounded-2xl px-4 py-3 text-sm font-semibold ${toast.ok ? "bg-green-500/10 text-green-400" : "bg-red-500/10 text-red-400"}`}>
            {toast.msg}
          </div>
        )}
      </div>
    </div>
  )
}
