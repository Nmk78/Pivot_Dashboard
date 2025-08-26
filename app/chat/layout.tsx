import type React from "react";
import { Suspense } from "react";
import { UserSidebar } from "@/components/userSidebar";

export default function ChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-auto min-h-screen">
      <Suspense fallback={<div className="w-64 bg-background border-r" />}>
        <UserSidebar />
      </Suspense>
      <main className="flex-1 overflow-hidden">{children}</main>
    </div>
  );
}
