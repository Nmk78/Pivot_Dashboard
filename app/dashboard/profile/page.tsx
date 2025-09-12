// "use client";

// import { useState, useEffect } from "react";
// import { useRouter } from "next/navigation";
// import { Button } from "@/components/ui/button";
// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardHeader,
//   CardTitle,
// } from "@/components/ui/card";
// import { Avatar, AvatarFallback } from "@/components/ui/avatar";
// import { Badge } from "@/components/ui/badge";
// import { Separator } from "@/components/ui/separator";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// import { useAuth } from "@/hooks/use-auth";
// import { getUserSessions, updateCurrentUser } from "@/lib/api-client-new";
// import {
//   User,
//   Settings,
//   Shield,
//   MessageSquare,
//   Edit,
//   Save,
//   X,
//   Crown,
//   Users,
//   BarChart3,
//   Activity,
//   Clock,
//   LogOut,
// } from "lucide-react";

// interface UserStats {
//   totalSessions: number;
//   totalMessages: number;
//   joinDate: string;
//   lastActive: string;
// }

// export default function ProfilePage() {
//   const { user, loading, logout } = useAuth();
//   const router = useRouter();
//   const [isEditing, setIsEditing] = useState(false);
//   const [userStats, setUserStats] = useState<UserStats | null>(null);
//   const [editForm, setEditForm] = useState({
//     full_name: "",
//     email: "",
//     username: "",
//   });

//   useEffect(() => {
//     if (!loading && !user) {
//       router.push("/auth/login");
//     }

//     if (user) {
//       setEditForm({
//         full_name: user.full_name || "",
//         email: user.email || "",
//         username: user.username || "",
//       });
//       loadUserStats();
//     }
//   }, [user, loading, router]);

//   const loadUserStats = async () => {
//     try {
//       const response = await getUserSessions(100, 0);
//       if (response.data) {
//         const sessions = response.data as any[];
//         setUserStats({
//           totalSessions: sessions.length,
//           totalMessages: sessions.reduce(
//             (acc, session) => acc + (session.message_count || 0),
//             0
//           ),
//           joinDate: user?.created_at || new Date().toISOString(),
//           lastActive:
//             sessions[0]?.updated_at ||
//             user?.last_login ||
//             new Date().toISOString(),
//         });
//       }
//     } catch (error) {
//       console.error("Failed to load user stats:", error);
//     }
//   };

//   const handleSaveProfile = async () => {
//     try {
//       const response = await updateCurrentUser({
//         full_name: editForm.full_name,
//         username: editForm.username,
//       });

//       if (response.data) {
//         console.log("Profile updated successfully:", response.data);
//         setIsEditing(false);
//         window.location.reload();
//       } else {
//         console.error("Failed to update profile:", response.error);
//       }
//     } catch (error) {
//       console.error("Error updating profile:", error);
//     }
//   };

//   const formatDate = (dateString: string) => {
//     return new Date(dateString).toLocaleDateString("en-US", {
//       year: "numeric",
//       month: "long",
//       day: "numeric",
//     });
//   };

//   const formatLastActive = (dateString: string) => {
//     const date = new Date(dateString);
//     const now = new Date();
//     const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

//     if (diffInHours < 1) return "Active now";
//     if (diffInHours < 24) return `${Math.floor(diffInHours)} hours ago`;
//     if (diffInHours < 24 * 7) return `${Math.floor(diffInHours / 24)} days ago`;
//     return formatDate(dateString);
//   };

//   if (loading) {
//     return (
//       <div className="flex items-center justify-center h-full">
//         <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
//       </div>
//     );
//   }

//   if (!user) {
//     return (
//       <div className="flex items-center justify-center h-full p-8">
//         <Card className="w-full max-w-md text-center">
//           <CardHeader>
//             <User className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
//             <CardTitle>Access Denied</CardTitle>
//             <CardDescription>
//               Please log in to view your profile
//             </CardDescription>
//           </CardHeader>
//           <CardContent>
//             <Button
//               onClick={() => router.push("/auth/login")}
//               className="w-full"
//             >
//               Login
//             </Button>
//           </CardContent>
//         </Card>
//       </div>
//     );
//   }

