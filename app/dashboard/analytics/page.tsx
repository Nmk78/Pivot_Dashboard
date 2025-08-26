"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { getUserSessions, getUploadedFiles } from "@/lib/api-client-new"
import { useAuth } from "@/hooks/use-auth"
import { Loader2, MessageSquare, FileText, TrendingUp, Zap } from "lucide-react"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"

interface AnalyticsData {
  totalSessions: number
  totalFiles: number
  totalMessages: number
  avgResponseTime: number
  sessionsThisWeek: number
  filesThisWeek: number
}

const chartColors = {
  primary: "hsl(var(--chart-1))",
  secondary: "hsl(var(--chart-2))",
  tertiary: "hsl(var(--chart-3))",
  quaternary: "hsl(var(--chart-4))",
  quinary: "hsl(var(--chart-5))",
}

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

  useEffect(() => {
    loadAnalytics()
  }, [])

  const loadAnalytics = async () => {
    try {
      // Load sessions and files data
      const [sessionsResponse, filesResponse] = await Promise.all([getUserSessions(100, 0), getUploadedFiles()])

      const sessions = sessionsResponse.data || []
      const files = filesResponse.data?.files || []

      // Calculate analytics
      const now = new Date()
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

      const sessionsThisWeek = sessions.filter((s) => new Date(s.created_at) >= weekAgo).length

      const filesThisWeek = files.filter((f) => new Date(f.upload_date) >= weekAgo).length

      setAnalytics({
        totalSessions: sessions.length,
        totalFiles: files.length,
        totalMessages: sessions.length * 5, // Estimated
        avgResponseTime: 1200, // Mock data
        sessionsThisWeek,
        filesThisWeek,
      })
    } catch (error) {
      console.error("Failed to load analytics:", error)
    } finally {
      setLoading(false)
    }
  }

  // Mock chart data
  const weeklyData = [
    { day: "Mon", sessions: 12, messages: 45 },
    { day: "Tue", sessions: 19, messages: 67 },
    { day: "Wed", sessions: 15, messages: 52 },
    { day: "Thu", sessions: 22, messages: 78 },
    { day: "Fri", sessions: 18, messages: 61 },
    { day: "Sat", sessions: 8, messages: 23 },
    { day: "Sun", sessions: 11, messages: 34 },
  ]

  const usageData = [
    { name: "Text Chat", value: 65, color: chartColors.primary },
    { name: "File Upload", value: 20, color: chartColors.secondary },
    { name: "Speech", value: 10, color: chartColors.tertiary },
    { name: "Search", value: 5, color: chartColors.quaternary },
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="h-full">
      <ScrollArea className="h-full p-6">
        <div className="space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-2xl font-bold font-playfair">Analytics Dashboard</h1>
            <p className="text-muted-foreground">Monitor your RAG chatbot performance and usage</p>
          </div>

          {/* Stats Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Sessions</CardTitle>
                <MessageSquare className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics?.totalSessions || 0}</div>
                <p className="text-xs text-muted-foreground">+{analytics?.sessionsThisWeek || 0} this week</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Files</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics?.totalFiles || 0}</div>
                <p className="text-xs text-muted-foreground">+{analytics?.filesThisWeek || 0} this week</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Messages</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics?.totalMessages || 0}</div>
                <p className="text-xs text-muted-foreground">Across all sessions</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
                <Zap className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics?.avgResponseTime || 0}ms</div>
                <p className="text-xs text-muted-foreground">
                  <Badge variant="secondary" className="text-xs">
                    Fast
                  </Badge>
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Charts */}
          <div className="grid gap-6 md:grid-cols-2">
            {/* Weekly Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Weekly Activity</CardTitle>
                <CardDescription>Sessions and messages over the past week</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  config={{
                    sessions: {
                      label: "Sessions",
                      color: chartColors.primary,
                    },
                    messages: {
                      label: "Messages",
                      color: chartColors.secondary,
                    },
                  }}
                  className="h-[300px]"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={weeklyData}>
                      <XAxis dataKey="day" />
                      <YAxis />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Bar dataKey="sessions" fill={chartColors.primary} />
                      <Bar dataKey="messages" fill={chartColors.secondary} />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>

            {/* Usage Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Feature Usage</CardTitle>
                <CardDescription>Distribution of feature usage</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  config={{
                    usage: {
                      label: "Usage",
                    },
                  }}
                  className="h-[300px]"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={usageData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {usageData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <ChartTooltip content={<ChartTooltipContent />} />
                    </PieChart>
                  </ResponsiveContainer>
                </ChartContainer>
                <div className="mt-4 grid grid-cols-2 gap-2">
                  {usageData.map((item, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                      <span className="text-sm">
                        {item.name}: {item.value}%
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* User Info */}
          {user && (
            <Card>
              <CardHeader>
                <CardTitle>Account Information</CardTitle>
                <CardDescription>Your account details and role</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <p className="text-sm font-medium">Full Name</p>
                    <p className="text-sm text-muted-foreground">{user.full_name || "Not set"}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Username</p>
                    <p className="text-sm text-muted-foreground">{user.username}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Email</p>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Role</p>
                    <Badge variant={user.role === "admin" ? "default" : "secondary"}>{user.role}</Badge>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Member Since</p>
                    <p className="text-sm text-muted-foreground">{new Date(user.created_at).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Last Login</p>
                    <p className="text-sm text-muted-foreground">
                      {user.last_login ? new Date(user.last_login).toLocaleDateString() : "Never"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </ScrollArea>
    </div>
  )
}
