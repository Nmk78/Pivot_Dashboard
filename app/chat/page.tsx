import { SearchParamsWrapper } from "@/components/search-params-wrapper"
import { ChatPageContent } from "@/components/chat-page-content"

export default function ChatPage() {
  return (
    <SearchParamsWrapper>
      <ChatPageContent />
    </SearchParamsWrapper>
  )
}
