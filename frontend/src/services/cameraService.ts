import axios from "axios"

const API_URL = `${import.meta.env.VITE_API_URL ?? "http://localhost:8000"}/api/v1`

export type CameraItem = {
  id: string
  name: string
  location: string
  source_url: string
  camera_type: string
  status: "active" | "inactive"
  created_at?: string
}

export const listCameras = async () => {
  const res = await axios.get(`${API_URL}/cameras`)
  return res.data as { data: CameraItem[]; count: number }
}

export const createCamera = async (payload: {
  name: string
  location: string
  source_url: string
  camera_type: string
}) => {
  return axios.post(`${API_URL}/cameras`, payload)
}

export const updateCamera = async (id: string, payload: any) => {
  return axios.put(`${API_URL}/cameras/${id}`, payload)
}

export const deleteCamera = async (id: string) => {
  return axios.delete(`${API_URL}/cameras/${id}`)
}
