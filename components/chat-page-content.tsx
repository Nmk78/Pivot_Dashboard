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

function ChatPageContentInner() {
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
      loadRecentSessions()
    } else {
      // No session in URL, load sessions and auto-select recent one
      loadRecentSessionsAndAutoSelect()
    }
  }, [searchParams])

  const loadRecentSessions = async () => {
    try {
      const response = await getUserSessions(5, 0)
      if (response.data) {
        setRecentSessions(response.data as ChatSession[])
      }
    } catch (error) {
      console.error("Failed to load sessions:", error)
    } finally {
      setLoading(false)
    }
  }

  const loadRecentSessionsAndAutoSelect = async () => {
    try {
      const response = await getUserSessions(5, 0)
      if (response.data) {
        const sessions = response.data as ChatSession[]
        setRecentSessions(sessions)
        
        // Check if there's a recent session within 5 hours
        if (sessions.length > 0) {
          const mostRecentSession = sessions[0]
          const sessionDate = new Date(mostRecentSession.updated_at)
          const now = new Date()
          const hoursDiff = (now.getTime() - sessionDate.getTime()) / (1000 * 60 * 60)
          
          if (hoursDiff <= 5) {
            // Auto-select the most recent session if it's within 5 hours
            setCurrentSession(mostRecentSession.id)
            router.replace(`/chat?session=${mostRecentSession.id}`)
          }
        }
      }
    } catch (error) {
      console.error("Failed to load sessions:", error)
    } finally {
      setLoading(false)
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
        router.replace(`/chat?session=${sessionData.id}`)
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
    // Check if we have recent sessions but none are within 5 hours
    const hasOldSessions = recentSessions.length > 0
    const welcomeMessage = hasOldSessions 
      ? "Your last chat was more than 5 hours ago. Start a new conversation or continue with a previous one."
      : "Start a new conversation to begin chatting with your AI assistant"
    
    return (
      <div className="flex items-center justify-center h-full p-8">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <MessageSquare className="h-12 w-12 mx-auto mb-4 text-primary" />
            <CardTitle className="font-playfair">Welcome to RAG Chat</CardTitle>
            <CardDescription>{welcomeMessage}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
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
            
            {/* Show recent sessions if they exist */}
            {hasOldSessions && (
              <>
                <div className="text-xs text-muted-foreground mt-4 mb-2">Or continue with:</div>
                <div className="space-y-1">
                  {recentSessions.slice(0, 3).map((session) => (
                    <Button
                      key={session.id}
                      variant="outline"
                      size="sm"
                      className="w-full text-left justify-start"
                      onClick={() => {
                        setCurrentSession(session.id)
                        router.replace(`/chat?session=${session.id}`)
                      }}
                    >
                      <MessageSquare className="mr-2 h-3 w-3" />
                      <span className="truncate">{session.title}</span>
                    </Button>
                  ))}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="h-full">
      <ChatInterface sessionId={currentSession} />
    </div>
  )
}

export function ChatPageContent() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    }>
      <ChatPageContentInner />
    </Suspense>
  )
}