//   const isAdmin = user.role === "admin";

//   console.log("🚀 ~ ProfilePage ~ sessions:", sessions)
//   return (
//     <div className="container mx-auto p-6 max-w-4xl">
//       <div className="space-y-6">
//         {/* Profile Header */}
//         <Card>
//           <CardHeader>
//             <div className="flex flex-col justify-center items-center space-y-4 md:flex-row md:items-start md:justify-between">
//               <div className="flex items-center space-x-4">
//                 <Avatar className=" size-14 md:size-20">
//                   <AvatarFallback className="text-lg">
//                     {(user.full_name || user.username || "U")
//                       .charAt(0)
//                       .toUpperCase()}
//                   </AvatarFallback>
//                 </Avatar>
//                 <div>
//                   <div className="flex items-center gap-2">
//                     <h1 className="text-2xl font-bold">
//                       {user.full_name || user.username}
//                     </h1>
//                     {isAdmin && (
//                       <Badge variant="default" className="bg-primary">
//                         <Crown className="h-3 w-3 mr-1" />
//                         Admin
//                       </Badge>
//                     )}
//                   </div>
//                   <p className="text-muted-foreground">{user.email}</p>
//                   {userStats && (
//                     <p className="text-sm text-muted-foreground mt-1">
//                       <Clock className="h-3 w-3 inline mr-1" />
//                       {formatLastActive(userStats.lastActive)}
//                     </p>
//                   )}
//                 </div>
//               </div>
//               <Button
//                 variant={isEditing ? "destructive" : "outline"}
//                 onClick={() => {
//                   if (isEditing) {
//                     setIsEditing(false);
//                     setEditForm({
//                       full_name: user.full_name || "",
//                       email: user.email || "",
//                       username: user.username || "",
//                     });
//                   } else {
//                     setIsEditing(true);
//                   }
//                 }}
//               >
//                 {isEditing ? (
//                   <X className="h-4 w-4 mr-2" />
//                 ) : (
//                   <Edit className="h-4 w-4 mr-2" />
//                 )}
//                 {isEditing ? "Cancel" : "Edit Profile"}
//               </Button>
//             </div>
//           </CardHeader>
//         </Card>

//         <Tabs defaultValue="overview" className="w-full">
//           <TabsList className="grid w-full grid-cols-2">
//             <TabsTrigger value="overview">Overview</TabsTrigger>
//             <TabsTrigger value="settings">Settings</TabsTrigger>
//             {/* {isAdmin && <TabsTrigger value="admin">Admin</TabsTrigger>} */}
//           </TabsList>

//           {/* Overview Tab */}
//           <TabsContent value="overview" className="space-y-6">
//             <div className="grid gap-6 md:grid-cols-2">
//               {/* Personal Information */}
//               <Card>
//                 <CardHeader>
//                   <CardTitle className="flex items-center gap-2">
//                     <User className="h-5 w-5" />
//                     Personal Information
//                   </CardTitle>
//                 </CardHeader>
//                 <CardContent className="space-y-4">
//                   <div className="flex space-x-2">
//                     <Label htmlFor="full_name">Full Name</Label>
//                     {isEditing ? (
//                       <Input
//                         id="full_name"
//                         value={editForm.full_name}
//                         onChange={(e) =>
//                           setEditForm((prev) => ({
//                             ...prev,
//                             full_name: e.target.value,
//                           }))
//                         }
//                       />
//                     ) : (
//                       <p className="text-sm text-muted-foreground">
//                         : {user.full_name || "Not provided"}
//                       </p>
//                     )}
//                   </div>

//                   <div className="flex space-x-2">
//                     <Label htmlFor="username">Username</Label>
//                     {isEditing ? (
//                       <Input
//                         id="username"
//                         value={editForm.username}
//                         onChange={(e) =>
//                           setEditForm((prev) => ({
//                             ...prev,
//                             username: e.target.value,
//                           }))
//                         }
//                       />
//                     ) : (
//                       <p className="text-sm text-muted-foreground">
//                         : {user.username}
//                       </p>
//                     )}
//                   </div>

