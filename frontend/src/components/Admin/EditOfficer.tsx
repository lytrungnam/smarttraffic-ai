import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Pencil, Shield } from "lucide-react"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { type UserPublic, UsersService } from "@/client"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { DropdownMenuItem } from "@/components/ui/dropdown-menu"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { LoadingButton } from "@/components/ui/loading-button"
import useCustomToast from "@/hooks/useCustomToast"
import { handleError } from "@/utils"

const formSchema = z
  .object({
    email: z.email({
      message: "Invalid email address",
    }),

    full_name: z.string().optional(),

    password: z
      .string()
      .min(8, {
        message: "Password must contain at least 8 characters",
      })
      .optional()
      .or(z.literal("")),

    confirm_password: z.string().optional(),

    is_superuser: z.boolean().optional(),

    is_active: z.boolean().optional(),
  })
  .refine((data) => !data.password || data.password === data.confirm_password, {
    message: "Password confirmation does not match",
    path: ["confirm_password"],
  })

type FormData = z.infer<typeof formSchema>

interface EditOfficerProps {
  user: UserPublic
  onSuccess: () => void
}

const EditOfficer = ({ user, onSuccess }: EditOfficerProps) => {
  const [isOpen, setIsOpen] = useState(false)

  const queryClient = useQueryClient()

  const { showSuccessToast, showErrorToast } = useCustomToast()

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),

    mode: "onBlur",

    criteriaMode: "all",

    defaultValues: {
      email: user.email,
      full_name: user.full_name ?? undefined,
      is_superuser: user.is_superuser,
      is_active: user.is_active,
    },
  })

  const mutation = useMutation({
    mutationFn: (data: FormData) =>
      UsersService.updateUser({
        userId: user.id,
        requestBody: data,
      }),

    onSuccess: () => {
      showSuccessToast("User updated successfully")

      setIsOpen(false)

      onSuccess()
    },

    onError: handleError.bind(showErrorToast),

    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ["users"],
      })
    },
  })

  const onSubmit = (data: FormData) => {
    const { confirm_password: _, ...submitData } = data

    if (!submitData.password) {
      delete submitData.password
    }

    mutation.mutate(submitData)
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      {/* DROPDOWN */}
      <DropdownMenuItem
        onSelect={(e) => e.preventDefault()}
        onClick={() => setIsOpen(true)}
      >
        <Pencil className="mr-2 h-4 w-4" />
        Edit User
      </DropdownMenuItem>

      {/* MODAL */}
      <DialogContent className="sm:max-w-md">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-cyan-400" />
                Edit User Account
              </DialogTitle>

              <DialogDescription>
                Update user information and permission settings for the AI
                traffic monitoring system.
              </DialogDescription>
            </DialogHeader>

            {/* FORM */}
            <div className="grid gap-4 py-4">
              {/* EMAIL */}
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Email <span className="text-destructive">*</span>
                    </FormLabel>

                    <FormControl>
                      <Input
                        placeholder="user@example.com"
                        type="email"
                        {...field}
                        required
                      />
                    </FormControl>

                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* NAME */}
              <FormField
                control={form.control}
                name="full_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>User Name</FormLabel>

                    <FormControl>
                      <Input
                        placeholder="User full name"
                        type="text"
                        {...field}
                      />
                    </FormControl>

                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* PASSWORD */}
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Reset Password</FormLabel>

                    <FormControl>
                      <Input
                        placeholder="Enter new secure password"
                        type="password"
                        {...field}
                      />
                    </FormControl>

                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* CONFIRM */}
              <FormField
                control={form.control}
                name="confirm_password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm Password</FormLabel>

                    <FormControl>
                      <Input
                        placeholder="Confirm password"
                        type="password"
                        {...field}
                      />
                    </FormControl>

                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* ADMIN */}
              <FormField
                control={form.control}
                name="is_superuser"
                render={({ field }) => (
                  <FormItem className="flex items-center gap-3 space-y-0 rounded-xl border border-white/10 p-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>

                    <div>
                      <FormLabel className="font-medium">
                        Administrator Access
                      </FormLabel>

                      <p className="text-sm text-muted-foreground">
                        Allow full management and monitoring permissions.
                      </p>
                    </div>
                  </FormItem>
                )}
              />

              {/* ACTIVE */}
              <FormField
                control={form.control}
                name="is_active"
                render={({ field }) => (
                  <FormItem className="flex items-center gap-3 space-y-0 rounded-xl border border-white/10 p-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>

                    <div>
                      <FormLabel className="font-medium">
                        Active User Account
                      </FormLabel>

                      <p className="text-sm text-muted-foreground">
                        Enable login access for this user account.
                      </p>
                    </div>
                  </FormItem>
                )}
              />
            </div>

            {/* FOOTER */}
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline" disabled={mutation.isPending}>
                  Cancel
                </Button>
              </DialogClose>

              <LoadingButton type="submit" loading={mutation.isPending}>
                Save Changes
              </LoadingButton>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

export default EditOfficer
