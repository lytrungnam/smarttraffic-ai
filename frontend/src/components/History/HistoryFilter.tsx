// components/History/HistoryFilter.jsx

import { CalendarDays, Filter, MapPin, Search, ShieldAlert } from "lucide-react"

export default function HistoryFilter() {
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
      {/* HEADER */}
      <div
        className="
          mb-8

          flex flex-col gap-4

          sm:flex-row
          sm:items-center
        "
      >
        {/* ICON */}
        <div
          className="
            rounded-2xl

            border border-cyan-500/20

            bg-cyan-500/10

            p-4
          "
        >
          <Filter className="h-6 w-6 text-cyan-400" />
        </div>

        {/* INFO */}
        <div>
          <h2
            className="
              text-xl
              font-semibold
              tracking-tight

              text-white
            "
          >
            History Filters
          </h2>

          <p
            className="
              mt-2

              text-sm
              text-zinc-400
            "
          >
            Filter vehicle detection history records
          </p>
        </div>
      </div>

      {/* FILTER GRID */}
      <div
        className="
          grid grid-cols-1
          gap-6

          xl:grid-cols-2
        "
      >
        {/* SEARCH */}
        <div>
          <label
            htmlFor="history-filter-plate-number"
            className="
              text-xs
              font-semibold

              text-zinc-400
            "
          >
            Plate Number
          </label>

          <div className="relative mt-3">
            <Search
              className="
                absolute left-4 top-1/2

                h-4 w-4

                -translate-y-1/2

                text-zinc-500
              "
            />

            <input
              id="history-filter-plate-number"
              type="text"
              placeholder="Search plate number..."
              className="
                w-full

                rounded-2xl

                border border-white/10

                bg-zinc-900/60

                py-3 pl-11 pr-4

                text-sm
                font-semibold

                text-white

                outline-none

                transition-all

                placeholder:text-zinc-500

                focus:border-cyan-500/40
              "
            />
          </div>
        </div>

        {/* STATUS */}
        <div>
          <label
            htmlFor="history-filter-status"
            className="
              text-xs
              font-semibold

              text-zinc-400
            "
          >
            Detection Status
          </label>

          <div className="relative mt-3">
            <ShieldAlert
              className="
                absolute left-4 top-1/2

                h-4 w-4

                -translate-y-1/2

                text-zinc-500
              "
            />

            <select
              id="history-filter-status"
              className="
                w-full

                appearance-none

                rounded-2xl

                border border-white/10

                bg-zinc-900/60

                py-3 pl-11 pr-4

                text-sm
                font-semibold

                text-white

                outline-none

                transition-all

                focus:border-cyan-500/40
              "
            >
              <option>All Status</option>

              <option>Detected</option>

              <option>stored</option>

              <option>processing</option>
            </select>
          </div>
        </div>

        {/* LOCATION */}
        <div>
          <label
            htmlFor="history-filter-location"
            className="
              text-xs
              font-semibold

              text-zinc-400
            "
          >
            Location
          </label>

          <div className="relative mt-3">
            <MapPin
              className="
                absolute left-4 top-1/2

                h-4 w-4

                -translate-y-1/2

                text-zinc-500
              "
            />

            <select
              id="history-filter-location"
              className="
                w-full

                appearance-none

                rounded-2xl

                border border-white/10

                bg-zinc-900/60

                py-3 pl-11 pr-4

                text-sm
                font-semibold

                text-white

                outline-none

                transition-all

                focus:border-cyan-500/40
              "
            >
              <option>All Locations</option>

              <option>Hai Chau District</option>

              <option>Thanh Khe District</option>

              <option>Lien Chieu District</option>

              <option>Ngu Hanh Son District</option>
            </select>
          </div>
        </div>

        {/* DATE */}
        <div>
          <label
            htmlFor="history-filter-date"
            className="
              text-xs
              font-semibold

              text-zinc-400
            "
          >
            Detection Date
          </label>

          <div className="relative mt-3">
            <CalendarDays
              className="
                absolute left-4 top-1/2

                h-4 w-4

                -translate-y-1/2

                text-zinc-500
              "
            />

            <input
              id="history-filter-date"
              type="date"
              className="
                w-full

                rounded-2xl

                border border-white/10

                bg-zinc-900/60

                py-3 pl-11 pr-4

                text-sm
                font-semibold

                text-white

                outline-none

                transition-all

                focus:border-cyan-500/40
              "
            />
          </div>
        </div>
      </div>

      {/* ACTIONS */}
      <div
        className="
          mt-8

          flex flex-col gap-4

          sm:flex-row
          sm:items-center
          sm:justify-end
        "
      >
        {/* RESET */}
        <button
          type="button"
          disabled
          title="Use the active History search controls above to reset filters."
          className="
            rounded-full

            border border-white/10

            bg-zinc-900

            px-4 py-2

            text-xs
            font-semibold

            text-white

            transition-all

            disabled:cursor-not-allowed
            disabled:opacity-50
          "
        >
          Reset Filters
        </button>

        {/* APPLY */}
        <button
          type="button"
          disabled
          title="Use the active History search controls above to apply vehicle filters."
          className="
            inline-flex items-center
            gap-2

            rounded-full

            border border-cyan-500/20

            bg-cyan-500/10

            px-4 py-2

            text-xs
            font-semibold

            text-cyan-400

            transition-all

            disabled:cursor-not-allowed
            disabled:opacity-50
          "
        >
          <Filter className="h-4 w-4" />
          Apply Filters
        </button>
      </div>
    </div>
  )
}
