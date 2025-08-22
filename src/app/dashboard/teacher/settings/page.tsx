"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  User, 
  Mail, 
  Calendar, 
  BookOpen, 
  Star, 
  Settings, 
  Save,
  Plus,
  X,
  Clock,
  MapPin,
  Target,
  Globe
} from "lucide-react"
import Link from "next/link"

interface TeacherProfile {
  bio?: string
  experience?: string
  specialties?: string[]
  hourlyRate?: number
  country?: string
  timezone?: string
  languages?: string[]
  availability?: any[]
}

export default function TeacherSettingsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [profile, setProfile] = useState<TeacherProfile>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [newSpecialty, setNewSpecialty] = useState("")
  const [newLanguage, setNewLanguage] = useState("")

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin")
      return
    }

    if (status === "authenticated" && session?.user?.role !== "TEACHER") {
      router.push("/dashboard/student")
      return
    }

    if (status === "authenticated") {
      fetchProfile()
    }
  }, [status, router, session])

  const fetchProfile = async () => {
    try {
      const response = await fetch("/api/teacher/profile")
      if (response.ok) {
        const data = await response.json()
        setProfile(data)
      }
    } catch (error) {
      console.error("Failed to fetch profile:", error)
    } finally {
      setLoading(false)
    }
  }

  const saveProfile = async () => {
    setSaving(true)
    try {
      const response = await fetch("/api/teacher/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(profile),
      })

      if (response.ok) {
        // Show success message or redirect
        router.push("/dashboard/teacher")
      }
    } catch (error) {
      console.error("Failed to save profile:", error)
    } finally {
      setSaving(false)
    }
  }

  const addSpecialty = () => {
    if (newSpecialty.trim() && !profile.specialties?.includes(newSpecialty.trim())) {
      setProfile(prev => ({
        ...prev,
        specialties: [...(prev.specialties || []), newSpecialty.trim()]
      }))
      setNewSpecialty("")
    }
  }

  const removeSpecialty = (specialty: string) => {
    setProfile(prev => ({
      ...prev,
      specialties: prev.specialties?.filter(s => s !== specialty) || []
    }))
  }

  const addLanguage = () => {
    if (newLanguage.trim() && !profile.languages?.includes(newLanguage.trim())) {
      setProfile(prev => ({
        ...prev,
        languages: [...(prev.languages || []), newLanguage.trim()]
      }))
      setNewLanguage("")
    }
  }

  const removeLanguage = (language: string) => {
    setProfile(prev => ({
      ...prev,
      languages: prev.languages?.filter(l => l !== language) || []
    }))
  }

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading settings...</p>
        </div>
      </div>
    )
  }

  if (!session || session.user.role !== "TEACHER") {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-gray-900">Teacher Settings</h1>
              <Badge variant="secondary">Teacher</Badge>
            </div>
            <div className="flex items-center space-x-4">
              <Button onClick={saveProfile} disabled={saving}>
                <Save className="h-4 w-4 mr-2" />
                {saving ? "Saving..." : "Save Changes"}
              </Button>
              <Button variant="outline" asChild>
                <Link href="/dashboard/teacher">
                  Back to Dashboard
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="basic" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="basic">Basic Info</TabsTrigger>
            <TabsTrigger value="teaching">Teaching</TabsTrigger>
            <TabsTrigger value="availability">Availability</TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <User className="h-5 w-5" />
                  <span>Basic Information</span>
                </CardTitle>
                <CardDescription>
                  Update your basic profile information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="country">Country</Label>
                    <Input
                      id="country"
                      value={profile.country || ""}
                      onChange={(e) => setProfile(prev => ({ ...prev, country: e.target.value }))}
                      placeholder="e.g., United States"
                    />
                  </div>
                  <div>
                    <Label htmlFor="timezone">Timezone</Label>
                    <Input
                      id="timezone"
                      value={profile.timezone || ""}
                      onChange={(e) => setProfile(prev => ({ ...prev, timezone: e.target.value }))}
                      placeholder="e.g., EST, PST"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    value={profile.bio || ""}
                    onChange={(e) => setProfile(prev => ({ ...prev, bio: e.target.value }))}
                    placeholder="Tell students about yourself, your teaching style, and what makes you unique..."
                    rows={4}
                  />
                </div>
                <div>
                  <Label htmlFor="experience">Teaching Experience</Label>
                  <Textarea
                    id="experience"
                    value={profile.experience || ""}
                    onChange={(e) => setProfile(prev => ({ ...prev, experience: e.target.value }))}
                    placeholder="Describe your teaching experience, certifications, and background..."
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="teaching" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BookOpen className="h-5 w-5" />
                  <span>Teaching Information</span>
                </CardTitle>
                <CardDescription>
                  Configure your teaching specialties and rates
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label htmlFor="hourlyRate">Hourly Rate (USD)</Label>
                  <Input
                    id="hourlyRate"
                    type="number"
                    value={profile.hourlyRate || ""}
                    onChange={(e) => setProfile(prev => ({ ...prev, hourlyRate: Number(e.target.value) }))}
                    placeholder="e.g., 25"
                  />
                </div>

                <div>
                  <Label>Specialties</Label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {profile.specialties?.map((specialty, index) => (
                      <Badge key={index} variant="secondary" className="flex items-center space-x-1">
                        <span>{specialty}</span>
                        <button
                          onClick={() => removeSpecialty(specialty)}
                          className="ml-1 hover:bg-gray-200 rounded-full p-0.5"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                  <div className="flex space-x-2">
                    <Input
                      value={newSpecialty}
                      onChange={(e) => setNewSpecialty(e.target.value)}
                      placeholder="Add specialty (e.g., Business English)"
                      onKeyPress={(e) => e.key === 'Enter' && addSpecialty()}
                    />
                    <Button onClick={addSpecialty} size="sm">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div>
                  <Label>Languages</Label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {profile.languages?.map((language, index) => (
                      <Badge key={index} variant="outline" className="flex items-center space-x-1">
                        <Globe className="h-3 w-3 mr-1" />
                        <span>{language}</span>
                        <button
                          onClick={() => removeLanguage(language)}
                          className="ml-1 hover:bg-gray-200 rounded-full p-0.5"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                  <div className="flex space-x-2">
                    <Input
                      value={newLanguage}
                      onChange={(e) => setNewLanguage(e.target.value)}
                      placeholder="Add language (e.g., Spanish)"
                      onKeyPress={(e) => e.key === 'Enter' && addLanguage()}
                    />
                    <Button onClick={addLanguage} size="sm">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="availability" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Clock className="h-5 w-5" />
                  <span>Availability Settings</span>
                </CardTitle>
                <CardDescription>
                  Manage your teaching availability and schedule
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Availability Management
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Set your available time slots for teaching. This helps students know when they can book lessons with you.
                  </p>
                  <Button asChild>
                    <Link href="/dashboard/teacher/availability">
                      Manage Availability
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}