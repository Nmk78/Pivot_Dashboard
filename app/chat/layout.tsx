import type React from "react";
import { Suspense } from "react";
import { UserSidebar } from "@/components/userSidebar";

export default function ChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-auto h-screen bg-background">
      <UserSidebar />
      {/* <main className="flex-1 overflow-hidden container ">{children}</main> */}
      <main className="flex-1 overflow-hidden">{children}</main>
      {/* <main className="flex-1 overflow-hidden ">{children}</main> */}
    </div>
  );
}
