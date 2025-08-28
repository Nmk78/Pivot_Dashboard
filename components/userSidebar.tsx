"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useAuth } from "@/hooks/use-auth";
import {
  getUserSessions,
  createChatSession,
  updateChatSession,
} from "@/lib/api-client-new";
import {
  MessageSquare,
  FileText,
  Users,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
  Mic,
  Search,
  Plus,
  Home,
  User,
  Edit2,
  CircleUser,
  Check,
  X as XIcon,
  LogIn,
  LayoutDashboard,
} from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

// const navigation = [
//   { name: "Overview", href: "/dashboard/overview", icon: Home },
//   { name: "Chat", href: "/dashboard/chat", icon: MessageSquare },
//   { name: "Sessions", href: "/dashboard/sessions", icon: MessageSquare },
//   { name: "Files", href: "/dashboard/files", icon: FileText },
//   { name: "Analytics", href: "/dashboard/analytics", icon: BarChart3 },
//   { name: "Speech", href: "/dashboard/speech", icon: Mic },
//   // { name: "Search", href: "/dashboard/search", icon: Search },
// ]

const adminNavigation = [
  { name: "Dashboard", href: "/dashboard/overview", icon: LayoutDashboard },
];

interface ChatSession {
  id: string;
  title: string;
  description: string;
  created_at: string;
  updated_at: string;
}

