"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  User, 
  Mail, 
  Calendar, 
  BookOpen, 
  Star, 
  Settings, 
  Edit,
  MapPin,
  Phone,
  Globe,
  Target,
  Clock,
  Heart,
  Coffee,
  Music,
  Gamepad2,
  Camera
} from "lucide-react"
import Link from "next/link"

interface UserProfile {
  name: string
  email: string
  role: string
  image?: string
  createdAt: string
  // Student specific fields
  age?: number
  country?: string
  timezone?: string
  englishLevel?: string
  learningGoals?: string[]
  interests?: string[]
  hobbies?: string[]
  preferredStudyDays?: string[]
  preferredStudyTimes?: string[]
  // Teacher specific fields
  bio?: string
  experience?: string
  specialties?: string[]
  rating?: number
  totalReviews?: number
}

export default function ProfilePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin")
      return
    }

    if (status === "authenticated") {
      fetchProfile()
    }
  }, [status, router])

  const fetchProfile = async () => {
    try {
      if (session?.user?.role === "STUDENT") {
        const response = await fetch("/api/student/profile")
        if (response.ok) {
          const data = await response.json()
          setProfile({
            name: session.user.name,
            email: session.user.email,
            role: session.user.role,
            image: session.user.image,
            createdAt: session.user.createdAt,
            ...data
          })
        }
      } else if (session?.user?.role === "TEACHER") {
        const response = await fetch("/api/teacher/profile")
        if (response.ok) {
          const data = await response.json()
          setProfile({
            name: session.user.name,
            email: session.user.email,
            role: session.user.role,
            image: session.user.image,
            createdAt: session.user.createdAt,
            ...data
          })
        }
      }
    } catch (error) {
      console.error("Failed to fetch profile:", error)
    } finally {
      setLoading(false)
    }
  }

  const getInterestIcon = (interest: string) => {
    const iconMap: Record<string, React.ComponentType<any>> = {
      'music': Music,
      'travel': MapPin,
      'sports': Target,
      'reading': BookOpen,
      'cooking': Coffee,
      'gaming': Gamepad2,
      'photography': Camera,
      'movies': Star,
      'art': Heart,
      'technology': Globe
    }
    const Icon = iconMap[interest.toLowerCase()] || Heart
    return <Icon className="h-4 w-4" />
  }

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    )
  }

  if (!session || !profile) {
    return null
  }

  const isStudent = profile.role === "STUDENT"
  const isTeacher = profile.role === "TEACHER"

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
              <Badge variant="secondary">{profile.role}</Badge>
            </div>
            <div className="flex items-center space-x-4">
              {isStudent && (
                <Button asChild>
                  <Link href="/dashboard/student/settings">
                    <Settings className="h-4 w-4 mr-2" />
                    Edit Profile
                  </Link>
                </Button>
              )}
              {isTeacher && (
                <Button asChild>
                  <Link href="/dashboard/teacher/settings">
                    <Settings className="h-4 w-4 mr-2" />
                    Edit Profile
                  </Link>
                </Button>
              )}
              <Button variant="outline" asChild>
                <Link href={isStudent ? "/dashboard/student" : "/dashboard/teacher"}>
                  Back to Dashboard
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Basic Info */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader className="text-center">
                <Avatar className="h-24 w-24 mx-auto mb-4">
                  <AvatarImage src={profile.image} />
                  <AvatarFallback className="text-2xl">
                    {profile.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <CardTitle className="text-xl">{profile.name}</CardTitle>
                <CardDescription>{profile.email}</CardDescription>
                <Badge variant="outline" className="mt-2">
                  {profile.role}
                </Badge>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Calendar className="h-4 w-4" />
                  <span>
                    Member since {new Date(profile.createdAt).toLocaleDateString()}
                  </span>
                </div>
                {isTeacher && profile.rating && (
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Star className="h-4 w-4 text-yellow-400 fill-current" />
                    <span>
                      {profile.rating}/5 ({profile.totalReviews} reviews)
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Detailed Info */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="basic" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="basic">Basic Info</TabsTrigger>
                <TabsTrigger value="learning">Learning</TabsTrigger>
                <TabsTrigger value="preferences">Preferences</TabsTrigger>
              </TabsList>

              <TabsContent value="basic" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <User className="h-5 w-5" />
                      <span>Basic Information</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-500">Full Name</label>
                        <p className="text-gray-900">{profile.name}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">Email</label>
                        <p className="text-gray-900">{profile.email}</p>
                      </div>
                      {profile.age && (
                        <div>
                          <label className="text-sm font-medium text-gray-500">Age</label>
                          <p className="text-gray-900">{profile.age} years old</p>
                        </div>
                      )}
                      {profile.country && (
                        <div>
                          <label className="text-sm font-medium text-gray-500">Country</label>
                          <p className="text-gray-900">{profile.country}</p>
                        </div>
                      )}
                      {profile.timezone && (
                        <div>
                          <label className="text-sm font-medium text-gray-500">Timezone</label>
                          <p className="text-gray-900">{profile.timezone}</p>
                        </div>
                      )}
                    </div>
                    {profile.bio && (
                      <div>
                        <label className="text-sm font-medium text-gray-500">Bio</label>
                        <p className="text-gray-900 mt-1">{profile.bio}</p>
                      </div>
                    )}
                    {profile.experience && (
                      <div>
                        <label className="text-sm font-medium text-gray-500">Experience</label>
                        <p className="text-gray-900 mt-1">{profile.experience}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="learning" className="space-y-6">
                {isStudent && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <BookOpen className="h-5 w-5" />
                        <span>Learning Information</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {profile.englishLevel && (
                        <div>
                          <label className="text-sm font-medium text-gray-500">English Level</label>
                          <p className="text-gray-900">{profile.englishLevel}</p>
                        </div>
                      )}
                      {profile.learningGoals && profile.learningGoals.length > 0 && (
                        <div>
                          <label className="text-sm font-medium text-gray-500">Learning Goals</label>
                          <div className="flex flex-wrap gap-2 mt-2">
                            {profile.learningGoals.map((goal, index) => (
                              <Badge key={index} variant="secondary">
                                {goal}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}
                {isTeacher && profile.specialties && profile.specialties.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <Target className="h-5 w-5" />
                        <span>Specialties</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {profile.specialties.map((specialty, index) => (
                          <Badge key={index} variant="secondary">
                            {specialty}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="preferences" className="space-y-6">
                {isStudent && (
                  <>
                    {profile.interests && profile.interests.length > 0 && (
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center space-x-2">
                            <Heart className="h-5 w-5" />
                            <span>Interests</span>
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="flex flex-wrap gap-2">
                            {profile.interests.map((interest, index) => (
                              <Badge key={index} variant="outline" className="flex items-center space-x-1">
                                {getInterestIcon(interest)}
                                <span>{interest}</span>
                              </Badge>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    )}
                    {profile.hobbies && profile.hobbies.length > 0 && (
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center space-x-2">
                            <Coffee className="h-5 w-5" />
                            <span>Hobbies</span>
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="flex flex-wrap gap-2">
                            {profile.hobbies.map((hobby, index) => (
                              <Badge key={index} variant="outline">
                                {hobby}
                              </Badge>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    )}
                    {(profile.preferredStudyDays || profile.preferredStudyTimes) && (
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center space-x-2">
                            <Clock className="h-5 w-5" />
                            <span>Study Schedule Preferences</span>
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          {profile.preferredStudyDays && profile.preferredStudyDays.length > 0 && (
                            <div>
                              <label className="text-sm font-medium text-gray-500">Preferred Days</label>
                              <div className="flex flex-wrap gap-2 mt-2">
                                {profile.preferredStudyDays.map((day, index) => (
                                  <Badge key={index} variant="secondary">
                                    {day}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                          {profile.preferredStudyTimes && profile.preferredStudyTimes.length > 0 && (
                            <div>
                              <label className="text-sm font-medium text-gray-500">Preferred Times</label>
                              <div className="flex flex-wrap gap-2 mt-2">
                                {profile.preferredStudyTimes.map((time, index) => (
                                  <Badge key={index} variant="secondary">
                                    {time}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    )}
                  </>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  )
}