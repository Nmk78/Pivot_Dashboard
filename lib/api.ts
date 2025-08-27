const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

interface ApiResponse<T> {
  data?: T
  error?: string
  status: number
}

// Auth token management
export const getAuthToken = (): string | null => {
  if (typeof window === "undefined") return null
  return localStorage.getItem("auth_token")
}

export const setAuthToken = (token: string): void => {
  if (typeof window === "undefined") return
  localStorage.setItem("auth_token", token)
}

export const removeAuthToken = (): void => {
  if (typeof window === "undefined") return
  localStorage.removeItem("auth_token")
}

// Generic API request function
export const apiRequest = async <T>(
  endpoint: string,
  options: RequestInit = {}
)
: Promise<ApiResponse<T>> =>
{
  const token = getAuthToken()
  const url = `${API_BASE_URL}${endpoint}`

  const config: RequestInit = {
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  }

  try {
    const response = await fetch(url, config)
    const data = await response.json()

    return {
      data: response.ok ? data : undefined,
      error: response.ok ? undefined : data.detail || "An error occurred",
      status: response.status,
    }
  } catch (error) {
    return {
      error: "Network error occurred",
      status: 0,
    }
  }
}

// Auth API functions
export const registerUser = async (userData: {
  email: string
  password: string
  username: string
  full_name: string
}) => {
  return apiRequest("/auth/register", {
    method: "POST",
    body: JSON.stringify(userData),
  })
}

export const loginUser = async (credentials: {
  username: string
  password: string
}) => {
  const formData = new FormData()
  formData.append("username", credentials.username)
  formData.append("password", credentials.password)

  return apiRequest("/auth/login", {
    method: "POST",
    headers: {},
    body: formData,
  })
}

export const getCurrentUser = async () => {
  return apiRequest("/auth/me")
}

export const updateCurrentUser = async (userData: {
  full_name?: string
  username?: string
}) => {
  return apiRequest("/auth/me", {
    method: "PUT",
    body: JSON.stringify(userData),
  })
}

// Chat API functions
export const createChatSession = async (sessionData?: {
  title?: string
  description?: string
}) => {
  return apiRequest("/chat/new-session", {
    method: "POST",
    body: sessionData ? JSON.stringify(sessionData) : undefined,
  })
}

export const getUserSessions = async (limit = 15, offset = 0) => {
  return apiRequest(`/chat/sessions?limit=${limit}&offset=${offset}`)
}

export const getChatSession = async (sessionId: string) => {
  return apiRequest(`/chat/sessions/${sessionId}`)
}

export const updateChatSession = async (
  sessionId: string,
  data: {
    title?: string
    description?: string
  },
) => {
  return apiRequest(`/chat/sessions/${sessionId}`, {
    method: "PUT",
    body: JSON.stringify(data),
  })
}

export const deleteChatSession = async (sessionId: string) => {
  return apiRequest(`/chat/sessions/${sessionId}`, {
    method: "DELETE",
  })
}

export const sendChatMessage = async (
  sessionId: string,
  message: {
    role: string
    content: string
    message_type?: string
    metadata?: object
  },
) => {
  return apiRequest(`/chat/sessions/${sessionId}/chat`, {
    method: "POST",
    body: JSON.stringify(message),
  })
}

export const getChatHistory = async (sessionId: string) => {
  return apiRequest(`/chat/sessions/${sessionId}/history`)
}

export const getSessionStats = async (sessionId: string) => {
  return apiRequest(`/chat/sessions/${sessionId}/stats`)
}

export const searchMessages = async (query: string, limit = 20) => {
  return apiRequest(`/chat/search?query=${encodeURIComponent(query)}&limit=${limit}`)
}

// File API functions
export const uploadFiles = async (files: FileList) => {
  const formData = new FormData()
  Array.from(files).forEach((file) => {
    formData.append("files", file)
  })

  return apiRequest("/files", {
    method: "POST",
    headers: {},
    body: formData,
  })
}

export const getUploadedFiles = async () => {
  return apiRequest("/files")
}

export const deleteFile = async (fileId: string) => {
  return apiRequest(`/file/${fileId}`, {
    method: "DELETE",
  })
}

// Speech API functions
export const speech = async (sessionId: string, audioFile: File) => {
  const formData = new FormData()
  formData.append("session_id", sessionId)
  formData.append("audio_file", audioFile)

  return apiRequest("/speech", {
    method: "POST",
    headers: {},
    body: formData,
  })
}

// Text with file API functions
export const textWithFile = async (
  sessionId: string,
  query: string,
  file: File,
  useAuth = false
) => {
  const formData = new FormData()
  formData.append("session_id", sessionId)
  formData.append("query", query)
  formData.append("file", file)

  const headers: Record<string, string> = {}
  if (useAuth) {
    const token = getAuthToken()
    if (token) {
      headers.Authorization = `Bearer ${token}`
    }
  }

  return apiRequest("/chat/text-with-file", {
    method: "POST",
    headers,
    body: formData,
  })
}
