import { SearchParamsWrapper } from "@/components/search-params-wrapper"
import { DashboardChatContent } from "@/components/dashboard-chat-content"

export default function ChatPage() {
  return (
    <SearchParamsWrapper>
      <DashboardChatContent />
    </SearchParamsWrapper>
  )
}
