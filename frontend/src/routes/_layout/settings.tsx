import { createFileRoute } from "@tanstack/react-router"

import ChangePassword from "@/components/AccountSettings/ChangePassword"
import DeleteAccount from "@/components/AccountSettings/DeleteAccount"
import UserInformation from "@/components/AccountSettings/UserInformation"

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"

import useAuth from "@/hooks/useAuth"

const tabsConfig = [
  {
    value: "my-profile",
    title: "My profile",
    component: UserInformation,
  },
  {
    value: "password",
    title: "Password",
    component: ChangePassword,
  },
  {
    value: "danger-zone",
    title: "Danger zone",
    component: DeleteAccount,
  },
]

export const Route = createFileRoute("/_layout/settings")({
  component: UserSettings,
  head: () => ({
    meta: [
      {
        title: "System Settings - SmartTraffic AI",
      },
    ],
  }),
})

function UserSettings() {
  const { user: currentUser } = useAuth()

  const finalTabs = currentUser?.is_superuser
    ? tabsConfig.slice(0, 3)
    : tabsConfig

  if (!currentUser) {
    return null
  }

  return (
    <div className="flex flex-col gap-6">
      {/* PAGE HEADER */}
      <div>
        <h1
          className="
            text-3xl
            font-semibold
            tracking-tight
            leading-none
            text-white
          "
        >
          User Settings
        </h1>

        <p
          className="
            mt-3
            text-sm
            font-medium
            tracking-wide
            text-zinc-400
          "
        >
          Manage your account settings and preferences
        </p>
      </div>

      {/* PROFILE HERO */}
      <div
        className="
          relative overflow-hidden

          rounded-3xl
          border border-white/10

          bg-gradient-to-br
          from-cyan-500/10
          via-blue-500/5
          to-transparent

          p-6
          backdrop-blur-xl
        "
      >
        {/* GLOW */}
        <div
          className="
            absolute
            top-0 right-0
            h-40 w-40
            bg-cyan-400/10
            blur-3xl
          "
        />

        <div
          className="
            relative

            flex flex-col
            gap-6

            lg:flex-row
            lg:items-center
            lg:justify-between
          "
        >
          {/* LEFT */}
          <div className="flex items-center gap-5">
            {/* AVATAR */}
            <div
              className="
                flex items-center justify-center

                h-20 w-20

                rounded-3xl
                border border-cyan-500/20

                bg-cyan-500/10

                text-3xl
                font-semibold
                tracking-tight
                text-cyan-400
              "
            >
              A
            </div>

            {/* INFO */}
            <div>
              <h2
                className="
                  text-3xl
                  font-semibold
                  tracking-tight
                  leading-none
                  text-white
                "
              >
                System Administrator
              </h2>

              <p
                className="
                  mt-2
                  text-sm
                  font-medium
                  tracking-wide
                  text-zinc-400
                "
              >
                {currentUser.email}
              </p>

              {/* BADGES */}
              <div
                className="
                  mt-4
                  flex flex-wrap
                  items-center
                  gap-3
                "
              >
                <div
                  className="
                    rounded-2xl
                    border border-green-500/20
                    bg-green-500/10

                    px-4 py-2

                    text-sm
                    font-semibold
                    tracking-wide
                    text-green-400
                  "
                >
                  System Active
                </div>

                <div
                  className="
                    rounded-2xl
                    border border-cyan-500/20
                    bg-cyan-500/10

                    px-4 py-2

                    text-sm
                    font-semibold
                    tracking-wide
                    text-cyan-400
                  "
                >
                  Full Access
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT STATS */}
          <div
            className="
              grid grid-cols-2
              gap-4
            "
          >
            {[
              {
                label: "Last Login",
                value: "2 min ago",
              },
              {
                label: "Security",
                value: "Protected",
              },
              {
                label: "Sessions",
                value: "4 Active",
              },
              {
                label: "AI Status",
                value: "Online",
              },
            ].map((item) => (
              <div
                key={item.label}
                className="
                  rounded-2xl
                  border border-white/10
                  bg-black/20

                  px-5 py-4
                "
              >
                <p
                  className="
                    text-xs
                    font-medium
                    tracking-[0.12em]
                    text-zinc-500
                  "
                >
                  {item.label}
                </p>

                <h3
                  className="
                    mt-2
                    text-xl
                    font-semibold
                    tracking-tight
                    leading-none
                    text-white
                  "
                >
                  {item.value}
                </h3>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* SETTINGS PANEL */}
      <div
        className="
          rounded-3xl
          border border-white/10

          bg-black/30

          p-6

          backdrop-blur-xl
        "
      >
        <Tabs
          defaultValue="my-profile"
          className="space-y-6"
        >
          {/* TABS */}
          <TabsList
            className="
              h-auto
              rounded-2xl
              border border-white/10
              bg-white/5
              p-1
            "
          >
            {finalTabs.map((tab) => (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                className="
                  rounded-xl

                  px-5 py-2.5

                  text-sm
                  font-semibold
                  tracking-wide

                  data-[state=active]:bg-cyan-500
                  data-[state=active]:text-black
                "
              >
                {tab.title}
              </TabsTrigger>
            ))}
          </TabsList>

          {/* CONTENT */}
          {finalTabs.map((tab) => (
            <TabsContent
              key={tab.value}
              value={tab.value}
              className="
                rounded-3xl
                border border-white/10

                bg-black/20

                p-6
              "
            >
              <tab.component />
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  )
}