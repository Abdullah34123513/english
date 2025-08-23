"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  Mail, 
  Send, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  RefreshCw, 
  Settings,
  TestTube,
  Activity,
  Copy,
  Download,
  Clock,
  Zap,
  Eye,
  EyeOff
} from "lucide-react"

interface EmailTestResult {
  id: string
  type: 'configuration' | 'connection' | 'verification' | 'welcome' | 'custom'
  status: 'success' | 'failed' | 'pending'
  message: string
  timestamp: string
  details?: any
  recipient?: string
}

interface EmailConfig {
  host: string
  port: string
  secure: string
  user: string
  fromName: string
  fromEmail: string
}

export function EmailTesting() {
  const [testResults, setTestResults] = useState<EmailTestResult[]>([])
  const [loading, setLoading] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const [emailConfig, setEmailConfig] = useState<EmailConfig>({
    host: '',
    port: '',
    secure: '',
    user: '',
    fromName: '',
    fromEmail: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [testEmail, setTestEmail] = useState('')
  const [customSubject, setCustomSubject] = useState('')
  const [customMessage, setCustomMessage] = useState('')

  const fetchEmailConfig = async () => {
    try {
      const response = await fetch('/api/admin/test-env')
      if (response.ok) {
        const data = await response.json()
        const emailResults = data.results.filter((r: any) => r.category === 'email')
        
        // Extract email configuration from results
        const config: EmailConfig = {
          host: emailResults.find((r: any) => r.key === 'SMTP_HOST')?.value || '',
          port: emailResults.find((r: any) => r.key === 'SMTP_PORT')?.value || '',
          secure: emailResults.find((r: any) => r.key === 'SMTP_SECURE')?.value || '',
          user: emailResults.find((r: any) => r.key === 'SMTP_USER')?.value || '',
          fromName: emailResults.find((r: any) => r.key === 'SMTP_FROM_NAME')?.value || '',
          fromEmail: emailResults.find((r: any) => r.key === 'SMTP_FROM_EMAIL')?.value || ''
        }
        
        setEmailConfig(config)
      }
    } catch (error) {
      console.error('Error fetching email configuration:', error)
    }
  }

  const addTestResult = (result: Omit<EmailTestResult, 'id' | 'timestamp'>) => {
    const newResult: EmailTestResult = {
      ...result,
      id: Date.now().toString(),
      timestamp: new Date().toISOString()
    }
    setTestResults(prev => [newResult, ...prev])
  }

  const testConfiguration = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/admin/test-env')
      if (response.ok) {
        const data = await response.json()
        const emailResults = data.results.filter((r: any) => r.category === 'email')
        const emailService = emailResults.find((r: any) => r.name === 'Email Service')
        
        if (emailService && emailService.isValid) {
          addTestResult({
            type: 'configuration',
            status: 'success',
            message: 'Email configuration is valid and properly set up',
            details: emailService
          })
        } else {
          addTestResult({
            type: 'configuration',
            status: 'failed',
            message: emailService?.message || 'Email configuration is invalid',
            details: emailService
          })
        }
      }
    } catch (error) {
      addTestResult({
        type: 'configuration',
        status: 'failed',
        message: `Failed to test configuration: ${error instanceof Error ? error.message : 'Unknown error'}`
      })
    } finally {
      setLoading(false)
      setLastUpdated(new Date())
    }
  }

  const testConnection = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/admin/test-email-connection', {
        method: 'POST'
      })
      
      const data = await response.json()
      
      if (data.success) {
        addTestResult({
          type: 'connection',
          status: 'success',
          message: 'SMTP connection established successfully',
          details: data
        })
      } else {
        addTestResult({
          type: 'connection',
          status: 'failed',
          message: data.error || 'Failed to establish SMTP connection',
          details: data
        })
      }
    } catch (error) {
      addTestResult({
        type: 'connection',
        status: 'failed',
        message: `Connection test failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      })
    } finally {
      setLoading(false)
      setLastUpdated(new Date())
    }
  }

  const sendTestEmail = async (type: 'verification' | 'welcome' | 'custom') => {
    if (!testEmail) {
      alert('Please enter a test email address')
      return
    }

    setLoading(true)
    try {
      let endpoint = ''
      let body: any = { email: testEmail }

      switch (type) {
        case 'verification':
          endpoint = '/api/admin/test-email-verification'
          break
        case 'welcome':
          endpoint = '/api/admin/test-email-welcome'
          break
        case 'custom':
          endpoint = '/api/admin/test-email-custom'
          body = {
            email: testEmail,
            subject: customSubject || 'Test Email from Admin Panel',
            message: customMessage || 'This is a test email sent from the admin panel.'
          }
          break
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body)
      })

      const data = await response.json()

      if (data.success) {
        addTestResult({
          type,
          status: 'success',
          message: `Test ${type} email sent successfully to ${testEmail}`,
          details: data,
          recipient: testEmail
        })
      } else {
        addTestResult({
          type,
          status: 'failed',
          message: data.error || `Failed to send ${type} email`,
          details: data,
          recipient: testEmail
        })
      }
    } catch (error) {
      addTestResult({
        type,
        status: 'failed',
        message: `Failed to send ${type} email: ${error instanceof Error ? error.message : 'Unknown error'}`,
        recipient: testEmail
      })
    } finally {
      setLoading(false)
      setLastUpdated(new Date())
    }
  }

  const clearResults = () => {
    setTestResults([])
  }

  const exportResults = () => {
    const exportData = {
      timestamp: new Date().toISOString(),
      emailConfig,
      testResults
    }

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `email-test-results-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  useEffect(() => {
    fetchEmailConfig()
  }, [])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return <CheckCircle2 className="h-4 w-4 text-green-500" />
      case 'failed': return <XCircle className="h-4 w-4 text-red-500" />
      case 'pending': return <RefreshCw className="h-4 w-4 text-yellow-500 animate-spin" />
      default: return <AlertTriangle className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'success':
        return <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-200">
          Success
        </Badge>
      case 'failed':
        return <Badge variant="destructive">
          Failed
        </Badge>
      case 'pending':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 border-yellow-200">
          Pending
        </Badge>
      default:
        return <Badge variant="secondary">
          Unknown
        </Badge>
    }
  }

  const isEmailConfigured = emailConfig.host && emailConfig.user

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="text-2xl font-bold text-gray-900 flex items-center">
            <Mail className="h-6 w-6 mr-2 text-blue-600" />
            Email Testing
          </h3>
          <p className="text-gray-600 mt-1">
            Test email configuration, SMTP connection, and send test emails
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            onClick={fetchEmailConfig} 
            disabled={loading}
            variant="outline"
            className="hover:bg-blue-50"
          >
            {loading ? (
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-2" />
            )}
            Refresh Config
          </Button>
          <Button 
            onClick={clearResults}
            variant="outline"
            disabled={testResults.length === 0}
            className="hover:bg-gray-50"
          >
            <Zap className="h-4 w-4 mr-2" />
            Clear Results
          </Button>
          <Button 
            onClick={exportResults}
            variant="outline"
            disabled={testResults.length === 0}
            className="hover:bg-green-50"
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Configuration Status */}
      <Card className={`border-l-4 ${isEmailConfigured ? 'border-l-green-400' : 'border-l-red-400'}`}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Settings className="h-5 w-5" />
              <div>
                <CardTitle>Email Configuration Status</CardTitle>
                <CardDescription>
                  Current SMTP configuration from environment variables
                </CardDescription>
              </div>
            </div>
            {isEmailConfigured ? (
              <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-200">
                Configured
              </Badge>
            ) : (
              <Badge variant="destructive">
                Not Configured
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
            <div>
              <Label className="text-gray-600">SMTP Host</Label>
              <p className="font-mono text-xs bg-gray-50 p-2 rounded">{emailConfig.host || 'Not set'}</p>
            </div>
            <div>
              <Label className="text-gray-600">SMTP Port</Label>
              <p className="font-mono text-xs bg-gray-50 p-2 rounded">{emailConfig.port || 'Not set'}</p>
            </div>
            <div>
              <Label className="text-gray-600">SMTP Secure</Label>
              <p className="font-mono text-xs bg-gray-50 p-2 rounded">{emailConfig.secure || 'Not set'}</p>
            </div>
            <div>
              <Label className="text-gray-600">SMTP User</Label>
              <p className="font-mono text-xs bg-gray-50 p-2 rounded">{emailConfig.user || 'Not set'}</p>
            </div>
            <div>
              <Label className="text-gray-600">From Name</Label>
              <p className="font-mono text-xs bg-gray-50 p-2 rounded">{emailConfig.fromName || 'Not set'}</p>
            </div>
            <div>
              <Label className="text-gray-600">From Email</Label>
              <p className="font-mono text-xs bg-gray-50 p-2 rounded">{emailConfig.fromEmail || 'Not set'}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Test Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <TestTube className="h-5 w-5 mr-2" />
            Email Tests
          </CardTitle>
          <CardDescription>
            Run different types of email tests to verify your email configuration
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button 
              onClick={testConfiguration}
              disabled={loading}
              className="h-20 flex-col"
              variant="outline"
            >
              <Activity className="h-6 w-6 mb-2" />
              Test Configuration
            </Button>
            <Button 
              onClick={testConnection}
              disabled={loading || !isEmailConfigured}
              className="h-20 flex-col"
              variant="outline"
            >
              <Mail className="h-6 w-6 mb-2" />
              Test SMTP Connection
            </Button>
            <Button 
              onClick={() => sendTestEmail('verification')}
              disabled={loading || !isEmailConfigured || !testEmail}
              className="h-20 flex-col"
              variant="outline"
            >
              <Send className="h-6 w-6 mb-2" />
              Send Test Email
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Test Email Configuration */}
      <Card>
        <CardHeader>
          <CardTitle>Send Test Email</CardTitle>
          <CardDescription>
            Configure and send test emails to verify the email system is working
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label htmlFor="testEmail">Test Email Address</Label>
              <Input
                id="testEmail"
                type="email"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                placeholder="Enter email address to send test email"
              />
            </div>
            
            <Tabs defaultValue="verification" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="verification">Verification Email</TabsTrigger>
                <TabsTrigger value="welcome">Welcome Email</TabsTrigger>
                <TabsTrigger value="custom">Custom Email</TabsTrigger>
              </TabsList>
              
              <TabsContent value="verification" className="space-y-4">
                <p className="text-sm text-gray-600">
                  Send a test email verification email to the specified address.
                </p>
                <Button 
                  onClick={() => sendTestEmail('verification')}
                  disabled={loading || !isEmailConfigured || !testEmail}
                  className="w-full"
                >
                  <Send className="h-4 w-4 mr-2" />
                  Send Verification Email
                </Button>
              </TabsContent>
              
              <TabsContent value="welcome" className="space-y-4">
                <p className="text-sm text-gray-600">
                  Send a test welcome email to the specified address.
                </p>
                <Button 
                  onClick={() => sendTestEmail('welcome')}
                  disabled={loading || !isEmailConfigured || !testEmail}
                  className="w-full"
                >
                  <Send className="h-4 w-4 mr-2" />
                  Send Welcome Email
                </Button>
              </TabsContent>
              
              <TabsContent value="custom" className="space-y-4">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="customSubject">Subject</Label>
                    <Input
                      id="customSubject"
                      value={customSubject}
                      onChange={(e) => setCustomSubject(e.target.value)}
                      placeholder="Enter email subject"
                    />
                  </div>
                  <div>
                    <Label htmlFor="customMessage">Message</Label>
                    <Textarea
                      id="customMessage"
                      value={customMessage}
                      onChange={(e) => setCustomMessage(e.target.value)}
                      placeholder="Enter email message"
                      rows={4}
                    />
                  </div>
                  <Button 
                    onClick={() => sendTestEmail('custom')}
                    disabled={loading || !isEmailConfigured || !testEmail}
                    className="w-full"
                  >
                    <Send className="h-4 w-4 mr-2" />
                    Send Custom Email
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </CardContent>
      </Card>

      {/* Test Results */}
      {testResults.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center">
                  <Activity className="h-5 w-5 mr-2" />
                  Test Results
                </CardTitle>
                <CardDescription>
                  Results of email tests and configuration checks
                </CardDescription>
              </div>
              {lastUpdated && (
                <div className="flex items-center text-sm text-gray-500">
                  <Clock className="h-4 w-4 mr-1" />
                  {lastUpdated.toLocaleString()}
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {testResults.map((result) => (
                <Card key={result.id} className={`border-l-4 ${
                  result.status === 'success' ? 'border-l-green-400' :
                  result.status === 'failed' ? 'border-l-red-400' :
                  'border-l-yellow-400'
                }`}>
                  <CardContent className="pt-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        {getStatusIcon(result.status)}
                        <div>
                          <p className="font-medium capitalize">{result.type}</p>
                          <p className="text-sm text-gray-600">{result.message}</p>
                          {result.recipient && (
                            <p className="text-xs text-gray-500">To: {result.recipient}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {getStatusBadge(result.status)}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(result.message)}
                          className="h-8 w-8 p-0"
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}