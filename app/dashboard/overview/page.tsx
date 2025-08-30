"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { getUserSessions, getUploadedFiles, createChatSession, getHealthStatus } from "@/lib/api-client-new"
import { useAuth } from "@/hooks/use-auth"
import { 
  Loader2, 
  MessageSquare, 
  FileText, 
  TrendingUp, 
  Zap, 
  Plus,
  BarChart3,
  Upload,
  Settings,
  Users,
  Clock,
  Activity
} from "lucide-react"
import { useRouter } from "next/navigation"

interface DashboardStats {
  totalSessions: number
  totalFiles: number
  totalMessages: number
  avgResponseTime: number
  sessionsThisWeek: number
  filesThisWeek: number
  recentSessions: any[]
  recentFiles: any[]
}

export default function OverviewPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [creatingSession, setCreatingSession] = useState(false)
  const { user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      const [sessionsResponse, filesResponse, healthResponse] = await Promise.all([
        getUserSessions(10, 0),
        getUploadedFiles(),
        getHealthStatus()
      ])
      console.log("🚀 ~ loadDashboardData ~ healthResponse:", healthResponse)

      const sessions = Array.isArray(sessionsResponse.data) ? sessionsResponse.data : []
      const files = filesResponse.data?.files || []
      const totalFiles = filesResponse.data?.total_count || 0

      const now = new Date()
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

      const sessionsThisWeek = sessions.filter((s: any) => new Date(s.created_at) >= weekAgo).length
      const filesThisWeek = files.filter((f: any) => new Date(f.upload_date) >= weekAgo).length

      const totalMessages = sessions.reduce((sum: number, session: any) => sum + (session.message_count || 0), 0)
      const avgResponseTime = healthResponse.data?.response_time_ms || 1200

      setStats({
        totalSessions: sessions.length,
        totalFiles: totalFiles,
        totalMessages: totalMessages,
        avgResponseTime: avgResponseTime,
        sessionsThisWeek,
        filesThisWeek,
        recentSessions: sessions?.slice(0, 3),
        recentFiles: files.slice(0, 3)
      })
    } catch (error) {
      console.error("Failed to load dashboard data:", error)
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
        router.push(`/dashboard?session=${response.data.id}`)
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

  return (
    <div className="h-full overflow-auto p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold font-playfair">Overview</h1>
            <p className="text-muted-foreground">Welcome back, {user?.full_name || user?.username}</p>
          </div>
          <Button onClick={handleNewChat} disabled={creatingSession} size="lg">
            {creatingSession ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Plus className="mr-2 h-4 w-4" />
            )}
            New Chat
          </Button>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Sessions</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalSessions || 0}</div>
              {/* <p className="text-xs text-muted-foreground">
                +{stats?.sessionsThisWeek || 0} this week
              </p> */}
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Files Uploaded</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalFiles || 0}</div>
              <p className="text-xs text-muted-foreground">
                {/* +{stats?.filesThisWeek || 0} this week */}
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Messages</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalMessages || 0}</div>
              <p className="text-xs text-muted-foreground">Across all sessions</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Response Time</CardTitle>
              <Zap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.avgResponseTime || 0}ms</div>
              <p className="text-xs text-muted-foreground">
                <Badge variant="secondary" className="text-xs">{stats?.avgResponseTime > 1500 ? "Slow" : "Fast"}</Badge>
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Chat Interface */}
          <Card className="hover:shadow-lg transition-all cursor-pointer" onClick={() => router.push('/dashboard')}>
            <CardHeader>
              <div className="flex items-center space-x-2">
                <MessageSquare className="h-6 w-6 text-primary" />
                <CardTitle>Chat Interface</CardTitle>
              </div>
              <CardDescription>Start conversations with your AI assistant</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span>Active Sessions</span>
                  <Badge variant="outline">{stats?.totalSessions || 0}</Badge>
                </div>
                {/* <Progress value={75} className="h-2" /> */}
                <Button variant="outline" className="w-full">
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Open Chat
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* File Management */}
          <Card className="hover:shadow-lg transition-all cursor-pointer" onClick={() => router.push('/dashboard/files')}>
            <CardHeader>
              <div className="flex items-center space-x-2">
                <FileText className="h-6 w-6 text-primary" />
                <CardTitle>File Management</CardTitle>
              </div>
              <CardDescription>Upload and manage documents for RAG processing</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span>Uploaded Files</span>
                  <Badge variant="outline">{stats?.totalFiles || 0}</Badge>
                </div>
                {/* <Progress value={60} className="h-2" /> */}
                <Button variant="outline" className="w-full">
                  <Upload className="mr-2 h-4 w-4" />
                  Manage Files
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Analytics */}
          {/* <Card className="hover:shadow-lg transition-all cursor-pointer" onClick={() => router.push('/dashboard/analytics')}>
            <CardHeader>
              <div className="flex items-center space-x-2">
                <BarChart3 className="h-6 w-6 text-primary" />
                <CardTitle>Analytics</CardTitle>
              </div>
              <CardDescription>Monitor performance and usage statistics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span>This Week</span>
                  <Badge variant="outline">+{(stats?.sessionsThisWeek || 0) + (stats?.filesThisWeek || 0)}</Badge>
                </div>
                <Progress value={85} className="h-2" />
                <Button variant="outline" className="w-full">
                  <BarChart3 className="mr-2 h-4 w-4" />
                  View Analytics
                </Button>
              </div>
            </CardContent>
          </Card> */}

          {/* Session Management */}
          <Card className="hover:shadow-lg transition-all cursor-pointer" onClick={() => router.push('/dashboard/sessions')}>
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Activity className="h-6 w-6 text-primary" />
                <CardTitle>Session Management</CardTitle>
              </div>
              <CardDescription>View and manage your conversation history</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span>Recent Sessions</span>
                  <Badge variant="outline">{stats?.recentSessions?.length || 0}</Badge>
                </div>
                {/* <Progress value={70} className="h-2" /> */}
                <Button variant="outline" className="w-full">
                  <Clock className="mr-2 h-4 w-4" />
                  View Sessions
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* User Profile */}
          {/* <Card className="hover:shadow-lg transition-all">
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Users className="h-6 w-6 text-primary" />
                <CardTitle>User Profile</CardTitle>
              </div>
              <CardDescription>Manage your account and preferences</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span>Role</span>
                  <Badge variant={user?.role === "admin" ? "default" : "secondary"}>
                    {user?.role || "user"}
                  </Badge>
                </div>
                <div className="text-sm text-muted-foreground">
                  {user?.email}
                </div>
                <Button variant="outline" className="w-full">
                  <Settings className="mr-2 h-4 w-4" />
                  Profile Settings
                </Button>
              </div>
            </CardContent>
          </Card> */}

          {/* Quick Actions */}
          <Card className="hover:shadow-lg transition-all">
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Zap className="h-6 w-6 text-primary" />
                <CardTitle>Quick Actions</CardTitle>
              </div>
              <CardDescription>Frequently used features and shortcuts</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Button variant="outline" className="w-full justify-start" onClick={handleNewChat}>
                  <Plus className="mr-2 h-4 w-4" />
                  New Chat Session
                </Button>
                <Button variant="outline" className="w-full justify-start" onClick={() => router.push('/dashboard/files')}>
                  <Upload className="mr-2 h-4 w-4" />
                  Upload Files
                </Button>
                {/* <Button variant="outline" className="w-full justify-start" onClick={() => router.push('/dashboard/analytics')}>
                  <BarChart3 className="mr-2 h-4 w-4" />
                  View Reports
                </Button> */}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Sessions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <MessageSquare className="h-5 w-5" />
                <span>Recent Sessions</span>
              </CardTitle>
              <CardDescription>Your latest conversations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {stats?.recentSessions?.length ? (
                  stats.recentSessions.map((session, index) => (
                    <div key={session.id} className="flex items-center justify-between p-3 rounded-lg border">
                      <div className="flex-1">
                        <p className="font-medium truncate">{session.title}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(session.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => router.push(`/dashboard?session=${session.id}`)}>
                        Open
                      </Button>
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground text-center py-4">No recent sessions</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Recent Files */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="h-5 w-5" />
                <span>Recent Files</span>
              </CardTitle>
              <CardDescription>Recently uploaded documents</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {stats?.recentFiles?.length ? (
                  stats.recentFiles.map((file, index) => (
                    <div key={file.id} className="flex items-center justify-between p-3 rounded-lg border">
                      <div className="flex-1">
                        <p className="font-medium truncate">{file.filename}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(file.upload_date).toLocaleDateString()}
                        </p>
                      </div>
                      <Badge variant="secondary">Indexed</Badge>
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground text-center py-4">No recent files</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
