"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { 
  Loader2, 
  Edit, 
  Save, 
  X, 
  Camera, 
  Upload, 
  Trash2, 
  User,
  Phone,
  MapPin,
  Clock,
  Languages,
  FileText,
  CheckCircle,
  AlertCircle
} from "lucide-react"

interface UserProfile {
  id: string
  email: string
  name?: string
  image?: string
  phone?: string
  bio?: string
  location?: string
  timezone?: string
  language?: string
  role: "STUDENT" | "TEACHER" | "ADMIN"
  createdAt: string
  updatedAt: string
}

interface UserProfileEditorProps {
  user: UserProfile
  onUpdate: (updatedUser: UserProfile) => void
}

const TIMEZONES = [
  "UTC-12:00", "UTC-11:00", "UTC-10:00", "UTC-09:30", "UTC-09:00", "UTC-08:00", "UTC-07:00", "UTC-06:00", "UTC-05:00", "UTC-04:00", "UTC-03:30", "UTC-03:00", "UTC-02:00", "UTC-01:00", "UTC+00:00", "UTC+01:00", "UTC+02:00", "UTC+03:00", "UTC+03:30", "UTC+04:00", "UTC+04:30", "UTC+05:00", "UTC+05:30", "UTC+05:45", "UTC+06:00", "UTC+06:30", "UTC+07:00", "UTC+08:00", "UTC+08:45", "UTC+09:00", "UTC+09:30", "UTC+10:00", "UTC+10:30", "UTC+11:00", "UTC+12:00", "UTC+12:45", "UTC+13:00", "UTC+14:00"
]

const COUNTRIES = [
  "United States", "Canada", "United Kingdom", "Australia", "Germany", "France", "Italy", "Spain", "Netherlands", "Sweden", "Norway", "Denmark", "Finland", "Switzerland", "Austria", "Belgium", "Ireland", "Portugal", "Greece", "Poland", "Czech Republic", "Hungary", "Romania", "Bulgaria", "Croatia", "Serbia", "Slovenia", "Slovakia", "Estonia", "Latvia", "Lithuania", "Malta", "Cyprus", "Luxembourg", "Iceland", "Japan", "China", "South Korea", "India", "Singapore", "Malaysia", "Thailand", "Indonesia", "Philippines", "Vietnam", "Taiwan", "Hong Kong", "New Zealand", "Brazil", "Argentina", "Mexico", "Chile", "Colombia", "Peru", "Venezuela", "Ecuador", "Bolivia", "Paraguay", "Uruguay", "Costa Rica", "Panama", "Guatemala", "El Salvador", "Honduras", "Nicaragua", "Cuba", "Dominican Republic", "Puerto Rico", "Jamaica", "Trinidad and Tobago", "Barbados", "Bahamas", "South Africa", "Egypt", "Nigeria", "Kenya", "Morocco", "Tunisia", "Algeria", "Ghana", "Uganda", "Tanzania", "Ethiopia", "Zimbabwe", "Zambia", "Botswana", "Namibia", "Mozambique", "Angola", "Senegal", "Ivory Coast", "Cameroon", "Mali", "Burkina Faso", "Niger", "Chad", "Sudan", "Libya", "Madagascar", "Mauritius", "Seychelles", "Rwanda", "Burundi", "Malawi", "Lesotho", "Eswatini", "Gambia", "Guinea", "Sierra Leone", "Liberia", "Togo", "Benin", "Central African Republic", "Republic of the Congo", "Democratic Republic of the Congo", "Gabon", "Equatorial Guinea", "São Tomé and Príncipe", "Cape Verde", "Comoros", "Mauritania", "Western Sahara", "Somalia", "Djibouti", "Eritrea", "South Sudan", "Israel", "Saudi Arabia", "United Arab Emirates", "Qatar", "Kuwait", "Bahrain", "Oman", "Yemen", "Jordan", "Lebanon", "Syria", "Iraq", "Iran", "Turkey", "Cyprus", "Georgia", "Armenia", "Azerbaijan", "Kazakhstan", "Uzbekistan", "Turkmenistan", "Tajikistan", "Kyrgyzstan", "Afghanistan", "Pakistan", "Bangladesh", "Sri Lanka", "Nepal", "Bhutan", "Maldives", "Myanmar", "Laos", "Cambodia", "Vietnam", "Brunei", "East Timor", "Papua New Guinea", "Fiji", "Solomon Islands", "Vanuatu", "Samoa", "Tonga", "Kiribati", "Tuvalu", "Nauru", "Palau", "Federated States of Micronesia", "Marshall Islands", "Russia", "Ukraine", "Belarus", "Moldova", "Estonia", "Latvia", "Lithuania", "Poland", "Czech Republic", "Slovakia", "Hungary", "Romania", "Bulgaria", "Slovenia", "Croatia", "Bosnia and Herzegovina", "Montenegro", "Serbia", "Kosovo", "North Macedonia", "Albania", "Greece", "Malta", "Andorra", "Monaco", "San Marino", "Vatican City", "Liechtenstein"
]

