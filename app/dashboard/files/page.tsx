"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  getUploadedFiles,
  uploadFiles,
  deleteFile,
} from "@/lib/api-client-new";
import { useAuth } from "@/hooks/use-auth";
import {
  Loader2,
  Upload,
  FileText,
  Trash2,
  Search,
  Download,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface UploadedFile {
  file_id: string;
  filename: string;
  created_at: string;
}

export default function FilesPage() {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const itemsPerPage = 9; // Number of files per page
  const { user } = useAuth();
  const { toast } = useToast();

  const isAdmin = user?.role === "admin";

  useEffect(() => {
    loadFiles();
  }, [currentPage]);

  const loadFiles = async () => {
    try {
      setLoading(true);
      const response = await getUploadedFiles(currentPage, itemsPerPage);
      console.log("🚀 ~ loadFiles ~ response:", response)
      if (response.data) {
        setFiles(response.data.files);
        setTotalPages(response.data.total_pages);
        setTotalCount(response.data.total_count);
      }
    } catch (error) {
      console.error("Failed to load files:", error);
      toast({
        title: "Error",
        description: "Failed to load files",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const selectedFiles = event.target.files;
    if (!selectedFiles || selectedFiles.length === 0) return;

    if (!isAdmin) {
      toast({
        title: "Access Denied",
        description: "Only admin users can upload files",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    try {
      const response = await uploadFiles(selectedFiles);
      if (response.data) {
        loadFiles();
        toast({
          title: "Success",
          description: `${selectedFiles.length} file(s) uploaded successfully`,
        });
      }
    } catch (error) {
      console.error("Failed to upload files:", error);
      toast({
        title: "Error",
        description: "Failed to upload files",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
      // Reset input
      event.target.value = "";
    }
  };

  const handleDeleteFile = async (fileId: string) => {
    if (!isAdmin) {
      toast({
        title: "Access Denied",
        description: "Only admin users can delete files",
        variant: "destructive",
      });
      return;
    }

    try {
      await deleteFile(fileId);
      setFiles((prev) => prev.filter((f) => f.file_id !== fileId));
      toast({
        title: "Success",
        description: "File deleted successfully",
      });
    } catch (error) {
      console.error("Failed to delete file:", error);
      toast({
        title: "Error",
        description: "Failed to delete file",
        variant: "destructive",
      });
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return (
      Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
    );
  };

  // Filter files based on search query (client-side filtering for current page)
  const filteredFiles = files.filter((file) =>
    file.filename.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col overflow-x-hidden sm:overflow-x-visible">
      {/* Header */}
      <div className="p-6 pb-0 border-b border-border">
      <div className="flex flex-col sm:flex-row items-center justify-between mb-4">
        <div className="">
        <h1 className="text-2xl font-bold font-playfair">
          File Management
        </h1>
        <p className="text-muted-foreground">
          Upload and manage documents for RAG processing
        </p>
        </div>
        {/* Search */}
        <div className="relative w-full sm:w-1/2 mb-4 sm:mb-0">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search files..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
        </div>
        {isAdmin && (
        <div className="relative w-full sm:w-auto">
          <input
          type="file"
          multiple
          onChange={handleFileUpload}
          disabled={uploading}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          accept=".pdf,.doc,.docx,.txt"
          />
          <Button disabled={uploading} className="w-full sm:w-auto">
          {uploading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Upload className="mr-2 h-4 w-4" />
          )}
          Upload Files
          </Button>
        </div>
        )}
      </div>

      {!isAdmin && (
        <div className="mt-4 p-3 bg-muted rounded-lg">
        <p className="text-sm text-muted-foreground">
          <strong>Note:</strong> Only admin users can upload and delete
          files. Contact your administrator to manage files.
        </p>
        </div>
      )}
      </div>

      {/* Files List */}
      <ScrollArea className="flex-1 p-6 sm:overflow-visible overflow-y-auto">
      {filteredFiles.length === 0 ? (
        <div className="text-center py-12">
        <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
        <h3 className="text-lg font-semibold mb-2">No files found</h3>
        <p className="text-muted-foreground mb-4">
          {searchQuery
          ? "Try adjusting your search terms"
          : "No files have been uploaded yet"}
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
        <div className="grid gap-2 md:grid-cols-3 lg:grid-cols-3">
        {filteredFiles.map((file) => (
          <Card
          key={file.file_id}
          className="hover:shadow-lg transition-shadow p-4"
          >
          <CardHeader className="pb-2">
            <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-lg flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              <span
                className="max-w-[150px] overflow-hidden text-ellipsis whitespace-nowrap"
                title={file.filename}
              >
                {file.filename}
              </span>
              <Badge variant="outline" className="ml-2">
                {file.filename.split(".").pop()?.toUpperCase()}
              </Badge>
              </CardTitle>
              <CardDescription className="mt-1">
              {(() => {
                const createdAt = new Date(file.created_at);
                const now = new Date();
                const diffInMs = now.getTime() - createdAt.getTime();
                const diffInMinutes = Math.floor(
                diffInMs / (1000 * 60)
                );
                const diffInHours = Math.floor(diffInMinutes / 60);
                const diffInDays = Math.floor(diffInHours / 24);

                const formattedDate = createdAt.toLocaleDateString(
                undefined,
                {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                }
                );

                if (diffInMinutes < 60) {
                return `$created at ${diffInMinutes} minute(s) ago `;
                } else if (diffInHours < 24) {
                return ` created at ${diffInHours} hour(s) ago `;
                } else {
                return `  created at ${diffInDays} day(s) ago `;
                }
              })()}
              </CardDescription>
            </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between text-sm text-muted-foreground mb-3">
            <span>
              Uploaded: {new Date(file.created_at).toLocaleDateString()}
            </span>
            {isAdmin && (
              <Button
              variant="ghost"
              size="sm"
              onClick={() => handleDeleteFile(file.file_id)}
              className="text-destructive hover:text-destructive hover:bg-destructive/10"
              >
              <Trash2 className="h-4 w-4" />
              </Button>
            )}
            </div>
          </CardContent>
          </Card>
        ))}
        </div>
      )}
      </ScrollArea>

      {/* Pagination Controls */}
      {totalPages > 1 && (
      <div className="flex justify-between items-center p-6 border-t border-border">
        <Button
        onClick={handlePreviousPage}
        disabled={currentPage === 1 || loading}
        variant="outline"
        >
        Previous
        </Button>
        <div className="flex flex-col sm:flex-row items-center gap-1 text-center sm:text-left">
        <span className="text-sm text-muted-foreground">
          Page {currentPage} of {totalPages}
        </span>
        <span className="text-xs text-muted-foreground">
          ( {totalCount} total files )
        </span>
        </div>
        <Button
        onClick={handleNextPage}
        disabled={currentPage === totalPages || loading}
        variant="outline"
        >
        Next
        </Button>
      </div>
      )}
    </div>
  );
}
