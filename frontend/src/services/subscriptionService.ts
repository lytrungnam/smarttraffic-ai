const API = import.meta.env.VITE_API_URL ?? "http://localhost:8000"

export type SubscriptionPlan = "free_trial" | "basic" | "pro" | "enterprise"
export type SubscriptionStatus = "active" | "inactive" | "expired"

export type Subscription = {
  id: string | null
  user_id: string | null
  plan: SubscriptionPlan
  status: SubscriptionStatus
  started_at: string | null
  expires_at: string | null
  payment_provider: string | null
  payment_status: string | null
  message?: string | null
}

const authHeaders = () => {
  const token = localStorage.getItem("access_token")
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }
}

const parseError = async (response: Response) => {
  try {
    const data = await response.json()
    return data.detail ?? "Không thể xử lý yêu cầu."
  } catch {
    return "Không thể xử lý yêu cầu."
  }
}

export async function getCurrentSubscription(): Promise<Subscription> {
  const response = await fetch(`${API}/api/v1/subscriptions/me`, {
    headers: authHeaders(),
  })

  if (!response.ok) {
    throw new Error(await parseError(response))
  }

  return response.json()
}

export async function activateDemoSubscription(
  plan: SubscriptionPlan,
): Promise<Subscription> {
  const response = await fetch(`${API}/api/v1/subscriptions/activate-demo`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ plan }),
  })

  if (!response.ok) {
    throw new Error(await parseError(response))
  }

  return response.json()
}
