// components/History/HistoryPagination.jsx

import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react"

type HistoryPaginationProps = {
  page: number
  limit: number
  total: number
  pages: number
  isLoading: boolean
  onPageChange: (page: number) => void
}

const getVisiblePages = (currentPage: number, totalPages: number) => {
  const visible = new Set([
    1,
    totalPages,
    currentPage - 1,
    currentPage,
    currentPage + 1,
  ])

  return Array.from(visible)
    .filter((item) => item >= 1 && item <= totalPages)
    .sort((a, b) => a - b)
}

export default function HistoryPagination({
  page,
  limit,
  total,
  pages,
  isLoading,
  onPageChange,
}: HistoryPaginationProps) {
  const firstItem = total === 0 ? 0 : (page - 1) * limit + 1

  const lastItem = Math.min(page * limit, total)

  const visiblePages = getVisiblePages(page, pages)

  return (
    <div
      className="
        rounded-3xl

        border border-white/10

        bg-zinc-950

        p-6

        shadow-2xl
      "
    >
      <div
        className="
          flex flex-col gap-6

          xl:flex-row
          xl:items-center
          xl:justify-between
        "
      >
        {/* LEFT */}
        <div>
          <h2
            className="
              text-xl
              font-semibold
              tracking-tight

              text-white
            "
          >
            Detection History Pages
          </h2>

          <p
            className="
              mt-2

              text-sm
              text-zinc-400
            "
          >
            Showing {firstItem} - {lastItem} of {total} detection records
          </p>
        </div>

        {/* RIGHT */}
        <div
          className="
            flex flex-wrap
            items-center
            gap-3
          "
        >
          {/* PREVIOUS */}
          <button
            type="button"
            disabled={page <= 1 || isLoading}
            onClick={() => {
              onPageChange(page - 1)
            }}
            className="
              inline-flex items-center
              gap-2

              rounded-full

              border border-white/10

              bg-zinc-900

              px-4 py-2

              transition-all

              hover:bg-zinc-800

              disabled:cursor-not-allowed
              disabled:opacity-40
            "
          >
            <ChevronLeft className="h-4 w-4 text-zinc-300" />

            <span
              className="
                text-xs
                font-semibold

                text-zinc-300
              "
            >
              Previous
            </span>
          </button>

          {visiblePages.map((item, index) => {
            const previous = visiblePages[index - 1]

            const showGap = previous !== undefined && item - previous > 1

            return (
              <div key={item} className="flex items-center gap-3">
                {showGap && (
                  <div
                    className="
                      flex h-10 w-10
                      items-center
                      justify-center
                      rounded-full
                      border border-white/10
                      bg-zinc-900
                    "
                  >
                    <MoreHorizontal className="h-4 w-4 text-zinc-500" />
                  </div>
                )}

                <button
                  type="button"
                  disabled={isLoading}
                  onClick={() => {
                    onPageChange(item)
                  }}
                  className={`
                    flex h-10 w-10
                    items-center
                    justify-center
                    rounded-full
                    border
                    transition-all
                    disabled:cursor-wait
                    disabled:opacity-60
                    ${
                      item === page
                        ? "border-cyan-500/20 bg-cyan-500/10 hover:bg-cyan-500/20"
                        : "border-white/10 bg-zinc-900 hover:bg-zinc-800"
                    }
                  `}
                >
                  <span
                    className={`
                      text-xs
                      font-semibold
                      ${item === page ? "text-cyan-400" : "text-white"}
                    `}
                  >
                    {item}
                  </span>
                </button>
              </div>
            )
          })}

          {/* NEXT */}
          <button
            type="button"
            disabled={page >= pages || isLoading}
            onClick={() => {
              onPageChange(page + 1)
            }}
            className="
              inline-flex items-center
              gap-2

              rounded-full

              border border-cyan-500/20

              bg-cyan-500/10

              px-4 py-2

              transition-all

              hover:bg-cyan-500/20

              disabled:cursor-not-allowed
              disabled:opacity-40
            "
          >
            <span
              className="
                text-xs
                font-semibold

                text-cyan-400
              "
            >
              Next
            </span>

            <ChevronRight className="h-4 w-4 text-cyan-400" />
          </button>
        </div>
      </div>
    </div>
  )
}
