"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Settings, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  RefreshCw, 
  Database,
  Mail,
  Shield,
  Globe,
  Info,
  Copy,
  Download,
  Clock,
  Zap
} from "lucide-react"

interface EnvTestResult {
  name: string
  key: string
  value: string
  isSet: boolean
  isValid: boolean
  message: string
  category: 'database' | 'email' | 'auth' | 'general' | 'external'
  recommendations?: string[]
}

interface TestSummary {
  total: number
  passed: number
  failed: number
  warnings: number
  critical: number
}

interface EnvironmentTestResponse {
  success: boolean
  timestamp: string
  summary: TestSummary
  results: EnvTestResult[]
  environment: string
}

export function EnvironmentTesting() {
  const [testData, setTestData] = useState<EnvironmentTestResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const [copiedKey, setCopiedKey] = useState<string | null>(null)

  const fetchEnvironmentTests = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/admin/test-env')
      if (response.ok) {
        const data = await response.json()
        setTestData(data)
        setLastUpdated(new Date())
      } else {
        console.error('Failed to fetch environment tests')
      }
    } catch (error) {
      console.error('Error fetching environment tests:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCleanup = async () => {
    try {
      const response = await fetch('/api/admin/test-env', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'cleanup_expired_tokens' }),
      })

      if (response.ok) {
        await fetchEnvironmentTests() // Refresh the tests
      }
    } catch (error) {
      console.error('Error performing cleanup:', error)
    }
  }

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text)
    setCopiedKey(key)
    setTimeout(() => setCopiedKey(null), 2000)
  }

  const exportResults = () => {
    if (!testData) return

    const exportData = {
      timestamp: testData.timestamp,
      environment: testData.environment,
      summary: testData.summary,
      results: testData.results.map(result => ({
        name: result.name,
        key: result.key,
        status: result.isValid ? 'PASS' : result.isSet ? 'FAIL' : 'WARNING',
        message: result.message,
        category: result.category,
        recommendations: result.recommendations
      }))
    }

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `environment-test-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  useEffect(() => {
    fetchEnvironmentTests()
  }, [])

  const getStatusIcon = (result: EnvTestResult) => {
    if (!result.isSet) return <AlertTriangle className="h-4 w-4 text-yellow-500" />
    if (result.isValid) return <CheckCircle2 className="h-4 w-4 text-green-500" />
    return <XCircle className="h-4 w-4 text-red-500" />
  }

  const getStatusBadge = (result: EnvTestResult) => {
    if (!result.isSet) {
      return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 border-yellow-200">
        Not Set
      </Badge>
    }
    if (result.isValid) {
      return <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-200">
        Working
      </Badge>
    }
    return <Badge variant="destructive">
      Failed
    </Badge>
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'database': return <Database className="h-4 w-4" />
      case 'email': return <Mail className="h-4 w-4" />
      case 'auth': return <Shield className="h-4 w-4" />
      case 'external': return <Globe className="h-4 w-4" />
      default: return <Settings className="h-4 w-4" />
    }
  }

  const getResultsByCategory = (category: string) => {
    return testData?.results.filter(result => result.category === category) || []
  }

  if (loading && !testData) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="relative">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-green-200 border-t-green-600"></div>
          <div className="absolute inset-0 rounded-full bg-green-400/20 blur-xl animate-pulse"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="text-2xl font-bold text-gray-900 flex items-center">
            <Settings className="h-6 w-6 mr-2 text-green-600" />
            Environment Testing
          </h3>
          <p className="text-gray-600 mt-1">
            Test and monitor all environment variables and system configurations
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            onClick={fetchEnvironmentTests} 
            disabled={loading}
            variant="outline"
            className="hover:bg-green-50"
          >
            {loading ? (
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-2" />
            )}
            Refresh Tests
          </Button>
          <Button 
            onClick={exportResults}
            variant="outline"
            disabled={!testData}
            className="hover:bg-blue-50"
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button 
            onClick={handleCleanup}
            variant="outline"
            className="hover:bg-purple-50"
          >
            <Zap className="h-4 w-4 mr-2" />
            Cleanup
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      {testData && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card className="border-0 bg-gradient-to-br from-blue-50 to-blue-100/50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-600 font-medium">Total Tests</p>
                  <p className="text-2xl font-bold text-blue-900">{testData.summary.total}</p>
                </div>
                <Settings className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 bg-gradient-to-br from-green-50 to-green-100/50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-green-600 font-medium">Passed</p>
                  <p className="text-2xl font-bold text-green-900">{testData.summary.passed}</p>
                </div>
                <CheckCircle2 className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 bg-gradient-to-br from-red-50 to-red-100/50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-red-600 font-medium">Failed</p>
                  <p className="text-2xl font-bold text-red-900">{testData.summary.failed}</p>
                </div>
                <XCircle className="h-8 w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 bg-gradient-to-br from-yellow-50 to-yellow-100/50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-yellow-600 font-medium">Warnings</p>
                  <p className="text-2xl font-bold text-yellow-900">{testData.summary.warnings}</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 bg-gradient-to-br from-purple-50 to-purple-100/50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-purple-600 font-medium">Critical</p>
                  <p className="text-2xl font-bold text-purple-900">{testData.summary.critical}</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Last Updated Info */}
      {lastUpdated && (
        <div className="flex items-center text-sm text-gray-500">
          <Clock className="h-4 w-4 mr-1" />
          Last updated: {lastUpdated.toLocaleString()}
        </div>
      )}

      {/* Critical Issues Alert */}
      {testData && testData.summary.critical > 0 && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertTitle className="text-red-800">Critical Issues Detected</AlertTitle>
          <AlertDescription className="text-red-700">
            {testData.summary.critical} critical configuration issues need immediate attention. 
            These may prevent the application from functioning properly.
          </AlertDescription>
        </Alert>
      )}

      {/* Test Results by Category */}
      {testData && (
        <Tabs defaultValue="database" className="space-y-4">
          <TabsList className="grid w-full grid-cols-5 bg-white p-1 rounded-lg shadow-sm">
            <TabsTrigger value="database" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white rounded-md">
              <Database className="h-4 w-4 mr-2" />
              Database
            </TabsTrigger>
            <TabsTrigger value="auth" className="data-[state=active]:bg-green-600 data-[state=active]:text-white rounded-md">
              <Shield className="h-4 w-4 mr-2" />
              Auth
            </TabsTrigger>
            <TabsTrigger value="email" className="data-[state=active]:bg-yellow-600 data-[state=active]:text-white rounded-md">
              <Mail className="h-4 w-4 mr-2" />
              Email
            </TabsTrigger>
            <TabsTrigger value="external" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white rounded-md">
              <Globe className="h-4 w-4 mr-2" />
              External
            </TabsTrigger>
            <TabsTrigger value="general" className="data-[state=active]:bg-gray-600 data-[state=active]:text-white rounded-md">
              <Settings className="h-4 w-4 mr-2" />
              General
            </TabsTrigger>
          </TabsList>

          {(['database', 'auth', 'email', 'external', 'general'] as const).map(category => (
            <TabsContent key={category} value={category} className="space-y-4">
              <div className="grid gap-4">
                {getResultsByCategory(category).map((result, index) => (
                  <Card key={index} className={`border-l-4 ${
                    !result.isSet ? 'border-l-yellow-400' :
                    result.isValid ? 'border-l-green-400' : 'border-l-red-400'
                  }`}>
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          {getCategoryIcon(result.category)}
                          <div>
                            <CardTitle className="text-lg">{result.name}</CardTitle>
                            <CardDescription className="text-sm text-gray-500">
                              {result.key}
                            </CardDescription>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {getStatusBadge(result)}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyToClipboard(result.key, result.key)}
                            className="h-8 w-8 p-0"
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="space-y-3">
                        <div className="flex items-start space-x-2">
                          {getStatusIcon(result)}
                          <p className={`text-sm ${
                            !result.isSet ? 'text-yellow-700' :
                            result.isValid ? 'text-green-700' : 'text-red-700'
                          }`}>
                            {result.message}
                          </p>
                        </div>
                        
                        {result.value && result.value !== 'Not configured' && (
                          <div className="bg-gray-50 rounded-md p-2">
                            <p className="text-xs text-gray-600 font-mono break-all">
                              {result.value}
                            </p>
                          </div>
                        )}

                        {result.recommendations && result.recommendations.length > 0 && (
                          <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
                            <div className="flex items-center space-x-2 mb-2">
                              <Info className="h-4 w-4 text-blue-600" />
                              <p className="text-sm font-medium text-blue-800">Recommendations</p>
                            </div>
                            <ul className="text-sm text-blue-700 space-y-1">
                              {result.recommendations.map((rec, i) => (
                                <li key={i} className="flex items-start space-x-2">
                                  <span className="text-blue-500 mt-1">•</span>
                                  <span>{rec}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      )}

      {/* Environment Info */}
      {testData && (
        <Card className="border-0 bg-gradient-to-br from-gray-50 to-gray-100/50">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Info className="h-5 w-5 mr-2 text-gray-600" />
              System Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-gray-700">Environment:</span>
                <span className="ml-2 text-gray-600">{testData.environment}</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Test Timestamp:</span>
                <span className="ml-2 text-gray-600">{new Date(testData.timestamp).toLocaleString()}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}