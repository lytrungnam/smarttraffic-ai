import { Camera, ImageOff, Loader2 } from "lucide-react"

import { useEffect, useRef, useState } from "react"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

import type { DetectionItem } from "@/services/detectionService"

import { getEvidenceImageUrl } from "@/services/detectionService"
import { formatPlateNumber } from "@/utils/plateDisplay"

type EvidencePreviewDialogProps = {
  detection: DetectionItem | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function EvidencePreviewDialog({
  detection,
  open,
  onOpenChange,
}: EvidencePreviewDialogProps) {
  const [isLoading, setIsLoading] = useState(false)

  const [hasImageError, setHasImageError] = useState(false)

  const loadingTimeoutRef = useRef<number | null>(null)

  const imageUrl = getEvidenceImageUrl(detection?.image_path)

  useEffect(() => {
    if (!open) {
      return
    }

    setHasImageError(false)
    setIsLoading(Boolean(imageUrl))

    if (loadingTimeoutRef.current) {
      window.clearTimeout(loadingTimeoutRef.current)
    }

    if (!imageUrl) {
      return
    }

    loadingTimeoutRef.current = window.setTimeout(() => {
      setIsLoading(false)
      setHasImageError(true)
    }, 12000)

    return () => {
      if (loadingTimeoutRef.current) {
        window.clearTimeout(loadingTimeoutRef.current)
      }
    }
  }, [imageUrl, open])

  const stopLoading = () => {
    if (loadingTimeoutRef.current) {
      window.clearTimeout(loadingTimeoutRef.current)
    }

    setIsLoading(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="
          max-h-[92vh]
          overflow-hidden

          border-white/10

          bg-zinc-950

          p-0

          text-white

          shadow-[0_0_60px_rgba(34,211,238,0.18)]

          sm:max-w-5xl
        "
      >
        <DialogHeader
          className="
            border-b border-white/10

            px-5 py-5

            sm:px-6
          "
        >
          <div
            className="
              flex items-center gap-3
            "
          >
            <div
              className="
                rounded-2xl

                border border-cyan-500/20

                bg-cyan-500/10

                p-3
              "
            >
              <Camera className="h-5 w-5 text-cyan-400" />
            </div>

            <div>
              <DialogTitle
                className="
                  text-lg
                  font-semibold
                  tracking-tight

                  text-white
                "
              >
                Evidence Preview
              </DialogTitle>

              <DialogDescription
                className="
                  mt-1

                  text-sm
                  text-zinc-400
                "
              >
                {formatPlateNumber(detection?.plate_number)}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div
          className="
            relative

            max-h-[calc(92vh-112px)]
            overflow-y-auto

            bg-black

            p-4

            sm:p-6
          "
        >
          <div
            className="
              relative

              flex min-h-[280px]
              items-center
              justify-center

              overflow-hidden
              rounded-3xl

              border border-white/10

              bg-zinc-900

              sm:min-h-[420px]
            "
          >
            {imageUrl && !hasImageError ? (
              <>
                {isLoading && (
                  <div
                    className="
                      absolute inset-0
                      z-10

                      flex flex-col
                      items-center
                      justify-center
                      gap-3

                      bg-zinc-950
                    "
                  >
                    <Loader2
                      className="
                        h-7 w-7

                        animate-spin

                        text-cyan-400
                      "
                    />

                    <span
                      className="
                        text-sm
                        font-semibold

                        text-zinc-400
                      "
                    >
                      Loading evidence image
                    </span>
                  </div>
                )}

                <img
                  src={imageUrl}
                  alt={`Evidence for ${formatPlateNumber(detection?.plate_number)}`}
                  className="
                    max-h-[70vh]
                    w-full

                    rounded-3xl

                    object-contain
                  "
                  onLoad={() => {
                    stopLoading()
                  }}
                  onError={() => {
                    stopLoading()
                    setHasImageError(true)
                  }}
                />
              </>
            ) : (
              <div
                className="
                  flex flex-col
                  items-center
                  justify-center
                  gap-4

                  px-6 py-16

                  text-center
                "
              >
                <div
                  className="
                    rounded-3xl

                    border border-white/10

                    bg-white/5

                    p-5
                  "
                >
                  <ImageOff className="h-8 w-8 text-zinc-500" />
                </div>

                <div>
                  <h3
                    className="
                      text-base
                      font-semibold

                      text-white
                    "
                  >
                    Evidence image unavailable
                  </h3>

                  <p
                    className="
                      mt-2

                      max-w-sm

                      text-sm
                      leading-relaxed
                      text-zinc-400
                    "
                  >
                    The evidence image is missing or could not be loaded from
                    storage.
                  </p>
                </div>
              </div>
            )}
          </div>

        </div>
      </DialogContent>
    </Dialog>
  )
}
