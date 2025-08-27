"use client";

import type React from "react";

import { useAuth } from "@/hooks/use-auth";
import { Sidebar } from "@/components/sidebar";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth/login");
    } else if (!loading && user && user.role !== "admin") {
      router.push("/unauthorized");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div
        id="dash_loading"
        className="flex flex-auto min-h-screen min-w-screen items-center justify-center bg-background"
      >
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  if (user.role !== "admin") {
    return null;
  }

  return (
    <div id="dash_layout" className="flex flex-auto h-screen bg-background">
      <Sidebar />
      <div className="flex-1 overflow-hidden ">{children}</div>  {/* //removed container class */}
    </div>
  );
}
