import { Appearance } from "@/components/Common/Appearance"
import { Logo } from "@/components/Common/Logo"
import { Footer } from "./Footer"

interface AuthLayoutProps {
  children: React.ReactNode
  emphasizeBrand?: boolean
}

export function AuthLayout({
  children,
  emphasizeBrand = false,
}: AuthLayoutProps) {
  return (
    <div
      className={
        emphasizeBrand
          ? "grid min-h-svh lg:grid-cols-[48%_52%]"
          : "grid min-h-svh lg:grid-cols-2"
      }
    >
      <div className="relative hidden overflow-visible bg-muted p-6 dark:bg-zinc-900 lg:flex lg:items-center lg:justify-center">
        <Logo
          variant={emphasizeBrand ? "hero" : "full"}
          className={emphasizeBrand ? "w-full" : "h-16"}
          asLink={false}
        />
      </div>
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex justify-end">
          <Appearance />
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div
            className={emphasizeBrand ? "w-full max-w-sm" : "w-full max-w-xs"}
          >
            {children}
          </div>
        </div>
        <Footer />
      </div>
    </div>
  )
}
