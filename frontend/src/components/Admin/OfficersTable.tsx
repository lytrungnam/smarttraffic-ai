import type { ColumnDef } from "@tanstack/react-table"

import type { UserPublic } from "@/client"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { OfficerActionsMenu } from "./OfficerActionsMenu"

export type OfficerTableData = UserPublic & {
  isCurrentUser: boolean
}

export const columns: ColumnDef<OfficerTableData>[] = [
  {
    accessorKey: "full_name",

    header: "Officer Name",

    cell: ({ row }) => {
      const fullName = row.original.full_name

      return (
        <div className="flex items-center gap-2">
          <span
            className={cn(
              "font-medium",
              !fullName &&
                "text-muted-foreground",
            )}
          >
            {fullName || "Unknown Officer"}
          </span>

          {row.original.isCurrentUser && (
            <Badge
              variant="outline"
              className="text-xs"
            >
              Current Session
            </Badge>
          )}
        </div>
      )
    },
  },

  {
    accessorKey: "email",

    header: "Officer Email",

    cell: ({ row }) => (
      <span className="text-muted-foreground">
        {row.original.email}
      </span>
    ),
  },

  {
    accessorKey: "is_superuser",

    header: "Access Level",

    cell: ({ row }) => (
      <Badge
        variant={
          row.original.is_superuser
            ? "default"
            : "secondary"
        }
      >
        {row.original.is_superuser
          ? "System Administrator"
          : "Traffic Officer"}
      </Badge>
    ),
  },

  {
    accessorKey: "is_active",

    header: "Account Status",

    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <span
          className={cn(
            "size-2 rounded-full",
            row.original.is_active
              ? "bg-green-500"
              : "bg-gray-400",
          )}
        />

        <span
          className={
            row.original.is_active
              ? ""
              : "text-muted-foreground"
          }
        >
          {row.original.is_active
            ? "Active"
            : "Disabled"}
        </span>
      </div>
    ),
  },

  {
    id: "actions",

    header: () => (
      <span className="sr-only">
        Officer Actions
      </span>
    ),

    cell: ({ row }) => (
      <div className="flex justify-end">
        <OfficerActionsMenu
          user={row.original}
        />
      </div>
    ),
  },
]