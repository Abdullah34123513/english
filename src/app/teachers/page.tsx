"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { TeacherList } from "@/components/student/teacher-list"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, BookOpen, Users } from "lucide-react"

export default function TeachersPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === "authenticated" && session?.user.role === "TEACHER") {
      router.push("/dashboard/teacher")
    }
  }, [session, status, router])

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (status === "authenticated" && session?.user.role === "TEACHER") {
    return null
  }

  const handleUpdate = () => {
    // Refresh the page or update state as needed
    console.log("Booking updated")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button 
                variant="ghost" 
                onClick={() => router.push("/")}
                className="flex items-center space-x-2"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back to Home</span>
              </Button>
              <div className="h-6 w-px bg-gray-300"></div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Find English Teachers</h1>
                <p className="text-gray-600">Connect with expert teachers for personalized learning</p>
              </div>
            </div>
            {!session && (
              <div className="flex items-center space-x-3">
                <Button 
                  variant="outline" 
                  onClick={() => router.push("/auth/signin")}
                >
                  Sign In
                </Button>
                <Button 
                  onClick={() => router.push("/auth/signup")}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  Get Started
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!session && (
          <Card className="mb-8 bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0">
            <CardContent className="p-8">
              <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
                <div className="flex-1">
                  <h2 className="text-2xl font-bold mb-2">Ready to Start Learning?</h2>
                  <p className="text-blue-100">
                    Create an account to book classes with our expert English teachers and track your progress.
                  </p>
                </div>
                <div className="flex space-x-3">
                  <Button 
                    variant="secondary" 
                    onClick={() => router.push("/auth/signin")}
                    className="text-blue-600 hover:text-blue-700"
                  >
                    Sign In
                  </Button>
                  <Button 
                    onClick={() => router.push("/auth/signup")}
                    variant="outline"
                    className="border-white text-white hover:bg-white hover:text-blue-600"
                  >
                    Sign Up Free
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <TeacherList onUpdate={handleUpdate} />
      </div>
    </div>
  )
}