//                   <div className="flex space-x-2">
//                     <Label htmlFor="email">Email</Label>
//                     {isEditing ? (
//                       <Input
//                         id="email"
//                         type="email"
//                         value={editForm.email}
//                         onChange={(e) =>
//                           setEditForm((prev) => ({
//                             ...prev,
//                             email: e.target.value,
//                           }))
//                         }
//                       />
//                     ) : (
//                       <p className="text-sm text-muted-foreground">
//                         : {user.email}
//                       </p>
//                     )}
//                   </div>

//                   <div className="flex space-x-2">
//                     <Label>Account Status</Label>
//                     <p className="text-sm text-muted-foreground capitalize">
//                       : {user.status || "Active"}
//                     </p>
//                   </div>

//                   {isEditing && (
//                     <Button onClick={handleSaveProfile} className="w-full">
//                       <Save className="h-4 w-4 mr-2" />
//                       Save Changes
//                     </Button>
//                   )}
//                 </CardContent>
//               </Card>

//               {/* Activity Stats */}
//               <Card>
//                 <CardHeader>
//                   <CardTitle className="flex items-center gap-2">
//                     <Activity className="h-5 w-5" />
//                     Activity Stats
//                   </CardTitle>
//                 </CardHeader>
//                 <CardContent>
//                   {userStats ? (
//                     <div className="space-y-4">
//                       <div className="flex items-center justify-between">
//                         <span className="text-sm text-muted-foreground">
//                           Total Sessions
//                         </span>
//                         <Badge variant="secondary">
//                           {userStats.totalSessions}
//                         </Badge>
//                       </div>
//                       <div className="flex items-center justify-between">
//                         <span className="text-sm text-muted-foreground">
//                           Total Messages
//                         </span>
//                         <Badge variant="secondary">
//                           {userStats.totalMessages}
//                         </Badge>
//                       </div>
//                       <div className="flex items-center justify-between">
//                         <span className="text-sm text-muted-foreground">
//                           Member Since
//                         </span>
//                         <span className="text-sm">
//                           {formatDate(userStats.joinDate)}
//                         </span>
//                       </div>
//                       <div className="flex items-center justify-between">
//                         <span className="text-sm text-muted-foreground">
//                           Last Active
//                         </span>
//                         <span className="text-sm">
//                           {formatLastActive(userStats.lastActive)}
//                         </span>
//                       </div>
//                     </div>
//                   ) : (
//                     <p className="text-sm text-muted-foreground">
//                       Loading stats...
//                     </p>
//                   )}
//                 </CardContent>
//               </Card>
//             </div>
//           </TabsContent>

//           {/* Settings Tab */}
//           <TabsContent value="settings" className="space-y-6">
//             <Card>
//               <CardHeader>
//                 <CardTitle className="flex items-center gap-2">
//                   <Settings className="h-5 w-5" />
//                   Account Settings
//                 </CardTitle>
//                 <CardDescription>
//                   Manage your account preferences and security settings
//                 </CardDescription>
//               </CardHeader>
//               <CardContent className="space-y-4">
//                 <div className="space-y-2">
//                   <Label>Account Type</Label>
//                   <div className="flex items-center gap-2">
//                     <Badge variant={isAdmin ? "default" : "secondary"}>
//                       {isAdmin ? "Administrator" : "User"}
//                     </Badge>
//                     {isAdmin && (
//                       <span className="text-sm text-muted-foreground">
//                         Full system access
//                       </span>
//                     )}
//                   </div>
//                 </div>

//                 <Separator />

//                 <div className="space-y-2">
//                   <Label>Account Information</Label>
//                   <div className="space-y-3">
//                     <div>
//                       <Label className="text-sm">User ID</Label>
//                       <p className="text-sm text-muted-foreground font-mono">
//                         {user.id}
//                       </p>
//                     </div>
//                     <div>
//                       <Label className="text-sm">Created</Label>
//                       <p className="text-sm text-muted-foreground">
//                         {formatDate(user.created_at)}
//                       </p>
//                     </div>
//                     <div>
//                       <Label className="text-sm">Last Login</Label>
//                       <p className="text-sm text-muted-foreground">
//                         {user.last_login
//                           ? formatLastActive(user.last_login)
//                           : "Never"}
//                       </p>
//                     </div>
//                   </div>
//                 </div>

