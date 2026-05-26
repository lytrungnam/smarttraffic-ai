import { useEffect, useState } from "react"
import { useWalletAuth } from "@/hooks/useWalletAuth"
import UpgradeModal from "./UpgradeModal"

const API = import.meta.env.VITE_API_URL ?? "http://localhost:8000"

type Detection = {
  id: string
  plate_number: string
  vehicle_type: string
  confidence: number
  location: string | null
  status: string
  created_at: string
}

export default function ExitLog() {
  const { isConnected, plan, features, getToken } = useWalletAuth()
  const [records, setRecords] = useState<Detection[]>([])
  const [loading, setLoading] = useState(false)
  const [upgradeOpen, setUpgradeOpen] = useState(false)

  useEffect(() => {
    if (!isConnected) return
    const token = getToken()
    setLoading(true)
    fetch(`${API}/api/v1/wallet-history?limit=50`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => setRecords(data.items ?? []))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [isConnected, getToken])

  const handleExport = async () => {
    const token = getToken()
    const res = await fetch(`${API}/api/v1/wallet-history/export`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    if (!res.ok) { setUpgradeOpen(true); return }
    const blob = await res.blob()
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "detection-history-30days.csv"
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <>
      <UpgradeModal open={upgradeOpen} onClose={() => setUpgradeOpen(false)} reason="manual" />

      <div className="overflow-hidden rounded-3xl border border-white/10 bg-zinc-950 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-5">
          <div>
            <h2 className="text-xl font-semibold text-white">Detection Log</h2>
            <p className="mt-1 text-sm text-zinc-400">
              {plan === "pro" ? "30 ngày gần nhất" : "24 giờ gần nhất"}
            </p>
          </div>
          {plan === "pro" && features.exportCsv && (
            <button
              type="button"
              onClick={handleExport}
              className="inline-flex items-center gap-2 rounded-full border border-cyan-500/20 bg-cyan-500/10 px-4 py-2 text-xs font-semibold text-cyan-400 hover:bg-cyan-500/20"
            >
              📥 Export CSV
            </button>
          )}
        </div>

        {/* Records */}
        <div className="divide-y divide-white/5 max-h-96 overflow-y-auto">
          {loading && (
            <p className="p-6 text-center text-sm text-cyan-400">Đang tải...</p>
          )}
          {!loading && records.length === 0 && (
            <p className="p-6 text-center text-sm text-zinc-500">Chưa có dữ liệu</p>
          )}
          {records.map((r) => (
            <div key={r.id} className="flex items-center justify-between px-5 py-4 hover:bg-zinc-900/40">
              <div>
                <p className="text-sm font-semibold text-white">{r.plate_number}</p>
                <p className="mt-0.5 text-xs text-zinc-500">{r.vehicle_type} · {r.location ?? "Unknown"}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-zinc-400">{new Date(r.created_at).toLocaleTimeString()}</p>
                <p className="mt-0.5 text-xs text-zinc-600">{new Date(r.created_at).toLocaleDateString()}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Free plan footer */}
        {plan === "free" && (
          <div className="border-t border-white/10 px-5 py-4 text-center text-xs text-zinc-500">
            💡 Pro plan: xem lịch sử 30 ngày & export CSV{" "}
            <button
              type="button"
              onClick={() => setUpgradeOpen(true)}
              className="ml-1 text-cyan-400 underline"
            >
              Nâng cấp
            </button>
          </div>
        )}
      </div>
    </>
  )
}
