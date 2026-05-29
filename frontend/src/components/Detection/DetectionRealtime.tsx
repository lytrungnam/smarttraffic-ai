// components/Detection/DetectionRealtime.jsx

import { Activity, Clock3, Radio, Wifi } from "lucide-react"

import { useCallback, useEffect, useState } from "react"

import { useWebSocket } from "@/hooks/useWebSocket"
import type {
  DetectionItem,
  DetectionRealtimePayload,
} from "@/services/detectionService"
import { getLatestDetections } from "@/services/detectionService"

const isDetectionItem = (value: unknown): value is DetectionItem => {
  return (
    typeof value === "object" &&
    value !== null &&
    "plate_number" in value &&
    typeof (value as DetectionItem).plate_number === "string"
  )
}

const extractDetections = (payload: DetectionRealtimePayload) => {
  if (Array.isArray(payload)) {
    return payload.filter(isDetectionItem)
  }

  if (isDetectionItem(payload)) {
    return [payload]
  }

  if ("plates" in payload && Array.isArray(payload.plates)) {
    return payload.plates.filter(isDetectionItem)
  }

  return []
}

const formatDetectionTime = (createdAt?: string) => {
  if (!createdAt) {
    return "Realtime"
  }

  const parsedDate = new Date(createdAt)

  if (Number.isNaN(parsedDate.getTime())) {
    return createdAt
  }

  return parsedDate.toLocaleTimeString()
}

export default function DetectionRealtime() {
  const [realtimeFeed, setRealtimeFeed] = useState<DetectionItem[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    getLatestDetections()
      .then((detections) => {
        setRealtimeFeed(detections.slice(0, 6))
      })
      .finally(() => {
        setIsLoading(false)
      })
  }, [])

  const handleWsMessage = useCallback((data: unknown) => {
    const incoming = extractDetections(data as DetectionRealtimePayload)
    if (incoming.length === 0) return
    setRealtimeFeed((current) => [...incoming, ...current].slice(0, 6))
  }, [])

  const wsUrl = `${(import.meta.env.VITE_API_URL ?? "http://localhost:8000").replace(/^http/, "ws")}/api/v1/ws/detections`
  useWebSocket(wsUrl, handleWsMessage)

  return (
    <div className="overflow-hidden rounded-3xl border border-white/10 bg-zinc-950 shadow-2xl">
      <div className="flex flex-col gap-5 border-b border-white/10 px-5 py-5 sm:flex-row sm:items-center sm:justify-between lg:px-6">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-white">
            Realtime Detection Feed
          </h2>

          <p className="mt-2 text-sm text-zinc-400">
            Live PostgreSQL and WebSocket ALPR detections
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-green-500/20 bg-green-500/10 px-3 py-1.5">
            <Wifi className="h-4 w-4 text-green-400" />
            <span className="text-xs font-semibold text-green-400">LIVE</span>
          </div>

          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/20 bg-cyan-500/10 px-3 py-1.5">
            <Radio className="h-4 w-4 text-cyan-400" />
            <span className="text-xs font-semibold text-cyan-400">
              AI STREAM
            </span>
          </div>
        </div>
      </div>

      <div className="space-y-5 p-6">
        {isLoading && (
          <div className="rounded-2xl border border-white/10 p-8 text-center text-sm font-semibold text-cyan-400">
            Loading live detections...
          </div>
        )}

        {!isLoading && realtimeFeed.length === 0 && (
          <div className="rounded-2xl border border-dashed border-white/10 p-10 text-center text-zinc-500">
            Waiting for realtime AI detections...
          </div>
        )}

        {!isLoading &&
          realtimeFeed.map((item) => (
            <div
              key={item.id ?? `${item.plate_number}-${item.created_at}`}
              className="group relative overflow-hidden rounded-3xl border border-white/10 bg-zinc-900/60 p-5 transition-all duration-300 hover:border-cyan-500/20"
            >
              <div className="absolute right-0 top-0 h-32 w-32 bg-cyan-500/5 blur-3xl" />

              <div className="relative flex flex-col gap-8 xl:flex-row xl:items-center xl:justify-between">
                <div className="flex-1">
                  <div className="flex items-start gap-4">
                    <div className="rounded-2xl border border-white/10 bg-cyan-500/10 p-4">
                      <Activity className="h-5 w-5 text-cyan-400" />
                    </div>

                    <div className="min-w-0">
                      <h3 className="text-xl font-semibold tracking-tight text-white">
                        {item.plate_number}
                      </h3>

                      <div className="mt-2 flex flex-wrap items-center gap-2 text-sm">
                        <span className="font-semibold text-zinc-300">
                          {item.vehicle_type || "unknown"}
                        </span>
                        <span className="text-zinc-600">•</span>
                        <span className="text-zinc-400">
                          {item.location || "Smart Camera"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6">
                    <div className="mb-3 flex items-center justify-between gap-4">
                      <span className="text-xs font-semibold text-zinc-400">
                        Detection Confidence
                      </span>
                      <span className="text-sm font-semibold text-cyan-400">
                        {item.confidence ?? 0}%
                      </span>
                    </div>

                    <div className="h-2.5 w-full overflow-hidden rounded-full bg-zinc-800">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-blue-500"
                        style={{
                          width: `${item.confidence ?? 0}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-start gap-5 xl:items-end">
                  <div className="inline-flex items-center gap-2 text-sm text-zinc-400">
                    <Clock3 className="h-4 w-4" />
                    <span>{formatDetectionTime(item.created_at)}</span>
                  </div>

                  <div className="inline-flex items-center gap-2 rounded-full border border-green-500/20 bg-green-500/10 px-3 py-1.5 text-green-400">
                    <span className="text-xs font-semibold">
                      {item.status || "detected"}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 animate-pulse rounded-full bg-green-400" />
                    <span className="text-xs font-semibold text-green-400">
                      Realtime AI Tracking
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <div className="h-[3px] w-full overflow-hidden rounded-full bg-zinc-800">
                  <div className="h-full w-full animate-pulse bg-gradient-to-r from-cyan-500 via-blue-500 to-cyan-500" />
                </div>
              </div>
            </div>
          ))}
      </div>
    </div>
  )
}
