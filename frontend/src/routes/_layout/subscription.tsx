import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { createFileRoute, useNavigate } from "@tanstack/react-router"
import {
  BadgeCheck,
  BarChart3,
  Building2,
  Camera,
  Check,
  Clock,
  CreditCard,
  Download,
  Headphones,
  Infinity,
  ShieldCheck,
  Sparkles,
  Users,
  X,
} from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  activateDemoSubscription,
  getCurrentSubscription,
  type SubscriptionPlan,
} from "@/services/subscriptionService"

export const Route = createFileRoute("/_layout/subscription")({
  component: SubscriptionPage,
  head: () => ({
    meta: [
      {
        title: "Subscription - SmartTraffic AI",
      },
    ],
  }),
})

type Plan = {
  key: SubscriptionPlan
  name: string
  price: string
  period: string
  description: string
  features: string[]
  icon: typeof Sparkles
  paid: boolean
  featured?: boolean
}

const plans: Plan[] = [
  {
    key: "free_trial",
    name: "Free Trial",
    price: "0 VND",
    period: "7 days trial",
    description: "Start validating camera detection workflows.",
    features: ["1 camera", "100 detections/day", "Basic history"],
    icon: Clock,
    paid: false,
  },
  {
    key: "basic",
    name: "Basic",
    price: "99,000 VND",
    period: "month",
    description: "For small parking lots and pilot traffic points.",
    features: [
      "1 camera",
      "1,000 detections/day",
      "Detection history",
      "Basic analytics",
    ],
    icon: Camera,
    paid: true,
  },
  {
    key: "pro",
    name: "Pro",
    price: "299,000 VND",
    period: "month",
    description: "For teams monitoring multiple streets or entrances.",
    features: [
      "5 cameras",
      "10,000 detections/day",
      "Advanced analytics",
      "Export reports",
      "Priority processing",
    ],
    icon: BarChart3,
    paid: true,
    featured: true,
  },
  {
    key: "enterprise",
    name: "Enterprise",
    price: "Contact sales",
    period: "custom",
    description: "For city-scale deployments and managed operations.",
    features: [
      "Unlimited cameras",
      "Realtime alerts",
      "Custom retention policy",
      "Multi-user management",
      "Priority support",
    ],
    icon: Building2,
    paid: false,
  },
]

