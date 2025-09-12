"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { AutosizeTextarea } from "@/components/ui/autosize-textarea"
import { Card } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Loader2, Send, User, Bot, Paperclip, Mic, MicOff, Play, Pause, FileText, Image, Video, Music, X } from "lucide-react"
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { sendChatMessage, getChatHistory, speech, textWithFile } from "@/lib/api"
import { useAuth } from "@/hooks/use-auth"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  created_at: string
  attachments?: {
    id: string
    name: string
    type: string
    size: number
    url?: string
  }[]
  audio_url?: string
}

interface ChatInterfaceProps {
  sessionId: string
}

export function ChatInterface({ sessionId }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)
  const [isRecording, setIsRecording] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [attachments, setAttachments] = useState<File[]>([])
  const [showAttachmentDialog, setShowAttachmentDialog] = useState(false)
  const [playingAudio, setPlayingAudio] = useState<string | null>(null)
  
  const viewportRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  
  const { user } = useAuth()

  // Load chat history
  useEffect(() => {
    const loadHistory = async () => {
      try {
        const response = await getChatHistory(sessionId)
        if (response.data && Array.isArray(response.data)) {
          setMessages(response.data)
        } else if (response.data && (response.data as any).messages) {
          setMessages((response.data as any).messages)
        }
      } catch (error) {
        console.error("Failed to load chat history:", error)
      } finally {
        setInitialLoading(false)
      }
    }

    if (sessionId) {
      loadHistory()
    }
  }, [sessionId])

  const scrollToBottom = () => {
    if (viewportRef.current) {
      setTimeout(() => {
        if (viewportRef.current) {
          viewportRef.current.scrollTop = viewportRef.current.scrollHeight;
        }
      }, 0);
    }
  };

  // Auto-scroll to bottom
  useEffect(() => {
    console.log("Scrolling to bottom")
    scrollToBottom();
  }, [messages]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current)
      }
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop()
      }
      if (audioRef.current) {
        audioRef.current.pause()
      }
    }
  }, [])

  const handleSendMessage = async (audioBlob?: Blob) => {
    if ((!input.trim() && attachments.length === 0 && !audioBlob) || loading) return

    const messageAttachments = attachments.map(file => ({
      id: Date.now().toString() + Math.random(),
      name: file.name,
      type: file.type,
      size: file.size,
    }))

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim() || (audioBlob ? "[Voice message]" : "[File attachment]"),
      created_at: new Date().toISOString(),
      attachments: messageAttachments.length > 0 ? messageAttachments : undefined,
      audio_url: audioBlob ? URL.createObjectURL(audioBlob) : undefined,
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setAttachments([])
    setLoading(true)

    try {
      let response
      
      if (audioBlob) {
        // Handle speech input using speech function
        const audioFile = new File([audioBlob], 'voice-message.wav', { type: 'audio/wav' })
        response = await speech(sessionId, audioFile)
      } else if (attachments.length > 0) {
        // Handle text with file using textWithFile function
        const query = input.trim() || "What is this file about?"
        response = await textWithFile(sessionId, query, attachments[0], true)
      } else {
        // Handle regular text message using sendChatMessage function
        response = await sendChatMessage(sessionId, {
          role: "user",
          content: userMessage.content,
          message_type: "text",
        })
      }
      console.log("🚀 ~ handleSendMessage ~ response:", response)

      if (response.data) {
        let assistantContent = ""
        let assistantId = ""
        let assistantCreatedAt = ""
        
        if (audioBlob) {
          // Speech response format
          assistantContent = (response.data as any).response || (response.data as any).content || "Speech processed successfully"
          assistantId = (response.data as any).audio_file_id || Date.now().toString()
          assistantCreatedAt = new Date().toISOString()
        } else if (attachments.length > 0) {
          // Text with file response format
          assistantContent = (response.data as any).response || (response.data as any).content || "File processed successfully"
          assistantId = Date.now().toString()
          assistantCreatedAt = new Date().toISOString()
        } else {
          // Regular chat response format
          assistantContent = (response.data as any).content || "Message sent successfully"
          assistantId = (response.data as any).message_id || Date.now().toString()
          assistantCreatedAt = (response.data as any).created_at || new Date().toISOString()
        }
        
        const assistantMessage: Message = {
          id: assistantId,
          role: "assistant",
          content: assistantContent,
          created_at: assistantCreatedAt,
        }
        setMessages((prev) => [...prev, assistantMessage])
      }else if(response.error){
        const errorMessage: Message = {
          id: Date.now().toString(),
          role: "assistant",
          content: response.error,
          created_at: new Date().toISOString(),
        }
        setMessages((prev) => [...prev, errorMessage])
      }
    } catch (error) {
      console.error("Failed to send message:", error)
      
      let errorContent = "Sorry, I encountered an error. Please try again."
      
      // Handle specific error types
      if (error && typeof error === 'object' && 'message' in error) {
        const errorMessage = (error as any).message
        if (errorMessage?.includes('Unsupported file type')) {
          errorContent = "This file type is not supported. Please try uploading a different file format (PDF, TXT, DOC, etc.)."
        }
      }
      
      // Handle API response errors
      if (error && typeof error === 'object' && 'detail' in error) {
        const detail = (error as any).detail
        if (typeof detail === 'string' && detail.includes('Unsupported file type')) {
          const fileType = detail.match(/Unsupported file type: (\.\w+)/)?.[1] || 'this file type'
          errorContent = `${fileType} files are not supported. Please try uploading a different file format (PDF, TXT, DOC, DOCX, etc.).`
        }
      }
      
      const errorMessage: Message = {
        id: Date.now().toString(),
        role: "assistant",
        content: errorContent,
        created_at: new Date().toISOString(),
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      audioChunksRef.current = []

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data)
      }

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' })
        handleSendMessage(audioBlob)
        stream.getTracks().forEach(track => track.stop())
      }

      mediaRecorder.start()
      setIsRecording(true)
      setRecordingTime(0)
      
      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1)
      }, 1000)
    } catch (error) {
      console.error('Error accessing microphone:', error)
      alert('Could not access microphone. Please check permissions.')
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop()
    }
    if (recordingIntervalRef.current) {
      clearInterval(recordingIntervalRef.current)
    }
    setIsRecording(false)
    setRecordingTime(0)
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    setAttachments(prev => [...prev, ...files])
    setShowAttachmentDialog(false)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index))
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return <Image className="h-4 w-4" />
    if (type.startsWith('video/')) return <Video className="h-4 w-4" />
    if (type.startsWith('audio/')) return <Music className="h-4 w-4" />
    return <FileText className="h-4 w-4" />
  }

  const toggleAudioPlayback = (audioUrl: string) => {
    if (playingAudio === audioUrl) {
      audioRef.current?.pause()
      setPlayingAudio(null)
    } else {
      if (audioRef.current) {
        audioRef.current.pause()
      }
      audioRef.current = new Audio(audioUrl)
      audioRef.current.play()
      setPlayingAudio(audioUrl)
      audioRef.current.onended = () => setPlayingAudio(null)
    }
  }

  const formatRecordingTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  if (initialLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    
    <div className="flex flex-col min-w-full w-full h-full overflow-hidden">
    {/* <div className="flex min-w-full h-full"> */}
      
      {/* <div className="flex-1"> */}
      {/* <div className="flex flex-col h-screen hide-scrollbar"> */}
      {/* Messages */}
      <ScrollArea className={`flex-1 min-w-full w-full h-[calc(100vh-200px)] p-4 mt-10 md:mt-0  ${messages.length === 0 ? 'mt-20 md:mt-0' : ''}`} viewportRef={viewportRef}>
        {/* <div className="space-y-4  overflow-y-hidden"> */}
          {messages.length === 0 ? (
            <div className="text-center text-muted-foreground">
              <Bot className="h-12 w-12 mx-auto mb-4 text-primary" />
              <h3 className="text-lg font-semibold mb-2">Start a conversation</h3>
              <p>Ask me anything about your documents or just chat!</p>
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 my-1 ${message.role === "user" ? "justify-end" : "justify-start"}`}
              >
                {message.role === "assistant" && (
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>
                      <Bot className="h-4 w-4 text-primary-foreground" />
                    </AvatarFallback>
                  </Avatar>
                )}
                <Card
                  className={`max-w-[80%] p-3 ${
                    message.role === "user" ? "bg-primary text-primary-foreground" : "bg-card"
                  }`}
                >
                  {/* Audio message */}
                  {message.audio_url && (
                    <div className="mb-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleAudioPlayback(message.audio_url!)}
                        className={`p-2 ${
                          message.role === "user" 
                            ? "hover:bg-primary-foreground/20 text-primary-foreground" 
                            : "hover:bg-muted"
                        }`}
                      >
                        {playingAudio === message.audio_url ? (
                          <Pause className="h-4 w-4 mr-2" />
                        ) : (
                          <Play className="h-4 w-4 mr-2" />
                        )}
                        Voice message
                      </Button>
                    </div>
                  )}
                  
                  {/* File attachments */}
                  {message.attachments && message.attachments.length > 0 && (
                    <div className="mb-2 space-y-1">
                      {message.attachments.map((attachment) => (
                        <div
                          key={attachment.id}
                          className={`flex items-center gap-2 p-2 rounded border ${
                            message.role === "user"
                              ? "border-primary-foreground/20 bg-primary-foreground/10"
                              : "border-border bg-muted/50"
                          }`}
                        >
                          {getFileIcon(attachment.type)}
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium truncate">{attachment.name}</p>
                            <p className="text-xs opacity-70">{formatFileSize(attachment.size)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  {/* Text content */}
                  {message.content && !message.content.startsWith('[') && (
                    <div className="prose prose-sm dark:prose-invert max-w-none">
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={{
                          p: ({node, ...props}) => <p className="mb-2 last:mb-0" {...props} />,
                        }}
                      >
                        {message.content}
                      </ReactMarkdown>
                    </div>
                  )}
                                    
                  <p
                    className={`text-xs mt-2 opacity-70 ${
                      message.role === "user" ? "text-primary-foreground" : "text-muted-foreground"
                    }`}
                  >
                    {new Date(message.created_at).toLocaleTimeString()}
                  </p>
                </Card>
                {message.role === "user" && (
                  <Avatar className="h-8 w-8 bg-secondary">
                    <AvatarFallback>
                      <User className="h-4 w-4 text-secondary-foreground" />
                    </AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))
          )}
          {loading && (
            <div className="flex gap-3 justify-start">
              <Avatar className="h-8 w-8 bg-primary">
                <AvatarFallback>
                  <Bot className="h-4 w-4 text-primary-foreground" />
                </AvatarFallback>
              </Avatar>
              <Card className="bg-card p-3">
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm text-muted-foreground">Thinking...</span>
                </div>
              </Card>
            </div>
          )}
        {/* </div> */}
      </ScrollArea>

      {/* Input */}
      <div className="p-4 border-t border-border ">
        {/* Attachments Preview */}
        {attachments.length > 0 && (
          <div className="mb-3 flex flex-wrap gap-2">
            {attachments.map((file, index) => (
              <div key={index} className="flex items-center gap-2 bg-muted px-3 py-2 rounded-lg">
                {getFileIcon(file.type)}
                <span className="text-sm truncate max-w-32">{file.name}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeAttachment(index)}
                  className="h-4 w-4 p-0 hover:bg-destructive hover:text-destructive-foreground"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        )}
        
        {/* Recording indicator */}
        {isRecording && (
          <div className="mb-3 flex items-center gap-2 bg-red-50 dark:bg-red-950 px-3 py-2 rounded-lg">
            <div className="h-2 w-2 bg-red-500 rounded-full animate-pulse" />
            <span className="text-sm text-red-600 dark:text-red-400">
              Recording... {formatRecordingTime(recordingTime)}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={stopRecording}
              className="ml-auto h-6 text-red-600 hover:text-red-700 hover:bg-red-100 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-900"
            >
              Stop
            </Button>
          </div>
        )}
        
        <div className="flex gap-2 ">
          {/* File attachment button */}
          <Dialog open={showAttachmentDialog} onOpenChange={setShowAttachmentDialog}>
            <DialogTrigger asChild>
              <Button variant="outline" size="icon" className="shrink-0 bg-transparent mt-auto">
                <Paperclip className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Attach Files</DialogTitle>
                <DialogDescription>
                  Select files to attach to your message. Supported formats: images, documents, audio, and video.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4">
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full"
                >
                  <Paperclip className="mr-2 h-4 w-4" />
                  Choose Files
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  onChange={handleFileSelect}
                  className="hidden"
                  accept="*/*"
                />
              </div>
            </DialogContent>
          </Dialog>
          
          {/* Voice recording button */}
          <Button
            variant="outline"
            size="icon"
            className="shrink-0 bg-transparent mt-auto"
            onClick={isRecording ? stopRecording : startRecording}
            disabled={loading}
          >
            {isRecording ? (
              <MicOff className="h-4 w-4 text-red-500" />
            ) : (
              <Mic className="h-4 w-4" />
            )}
          </Button>
          
          {/* Text input */}
          <AutosizeTextarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="ask something..."
            disabled={loading || isRecording}
            className="flex-1 min-h-[32px] w-0 min-w-0 resize-none border-primary"
            minHeight={32}
            maxHeight={150}
          />
          
          {/* Send button */}
          <Button 
            onClick={() => handleSendMessage()} 
            disabled={(!input.trim() && attachments.length === 0) || loading || isRecording} 
            className="shrink-0 mt-auto"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </div>
      {/* </div> */}
    {/* </div> */}
    </div>
    </div>
  );
}
