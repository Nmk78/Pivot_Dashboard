"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChatInterface } from "@/components/chat-interface"
import { createChatSession, getUserSessions } from "@/lib/api-client-new"
import { Loader2, MessageSquare, Plus } from "lucide-react"

interface ChatSession {
  id: string
  title: string
  description: string
  created_at: string
  updated_at: string
}

function DashboardChatContentInner() {
  const [currentSession, setCurrentSession] = useState<string | null>(null)
  const [recentSessions, setRecentSessions] = useState<ChatSession[]>([])
  const [loading, setLoading] = useState(true)
  const [creatingSession, setCreatingSession] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const sessionParam = searchParams.get('session')
    
    if (sessionParam) {
      setCurrentSession(sessionParam)
    }
    
    loadRecentSessions()
  }, [searchParams])

  const loadRecentSessions = async () => {
    try {
      const response = await getUserSessions(20, 0)
      if (response.data) {
        setRecentSessions(response.data as ChatSession[])
      }
    } catch (error) {
      console.error("Failed to load sessions:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSessionSelect = (sessionId: string) => {
    setCurrentSession(sessionId)
    router.replace(`/dashboard/chat?session=${sessionId}`)
  }

  const formatSessionDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    } else if (diffInHours < 24 * 7) {
      return date.toLocaleDateString([], { weekday: 'short' })
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' })
    }
  }

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
        loadRecentSessions()
      }
    } catch (error) {
      console.error("Failed to create session:", error)
    } finally {
      setCreatingSession(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!currentSession) {
    return (
      <div className="flex items-center justify-center h-full p-8">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <MessageSquare className="h-12 w-12 mx-auto mb-4 text-primary" />
            <CardTitle className="font-playfair">Welcome to RAG Chat</CardTitle>
            <CardDescription>Start a new conversation to begin chatting with your AI assistant</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={handleNewChat} disabled={creatingSession} className="w-full">
              {creatingSession ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="mr-2 h-4 w-4" />
                  Start New Chat
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex flex-1 h-full">
      <div className="flex-1">
        <ChatInterface sessionId={currentSession} />
      </div>
    </div>
  )
}

export function DashboardChatContent() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    }>
      <DashboardChatContentInner />
    </Suspense>
  )
}
