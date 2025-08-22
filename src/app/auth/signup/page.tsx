"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  BookOpen, 
  Loader2, 
  GraduationCap, 
  Users, 
  Globe,
  Sparkles,
  ArrowRight,
  User,
  UserCheck,
  ArrowLeft,
  Chrome
} from "lucide-react"
import TeacherRegistration from "@/components/auth/teacher-registration"
import StudentRegistration from "@/components/auth/student-registration"
import { motion } from "framer-motion"

export default function SignUp() {
  const [step, setStep] = useState<"role" | "teacher" | "student">("role")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const router = useRouter()

  const handleRoleSelect = (role: "STUDENT" | "TEACHER") => {
    setStep(role === "TEACHER" ? "teacher" : "student")
  }

  const handleTeacherRegistration = async (data: any) => {
    setLoading(true)
    setError("")
    
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          password: data.password,
          role: "TEACHER",
          teacherData: {
            bio: data.bio,
            experience: data.experience,
            education: data.education,
            hourlyRate: parseFloat(data.hourlyRate),
            languages: data.languages,
            specializations: data.specializations,
            teachingStyle: data.teachingStyle,
            preferredAgeGroups: data.preferredAgeGroups,
            availability: data.availability,
            certifications: data.certifications,
            introductionVideo: data.introductionVideo,
            trialLesson: data.trialLesson
          }
        }),
      })

      if (response.ok) {
        const data = await response.json()
        if (data.requiresVerification) {
          setSuccess("Account created successfully! Please check your email to verify your account.")
          setTimeout(() => {
            router.push("/auth/signin?message=check_email")
          }, 3000)
        } else {
          setSuccess("Account created successfully! Redirecting to sign in...")
          setTimeout(() => {
            router.push("/auth/signin")
          }, 2000)
        }
      } else {
        const data = await response.json()
        setError(data.error || "An error occurred. Please try again.")
      }
    } catch (error) {
      setError("An error occurred. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleStudentRegistration = async (data: any) => {
    setLoading(true)
    setError("")
    
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          password: data.password,
          role: "STUDENT",
          studentData: {} // Empty object for simple registration
        }),
      })

      if (response.ok) {
        const data = await response.json()
        if (data.requiresVerification) {
          setSuccess("Account created successfully! Please check your email to verify your account.")
          setTimeout(() => {
            router.push("/auth/signin?message=check_email")
          }, 3000)
        } else {
          setSuccess("Student account created successfully! Redirecting to sign in...")
          setTimeout(() => {
            router.push("/auth/signin")
          }, 2000)
        }
      } else {
        const data = await response.json()
        setError(data.error || "An error occurred. Please try again.")
      }
    } catch (error) {
      setError("An error occurred. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSignIn = () => {
    signIn("google", { callbackUrl: "/" })
  }

  const handleBack = () => {
    setStep("role")
    setError("")
  }

  if (step === "role") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-grid-blue-100/[0.05] bg-[length:60px_60px]" />
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 via-purple-600/5 to-pink-600/5" />
        
        {/* Floating Elements */}
        <div className="absolute top-20 left-20 w-72 h-72 bg-blue-400/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-purple-400/10 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 w-80 h-80 bg-indigo-400/10 rounded-full blur-3xl animate-pulse delay-2000" />

        <div className="relative min-h-screen flex">
          {/* Left Side - Branding */}
          <div className="hidden lg:flex lg:w-1/2 xl:w-2/5 items-center justify-center p-12">
            <motion.div 
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="max-w-md space-y-8"
            >
              {/* Logo */}
              <motion.div 
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.6 }}
                className="flex items-center space-x-3"
              >
                <div className="relative">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <BookOpen className="h-6 w-6 text-white" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-pink-500 to-orange-500 rounded-full flex items-center justify-center">
                    <Sparkles className="h-2 w-2 text-white" />
                  </div>
                </div>
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    EnglishLearn
                  </h1>
                  <p className="text-sm text-gray-600">Master English with AI</p>
                </div>
              </motion.div>

              {/* Main Content */}
              <motion.div 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.8 }}
                className="space-y-6"
              >
                <h2 className="text-4xl font-bold text-gray-900 leading-tight">
                  Join Our
                  <span className="block bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mt-2">
                    Learning Community
                  </span>
                </h2>
                
                <p className="text-lg text-gray-600 leading-relaxed">
                  Start your English learning journey today. Whether you want to teach or learn, we have the perfect platform for you.
                </p>

                {/* Features */}
                <div className="space-y-4">
                  <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6, duration: 0.6 }}
                    className="flex items-center space-x-3"
                  >
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                      <GraduationCap className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Expert Teachers</h3>
                      <p className="text-sm text-gray-600">Learn from certified professionals</p>
                    </div>
                  </motion.div>

                  <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.8, duration: 0.6 }}
                    className="flex items-center space-x-3"
                  >
                    <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
                      <Users className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Global Community</h3>
                      <p className="text-sm text-gray-600">Connect with learners worldwide</p>
                    </div>
                  </motion.div>

                  <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 1, duration: 0.6 }}
                    className="flex items-center space-x-3"
                  >
                    <div className="w-10 h-10 bg-gradient-to-r from-pink-500 to-pink-600 rounded-xl flex items-center justify-center">
                      <Globe className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">AI-Powered Learning</h3>
                      <p className="text-sm text-gray-600">Smart insights and personalized paths</p>
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            </motion.div>
          </div>

          {/* Right Side - Role Selection */}
          <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
            <motion.div 
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="w-full max-w-md"
            >
              <Card className="border-0 shadow-2xl bg-white/95 backdrop-blur-sm">
                <CardHeader className="text-center space-y-4 pb-8">
                  <motion.div 
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.3, duration: 0.6 }}
                    className="mx-auto w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center"
                  >
                    <User className="h-8 w-8 text-white" />
                  </motion.div>
                  
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4, duration: 0.6 }}
                  >
                    <CardTitle className="text-2xl font-bold text-gray-900">
                      Join EnglishLearn
                    </CardTitle>
                    <CardDescription className="text-gray-600 mt-2">
                      Choose how you want to join our platform
                    </CardDescription>
                  </motion.div>
                </CardHeader>

                <CardContent className="space-y-6">
                  {/* Role Selection Buttons */}
                  <div className="space-y-4">
                    <motion.div 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5, duration: 0.5 }}
                    >
                      <Button 
                        className="w-full h-14 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 group"
                        onClick={() => handleRoleSelect("STUDENT")}
                      >
                        <div className="flex items-center justify-center space-x-3">
                          <User className="h-5 w-5" />
                          <div className="text-left">
                            <div className="font-semibold">I Want to Learn English</div>
                            <div className="text-xs opacity-90">Start your learning journey</div>
                          </div>
                          <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                        </div>
                      </Button>
                    </motion.div>

                    <motion.div 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.6, duration: 0.5 }}
                    >
                      <Button 
                        className="w-full h-14 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 group"
                        onClick={() => handleRoleSelect("TEACHER")}
                      >
                        <div className="flex items-center justify-center space-x-3">
                          <UserCheck className="h-5 w-5" />
                          <div className="text-left">
                            <div className="font-semibold">I Want to Teach English</div>
                            <div className="text-xs opacity-90">Share your expertise</div>
                          </div>
                          <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                        </div>
                      </Button>
                    </motion.div>
                  </div>

                  {/* Divider */}
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.7, duration: 0.5 }}
                    className="relative"
                  >
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-200" />
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-4 bg-white text-gray-500">Or continue with</span>
                    </div>
                  </motion.div>

                  {/* Google Sign In */}
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8, duration: 0.5 }}
                  >
                    <Button
                      variant="outline"
                      className="w-full h-12 border-gray-200 hover:border-gray-300 text-gray-700 hover:text-gray-900 font-medium shadow-sm hover:shadow-md transition-all duration-300"
                      onClick={handleGoogleSignIn}
                    >
                      <Chrome className="w-5 h-5 mr-3" />
                      Sign up with Google
                    </Button>
                  </motion.div>

                  {/* Sign In Link */}
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.9, duration: 0.5 }}
                    className="text-center text-sm"
                  >
                    <span className="text-gray-600">Already have an account? </span>
                    <button
                      onClick={() => router.push("/auth/signin")}
                      className="text-blue-600 hover:text-blue-700 font-medium hover:underline transition-colors"
                    >
                      Sign in here
                    </button>
                  </motion.div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    )
  }

  if (step === "teacher") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-grid-blue-100/[0.05] bg-[length:60px_60px]" />
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 via-purple-600/5 to-pink-600/5" />
        
        {/* Floating Elements */}
        <div className="absolute top-20 left-20 w-72 h-72 bg-blue-400/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-purple-400/10 rounded-full blur-3xl animate-pulse delay-1000" />

        <div className="relative min-h-screen p-4 lg:p-12">
          <div className="max-w-6xl mx-auto">
            {/* Back Button */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              <Button
                variant="outline"
                onClick={handleBack}
                className="mb-6 border-gray-200 hover:border-gray-300"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Role Selection
              </Button>
            </motion.div>

            <TeacherRegistration
              onSubmit={handleTeacherRegistration}
              onBack={handleBack}
              loading={loading}
              error={error}
            />
          </div>
        </div>
      </div>
    )
  }

  if (step === "student") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-grid-blue-100/[0.05] bg-[length:60px_60px]" />
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 via-purple-600/5 to-pink-600/5" />
        
        {/* Floating Elements */}
        <div className="absolute top-20 left-20 w-72 h-72 bg-blue-400/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-purple-400/10 rounded-full blur-3xl animate-pulse delay-1000" />

        <div className="relative min-h-screen p-4 lg:p-12">
          <div className="max-w-4xl mx-auto">
            {/* Back Button */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              <Button
                variant="outline"
                onClick={handleBack}
                className="mb-6 border-gray-200 hover:border-gray-300"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Role Selection
              </Button>
            </motion.div>

            <StudentRegistration
              onSubmit={handleStudentRegistration}
              onBack={handleBack}
              loading={loading}
              error={error}
            />
          </div>
        </div>
      </div>
    )
  }

  return null
}