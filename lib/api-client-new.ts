import axios, { type AxiosResponse, type AxiosError } from "axios"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

interface ApiResponse<T> {
  data?: T
  error?: string
  status: number
}

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
})

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

// Add request interceptor to include auth token
apiClient.interceptors.request.use((config) => {
  const token = getAuthToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Generic API request function using axios - NO BACKSLASHES
export const apiRequest = async <T,>(
  endpoint: string,
  options: {
    method?: string
    data?: any
    headers?: Record<string, string>
  } = {},
): Promise<ApiResponse<T>> => {
  try {
    const response: AxiosResponse<T> = await apiClient({
      url: endpoint,
      method: options.method || "GET",
      data: options.data,
      headers: options.headers,
    })

    return {
      data: response.data,
      status: response.status,
    }
  } catch (error) {
    const axiosError = error as AxiosError<any>
    return {
      error: axiosError.response?.data?.detail || axiosError.message || "An error occurred",
      status: axiosError.response?.status || 0,
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
    data: userData,
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
    data: formData,
    headers: { "Content-Type": "multipart/form-data" },
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
    data: userData,
  })
}

// Chat API functions
export const createChatSession = async (sessionData?: {
  title?: string
  description?: string
}) => {
  return apiRequest("/chat/new-session", {
    method: "POST",
    data: sessionData,
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
    data,
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
    data: message,
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
    data: formData,
    headers: { "Content-Type": "multipart/form-data" },
  })
}

interface UploadedFile {
  file_id: string
  filename: string
  created_at: string
}

export const getUploadedFiles = async (): Promise<ApiResponse<{ files: UploadedFile[] }>> => {
  return apiRequest<{ files: UploadedFile[] }>("/files")
}

export const deleteFile = async (fileId: string): Promise<ApiResponse<null>> => {
  return apiRequest<null>(`/file/${fileId}`, {
    method: "DELETE",
  })
}
