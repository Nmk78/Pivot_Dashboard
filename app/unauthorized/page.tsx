"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ShieldX, Home, LogOut } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { useRouter } from "next/navigation"

export default function UnauthorizedPage() {
  const { logout } = useAuth()
  const router = useRouter()

  const handleGoHome = () => {
    router.push("/")
  }

  const handleLogout = () => {
    logout()
    router.push("/auth/login")
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-900 via-gray-900 to-zinc-900 flex items-center justify-center p-4">
    {/* <div className="min-h-screen w-full bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4"> */}
      <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />
      
      <Card className="w-full max-w-md relative z-10 bg-slate-800/50 border-slate-700 backdrop-blur-sm">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-500/10">
            <ShieldX className="h-8 w-8 text-red-500" />
          </div>
          <CardTitle className="text-2xl font-bold text-white">Access Denied</CardTitle>
          <CardDescription className="text-slate-300">
            You don't have permission to access the dashboard. Admin privileges are required.
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="text-center text-sm text-slate-400 mb-6">
            Contact your administrator if you believe this is an error.
          </div>
          
          <div className="flex flex-col gap-3">
            <Button 
              onClick={handleGoHome}
              variant="outline" 
              className="w-full border-slate-600 bg-slate-700/50 text-white hover:bg-slate-600"
            >
              <Home className="mr-2 h-4 w-4" />
              Go to Home
            </Button>
            
            <Button 
              onClick={handleLogout}
              variant="destructive" 
              className="w-full"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
        </CardContent>
      </Card>
      
      {/* Decorative elements */}
      <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-purple-500 rounded-full animate-ping opacity-20" />
      <div className="absolute top-3/4 right-1/4 w-1 h-1 bg-blue-500 rounded-full animate-pulse opacity-30" />
      <div className="absolute bottom-1/4 left-1/3 w-1.5 h-1.5 bg-pink-500 rounded-full animate-ping opacity-25" />
    </div>
  )
}