function UserSidebarInner() {
  const [collapsed, setCollapsed] = useState(false);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [loadingSessions, setLoadingSessions] = useState(false);
  const [editingSession, setEditingSession] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [creatingSession, setCreatingSession] = useState(false);

  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, logout } = useAuth();
  const currentSessionId = searchParams.get("session");

  const isAdmin = user?.role === "admin";
  const isMobile = useIsMobile();

  // Load user sessions
  useEffect(() => {
    if (user) {
      loadUserSessions();
    }
  }, [user]);

  const loadUserSessions = async () => {
    if (!user) return;

    setLoadingSessions(true);
    try {
      const response = await getUserSessions(10, 0);
      if (response.data) {
        setSessions(response.data as ChatSession[]);
      }
    } catch (error) {
      console.error("Failed to load sessions:", error);
    } finally {
      setLoadingSessions(false);
    }
  };

  const handleSessionClick = (sessionId: string) => {
    router.push(`/chat?session=${sessionId}`);
  };

  const handleNewChat = async () => {
    if (!user) return;

    setCreatingSession(true);
    try {
      const response = await createChatSession({
        title: `Chat ${new Date().toLocaleDateString()}`,
        description: "New conversation",
      });
      if (response.data) {
        const sessionData = response.data as { id: string };
        router.push(`/chat?session=${sessionData.id}`);
        loadUserSessions();
      }
    } catch (error) {
      console.error("Failed to create session:", error);
    } finally {
      setCreatingSession(false);
    }
  };

  const startEditingSession = (session: ChatSession) => {
    setEditingSession(session.id);
    setEditTitle(session.title);
  };

  const saveSessionTitle = async () => {
    if (!editingSession || !editTitle.trim()) return;

    try {
      // Update session via API
      const response = await updateChatSession(editingSession, {
        title: editTitle.trim(),
      });

      if (response.data) {
        // Update local state on successful API call
        setSessions((prev) =>
          prev.map((session) =>
            session.id === editingSession
              ? { ...session, title: editTitle.trim() }
              : session
          )
        );
      }
    } catch (error) {
      console.error("Failed to update session title:", error);
      // Could add toast notification here for better UX
    }

    setEditingSession(null);
    setEditTitle("");
  };

  const cancelEditing = () => {
    setEditingSession(null);
    setEditTitle("");
  };

  const formatSessionDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    } else if (diffInHours < 24 * 7) {
      return date.toLocaleDateString([], { weekday: "short" });
    } else {
      return date.toLocaleDateString([], { month: "short", day: "numeric" });
    }
  };

  if (isMobile) {
    return (
      <div className="fixed top-0 left-0 w-full bg-sidebar border-b border-sidebar-border flex justify-between items-center py-2 px-4">
        <a href="/" className="flex justify-center align-bottom space-x-0">
          <img src="/logo.png" alt="Logo" className="w-8 h-8" />
          <span className="text-xs mt-auto font-bold text-sidebar-foreground">ivot</span>
        </a>
        <div className="flex items-center space-x-4">
          {user ? (
            <>
                 <Link className="" href={isAdmin ? "/dashboard/profile" : "/profile"}>
                  <User className="h-6 w-6" />
                </Link>
            </>
          ) : (
            <Button asChild variant="ghost">
              <Link href="/auth/login">
                <LogIn className="h-6 w-6" />
              </Link>
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex flex-col h-screen bg-sidebar border-r border-sidebar-border transition-all duration-300",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-sidebar-border">
        {!collapsed && (
          <a href="/" className="flex items-center space-x-2">
            <img src="/logo.png" alt="Logo" className="w-8 h-8" />
            <h1 className="text-lg font-bold font-playfair text-sidebar-foreground">
              Pivot
            </h1>
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
      <ScrollArea className="flex-1 px-3 py-4 ">
        <div id="sessionContainer" className="space-y-2 ">
          {/* New Chat Button - Only show if user is logged in */}
          {user && (
            <Button
              onClick={handleNewChat}
              disabled={creatingSession}
              className={cn(
                "w-full justify-start bg-primary hover:bg-primary/90 text-primary-foreground",
                collapsed && "px-2"
              )}
            >
              {creatingSession ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                  {!collapsed && <span className="ml-2">Creating...</span>}
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4" />
                  {!collapsed && <span className="ml-2">New Chat</span>}
                </>
              )}
            </Button>
          )}

          {/* User Sessions - Only show if user is logged in and not collapsed */}
          {user && !collapsed && sessions.length > 0 && (
            <>
              <Separator className="my-4 bg-sidebar-border " />
              <div
                className="space-y-1 w-auto overflow-hidden"
              >
                <h3 className="text-xs font-semibold text-muted-foreground px-2 mb-2">
                  Recent Sessions
                </h3>
                <ScrollArea className="h-96 overflow-y-auto ">
                {/* <div className="flex-1 overflow-y-auto max-h-96 "> */}

                  {sessions.map((session) => (
                  <div key={session.id} className="group">
                    {editingSession === session.id ? (
                      <div className="flex items-center gap-1 p-2">
                        <Input
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          className="h-6 text-xs"
                          onKeyPress={(e) => {
                            if (e.key === "Enter") saveSessionTitle();
                            if (e.key === "Escape") cancelEditing();
                          }}
                          autoFocus
                        />
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={saveSessionTitle}
                          className="h-6 w-6 p-0"
                        >
                          <Check className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={cancelEditing}
                          className="h-6 w-6 p-0"
                        >
                          <XIcon className="h-3 w-3" />
                        </Button>
                      </div>
                    ) : (
                      <Button
                        variant={
                          currentSessionId === session.id
                            ? "secondary"
                            : "ghost"
                        }
                        className={cn(
                          "w-full justify-start text-left h-auto p-2 group-hover:bg-sidebar-accent",
                          currentSessionId === session.id &&
                            "bg-sidebar-accent text-sidebar-accent-foreground"
                        )}
                        onClick={() => handleSessionClick(session.id)}
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="text-xs font-medium truncate">
                              {session.title}
                            </p>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={(e) => {
                                e.stopPropagation();
                                startEditingSession(session);
                              }}
                              className="h-4 w-4 p-0 opacity-0 group-hover:opacity-100"
                            >
                              <Edit2 className="h-3 w-3" />
                            </Button>
                          </div>
                          <p className="text-xs text-muted-foreground truncate">
                            {formatSessionDate(session.updated_at)}
                          </p>
                        </div>
                      </Button>
                    )}
                  </div>
                ))}
                </ScrollArea>
              </div>
            </>
          )}

          <Separator className="my-4 bg-sidebar-border" />
        </div>
      </ScrollArea>

      {/* <Separator className="my-4 bg-sidebar-border" /> */}
      <div className="h-10">
        {isAdmin &&adminNavigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Button
              key={item.name}
              asChild
              variant={isActive ? "secondary" : "ghost"}
              className={cn(
                "w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent",
                collapsed && "px-2",
                isActive && "bg-sidebar-accent text-sidebar-accent-foreground"
              )}
            >
              <Link href={item.href}>
                <item.icon className="h-4 w-4" />
                {!collapsed && <span className="ml-2">{item.name}</span>}
              </Link>
            </Button>
          );
        })}
      </div>

      {/* <Separator className="my-4 bg-sidebar-border" /> */}

      {/* User Section */}
      <div className="p-4 border-t border-sidebar-border">
        {user ? (
          <>
            {/* Logged in user */}
            {!collapsed && (
              <a href="/profile" className="flex space-x-2 space-y-0">
                <div className="flex items-center gap-3 mb-2">
                  <CircleUser className="h-8 w-8 mt-1" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-sidebar-foreground truncate">
                      {user.username}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {user.email}
                    </p>
                  </div>
                </div>
                {/* {user.role === "admin" && (
                  <span className="inline-block px-2 py-1 text-xs bg-primary text-primary-foreground rounded-full">
                    Admin
                  </span>
                )} */}
              </a>
            )}
            {/* <Button
              variant="ghost"
              onClick={logout}
              className={cn("w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent", collapsed && "px-2")}
            >
              <LogOut className="h-4 w-4" />
              {!collapsed && <span className="ml-2">Logout</span>}
            </Button> */}
          </>
        ) : (
          <>
            {/* Guest user */}
            {!collapsed && (
              <div className="mb-3">
                <div className="flex items-center gap-3 mb-2">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-muted">
                      <User className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-sidebar-foreground">
                      Guest
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Not logged in
                    </p>
                  </div>
                </div>
              </div>
            )}
            <Button
              asChild
              variant="default"
              className={cn("w-full justify-start", collapsed && "px-2")}
            >
              <Link href="/auth/login">
                <LogIn className="h-4 w-4" />
                {!collapsed && <span className="ml-2">Login</span>}
              </Link>
            </Button>
          </>
        )}
      </div>
    </div>
  );
}

export function UserSidebar() {
  return (
    <Suspense
      fallback={
        <div className="w-64 h-screen bg-sidebar border-r border-sidebar-border flex items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      }
    >
      <UserSidebarInner />
    </Suspense>
  );
}
