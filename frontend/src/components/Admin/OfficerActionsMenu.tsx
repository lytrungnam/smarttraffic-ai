import { EllipsisVertical } from "lucide-react"
import { useState } from "react"

import type { UserPublic } from "@/client"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import useAuth from "@/hooks/useAuth"

import DeleteOfficer from "./DeleteOfficer"
import  EditOfficer  from "./EditOfficer"

interface OfficerActionsMenuProps {
  user: UserPublic
}

export const OfficerActionsMenu = ({
  user,
}: OfficerActionsMenuProps) => {
  const [open, setOpen] = useState(false)

  const { user: currentUser } = useAuth()

  // Prevent self-management
  if (user.id === currentUser?.id) {
    return null
  }

  return (
    <DropdownMenu
      open={open}
      onOpenChange={setOpen}
    >
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
        >
          <EllipsisVertical />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end">
        <EditOfficer
          user={user}
          onSuccess={() => setOpen(false)}
        />

        <DeleteOfficer
          id={user.id}
          onSuccess={() => setOpen(false)}
        />
      </DropdownMenuContent>
    </DropdownMenu>
  )
}