// components/History/HistorySearch.jsx

import { Car, Clock3, ScanSearch, Search, ShieldAlert, X } from "lucide-react"

import {
  TRAFFIC_VEHICLE_CLASSES,
  VEHICLE_CLASS_LABELS,
} from "@/constants/vehicleClasses"

type HistorySearchProps = {
  search: string
  vehicleType: string
  total: number
  isLoading: boolean
  onSearchChange: (value: string) => void
  onVehicleTypeChange: (value: string) => void
  onReset: () => void
}

const vehicleTypes = [
  {
    label: "All Vehicles",
    value: "",
  },
  ...TRAFFIC_VEHICLE_CLASSES.map((vehicleClass) => ({
    label: VEHICLE_CLASS_LABELS[vehicleClass],
    value: vehicleClass,
  })),
  {
    label: "Unclassified",
    value: "unclassified",
  },
]

export default function HistorySearch({
  search,
  vehicleType,
  total,
  isLoading,
  onSearchChange,
  onVehicleTypeChange,
  onReset,
}: HistorySearchProps) {
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
          <ScanSearch className="h-6 w-6 text-cyan-400" />
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
            Search Detection History
          </h2>

          <p
            className="
              mt-2

              text-sm
              text-zinc-400
            "
          >
            Find vehicle records by license plate number
          </p>
        </div>
      </div>

      {/* SEARCH */}
      <div className="relative">
        <Search
          className="
            absolute left-5 top-1/2

            h-5 w-5

            -translate-y-1/2

            text-zinc-500
          "
        />

        <input
          type="text"
          value={search}
          onChange={(event) => {
            onSearchChange(event.target.value)
          }}
          placeholder="Enter vehicle plate number..."
          className="
            w-full

            rounded-3xl

            border border-white/10

            bg-zinc-900/60

            py-4 pl-14 pr-14

            text-sm
            font-semibold

            text-white

            outline-none

            transition-all

            placeholder:text-zinc-500

            focus:border-cyan-500/40
          "
        />

        {/* CLEAR */}
        <button
          type="button"
          disabled={!search}
          onClick={() => {
            onSearchChange("")
          }}
          className="
            absolute right-4 top-1/2

            -translate-y-1/2

            rounded-xl

            border border-red-500/20

            bg-red-500/10

            p-2

            transition-all

            hover:bg-red-500/20

            disabled:cursor-not-allowed
            disabled:opacity-40
          "
        >
          <X className="h-4 w-4 text-red-400" />
        </button>
      </div>

      {/* FILTER */}
      <div className="mt-5">
        <label
          htmlFor="history-vehicle-type"
          className="
            text-xs
            font-semibold
            text-zinc-400
          "
        >
          Vehicle Type
        </label>

        <div className="relative mt-3">
          <Car
            className="
              absolute left-5 top-1/2
              h-5 w-5
              -translate-y-1/2
              text-zinc-500
            "
          />

          <select
            id="history-vehicle-type"
            value={vehicleType}
            onChange={(event) => {
              onVehicleTypeChange(event.target.value)
            }}
            className="
              w-full
              appearance-none
              rounded-3xl
              border border-white/10
              bg-zinc-900/60
              py-4 pl-14 pr-5
              text-sm
              font-semibold
              text-white
              outline-none
              transition-all
              focus:border-cyan-500/40
            "
          >
            {vehicleTypes.map((item) => (
              <option key={item.value || "all"} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* QUICK INFO */}
      <div
        className="
          mt-8

          grid grid-cols-1
          gap-5

          xl:grid-cols-3
        "
      >
        {/* SEARCH SPEED */}
        <div
          className="
            rounded-3xl

            border border-white/10

            bg-zinc-900/60

            p-5
          "
        >
          <div
            className="
              mb-4

              flex items-center
              gap-3
            "
          >
            <Clock3 className="h-5 w-5 text-cyan-400" />

            <h3
              className="
                text-sm
                font-semibold

                text-white
              "
            >
              Search Speed
            </h3>
          </div>

          <h2
            className="
              text-2xl
              font-semibold
              tracking-tight

              text-cyan-400
            "
          >
            Live
          </h2>

          <p
            className="
              mt-2

              text-sm
              text-zinc-400
            "
          >
            PostgreSQL filtered query
          </p>
        </div>

        {/* MATCH RESULTS */}
        <div
          className="
            rounded-3xl

            border border-white/10

            bg-zinc-900/60

            p-5
          "
        >
          <div
            className="
              mb-4

              flex items-center
              gap-3
            "
          >
            <ShieldAlert className="h-5 w-5 text-yellow-400" />

            <h3
              className="
                text-sm
                font-semibold

                text-white
              "
            >
              Match Results
            </h3>
          </div>

          <h2
            className="
              text-2xl
              font-semibold
              tracking-tight

              text-yellow-400
            "
          >
            {isLoading ? "..." : total}
          </h2>

          <p
            className="
              mt-2

              text-sm
              text-zinc-400
            "
          >
            Historical records found
          </p>
        </div>

        {/* DATABASE */}
        <div
          className="
            rounded-3xl

            border border-white/10

            bg-zinc-900/60

            p-5
          "
        >
          <div
            className="
              mb-4

              flex items-center
              gap-3
            "
          >
            <Search className="h-5 w-5 text-green-400" />

            <h3
              className="
                text-sm
                font-semibold

                text-white
              "
            >
              Database Status
            </h3>
          </div>

          <h2
            className="
              text-2xl
              font-semibold
              tracking-tight

              text-green-400
            "
          >
            Online
          </h2>

          <p
            className="
              mt-2

              text-sm
              text-zinc-400
            "
          >
            Connected to central server
          </p>
        </div>
      </div>

      {/* RECENT SEARCH */}
      <div className="mt-8">
        <h3
          className="
            text-sm
            font-semibold

            text-white
          "
        >
          Recent Searches
        </h3>

        <div
          className="
            mt-5

            flex flex-wrap
            gap-3
          "
        >
          {["43A", "92B", "51H"].map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => {
                onSearchChange(item)
              }}
              className="
                rounded-full

                border border-cyan-500/20

                bg-cyan-500/10

                px-3 py-1.5

                transition-all

                hover:bg-cyan-500/20
              "
            >
              <span
                className="
                  text-xs
                  font-semibold

                  text-cyan-400
                "
              >
                {item}
              </span>
            </button>
          ))}
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
          onClick={onReset}
          className="
            rounded-full

            border border-white/10

            bg-zinc-900

            px-4 py-2

            transition-all

            hover:bg-zinc-800
          "
        >
          <span
            className="
              text-xs
              font-semibold

              text-white
            "
          >
            Reset
          </span>
        </button>

        <div
          className="
            inline-flex items-center
            gap-2

            rounded-full

            border border-cyan-500/20

            bg-cyan-500/10

            px-4 py-2

          "
        >
          <Search className="h-4 w-4 text-cyan-400" />

          <span
            className="
              text-xs
              font-semibold

              text-cyan-400
            "
          >
            {isLoading ? "Searching" : "Search Active"}
          </span>
        </div>
      </div>
    </div>
  )
}