//                 <Separator />

//                 <Button
//                   onClick={logout}
//                   variant="outline"
//                   className="w-full space-x-2 cursor-pointer"
//                 >
//                   <LogOut className="h-4 w-4" />
//                   Logout
//                 </Button>
//                 {/* <Button
//                                 variant="ghost"
//                                 onClick={logout}
//                                 className={cn("w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent", collapsed && "px-2")}
//                               >
//                                 <LogOut className="h-4 w-4" />
//                                 {!collapsed && <span className="ml-2">Logout</span>}
//                               </Button> */}
//               </CardContent>
//             </Card>
//           </TabsContent>

//           {/* Admin Tab - Only visible to admins */}
//           {/* {isAdmin && (
//             <TabsContent value="admin" className="space-y-6">
//               <Card>
//                 <CardHeader>
//                   <CardTitle className="flex items-center gap-2">
//                     <Shield className="h-5 w-5" />
//                     Admin Dashboard
//                   </CardTitle>
//                   <CardDescription>
//                     Administrative tools and system management
//                   </CardDescription>
//                 </CardHeader>
//                 <CardContent>
//                   <div className="grid gap-4 md:grid-cols-2">
//                     <Button variant="outline" className="h-20 flex-col">
//                       <Users className="h-6 w-6 mb-2" />
//                       <span>Manage Users</span>
//                     </Button>
//                     <Button variant="outline" className="h-20 flex-col">
//                       <BarChart3 className="h-6 w-6 mb-2" />
//                       <span>System Analytics</span>
//                     </Button>
//                     <Button variant="outline" className="h-20 flex-col">
//                       <MessageSquare className="h-6 w-6 mb-2" />
//                       <span>Chat Sessions</span>
//                     </Button>
//                     <Button variant="outline" className="h-20 flex-col">
//                       <Settings className="h-6 w-6 mb-2" />
//                       <span>System Settings</span>
//                     </Button>
//                   </div>
//                 </CardContent>
//               </Card>
//             </TabsContent>
//           )} */}
//         </Tabs>
//       </div>
//     </div>
//   );
// }


"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuth } from "@/hooks/use-auth"
import { getUserSessions, updateChatSession, updateCurrentUser } from "@/lib/api-client-new"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import { 
  User, 
  LogOut,
  Settings, 
  Shield, 
  MessageSquare, 
  Calendar, 
  Mail, 
  Phone, 
  MapPin, 
  Edit, 
  Save, 
  X,
  Crown,
  Users,
  BarChart3,
  Activity,
  Clock,
  Check,
  Edit2
} from "lucide-react"
import Link from "next/link"

interface UserStats {
  totalSessions: number
  totalMessages: number
  joinDate: string
  lastActive: string
}

