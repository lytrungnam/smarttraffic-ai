import type { DetectionRealtimePayload } from "./detectionService"

let socket: WebSocket | null = null

export const connectDetectionSocket = (
  onMessage: (data: DetectionRealtimePayload) => void,
) => {
  socket = new WebSocket("ws://127.0.0.1:8000/api/v1/ws/detections")

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
