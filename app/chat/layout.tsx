import type React from "react";
import { UserSidebar } from "@/components/userSidebar";

export default function ChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-row h-screen">
      <UserSidebar />
      <main className="flex-1 overflow-hidden">{children}</main>
    </div>
  );
}