const LANGUAGES = [
  "English", "Spanish", "French", "German", "Italian", "Portuguese", "Russian", "Chinese", "Japanese", "Korean", "Arabic", "Hindi", "Turkish", "Dutch", "Swedish", "Norwegian", "Danish", "Finnish", "Polish", "Czech", "Hungarian", "Greek", "Hebrew", "Thai", "Vietnamese", "Indonesian", "Malay", "Filipino", "Bengali", "Urdu", "Persian", "Swahili"
]

export function UserProfileEditor({ user, onUpdate }: UserProfileEditorProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isUploading, setIsUploading] = useState(false)
  
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const [formData, setFormData] = useState({
    name: user.name || "",
    email: user.email,
    phone: user.phone || "",
    bio: user.bio || "",
    location: user.location || "",
    timezone: user.timezone || "UTC+00:00",
    language: user.language || "English",
  })

  useEffect(() => {
    setFormData({
      name: user.name || "",
      email: user.email,
      phone: user.phone || "",
      bio: user.bio || "",
      location: user.location || "",
      timezone: user.timezone || "UTC+00:00",
      language: user.language || "English",
    })
    setImagePreview(user.image || null)
  }, [user])

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError("Please select an image file")
        return
      }
      
      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        setError("Image size must be less than 5MB")
        return
      }
      
      setSelectedFile(file)
      
      // Create preview
      const reader = new FileReader()
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleImageUpload = async () => {
    if (!selectedFile) return

    setIsUploading(true)
    setUploadProgress(0)
    setError("")

    try {
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return 90
          }
          return prev + 10
        })
      }, 200)

      const formData = new FormData()
      formData.append("file", selectedFile)
      formData.append("type", "profile")

      const response = await fetch("/api/upload/profile", {
        method: "POST",
        body: formData,
      })

      clearInterval(progressInterval)
      setUploadProgress(100)

      if (response.ok) {
        const data = await response.json()
        // Use the primary URL (medium size) for the profile image
        setFormData(prev => ({ ...prev, image: data.primaryUrl || data.urls.medium }))
        setSuccess("Profile image uploaded and optimized successfully!")
        setTimeout(() => setSuccess(""), 3000)
      } else {
        const errorData = await response.json()
        setError(errorData.error || "Failed to upload image")
      }
    } catch (error) {
      setError("An error occurred while uploading the image")
    } finally {
      setIsUploading(false)
      setSelectedFile(null)
      setUploadProgress(0)
    }
  }

  const handleRemoveImage = () => {
    setImagePreview(null)
    setSelectedFile(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleSave = async () => {
    setLoading(true)
    setError("")
    setSuccess("")

    try {
      const response = await fetch("/api/user/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        const updatedUser = await response.json()
        setSuccess("Profile updated successfully!")
        setIsEditing(false)
        onUpdate(updatedUser)
        setTimeout(() => setSuccess(""), 3000)
      } else {
        const data = await response.json()
        setError(data.error || "Failed to update profile")
      }
    } catch (error) {
      setError("An error occurred. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    setFormData({
      name: user.name || "",
      email: user.email,
      phone: user.phone || "",
      bio: user.bio || "",
      location: user.location || "",
      timezone: user.timezone || "UTC+00:00",
      language: user.language || "English",
    })
    setImagePreview(user.image || null)
    setSelectedFile(null)
    setIsEditing(false)
    setError("")
    setSuccess("")
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map(word => word.charAt(0).toUpperCase())
      .join("")
      .substring(0, 2)
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center space-x-2">
                <User className="h-5 w-5" />
                <span>Profile Settings</span>
              </CardTitle>
              <CardDescription>
                Manage your personal information and profile picture
              </CardDescription>
            </div>
            {!isEditing && (
              <Button 
                variant="outline" 
                onClick={() => setIsEditing(true)}
                className="group"
              >
                <Edit className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform" />
                Edit Profile
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          {success && (
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">{success}</AlertDescription>
            </Alert>
          )}

          {/* Profile Image Section */}
          <div className="flex flex-col items-center space-y-4">
            <div className="relative">
              <Avatar className="h-24 w-24 border-4 border-gray-200">
                <AvatarImage src={imagePreview || undefined} alt="Profile" />
                <AvatarFallback className="text-lg font-semibold bg-gradient-to-br from-blue-600 to-purple-600 text-white">
                  {getInitials(formData.name || "U")}
                </AvatarFallback>
              </Avatar>
              
              {isEditing && (
                <div className="absolute -bottom-2 -right-2 flex space-x-1">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        size="sm"
                        className="h-8 w-8 rounded-full bg-blue-600 hover:bg-blue-700 text-white border-2 border-white shadow-lg"
                      >
                        <Camera className="h-3 w-3" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Update Profile Picture</DialogTitle>
                        <DialogDescription>
                          Choose a new profile picture. Max size: 5MB. Supported formats: JPG, PNG, GIF.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="flex justify-center">
                          <Avatar className="h-32 w-32">
                            <AvatarImage src={imagePreview || undefined} alt="Preview" />
                            <AvatarFallback className="text-2xl font-semibold bg-gradient-to-br from-blue-600 to-purple-600 text-white">
                              {getInitials(formData.name || "U")}
                            </AvatarFallback>
                          </Avatar>
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="profile-image">Choose Image</Label>
                          <Input
                            ref={fileInputRef}
                            id="profile-image"
                            type="file"
                            accept="image/*"
                            onChange={handleFileChange}
                            className="cursor-pointer"
                          />
                        </div>

                        {selectedFile && (
                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                              <span className="font-medium">{selectedFile.name}</span>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleRemoveImage}
                                className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </div>
                            
                            {isUploading && (
                              <div className="space-y-1">
                                <div className="flex justify-between text-xs">
                                  <span>Uploading...</span>
                                  <span>{uploadProgress}%</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                  <div 
                                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                    style={{ width: `${uploadProgress}%` }}
                                  />
                                </div>
                              </div>
                            )}
                            
                            {!isUploading && (
                              <Button
                                onClick={handleImageUpload}
                                className="w-full"
                                disabled={isUploading}
                              >
                                <Upload className="h-4 w-4 mr-2" />
                                Upload Image
                              </Button>
                            )}
                          </div>
                        )}

                        {imagePreview && !selectedFile && (
                          <Button
                            variant="outline"
                            onClick={handleRemoveImage}
                            className="w-full"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Remove Current Image
                          </Button>
                        )}
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              )}
            </div>
            
            {isEditing && (
              <p className="text-sm text-gray-500 text-center">
                Click the camera icon to update your profile picture
              </p>
            )}
          </div>

          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              {isEditing ? (
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  placeholder="Enter your full name"
                />
              ) : (
                <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-md">
                  <User className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">{formData.name || "Not specified"}</span>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-md">
                <span className="text-sm text-gray-600">{formData.email}</span>
                <Badge variant="secondary" className="text-xs">
                  Verified
                </Badge>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              {isEditing ? (
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleChange("phone", e.target.value)}
                  placeholder="+1 (555) 123-4567"
                />
              ) : (
                <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-md">
                  <Phone className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">{formData.phone || "Not specified"}</span>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Country</Label>
              {isEditing ? (
                <Select value={formData.location} onValueChange={(value) => handleChange("location", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select country" />
                  </SelectTrigger>
                  <SelectContent>
                    {COUNTRIES.map((country) => (
                      <SelectItem key={country} value={country}>
                        {country}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-md">
                  <MapPin className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">{formData.location || "Not specified"}</span>
                </div>
              )}
            </div>
          </div>

          {/* Preferences */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="timezone">Timezone</Label>
              {isEditing ? (
                <Select value={formData.timezone} onValueChange={(value) => handleChange("timezone", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select timezone" />
                  </SelectTrigger>
                  <SelectContent>
                    {TIMEZONES.map((timezone) => (
                      <SelectItem key={timezone} value={timezone}>
                        {timezone}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-md">
                  <Clock className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">{formData.timezone}</span>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="language">Preferred Language</Label>
              {isEditing ? (
                <Select value={formData.language} onValueChange={(value) => handleChange("language", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select language" />
                  </SelectTrigger>
                  <SelectContent>
                    {LANGUAGES.map((language) => (
                      <SelectItem key={language} value={language}>
                        {language}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-md">
                  <Languages className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">{formData.language}</span>
                </div>
              )}
            </div>
          </div>

          {/* Bio */}
          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            {isEditing ? (
              <Textarea
                id="bio"
                value={formData.bio}
                onChange={(e) => handleChange("bio", e.target.value)}
                placeholder="Tell us about yourself..."
                rows={4}
                className="resize-none"
              />
            ) : (
              <div className="flex items-start space-x-2 p-3 bg-gray-50 rounded-md min-h-[100px]">
                <FileText className="h-4 w-4 text-gray-500 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-gray-600">
                  {formData.bio || "No bio provided"}
                </span>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          {isEditing && (
            <div className="flex justify-end space-x-2 pt-4 border-t">
              <Button variant="outline" onClick={handleCancel}>
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}