import { SearchParamsWrapper } from "@/components/search-params-wrapper"
import { ChatPageContent } from "@/components/chat-page-content"

export default function ChatPage() {
  return (
    <div className="h-full fixed">
      {/* <UserSidebar /> */}
      <ChatInterface sessionId={currentSession} />
    </div>
  )
}