export default function ProfilePage() {
  const { user, loading, logout, refreshUser } = useAuth()
  const router = useRouter()
  const [isEditing, setIsEditing] = useState(false)
  const [userStats, setUserStats] = useState<UserStats | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [loadingSessions, setLoadingSessions] = useState<boolean | null>(null)
  const [editingSession, setEditingSession] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState<string>("");
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);

  interface ChatSession {
    id: string;
    title: string;
    description: string;
    created_at: string;
    updated_at: string;
  }

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

  const [editForm, setEditForm] = useState({
    full_name: "",
    email: "",
    username: ""
  })

  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth/login")
    }
    
    if (user) {
      setEditForm({
        full_name: user.full_name || "",
        email: user.email || "",
        username: user.username || ""
      })
      loadUserStats()
      loadUserSessions()
    }
  }, [user, loading, router])

  const loadUserStats = async () => {
    try {
      const response = await getUserSessions(100, 0)
      if (response.data) {
        const sessions = response.data as any[]
        setUserStats({
          totalSessions: sessions.length,
          totalMessages: sessions.reduce((acc, session) => acc + (session.message_count || 0), 0),
          joinDate: user?.created_at || new Date().toISOString(),
          lastActive: sessions[0]?.updated_at || user?.last_login || new Date().toISOString()
        })
      }
    } catch (error) {
      console.error("Failed to load user stats:", error)
    }
  }

  const handleSaveProfile = async () => {
    if (!user) return
    
    setIsSaving(true)
    setSaveError(null)
    
    try {
      const updateData = {
        full_name: editForm.full_name.trim(),
        username: editForm.username.trim()
      }
      
      const response = await updateCurrentUser(updateData)
      
      if (response.data) {
        // Refresh user data to reflect changes
        await refreshUser()
      } else {
        setSaveError(response.error || "Failed to update profile")
        return
      }
    } catch (error) {
      setSaveError("Network error occurred while updating profile")
      return
    } finally {
      setIsSaving(false)
    }
    setIsEditing(false)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatLastActive = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)
    
    if (diffInHours < 1) return "Active now"
    if (diffInHours < 24) return `${Math.floor(diffInHours)} hours ago`
    if (diffInHours < 24 * 7) return `${Math.floor(diffInHours / 24)} days ago`
    return formatDate(dateString)
  }

  const formatSessionDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const startEditingSession = (session: ChatSession) => {
    setEditingSession(session.id)
    setEditTitle(session.title)
  }

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
    setEditingSession(null)
    setEditTitle("")
  }

  const handleSessionClick = (sessionId: string) => {
    setCurrentSessionId(sessionId)
    // TODO: Navigate to chat session or load session data
    console.log('Session clicked:', sessionId)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center h-full p-8">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <User className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>Please log in to view your profile</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.push("/auth/login")} className="w-full">
              Login
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const isAdmin = user.role === "admin"

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="space-y-6">
        {/* Profile Header */}
        <Card>
          <CardHeader>
            <div className="flex flex-col justify-center items-center space-y-4 md:flex-row md:items-start md:justify-between">
              <div className="flex items-center space-x-4">
                <Avatar className=" size-14 md:size-20">
                  <AvatarFallback className="text-lg">
                    {(user.full_name || user.username || '?').charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-2xl font-bold">{user.full_name || user.username}</h1>
                    {isAdmin && (
                      <Badge variant="default" className="bg-primary">
                        <Crown className="h-3 w-3 mr-1" />
                        Admin
                      </Badge>
                    )}
                  </div>
                  <p className="text-muted-foreground">{user.email}</p>
                  {userStats && (
                    <p className="text-sm text-muted-foreground mt-1">
                      <Clock className="h-3 w-3 inline mr-1" />
                      {formatLastActive(userStats.lastActive)}
                    </p>
                  )}
                </div>
              </div>
              <Button
                variant={isEditing ? "destructive" : "outline"}
                onClick={() => {
                  if (isEditing) {
                    setIsEditing(false)
                    setEditForm({
                      full_name: user.full_name || "",
                      email: user.email || "",
                      username: user.username || ""
                    })
                  } else {
                    setIsEditing(true)
                  }
                }}
              >
                {isEditing ? <X className="h-4 w-4 mr-2" /> : <Edit className="h-4 w-4 mr-2" />}
                {isEditing ? "Cancel" : "Edit Profile"}
              </Button>
            </div>
          </CardHeader>
        </Card>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="recentsessions">Chat Sessions</TabsTrigger>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              {/* Personal Information */}
              <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Personal Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex space-x-2">
              <Label htmlFor="full_name">Full Name</Label>
              {isEditing ? (
                <Input
            id="full_name"
            value={editForm.full_name}
            onChange={(e) => setEditForm(prev => ({ ...prev, full_name: e.target.value }))}
                />
              ) : (
                <p className="text-sm text-muted-foreground">: {user.full_name || "Not provided"}</p>
              )}
            </div>
            
            <div className="flex space-x-2">
              <Label htmlFor="username">Username</Label>
              {isEditing ? (
                <Input
            id="username"
            value={editForm.username}
            onChange={(e) => setEditForm(prev => ({ ...prev, username: e.target.value }))}
                />
              ) : (
                <p className="text-sm text-muted-foreground">: {user.username}</p>
              )}
            </div>
            
            <div className="flex space-x-2">
              <Label htmlFor="email">Email</Label>
              {isEditing ? (
                <Input
            id="email"
            type="email"
            value={editForm.email}
            onChange={(e) => setEditForm(prev => ({ ...prev, email: e.target.value }))}
                />
              ) : (
                <p className="text-sm text-muted-foreground">: {user.email}</p>
              )}
            </div>

            <div className="flex space-x-2">
              <Label>Account Status</Label>
              <p className="text-sm text-muted-foreground capitalize">: {user.status || "Active"}</p>
            </div>

            {isEditing && (
              <Button 
                onClick={handleSaveProfile} 
                className="w-full"
                disabled={isSaving}
              >
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </Button>
            )}
          </CardContent>
              </Card>

              {/* Activity Stats */}
              <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Activity Stats
            </CardTitle>
          </CardHeader>
          <CardContent>
            {userStats ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Total Sessions</span>
            <Badge variant="secondary">{userStats.totalSessions}</Badge>
                </div>
                <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Total Messages</span>
            <Badge variant="secondary">{userStats.totalMessages}</Badge>
                </div>
                <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Member Since</span>
            <span className="text-sm">{formatDate(userStats.joinDate)}</span>
                </div>
                <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Last Active</span>
            <span className="text-sm">{formatLastActive(userStats.lastActive)}</span>
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Loading stats...</p>
            )}
          </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Account Settings
          </CardTitle>
          <CardDescription>
            Manage your account preferences and security settings
          </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Account Type</Label>
            <div className="flex items-center gap-2">
              <Badge variant={isAdmin ? "default" : "secondary"}>
                {isAdmin ? "Administrator" : "User"}
              </Badge>
              {isAdmin && <span className="text-sm text-muted-foreground">Full system access</span>}
            </div>
          </div>

          <Separator />

          <div className="space-y-2">
            <Label>Account Information</Label>
            <div className="space-y-3">
              <div>
                <Label className="text-sm">User ID</Label>
                <p className="text-sm text-muted-foreground font-mono">{user.id}</p>
              </div>
              <div>
                <Label className="text-sm">Created</Label>
                <p className="text-sm text-muted-foreground">{formatDate(user.created_at)}</p>
              </div>
              <div>
                <Label className="text-sm">Last Login</Label>
                <p className="text-sm text-muted-foreground">{user.last_login ? formatLastActive(user.last_login) : "Never"}</p>
              </div>
            </div>
          </div>

          <Separator />

          <div className="space-y-2">
            <Label>Security</Label>
            <Button onClick={logout} variant="outline" className="w-full space-x-2 cursor-pointer">
              <LogOut className="h-4 w-4" /> 
              Logout
            </Button>
          </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Recent Sessions Tab */}
          <TabsContent value="recentsessions" className="space-y-6">
            <Card>
              <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Chat Sessions
              </CardTitle>
              <CardDescription>
                View and manage your recent chat sessions
              </CardDescription>
              </CardHeader>
              <CardContent>
              {user && sessions.length > 0 ? (
                <>
                <Separator className="my-4 bg-sidebar-border" />
                <div className="space-y-1 w-auto overflow-hidden">
                  <h3 className="text-xs font-semibold text-muted-foreground px-2 mb-2">
                  Recent Sessions
                  </h3>
                  
                  <ScrollArea className="flex-1 overflow-y-scroll max-h-96 ">
                  {sessions.map((session) => (
                    <Link href={`/chat?session=${session.id}`} key={session.id} className="group">
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
                        <X className="h-3 w-3" />
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
                          <Edit2 className="h-3 w-3 p-2" />
                        </Button>
                        </div>
                        <p className="text-xs text-muted-foreground truncate">
                        {formatSessionDate(session.updated_at)}
                        </p>
                      </div>
                      </Button>
                    )}
                    </Link>
                  ))}
                  </ScrollArea>
                </div>
                </>
              ) : (
                <p className="text-sm text-muted-foreground">
                No recent sessions available.
                </p>
              )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}