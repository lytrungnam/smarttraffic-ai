import { useCallback, useEffect, useState } from "react"

const API = import.meta.env.VITE_API_URL ?? "http://localhost:8000"
const POLYGON_CHAIN_ID = "0x89"
const TOKEN_KEY = "wallet_token"

export type WalletPlan = "free" | "pro"

export type WalletFeatures = {
  maxCameras: number
  historyDays: number
  exportCsv: boolean
  usageLimitPerDay: string
}

export type WalletAuthState = {
  address: string | null
  isConnected: boolean
  isLoading: boolean
  plan: WalletPlan
  cameraLimit: number
  todayUsedMinutes: number
  remainingMinutes: number | null
  features: WalletFeatures
}

const DEFAULT_STATE: WalletAuthState = {
  address: null,
  isConnected: false,
  isLoading: false,
  plan: "free",
  cameraLimit: 1,
  todayUsedMinutes: 0,
  remainingMinutes: 120,
  features: {
    maxCameras: 1,
    historyDays: 1,
    exportCsv: false,
    usageLimitPerDay: "2 giờ/ngày",
  },
}

async function apiPost<T>(path: string, body: unknown, token?: string): Promise<T> {
  const res = await fetch(`${API}/api/v1${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }))
    throw new Error(err.detail ?? "Request failed")
  }
  return res.json()
}

async function apiGet<T>(path: string, token: string): Promise<T> {
  const res = await fetch(`${API}/api/v1${path}`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!res.ok) throw new Error("Request failed")
  return res.json()
}

function shortAddress(addr: string) {
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`
}

export function useWalletAuth() {
  const [state, setState] = useState<WalletAuthState>(DEFAULT_STATE)

  const applyStatus = useCallback((status: Record<string, unknown>, address: string) => {
    setState((prev) => ({
      ...prev,
      address,
      isConnected: true,
      isLoading: false,
      plan: (status.plan as WalletPlan) ?? "free",
      cameraLimit: (status.camera_limit as number) ?? 1,
      todayUsedMinutes: (status.today_used_minutes as number) ?? 0,
      remainingMinutes: status.remaining_minutes as number | null,
      features: {
        maxCameras: (status.features as Record<string, unknown>)?.max_cameras as number ?? 1,
        historyDays: (status.features as Record<string, unknown>)?.history_days as number ?? 1,
        exportCsv: Boolean((status.features as Record<string, unknown>)?.export_csv),
        usageLimitPerDay: (status.features as Record<string, unknown>)?.usage_limit_per_day as string ?? "2 giờ/ngày",
      },
    }))
  }, [])

  // Auto-reconnect on load
  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY)
    if (!token) return
    const stored = localStorage.getItem("wallet_address")
    if (!stored) return

    apiGet<Record<string, unknown>>("/payment/status", token)
      .then((status) => applyStatus(status, stored))
      .catch(() => {
        localStorage.removeItem(TOKEN_KEY)
        localStorage.removeItem("wallet_address")
      })
  }, [applyStatus])

  const connect = useCallback(async () => {
    const eth = (window as unknown as Record<string, unknown>).ethereum
    if (!eth) {
      window.open("https://metamask.io", "_blank")
      return
    }

    setState((s) => ({ ...s, isLoading: true }))

    try {
      // 1. Request accounts
      const accounts = await (eth as { request: (o: unknown) => Promise<string[]> }).request({
        method: "eth_requestAccounts",
      })
      const address = accounts[0].toLowerCase()

      // 2. Switch to Polygon if needed
      const chainId = await (eth as { request: (o: unknown) => Promise<string> }).request({
        method: "eth_chainId",
      })
      if (chainId !== POLYGON_CHAIN_ID) {
        await (eth as { request: (o: unknown) => Promise<void> }).request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: POLYGON_CHAIN_ID }],
        })
      }

      // 3. Get nonce
      const nonceRes = await fetch(`${API}/api/v1/auth/nonce?wallet=${address}`)
      const { nonce } = await nonceRes.json()

      // 4. Sign
      const message = `SmartTraffic AI\nXác thực ví của bạn.\nNonce: ${nonce}`
      const signature = await (eth as { request: (o: unknown) => Promise<string> }).request({
        method: "personal_sign",
        params: [message, address],
      })

      // 5. Verify
      const verifyData = await apiPost<{
        access_token: string
        wallet_address: string
        plan: WalletPlan
        camera_limit: number
      }>("/auth/verify", { wallet_address: address, signature, nonce })

      localStorage.setItem(TOKEN_KEY, verifyData.access_token)
      localStorage.setItem("wallet_address", verifyData.wallet_address)

      // 6. Fetch full status
      const status = await apiGet<Record<string, unknown>>("/payment/status", verifyData.access_token)
      applyStatus(status, verifyData.wallet_address)
    } catch (err) {
      console.error("Wallet connect error:", err)
      setState((s) => ({ ...s, isLoading: false }))
    }
  }, [applyStatus])

  const disconnect = useCallback(async () => {
    const token = localStorage.getItem(TOKEN_KEY)
    if (token) {
      await apiPost("/auth/logout", {}, token).catch(() => {})
    }
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem("wallet_address")
    setState({ ...DEFAULT_STATE })
  }, [])

  const refreshStatus = useCallback(async () => {
    const token = localStorage.getItem(TOKEN_KEY)
    const address = localStorage.getItem("wallet_address")
    if (!token || !address) return
    const status = await apiGet<Record<string, unknown>>("/payment/status", token)
    applyStatus(status, address)
  }, [applyStatus])

  const getToken = useCallback(() => localStorage.getItem(TOKEN_KEY) ?? "", [])

  return { ...state, connect, disconnect, refreshStatus, getToken, shortAddress }
}
