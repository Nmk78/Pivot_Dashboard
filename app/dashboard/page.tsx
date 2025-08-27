import { SearchParamsWrapper } from "@/components/search-params-wrapper"
import { DashboardPageContent } from "@/components/dashboard-page-content"

export default function DashboardPage() {
  return (
    <SearchParamsWrapper>
      <DashboardPageContent />
    </SearchParamsWrapper>
  )
}
