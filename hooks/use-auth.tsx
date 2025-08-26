"use client"

import { useState, useEffect, createContext, useContext, type ReactNode } from "react"
import { getCurrentUser, loginUser, registerUser, removeAuthToken, setAuthToken } from "@/lib/api-client-new"

interface User {
  id: string
  email: string
  username: string
  full_name: string
  role: "user" | "admin"
  status: string
  created_at: string
  last_login: string | null
}

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (credentials: { username: string; password: string }) => Promise<{ success: boolean; error?: string }>
  register: (userData: { email: string; password: string; username: string; full_name: string }) => Promise<{
    success: boolean
    error?: string
  }>
  logout: () => void
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  const refreshUser = async () => {
    try {
      const response = await getCurrentUser()
      if (response.data) {
        setUser(response.data as User)
      } else {
        setUser(null)
        removeAuthToken()
      }
    } catch (error) {
      setUser(null)
      removeAuthToken()
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    refreshUser()
  }, [])

  const login = async (credentials: { username: string; password: string }) => {
    try {
      const response = await loginUser(credentials)
      if (response.data && response.data.access_token) {
        setAuthToken(response.data.access_token)
        if(response.data.user.role !== "admin"){
          return { success: false, error: response.error || "You are not authorized to login as admin" }
        }
        setUser(response.data.user)
        return { success: true }
      } else {
        return { success: false, error: response.error || "Login failed" }
      }
    } catch (error) {
      return { success: false, error: "Network error occurred" }
    }
  }

  const register = async (userData: { email: string; password: string; username: string; full_name: string }) => {
    try {
      const response = await registerUser(userData)
      if (response.data) {
        return { success: true }
      } else {
        return { success: false, error: response.error || "Registration failed" }
      }
    } catch (error) {
      return { success: false, error: "Network error occurred" }
    }
  }

  const logout = () => {
    removeAuthToken()
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
