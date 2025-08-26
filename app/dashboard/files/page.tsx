"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { getUploadedFiles, uploadFiles, deleteFile } from "@/lib/api-client-new"
import { useAuth } from "@/hooks/use-auth"
import { Loader2, Upload, FileText, Trash2, Search, Download } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface UploadedFile {
  id: string
  filename: string
  upload_date: string
  size: number
}

export default function FilesPage() {
  const [files, setFiles] = useState<UploadedFile[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const { user } = useAuth()
  const { toast } = useToast()

  const isAdmin = user?.role === "admin"

  useEffect(() => {
    loadFiles()
  }, [])

  const loadFiles = async () => {
    try {
      const response = await getUploadedFiles()
      if (response.data?.files) {
        setFiles(response.data.files)
      }
    } catch (error) {
      console.error("Failed to load files:", error)
      toast({
        title: "Error",
        description: "Failed to load files",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = event.target.files
    if (!selectedFiles || selectedFiles.length === 0) return

    if (!isAdmin) {
      toast({
        title: "Access Denied",
        description: "Only admin users can upload files",
        variant: "destructive",
      })
      return
    }

    setUploading(true)
    try {
      const response = await uploadFiles(selectedFiles)
      if (response.data) {
        loadFiles()
        toast({
          title: "Success",
          description: `${selectedFiles.length} file(s) uploaded successfully`,
        })
      }
    } catch (error) {
      console.error("Failed to upload files:", error)
      toast({
        title: "Error",
        description: "Failed to upload files",
        variant: "destructive",
      })
    } finally {
      setUploading(false)
      // Reset input
      event.target.value = ""
    }
  }

  const handleDeleteFile = async (fileId: string) => {
    if (!isAdmin) {
      toast({
        title: "Access Denied",
        description: "Only admin users can delete files",
        variant: "destructive",
      })
      return
    }

    try {
      await deleteFile(fileId)
      setFiles((prev) => prev.filter((f) => f.id !== fileId))
      toast({
        title: "Success",
        description: "File deleted successfully",
      })
    } catch (error) {
      console.error("Failed to delete file:", error)
      toast({
        title: "Error",
        description: "Failed to delete file",
        variant: "destructive",
      })
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  const filteredFiles = files.filter((file) => file.filename.toLowerCase().includes(searchQuery.toLowerCase()))

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold font-playfair">File Management</h1>
            <p className="text-muted-foreground">Upload and manage documents for RAG processing</p>
          </div>
          {isAdmin && (
            <div className="relative">
              <input
                type="file"
                multiple
                onChange={handleFileUpload}
                disabled={uploading}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                accept=".pdf,.doc,.docx,.txt"
              />
              <Button disabled={uploading}>
                {uploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
                Upload Files
              </Button>
            </div>
          )}
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search files..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {!isAdmin && (
          <div className="mt-4 p-3 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground">
              <strong>Note:</strong> Only admin users can upload and delete files. Contact your administrator to manage
              files.
            </p>
          </div>
        )}
      </div>

      {/* Files List */}
      <ScrollArea className="flex-1 p-6">
        {filteredFiles.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">No files found</h3>
            <p className="text-muted-foreground mb-4">
              {searchQuery ? "Try adjusting your search terms" : "No files have been uploaded yet"}
            </p>
            {isAdmin && !searchQuery && (
              <div className="relative inline-block">
                <input
                  type="file"
                  multiple
                  onChange={handleFileUpload}
                  disabled={uploading}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  accept=".pdf,.doc,.docx,.txt"
                />
                <Button disabled={uploading}>
                  <Upload className="mr-2 h-4 w-4" />
                  Upload First File
                </Button>
              </div>
            )}
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredFiles.map((file) => (
              <Card key={file.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg truncate flex items-center gap-2">
                        <FileText className="h-5 w-5 text-primary" />
                        {file.filename}
                      </CardTitle>
                      <CardDescription className="mt-1">{formatFileSize(file.size)}</CardDescription>
                    </div>
                    {isAdmin && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteFile(file.id)}
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between text-sm text-muted-foreground mb-3">
                    <span>Uploaded: {new Date(file.upload_date).toLocaleDateString()}</span>
                    <Badge variant="secondary">Indexed</Badge>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1 bg-transparent">
                      <Download className="mr-2 h-3 w-3" />
                      Download
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  )
}