function SubscriptionPage() {
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null)
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  const { data: subscription } = useQuery({
    queryKey: ["subscription"],
    queryFn: getCurrentSubscription,
  })

  const activation = useMutation({
    mutationFn: activateDemoSubscription,
    onSuccess: async (data) => {
      await queryClient.invalidateQueries({ queryKey: ["subscription"] })
      toast.success(
        data.message ??
          "Demo payment completed. The subscription plan has been activated.",
      )
      setSelectedPlan(null)
      navigate({ to: "/dashboard" })
    },
    onError: (error) => {
      toast.error((error as Error).message)
    },
  })

  const handlePlanAction = (plan: Plan) => {
    if (plan.key === "enterprise") {
      toast.info("Please contact the SmartTraffic AI team to activate Enterprise.")
      return
    }

    if (plan.paid) {
      setSelectedPlan(plan)
      return
    }

    activation.mutate(plan.key)
  }

  const currentPlan = subscription?.status === "active" ? subscription.plan : null

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#020617] via-[#09090B] to-[#0F172A] text-white">
      <section className="space-y-8 px-6 py-8 lg:px-10">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-pink-400/20 bg-pink-500/10 px-3 py-1 text-sm font-semibold text-pink-300">
              <CreditCard className="h-4 w-4" />
              MoMo Demo Payment
            </div>
            <h1 className="mt-5 text-3xl font-semibold leading-tight tracking-tight text-white md:text-5xl">
              Pricing Plans
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-zinc-400 md:text-base">
              Choose a commercial SmartTraffic AI plan. Demo payments activate
              immediately for testing without storing payment credentials.
            </p>
          </div>

          <div className="rounded-lg border border-white/10 bg-black/30 px-5 py-4">
            <p className="text-xs font-semibold uppercase text-zinc-500">
              Current subscription
            </p>
            <p className="mt-2 text-lg font-semibold text-white">
              {subscription?.status === "active"
                ? plans.find((plan) => plan.key === subscription.plan)?.name
                : "No active plan"}
            </p>
            <p className="mt-1 text-sm text-zinc-400">
              {subscription?.status === "active"
                ? `Status: ${subscription.status}`
                : "Start with Free Trial or choose a paid plan."}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-4">
          {plans.map((plan) => {
            const Icon = plan.icon
            const isCurrent = currentPlan === plan.key

            return (
              <article
                key={plan.key}
                className={`flex min-h-[520px] flex-col rounded-lg border p-5 ${
                  plan.featured
                    ? "border-pink-400/40 bg-pink-500/10"
                    : "border-white/10 bg-white/[0.03]"
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-lg border border-white/10 bg-black/30">
                    <Icon className="h-5 w-5 text-pink-300" />
                  </div>
                  {plan.featured && (
                    <span className="rounded-full bg-pink-400 px-3 py-1 text-xs font-bold text-black">
                      Popular
                    </span>
                  )}
                </div>

                <h2 className="mt-5 text-2xl font-semibold text-white">
                  {plan.name}
                </h2>
                <p className="mt-2 min-h-12 text-sm leading-6 text-zinc-400">
                  {plan.description}
                </p>

                <div className="mt-6">
                  <p className="text-3xl font-semibold tracking-tight text-white">
                    {plan.price}
                  </p>
                  <p className="mt-1 text-sm text-zinc-500">{plan.period}</p>
                </div>

                <ul className="mt-6 flex-1 space-y-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex gap-3 text-sm text-zinc-300">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-green-400" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  type="button"
                  disabled={activation.isPending || isCurrent}
                  onClick={() => handlePlanAction(plan)}
                  className={
                    plan.paid
                      ? "mt-6 bg-pink-500 text-white hover:bg-pink-400"
                      : "mt-6"
                  }
                  variant={plan.paid ? "default" : "outline"}
                >
                  {isCurrent ? (
                    <>
                      <BadgeCheck className="h-4 w-4" />
                      Active Plan
                    </>
                  ) : plan.paid ? (
                    <>
                      <CreditCard className="h-4 w-4" />
                      Pay with MoMo
                    </>
                  ) : plan.key === "enterprise" ? (
                    <>
                      <Headphones className="h-4 w-4" />
                      Contact sales
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4" />
                      Activate Plan
                    </>
                  )}
                </Button>
              </article>
            )
          })}
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {[
            ["Commercial SaaS", ShieldCheck],
            ["Report exports", Download],
            ["Team-ready plans", Users],
            ["Scale cameras", Infinity],
          ].map(([label, Icon]) => (
            <div
              key={String(label)}
              className="flex items-center gap-3 rounded-lg border border-white/10 bg-black/20 px-4 py-3"
            >
              <Icon className="h-5 w-5 text-cyan-300" />
              <span className="text-sm font-semibold text-zinc-200">
                {String(label)}
              </span>
            </div>
          ))}
        </div>
      </section>

      <Dialog open={selectedPlan !== null} onOpenChange={() => setSelectedPlan(null)}>
        <DialogContent className="border-white/10 bg-zinc-950 text-white">
          <DialogHeader>
            <DialogTitle>Pay with MoMo</DialogTitle>
            <DialogDescription>
              Confirm demo payment to activate your subscription plan.
            </DialogDescription>
          </DialogHeader>

          {selectedPlan && (
            <div className="space-y-5">
              <div className="rounded-lg border border-white/10 bg-white/[0.03] p-4">
                <p className="text-sm text-zinc-400">Plan</p>
                <p className="mt-1 text-xl font-semibold text-white">
                  {selectedPlan.name}
                </p>
                <p className="mt-1 text-pink-300">{selectedPlan.price}/month</p>
              </div>

              <div className="mx-auto grid h-48 w-48 grid-cols-6 gap-1 rounded-lg border-4 border-pink-500 bg-white p-3">
                {Array.from({ length: 36 }).map((_, index) => (
                  <div
                    key={index}
                    className={
                      index % 2 === 0 || index % 7 === 0
                        ? "bg-zinc-950"
                        : "bg-pink-400"
                    }
                  />
                ))}
              </div>

              <div className="rounded-lg border border-pink-400/20 bg-pink-500/10 p-4 text-sm leading-6 text-zinc-200">
                <p className="font-semibold text-pink-200">
                  Payment Instructions
                </p>
                <p className="mt-2">
                  Open the MoMo app, scan the demo QR code, verify the selected
                  plan and amount, then click 'I Have Completed Payment' to
                  activate the plan in demo mode.
                </p>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setSelectedPlan(null)}
            >
              <X className="h-4 w-4" />
              Cancel
            </Button>
            <Button
              type="button"
              disabled={activation.isPending || selectedPlan === null}
              onClick={() => selectedPlan && activation.mutate(selectedPlan.key)}
              className="bg-pink-500 text-white hover:bg-pink-400"
            >
              <BadgeCheck className="h-4 w-4" />
              {activation.isPending ? "Activating..." : "I Have Completed Payment"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
