"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { getUserSessions, deleteChatSession, createChatSession } from "@/lib/api-client-new"
import { Loader2, MessageSquare, Plus, Trash2, Search, Calendar } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface ChatSession {
  id: string
  title: string
  description: string
  created_at: string
  updated_at: string
  status: string
  is_temporary: boolean
}

export default function SessionsPage() {
  const [sessions, setSessions] = useState<ChatSession[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [creatingSession, setCreatingSession] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    loadSessions()
  }, [])

  const loadSessions = async () => {
    try {
      const response = await getUserSessions(50, 0)
      if (response.data) {
        setSessions(response.data)
      }
    } catch (error) {
      console.error("Failed to load sessions:", error)
      toast({
        title: "Error",
        description: "Failed to load chat sessions",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCreateSession = async () => {
    setCreatingSession(true)
    try {
      const response = await createChatSession({
        title: `New Chat ${new Date().toLocaleDateString()}`,
        description: "New conversation",
      })
      if (response.data) {
        loadSessions()
        toast({
          title: "Success",
          description: "New chat session created",
        })
      }
    } catch (error) {
      console.error("Failed to create session:", error)
      toast({
        title: "Error",
        description: "Failed to create chat session",
        variant: "destructive",
      })
    } finally {
      setCreatingSession(false)
    }
  }

  const handleDeleteSession = async (sessionId: string) => {
    try {
      await deleteChatSession(sessionId)
      setSessions((prev) => prev.filter((s) => s.id !== sessionId))
      toast({
        title: "Success",
        description: "Chat session deleted",
      })
    } catch (error) {
      console.error("Failed to delete session:", error)
      toast({
        title: "Error",
        description: "Failed to delete chat session",
        variant: "destructive",
      })
    }
  }

  const filteredSessions = sessions.filter(
    (session) =>
      session.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      session.description.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold font-playfair">Chat Sessions</h1>
            <p className="text-muted-foreground">Manage your conversation history</p>
          </div>
          <Button onClick={handleCreateSession} disabled={creatingSession}>
            {creatingSession ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
            New Session
          </Button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search sessions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Sessions List */}
      <ScrollArea className="flex-1 p-6 overflow-y-scroll">
        {filteredSessions.length === 0 ? (
          <div className="text-center py-12">
            <MessageSquare className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">No sessions found</h3>
            <p className="text-muted-foreground mb-4">
              {searchQuery ? "Try adjusting your search terms" : "Create your first chat session to get started"}
            </p>
            {!searchQuery && (
              <Button onClick={handleCreateSession} disabled={creatingSession}>
                <Plus className="mr-2 h-4 w-4" />
                Create First Session
              </Button>
            )}
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredSessions.map((session) => (
              <Card key={session.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg truncate">{session.title}</CardTitle>
                      <CardDescription className="mt-1 line-clamp-2">{session.description}</CardDescription>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteSession(session.id)}
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(session.created_at).toLocaleDateString()}
                    </div>
                    <div className="flex gap-2">
                      <Badge variant={session.status === "active" ? "default" : "secondary"}>{session.status}</Badge>
                      {session.is_temporary && <Badge variant="outline">Temporary</Badge>}
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    className="w-full mt-3 bg-transparent"
                    onClick={() => (window.location.href = `/dashboard?session=${session.id}`)}
                  >
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Open Chat
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  )
}
