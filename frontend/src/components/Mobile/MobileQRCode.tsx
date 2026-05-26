import { useEffect, useState } from "react"
import { QRCodeSVG } from "qrcode.react"
import { Copy, Check, Smartphone } from "lucide-react"

const API = import.meta.env.VITE_API_URL ?? "http://localhost:8000"

type Config = {
  server_ip: string
}

export default function MobileQRCode() {
  const [serverIp, setServerIp] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`${API}/api/v1/stream/config`)
      .then((r) => r.json())
      .then((c: Config) => setServerIp(c.server_ip))
      .catch(() => setServerIp(window.location.hostname))
      .finally(() => setLoading(false))
  }, [])

  const mobileUrl = serverIp
    ? `http://${serverIp}:5173/mobile-camera`
    : null

  const handleCopy = async () => {
    if (!mobileUrl) return
    await navigator.clipboard.writeText(mobileUrl).catch(() => {})
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="overflow-hidden rounded-3xl border border-white/10 bg-zinc-950 p-6 shadow-2xl">
      {/* Header */}
      <div className="mb-5 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-purple-500/20 bg-purple-500/10">
          <Smartphone className="h-5 w-5 text-purple-400" />
        </div>
        <div>
          <h3 className="font-semibold text-white">Dùng điện thoại làm camera</h3>
          <p className="text-xs text-zinc-500">Quét QR bằng Android Chrome</p>
        </div>
      </div>

      {/* QR Code */}
      <div className="flex flex-col items-center">
        {loading ? (
          <div className="flex h-[200px] w-[200px] items-center justify-center rounded-2xl border border-white/10 bg-zinc-900">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-cyan-400 border-t-transparent" />
          </div>
        ) : mobileUrl ? (
          <div className="rounded-2xl bg-white p-3">
            <QRCodeSVG
              value={mobileUrl}
              size={180}
              bgColor="#ffffff"
              fgColor="#09090B"
              level="M"
            />
          </div>
        ) : (
          <div className="flex h-[200px] w-[200px] items-center justify-center rounded-2xl border border-red-500/20 bg-red-500/5 text-sm text-red-400">
            Không lấy được IP
          </div>
        )}

        {/* Instructions */}
        <div className="mt-4 text-center">
          <p className="text-xs text-zinc-400">Quét bằng Android Chrome</p>
          <p className="text-xs text-zinc-500">Kết nối cùng WiFi với máy tính</p>
        </div>

        {/* URL + Copy */}
        {mobileUrl && (
          <div className="mt-4 flex w-full items-center gap-2">
            <code className="flex-1 truncate rounded-xl bg-zinc-900 px-3 py-2 text-xs text-cyan-400">
              {mobileUrl}
            </code>
            <button
              type="button"
              onClick={handleCopy}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-zinc-900 transition hover:bg-zinc-800"
            >
              {copied ? (
                <Check className="h-3.5 w-3.5 text-green-400" />
              ) : (
                <Copy className="h-3.5 w-3.5 text-zinc-400" />
              )}
            </button>
          </div>
        )}
      </div>

      {/* Tip */}
      <p className="mt-4 rounded-xl bg-zinc-900/60 px-3 py-2 text-center text-xs text-zinc-500">
        Không mở được? Vào{" "}
        <code className="text-zinc-400">chrome://flags</code> → thêm địa chỉ HTTP vào{" "}
        <em>Insecure origins treated as secure</em>
      </p>
    </div>
  )
}
