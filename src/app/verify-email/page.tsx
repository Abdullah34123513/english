"use client"

import { useEffect, useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { 
  Mail, 
  CheckCircle, 
  XCircle, 
  Loader2, 
  RefreshCw,
  ArrowLeft,
  Sparkles,
  Shield,
  Clock
} from "lucide-react"
import Link from "next/link"

function VerifyEmailContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token')
  
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')
  const [email, setEmail] = useState('')

  useEffect(() => {
    if (token) {
      verifyEmail()
    } else {
      setStatus('error')
      setMessage('No verification token provided')
    }
  }, [token])

  const verifyEmail = async () => {
    if (!token) return

    try {
      const response = await fetch('/api/verify-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token }),
      })

      const data = await response.json()

      if (response.ok && data.success) {
        setStatus('success')
        setMessage(data.message || 'Email verified successfully!')
      } else {
        setStatus('error')
        setMessage(data.error || 'Verification failed')
      }
    } catch (error) {
      console.error('Verification error:', error)
      setStatus('error')
      setMessage('An error occurred during verification')
    }
  }

  const handleResend = async () => {
    if (!email) {
      setMessage('Please enter your email address')
      return
    }

    try {
      setStatus('loading')
      const response = await fetch('/api/resend-verification', {
        method: 'POST',
      })

      const data = await response.json()

      if (response.ok) {
        setStatus('success')
        setMessage(data.message || 'Verification email resent successfully!')
      } else {
        setStatus('error')
        setMessage(data.error || 'Failed to resend verification email')
      }
    } catch (error) {
      console.error('Resend error:', error)
      setStatus('error')
      setMessage('An error occurred while resending the email')
    }
  }

  const renderContent = () => {
    switch (status) {
      case 'loading':
        return (
          <div className="text-center space-y-6">
            <div className="relative">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600 mx-auto mb-4"></div>
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 opacity-20 blur-xl animate-pulse"></div>
            </div>
            <h3 className="text-xl font-semibold text-gray-900">Verifying your email...</h3>
            <p className="text-gray-600">Please wait while we verify your email address.</p>
          </div>
        )

      case 'success':
        return (
          <div className="text-center space-y-6">
            <div className="relative">
              <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-8 w-8 text-white" />
              </div>
              <div className="absolute inset-0 rounded-full bg-green-400/20 blur-xl animate-pulse"></div>
            </div>
            <h3 className="text-xl font-semibold text-gray-900">Email Verified Successfully!</h3>
            <p className="text-gray-600">{message}</p>
            <div className="space-y-3">
              <Button asChild className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800">
                <Link href="/auth/signin">
                  Sign In to Your Account
                </Link>
              </Button>
            </div>
          </div>
        )

      case 'error':
        return (
          <div className="text-center space-y-6">
            <div className="relative">
              <div className="w-16 h-16 bg-gradient-to-r from-red-500 to-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <XCircle className="h-8 w-8 text-white" />
              </div>
              <div className="absolute inset-0 rounded-full bg-red-400/20 blur-xl"></div>
            </div>
            <h3 className="text-xl font-semibold text-gray-900">Verification Failed</h3>
            <p className="text-gray-600">{message}</p>
            
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <Clock className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-800">Token Expired?</span>
                </div>
                <p className="text-sm text-blue-700">
                  Verification tokens expire after 24 hours for security reasons.
                </p>
              </div>

              <div className="space-y-3">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Enter your email to resend verification:
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <Button 
                  onClick={handleResend}
                  disabled={!email || status === 'loading'}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  {status === 'loading' ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Resend Verification Email
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-grid-blue-100/[0.05] bg-[length:60px_60px]" />
      <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 via-purple-600/5 to-pink-600/5" />
      
      {/* Floating Elements */}
      <div className="absolute top-20 left-20 w-72 h-72 bg-blue-400/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-20 right-20 w-96 h-96 bg-purple-400/10 rounded-full blur-3xl animate-pulse delay-1000" />
      <div className="absolute top-1/2 left-1/2 w-80 h-80 bg-indigo-400/10 rounded-full blur-3xl animate-pulse delay-2000" />

      <div className="relative min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Back Button */}
          <div className="mb-6">
            <Button 
              variant="ghost" 
              asChild 
              className="text-gray-600 hover:text-gray-900"
            >
              <Link href="/auth/signin">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Sign In
              </Link>
            </Button>
          </div>

          {/* Main Card */}
          <Card className="border-0 shadow-2xl bg-white/95 backdrop-blur-sm">
            <CardHeader className="text-center space-y-4 pb-8">
              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto">
                  <Mail className="h-8 w-8 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-pink-500 to-orange-500 rounded-full flex items-center justify-center">
                  <Shield className="h-2 w-2 text-white" />
                </div>
              </div>
              
              <CardTitle className="text-2xl font-bold text-gray-900">
                Email Verification
              </CardTitle>
              <CardDescription className="text-gray-600">
                Verify your email address to secure your account
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Status Indicators */}
              <div className="flex justify-center space-x-2">
                <Badge variant="outline" className="text-xs">
                  <Sparkles className="h-3 w-3 mr-1" />
                  Secure Verification
                </Badge>
                <Badge variant="outline" className="text-xs">
                  <Clock className="h-3 w-3 mr-1" />
                  24 Hour Expiry
                </Badge>
              </div>

              {/* Dynamic Content */}
              <div className="py-4">
                {renderContent()}
              </div>

              {/* Additional Info */}
              <div className="text-center text-xs text-gray-500 space-y-1">
                <p>
                  Having trouble? Contact our support team for assistance.
                </p>
                <p>
                  This is a secure verification process to protect your account.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600"></div>
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  )
}