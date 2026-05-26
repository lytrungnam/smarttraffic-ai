import { zodResolver } from "@hookform/resolvers/zod"
import {
  createFileRoute,
  Link as RouterLink,
  redirect,
} from "@tanstack/react-router"
import { CarFront } from "lucide-react"
import { useForm } from "react-hook-form"
import { z } from "zod"

import type { Body_login_login_access_token as AccessToken } from "@/client"
import { AuthLayout } from "@/components/Common/AuthLayout"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { LoadingButton } from "@/components/ui/loading-button"
import { PasswordInput } from "@/components/ui/password-input"
import useAuth, { isLoggedIn } from "@/hooks/useAuth"

const formSchema = z.object({
  username: z.email(),
  password: z
    .string()
    .min(1, {
      message: "Password is required",
    })
    .min(8, {
      message:
        "Password must be at least 8 characters",
    }),
}) satisfies z.ZodType<AccessToken>

type FormData = z.infer<typeof formSchema>

export const Route = createFileRoute("/login")({
  component: Login,

  beforeLoad: async () => {
    if (isLoggedIn()) {
      throw redirect({
        to: "/",
      })
    }
  },

  head: () => ({
    meta: [
      {
        title:
          "Login - SmartTraffic AI",
      },
    ],
  }),
})

function Login() {
  const { loginMutation } = useAuth()

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),

    mode: "onBlur",

    criteriaMode: "all",

    defaultValues: {
      username: "",
      password: "",
    },
  })

  const onSubmit = (data: FormData) => {
    if (loginMutation.isPending) return

    loginMutation.mutate(data)
  }

  return (
    <AuthLayout>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-col gap-6"
        >
         {/* HEADER */}
<div className="flex flex-col items-center gap-5 text-center">

  <div
    className="
      relative flex items-center justify-center
      size-20 rounded-3xl
      bg-gradient-to-br
      from-cyan-500/20
      to-blue-500/10
      border border-cyan-400/20
      shadow-[0_0_40px_rgba(34,211,238,0.15)]
      backdrop-blur-sm
    "
  >
    <div
      className="
        absolute inset-0 rounded-3xl
        bg-cyan-400/5
        animate-pulse
      "
    />

    <CarFront
      className="
        size-10 text-cyan-400
        drop-shadow-[0_0_10px_rgba(34,211,238,0.6)]
      "
    />
  </div>

  <div className="space-y-2">
    <h1
      className="
        text-4xl font-black tracking-tight
        bg-gradient-to-r
        from-cyan-400
        via-white
        to-cyan-200
        bg-clip-text
        text-transparent
      "
    >
      SmartTraffic AI
    </h1>

    <p
      className="
        text-sm text-muted-foreground
        max-w-sm leading-relaxed
      "
    >
      AI-powered traffic monitoring,
      automatic vehicle detection
      and license plate recognition system
    </p>
  </div>

  <div
    className="
      flex items-center gap-2
      rounded-full
      border border-cyan-500/20
      bg-cyan-500/5
      px-4 py-1.5
      text-xs text-cyan-300
    "
  >
    <div className="size-2 rounded-full bg-emerald-400 animate-pulse" />

    Real-time Monitoring Active
  </div>
</div>

          {/* FORM */}
          <div className="grid gap-4">
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Officer Email
                  </FormLabel>

                  <FormControl>
                    <Input
                      data-testid="email-input"
                      placeholder="officer@traffic.gov"
                      type="email"
                      {...field}
                    />
                  </FormControl>

                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center">
                    <FormLabel>
                      Password
                    </FormLabel>

                    <RouterLink
                      to="/recover-password"
                      className="
                        ml-auto text-sm
                        underline-offset-4
                        hover:underline
                      "
                    >
                      Forgot password?
                    </RouterLink>
                  </div>

                  <FormControl>
                    <PasswordInput
                      data-testid="password-input"
                      placeholder="Enter secure password"
                      {...field}
                    />
                  </FormControl>

                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />

            <LoadingButton
              type="submit"
              loading={loginMutation.isPending}
            >
              Access System
            </LoadingButton>
          </div>

          {/* FOOTER */}
          <div className="text-center text-sm">
            Don't have an officer account?{" "}

            <RouterLink
              to="/signup"
              className="underline underline-offset-4"
            >
              Register
            </RouterLink>
          </div>
        </form>
      </Form>
    </AuthLayout>
  )
}