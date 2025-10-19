"use client"

import { type ReactNode, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  BookOpenCheckIcon,
  CompassIcon,
  HomeIcon,
  MenuIcon,
  SparklesIcon,
  XIcon,
} from "lucide-react"
import { SignedIn, SignedOut, SignInButton, SignUpButton, UserButton, useUser } from "@clerk/nextjs"
import { Button } from "@/components/ui/button"

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: HomeIcon },
  { href: "/explore", label: "Community", icon: CompassIcon },
  { href: "/study", label: "Study", icon: BookOpenCheckIcon },
  // { href: "/profile", label: "Profile", icon: UserIcon },
]


const isActivePath = (pathname: string, href: string) => {
  if (href === "/dashboard") {
    return pathname === "/dashboard"
  }
  if (href === "/study") {
    return pathname === "/study" || pathname.startsWith("/study/")
  }
  return pathname === href
}

export const AppLayout = ({ children }: { children: ReactNode }) => {
  const pathname = usePathname()
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const { user } = useUser()

  if (pathname === "/") {
    return <div className="min-h-screen bg-background">{children}</div>
  }

  const closeMobile = () => setIsMobileOpen(false)

  const renderNav = () => (
    <>
      <div className="mb-10 flex items-center gap-2">
        <SparklesIcon className="size-5 text-primary" />
        <span className="text-xl font-semibold">FlashLearn</span>
      </div>
      <ul className="flex flex-1 flex-col gap-2">
        {navItems.map((item) => {
          const Icon = item.icon
          const active = isActivePath(pathname, item.href)
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition hover:bg-primary/10 ${
                  active ? "bg-primary/10 text-primary" : "text-muted-foreground"
                }`}
                onClick={closeMobile}
              >
                <Icon className="size-4" />
                {item.label}
              </Link>
            </li>
          )
        })}
      </ul>
      <div className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
        Keep practicing daily to strengthen your memory.
      </div>
    </>
  )

  return (
    <div className="flex min-h-screen bg-muted/30">
      <nav className="hidden w-64 shrink-0 border-r bg-background p-6 lg:flex lg:flex-col">
        {renderNav()}
      </nav>

      <div className="flex w-full flex-col">
        <header className="flex items-center justify-between border-b bg-background px-4 py-3 shadow-sm lg:px-8">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setIsMobileOpen((prev) => !prev)}
            >
              {isMobileOpen ? <XIcon className="size-5" /> : <MenuIcon className="size-5" />}
              <span className="sr-only">Toggle navigation</span>
            </Button>
            <div>
              <p className="text-sm text-muted-foreground">Welcome back</p>
              <h1 className="text-lg font-semibold">{user?.fullName}</h1>
            </div>
          </div>
          <div className="hidden items-center gap-2 lg:flex">
            <SignedOut>
              <SignInButton mode="modal">
                <Button size="sm" variant="outline">
                  Sign in
                </Button>
              </SignInButton>
              <SignUpButton mode="modal">
                <Button size="sm">Create account</Button>
              </SignUpButton>
            </SignedOut>
            <SignedIn>
              <UserButton appearance={{ elements: { avatarBox: "size-9" } }} />
            </SignedIn>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 lg:p-8">{children}</main>
      </div>

      {isMobileOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div className="w-64 bg-background p-6 shadow-lg">
            {renderNav()}
            <div className="mt-6 flex flex-col gap-3">
              <SignedOut>
                <SignInButton mode="modal">
                  <Button variant="outline">Sign in</Button>
                </SignInButton>
                <SignUpButton mode="modal">
                  <Button>Create account</Button>
                </SignUpButton>
              </SignedOut>
              <SignedIn>
                <UserButton appearance={{ elements: { avatarBox: "size-9" } }} />
              </SignedIn>
            </div>
          </div>
          <div className="flex-1" onClick={closeMobile} />
        </div>
      )}
    </div>
  )
}
