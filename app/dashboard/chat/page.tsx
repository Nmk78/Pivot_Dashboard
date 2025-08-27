import { SearchParamsWrapper } from "@/components/search-params-wrapper"
import { DashboardChatContent } from "@/components/dashboard-chat-content"

export default function ChatPage() {
  return (
    // <div className="flex-1 w-screen h-screen z-50 ">
      <SearchParamsWrapper>
      <DashboardChatContent />
    </SearchParamsWrapper>
    // </div>
  )
}
