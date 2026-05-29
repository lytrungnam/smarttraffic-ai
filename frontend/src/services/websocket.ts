import type { DetectionRealtimePayload } from "./detectionService"

let socket: WebSocket | null = null

export const connectDetectionSocket = (
  onMessage: (data: DetectionRealtimePayload) => void,
) => {
  const wsBase = (import.meta.env.VITE_API_URL ?? "http://localhost:8000").replace(/^http/, "ws")
  socket = new WebSocket(`${wsBase}/api/v1/ws/detections`)

  socket.onopen = () => {
    console.log("✅ WebSocket Connected")
  }

  socket.onmessage = (event) => {
    const data = JSON.parse(event.data)

    onMessage(data)
  }

  socket.onclose = () => {
    console.log("❌ WebSocket Disconnected")
  }

  socket.onerror = (error) => {
    console.error("WebSocket Error:", error)
  }

  return socket
}
