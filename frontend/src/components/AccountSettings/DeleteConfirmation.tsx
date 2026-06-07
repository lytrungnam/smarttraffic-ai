import { useMutation, useQueryClient } from "@tanstack/react-query"
import { ShieldAlert } from "lucide-react"
import { useForm } from "react-hook-form"

import { UsersService } from "@/client"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { LoadingButton } from "@/components/ui/loading-button"
import useAuth from "@/hooks/useAuth"
import useCustomToast from "@/hooks/useCustomToast"
import { handleError } from "@/utils"

const DeleteConfirmation = () => {
  const queryClient = useQueryClient()

  const { showSuccessToast, showErrorToast } = useCustomToast()

  const { handleSubmit } = useForm()

  const { logout } = useAuth()

  const mutation = useMutation({
    mutationFn: () => UsersService.deleteUserMe(),

    onSuccess: () => {
      showSuccessToast("User account deleted successfully")

      logout()
    },

    onError: handleError.bind(showErrorToast),

    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ["currentUser"],
      })
    },
  })

  const onSubmit = async () => {
    mutation.mutate()
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="destructive" className="mt-3">
          Delete User Account
        </Button>
      </DialogTrigger>

      <DialogContent>
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-400">
              <ShieldAlert className="h-5 w-5" />
              Delete User Account
            </DialogTitle>

            <DialogDescription>
              All user account data, authentication information, and traffic
              monitoring access will be <strong>permanently deleted.</strong>
              <br />
              <br />
              If you are sure, click <strong>"Confirm Deletion"</strong> to
              continue.
              <br />
              <br />
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          {/* FOOTER */}
          <DialogFooter className="mt-4">
            <DialogClose asChild>
              <Button variant="outline" disabled={mutation.isPending}>
                Cancel
              </Button>
            </DialogClose>

            <LoadingButton
              variant="destructive"
              type="submit"
              loading={mutation.isPending}
            >
              Confirm Deletion
            </LoadingButton>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default DeleteConfirmation
