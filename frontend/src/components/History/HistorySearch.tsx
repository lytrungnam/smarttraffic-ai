// components/History/HistorySearch.jsx

import { Car, ScanSearch, Search, X } from "lucide-react"

import {
  TRAFFIC_VEHICLE_CLASSES,
  VEHICLE_CLASS_LABELS,
} from "@/constants/vehicleClasses"

type HistorySearchProps = {
  search: string
  vehicleType: string
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
    label: "Unclassified Vehicle",
    value: "unclassified",
  },
]

export default function HistorySearch({
  search,
  vehicleType,
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

        <button
          type="button"
          disabled={isLoading}
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
            disabled:opacity-50
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
            {isLoading ? "Searching" : "Search"}
          </span>
        </button>
      </div>
    </div>
  )
}
