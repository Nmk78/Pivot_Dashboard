"use client"

import { Suspense } from "react"

interface SearchParamsWrapperProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

export function SearchParamsWrapper({ children, fallback }: SearchParamsWrapperProps) {
  return (
    <Suspense fallback={fallback || <div className="flex items-center justify-center h-full"><div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" /></div>}>
      {children}
    </Suspense>
  )
}
