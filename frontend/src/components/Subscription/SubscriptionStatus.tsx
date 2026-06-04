import { useQuery } from "@tanstack/react-query"
import { Link } from "@tanstack/react-router"
import { CreditCard } from "lucide-react"

import { getCurrentSubscription } from "@/services/subscriptionService"

const PLAN_LABELS: Record<string, string> = {
  free_trial: "Free Trial",
  basic: "Basic",
  pro: "Pro",
  enterprise: "Enterprise",
}

export default function SubscriptionStatus() {
  const { data } = useQuery({
    queryKey: ["subscription"],
    queryFn: getCurrentSubscription,
  })

  const isActive = data?.status === "active"
  const label = data ? PLAN_LABELS[data.plan] : "Subscription"

  return (
    <Link
      to="/subscription"
      className="inline-flex min-h-9 items-center gap-2 rounded-md border border-white/10 bg-white/5 px-3 text-sm font-semibold text-zinc-200 transition hover:bg-white/10"
    >
      <CreditCard className="h-4 w-4 text-pink-400" />
      <span className="hidden sm:inline">{label}</span>
      <span
        className={
          isActive
            ? "rounded-full bg-green-500/10 px-2 py-0.5 text-xs text-green-400"
            : "rounded-full bg-yellow-500/10 px-2 py-0.5 text-xs text-yellow-300"
        }
      >
        {isActive ? "Active" : "Trial"}
      </span>
    </Link>
  )
}
