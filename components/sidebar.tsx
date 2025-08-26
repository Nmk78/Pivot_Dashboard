"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { useAuth } from "@/hooks/use-auth"
import { MessageSquare, FileText, Users, BarChart3, Settings, LogOut, Menu, X, Mic, Search, Plus, Home, Loader2 } from "lucide-react"


import { createChatSession, getUserSessions } from "@/lib/api-client-new"
import { useRouter } from "next/navigation"

const navigation = [
  { name: "Overview", href: "/dashboard/overview", icon: Home },
  { name: "Chat", href: "/dashboard/chat", icon: MessageSquare },
  { name: "Sessions", href: "/dashboard/sessions", icon: MessageSquare },
  { name: "Files", href: "/dashboard/files", icon: FileText },
  { name: "Analytics", href: "/dashboard/analytics", icon: BarChart3 },
  // { name: "Speech", href: "/dashboard/speech", icon: Mic },
  // { name: "Search", href: "/dashboard/search", icon: Search },
]


export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false)
  const pathname = usePathname()
  const { user, logout } = useAuth()
  const [creatingSession, setCreatingSession] = useState(false)
  const [currentSession, setCurrentSession] = useState<string | null>(null)

  const router = useRouter()


  const isAdmin = user?.role === "admin"

    const handleNewChat = async () => {
      setCreatingSession(true)
      try {
        const response = await createChatSession({
          title: `Chat ${new Date().toLocaleDateString()}`,
          description: "New conversation",
        })
        if (response.data) {
          const sessionData = response.data as { id: string }
          setCurrentSession(sessionData.id)
          router.replace(`/dashboard/chat?session=${sessionData.id}`)
        }
      } catch (error) {
        console.error("Failed to create session:", error)
      } finally {
        setCreatingSession(false)
      }
    }

  return (
    <div
      className={cn(
        "flex flex-col h-screen bg-sidebar border-r border-sidebar-border transition-all duration-300",
        collapsed ? "w-16" : "w-64",
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-sidebar-border">
        {!collapsed && (
          <a href="/" className="flex items-center space-x-2">
            <img src="/logo.png" alt="Logo" className="w-8 h-8" />
            <h1 className="text-lg font-bold font-playfair text-sidebar-foreground">Pivot</h1>
          </a>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setCollapsed(!collapsed)}
          className="text-sidebar-foreground hover:bg-sidebar-accent"
        >
          {collapsed ? <Menu className="h-4 w-4" /> : <X className="h-4 w-4" />}
        </Button>
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 px-3 py-4">
        <div className="space-y-2">
          {/* New Chat Button */}
          <Button
            // asChild
            className={cn(
              "w-full justify-start bg-primary hover:bg-primary/90 text-primary-foreground",
              collapsed && "px-2",
            )}
            onClick={handleNewChat} disabled={creatingSession}          >
              <Plus className="h-4 w-4" />
              {!collapsed && <span className="ml-2">New Chat</span>}
          </Button>

          <Separator className="my-4 bg-sidebar-border" />

          {/* Main Navigation */}
          {navigation.map((item) => {
            const isActive = pathname === item.href
            return (
              <Button
                key={item.name}
                asChild
                variant={isActive ? "secondary" : "ghost"}
                className={cn(
                  "w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent",
                  collapsed && "px-2",
                  isActive && "bg-sidebar-accent text-sidebar-accent-foreground",
                )}
              >
                <Link href={item.href}>
                  <item.icon className="h-4 w-4" />
                  {!collapsed && <span className="ml-2">{item.name}</span>}
                </Link>
              </Button>
            )
          })}

        </div>
      </ScrollArea>

      {/* User Section */}
      <div className="p-4 border-t border-sidebar-border">
        {!collapsed && user && (
          <a href={ isAdmin ? "/dashboard/profile" : "/profile"} className="mb-3">
            <p className="text-sm font-medium text-sidebar-foreground truncate">{user.full_name || user.username}</p>
            <p className="text-xs text-muted-foreground truncate">{user.email}</p>
            {user.role === "admin" && (
              <span className="inline-block px-2 py-1 text-xs bg-primary text-primary-foreground rounded-full mt-1">
                Admin
              </span>
            )}
          </a>
        )}
        <Button
          variant="ghost"
          onClick={logout}
          className={cn("w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent", collapsed && "px-2")}
        >
          <LogOut className="h-4 w-4" />
          {!collapsed && <span className="ml-2">Logout</span>}
        </Button>
      </div>
    </div>
  )
}
