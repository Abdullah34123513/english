"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Edit, Save, X } from "lucide-react"

interface TeacherProfileProps {
  teacherData: any
  onUpdate: () => void
}

export function TeacherProfile({ teacherData, onUpdate }: TeacherProfileProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [formData, setFormData] = useState({
    bio: teacherData?.bio || "",
    hourlyRate: teacherData?.hourlyRate?.toString() || "25",
    experience: teacherData?.experience?.toString() || "",
    education: teacherData?.education || "",
    languages: teacherData?.languages || "",
  })

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSave = async () => {
    setLoading(true)
    setError("")
    setSuccess("")

    try {
      const response = await fetch("/api/teacher/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          bio: formData.bio,
          hourlyRate: parseFloat(formData.hourlyRate),
          experience: parseInt(formData.experience) || null,
          education: formData.education,
          languages: formData.languages,
        }),
      })

      if (response.ok) {
        setSuccess("Profile updated successfully!")
        setIsEditing(false)
        onUpdate()
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
      bio: teacherData?.bio || "",
      hourlyRate: teacherData?.hourlyRate?.toString() || "25",
      experience: teacherData?.experience?.toString() || "",
      education: teacherData?.education || "",
      languages: teacherData?.languages || "",
    })
    setIsEditing(false)
    setError("")
    setSuccess("")
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Teacher Profile</CardTitle>
            <CardDescription>
              Manage your teaching profile and information
            </CardDescription>
          </div>
          {!isEditing && (
            <Button variant="outline" onClick={() => setIsEditing(true)}>
              <Edit className="h-4 w-4 mr-2" />
              Edit Profile
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        {success && (
          <Alert>
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            {isEditing ? (
              <Textarea
                id="bio"
                value={formData.bio}
                onChange={(e) => handleChange("bio", e.target.value)}
                placeholder="Tell students about your teaching style, experience, and approach..."
                rows={4}
              />
            ) : (
              <p className="text-sm text-muted-foreground min-h-[100px] p-3 bg-gray-50 rounded-md">
                {formData.bio || "No bio provided"}
              </p>
            )}
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="hourlyRate">Hourly Rate ($)</Label>
              {isEditing ? (
                <Input
                  id="hourlyRate"
                  type="number"
                  value={formData.hourlyRate}
                  onChange={(e) => handleChange("hourlyRate", e.target.value)}
                  min="0"
                  step="0.01"
                />
              ) : (
                <p className="text-sm text-muted-foreground p-3 bg-gray-50 rounded-md">
                  ${formData.hourlyRate}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="experience">Years of Experience</Label>
              {isEditing ? (
                <Input
                  id="experience"
                  type="number"
                  value={formData.experience}
                  onChange={(e) => handleChange("experience", e.target.value)}
                  min="0"
                />
              ) : (
                <p className="text-sm text-muted-foreground p-3 bg-gray-50 rounded-md">
                  {formData.experience || "Not specified"}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="education">Education</Label>
            {isEditing ? (
              <Input
                id="education"
                value={formData.education}
                onChange={(e) => handleChange("education", e.target.value)}
                placeholder="e.g., BA in English Literature, CELTA certified"
              />
            ) : (
              <p className="text-sm text-muted-foreground p-3 bg-gray-50 rounded-md">
                {formData.education || "Not specified"}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="languages">Languages Taught</Label>
            {isEditing ? (
              <Input
                id="languages"
                value={formData.languages}
                onChange={(e) => handleChange("languages", e.target.value)}
                placeholder="e.g., Business English, Conversational English, IELTS Prep"
              />
            ) : (
              <p className="text-sm text-muted-foreground p-3 bg-gray-50 rounded-md">
                {formData.languages || "Not specified"}
              </p>
            )}
          </div>
        </div>

        {isEditing && (
          <div className="flex justify-end space-x-2 pt-4">
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
  )
}