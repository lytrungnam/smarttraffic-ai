import { createFileRoute } from "@tanstack/react-router"

import { Database, FileSearch } from "lucide-react"

import { useCallback, useEffect, useMemo, useState } from "react"

import DashboardSection from "@/components/Dashboard/DashboardSection"

import HistoryCard from "@/components/History/HistoryCard"
import HistoryHero from "@/components/History/HistoryHero"
import HistoryPagination from "@/components/History/HistoryPagination"
import HistorySearch from "@/components/History/HistorySearch"
import HistoryTable from "@/components/History/HistoryTable"

import {
  type DetectionHistoryResponse,
  type DetectionItem,
  type DetectionRealtimePayload,
  getDetectionHistory,
} from "@/services/detectionService"

import { connectDetectionSocket } from "@/services/websocket"

export const Route = createFileRoute("/_layout/history")({
  component: HistoryPage,
})

function HistoryPage() {
  const [records, setRecords] = useState<DetectionItem[]>([])

  const [page, setPage] = useState(1)

  const [limit] = useState(10)

  const [search, setSearch] = useState("")

  const [vehicleType, setVehicleType] = useState("")

  const [total, setTotal] = useState(0)

  const [pages, setPages] = useState(1)

  const [isLoading, setIsLoading] = useState(false)

  const [error, setError] = useState<string | null>(null)

  const applyHistoryResponse = useCallback(
    (response: DetectionHistoryResponse) => {
      setRecords(response.items)
      setTotal(response.total)
      setPages(response.pages)
    },
    [],
  )

  const loadHistory = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await getDetectionHistory({
        page,
        limit,
        search,
        vehicle_type: vehicleType,
      })

      applyHistoryResponse(response)
    } catch (loadError) {
      console.error("Failed to load detection history:", loadError)

      setError("Unable to load detection history from the server.")
    } finally {
      setIsLoading(false)
    }
  }, [applyHistoryResponse, limit, page, search, vehicleType])

  useEffect(() => {
    loadHistory()
  }, [loadHistory])

  const matchesActiveFilters = useCallback(
    (detection: DetectionItem) => {
      const matchesSearch =
        !search ||
        detection.plate_number.toLowerCase().includes(search.toLowerCase())

      const matchesVehicle =
        !vehicleType ||
        detection.vehicle_type?.toLowerCase() === vehicleType.toLowerCase()

      return matchesSearch && matchesVehicle
    },
    [search, vehicleType],
  )

  const extractRealtimeDetections = useCallback(
    (payload: DetectionRealtimePayload) => {
      if (Array.isArray(payload)) {
        return payload
      }

      if (
        "plate_number" in payload &&
        typeof payload.plate_number === "string"
      ) {
        return [payload]
      }

      if ("plates" in payload && Array.isArray(payload.plates)) {
        return payload.plates
      }

      return []
    },
    [],
  )

  useEffect(() => {
    const socket = connectDetectionSocket((payload) => {
      const incoming =
        extractRealtimeDetections(payload).filter(matchesActiveFilters)

      if (incoming.length === 0) {
        return
      }

      setRecords((currentRecords) => {
        const existingIds = new Set(
          currentRecords.map((record) => record.id).filter(Boolean),
        )

        const uniqueIncoming = incoming.filter(
          (record) => !record.id || !existingIds.has(record.id),
        )

        return [...uniqueIncoming, ...currentRecords].slice(0, limit)
      })

      setTotal((currentTotal) => currentTotal + incoming.length)
    })

    return () => {
      socket.close()
    }
  }, [extractRealtimeDetections, limit, matchesActiveFilters])

  const recentRecords = useMemo(() => records.slice(0, 3), [records])

  const handleSearchChange = (value: string) => {
    setSearch(value)
    setPage(1)
  }

  const handleVehicleTypeChange = (value: string) => {
    setVehicleType(value)
    setPage(1)
  }

  const handleResetFilters = () => {
    setSearch("")
    setVehicleType("")
    setPage(1)
  }

  return (
    <div
      className="
        min-h-screen
        bg-gradient-to-br
        from-[#020617]
        via-[#09090B]
        to-[#0F172A]
        text-white
      "
    >
      {/* HERO */}
      <HistoryHero />

      {/* MAIN */}
      <main
        className="
          space-y-8
          px-6 py-8
          lg:px-10
        "
      >
        {/* CARDS */}
        <HistoryCard records={recentRecords} isLoading={isLoading} />

        {/* SEARCH */}
        <DashboardSection
          title="Search Detection Records"
          description="
            Search and filter archived
            AI traffic surveillance data
          "
          icon={FileSearch}
        >
          <HistorySearch
            search={search}
            vehicleType={vehicleType}
            total={total}
            isLoading={isLoading}
            onSearchChange={handleSearchChange}
            onVehicleTypeChange={handleVehicleTypeChange}
            onReset={handleResetFilters}
          />
        </DashboardSection>

        {/* TABLE */}
        <DashboardSection
          title="Detection History Records"
          description="
            Historical vehicle detection
            and OCR recognition records
          "
          icon={Database}
        >
          <HistoryTable records={records} isLoading={isLoading} error={error} />

          <div className="mt-8">
            <HistoryPagination
              page={page}
              limit={limit}
              total={total}
              pages={pages}
              isLoading={isLoading}
              onPageChange={setPage}
            />
          </div>
        </DashboardSection>
      </main>
    </div>
  )
}
