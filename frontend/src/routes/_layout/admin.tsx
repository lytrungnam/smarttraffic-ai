import { useSuspenseQuery } from "@tanstack/react-query"

import { createFileRoute, redirect } from "@tanstack/react-router"

import { Suspense } from "react"

import { type UserPublic, UsersService } from "@/client"

import AddUser from "@/components/Admin/AddOfficer"

import AdminHero from "@/components/Admin/AdminHero"
import AdminStats from "@/components/Admin/AdminStats"
import AdminSystem from "@/components/Admin/AdminSystem"

import { columns } from "@/components/Admin/OfficersTable"

import { DataTable } from "@/components/Common/DataTable"

import UsersTableSkeleton from "@/components/Violations/UsersTableSkeleton"

import useAuth from "@/hooks/useAuth"

function getUsersQueryOptions() {
  return {
    queryFn: () =>
      UsersService.readUsers({
        skip: 0,
        limit: 100,
      }),

    queryKey: ["users"],
  }
}

export const Route = createFileRoute("/_layout/admin")({
  component: Admin,

  beforeLoad: async () => {
    const user = await UsersService.readUserMe()

    if (!user.is_superuser) {
      throw redirect({
        to: "/",
      })
    }
  },

  head: () => ({
    meta: [
      {
        title: "User Management - SmartTraffic AI",
      },
    ],
  }),
})

function UsersTableContent() {
  const { user: currentUser } = useAuth()

  const { data: users } = useSuspenseQuery(getUsersQueryOptions())

  const tableData = users.data.map((user: UserPublic) => ({
    ...user,

    isCurrentUser: currentUser?.id === user.id,
  }))

  return <DataTable columns={columns} data={tableData} />
}

function UsersTable() {
  return (
    <Suspense fallback={<UsersTableSkeleton />}>
      <UsersTableContent />
    </Suspense>
  )
}

function Admin() {
  return (
    <div className="space-y-8">
      {/* HERO */}
      <AdminHero />

      {/* STATS */}
      <AdminStats />

      {/* SYSTEM STATUS */}
      <AdminSystem />

      {/* HEADER */}
      <div
        className="
          flex flex-col gap-6

          lg:flex-row
          lg:items-center
          lg:justify-between
        "
      >
        {/* LEFT */}
        <div>
          <h1
            className="
              text-4xl font-black
              tracking-tight
              text-white
            "
          >
            Users
          </h1>

          <p
            className="
              mt-3
              text-zinc-400
            "
          >
            Manage users, permissions, and realtime monitoring access.
          </p>
        </div>

        {/* RIGHT */}
        <AddUser />
      </div>

      {/* TABLE */}
      <div
        className="
          overflow-hidden
          rounded-3xl

          border border-white/10

          bg-white/[0.03]

          shadow-2xl
          backdrop-blur-xl
        "
      >
        <UsersTable />
      </div>
    </div>
  )
}

export default Admin
