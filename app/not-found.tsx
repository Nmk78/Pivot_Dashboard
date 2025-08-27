"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Home, MessageSquare, Search } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-900 via-gray-900 to-zinc-900 flex items-center justify-center p-4">
    {/* <div className="min-h-screen w-full bg-gradient-to-br from-gray-50 via-purple-50 to-blue-50 dark:from-slate-900 dark:via-purple-900 dark:to-slate-900 flex items-center justify-center p-4"> */}
      <div className="text-center space-y-8 max-w-2xl mx-auto relative">
        {/* Animated 404 */}
        <div className="relative">
          <div className="text-[12rem] md:text-[16rem] font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-400 dark:to-pink-400 leading-none animate-pulse">
            404
          </div>
          <div className="absolute inset-0 text-[12rem] md:text-[16rem] font-black text-purple-300/30 dark:text-purple-500/20 blur-sm leading-none">
            404
          </div>
        </div>

        {/* Content */}
        <div className="space-y-6">
          <div className="space-y-3">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
              Oops! Page Not Found
            </h1>
            <p className="text-lg text-purple-400 dark:text-gray-300 max-w-md mx-auto">
              The page you're looking for seems to have vanished into the digital void. 
              Let's get you back on track.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
            <Button 
              asChild 
              size="lg"
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 dark:from-purple-600 dark:to-pink-600 dark:hover:from-purple-700 dark:hover:to-pink-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            >
              <Link href="/" className="flex items-center gap-2">
                <Home className="w-4 h-4" />
                Back to Home
              </Link>
            </Button>
            
            <Button 
              asChild 
              variant="outline" 
              size="lg"
              className="border-purple-600 text-purple-600 hover:bg-purple-600 hover:text-white dark:border-purple-400 dark:text-purple-400 dark:hover:bg-purple-400 dark:hover:text-white transition-all duration-300"
            >
              <Link href="/chat" className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4" />
                Go to Chat
              </Link>
            </Button>
          </div>

          {/* Go Back Link */}
          <div className="pt-6">
            <Button 
              variant="ghost" 
              onClick={() => window.history.back()}
              className="text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors duration-300"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go Back
            </Button>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-purple-500 dark:bg-purple-400 rounded-full animate-ping opacity-75"></div>
        <div className="absolute top-3/4 right-1/4 w-1 h-1 bg-pink-500 dark:bg-pink-400 rounded-full animate-ping opacity-50 animation-delay-1000"></div>
        <div className="absolute top-1/2 left-1/6 w-1.5 h-1.5 bg-blue-500 dark:bg-blue-400 rounded-full animate-pulse opacity-60"></div>
      </div>
    </div>
  );
}
