// components/Dashboard/DashboardSection.tsx

import type { ReactNode } from "react"

type DashboardSectionProps = {
  title: string
  description?: string
  icon?: any
  children: ReactNode
  action?: ReactNode
  className?: string
}

export default function DashboardSection({
  title,
  description,
  icon: Icon,
  children,
  action,
  className = "",
}: DashboardSectionProps) {
  return (
    <section
      className={`
        h-full
        overflow-hidden

        rounded-3xl
        border border-white/10
        bg-black/40

        p-4
        sm:p-5
        lg:p-6

        shadow-2xl
        backdrop-blur-xl

        ${className}
      `}
    >
      {/* HEADER */}
      <div
        className="
          mb-6
          flex items-start justify-between
          gap-4
        "
      >
        {/* LEFT */}
        <div className="flex items-start gap-3">
          {/* ICON */}
          {Icon && (
            <div
              className="
                rounded-2xl
                border border-cyan-500/10
                bg-cyan-500/10
                p-3
                text-cyan-400
              "
            >
              <Icon className="h-5 w-5" />
            </div>
          )}

          {/* TITLE */}
          <div>
            <h2
              className="
                text-xl
                font-semibold
                tracking-tight
                text-white
              "
            >
              {title}
            </h2>

            {description && (
              <p
                className="
                  mt-1
                  max-w-xl
                  text-sm
                  font-medium
                  leading-relaxed
                  tracking-wide
                  text-zinc-400
                "
              >
                {description}
              </p>
            )}
          </div>
        </div>

        {/* ACTION */}
        {action && (
          <div
            className="
              shrink-0

              text-sm
              font-medium
              tracking-wide
              text-zinc-300
            "
          >
            {action}
          </div>
        )}
      </div>

      {/* CONTENT */}
      <div
        className="
          h-full

          text-sm
          font-medium
          tracking-wide
          text-zinc-200
        "
      >
        {children}
      </div>
    </section>
  )
}
