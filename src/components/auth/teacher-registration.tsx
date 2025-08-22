"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Checkbox } from "@/components/ui/checkbox"
import { 
  Loader2, 
  Plus, 
  X, 
  Clock, 
  Globe, 
  BookOpen, 
  Star, 
  UserCheck,
  ArrowLeft,
  Sparkles,
  Eye,
  EyeOff,
  Lock,
  Mail,
  User,
  Calendar,
  DollarSign,
  Award,
  Target
} from "lucide-react"
import { motion } from "framer-motion"

interface TeacherRegistrationData {
  // Basic Info
  name: string
  email: string
  password: string
  confirmPassword: string
  
  // Professional Info
  bio: string
  experience: string
  education: string
  hourlyRate: string
  
  // Languages & Specializations
  languages: string[]
  specializations: []
  
  // Teaching Style
  teachingStyle: string
  preferredAgeGroups: string[]
  
  // Availability
  availability: {
    dayOfWeek: number
    startTime: string
    endTime: string
  }[]
  
  // Additional Info
  certifications: string[]
  introductionVideo: string
  trialLesson: boolean
}

const DAYS_OF_WEEK = [
  { value: 0, label: "Sunday" },
  { value: 1, label: "Monday" },
  { value: 2, label: "Tuesday" },
  { value: 3, label: "Wednesday" },
  { value: 4, label: "Thursday" },
  { value: 5, label: "Friday" },
  { value: 6, label: "Saturday" }
]

const LANGUAGE_OPTIONS = [
  "English", "Spanish", "French", "German", "Italian", "Portuguese", "Chinese", "Japanese", "Korean", "Arabic"
]

const SPECIALIZATION_OPTIONS = [
  "Business English", "Conversation Practice", "Grammar", "Pronunciation", "Vocabulary Building",
  "Exam Preparation (IELTS/TOEFL)", "Academic English", "Creative Writing", "Public Speaking",
  "Interview Preparation", "Travel English", "English for Kids", "English for Teens"
]

const AGE_GROUP_OPTIONS = [
  "Children (5-12)", "Teenagers (13-17)", "Young Adults (18-25)", "Adults (26-40)", "Mature Adults (40+)"
]

interface TeacherRegistrationProps {
  onSubmit: (data: TeacherRegistrationData) => Promise<void>
  onBack: () => void
  loading?: boolean
  error?: string
}

export default function TeacherRegistration({ onSubmit, onBack, loading = false, error = "" }: TeacherRegistrationProps) {
  const [formData, setFormData] = useState<TeacherRegistrationData>({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    bio: "",
    experience: "",
    education: "",
    hourlyRate: "25",
    languages: [],
    specializations: [],
    teachingStyle: "",
    preferredAgeGroups: [],
    availability: [],
    certifications: [],
    introductionVideo: "",
    trialLesson: true
  })

  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [newLanguage, setNewLanguage] = useState("")
  const [newSpecialization, setNewSpecialization] = useState("")
  const [newCertification, setNewCertification] = useState("")
  const [newAvailability, setNewAvailability] = useState({
    dayOfWeek: 1,
    startTime: "09:00",
    endTime: "10:00"
  })

  const addLanguage = () => {
    if (newLanguage && !formData.languages.includes(newLanguage)) {
      setFormData(prev => ({
        ...prev,
        languages: [...prev.languages, newLanguage]
      }))
      setNewLanguage("")
    }
  }

  const removeLanguage = (language: string) => {
    setFormData(prev => ({
      ...prev,
      languages: prev.languages.filter(l => l !== language)
    }))
  }

  const addSpecialization = () => {
    if (newSpecialization && !formData.specializations.includes(newSpecialization)) {
      setFormData(prev => ({
        ...prev,
        specializations: [...prev.specializations, newSpecialization]
      }))
      setNewSpecialization("")
    }
  }

  const removeSpecialization = (specialization: string) => {
    setFormData(prev => ({
      ...prev,
      specializations: prev.specializations.filter(s => s !== specialization)
    }))
  }

  const addCertification = () => {
    if (newCertification.trim()) {
      setFormData(prev => ({
        ...prev,
        certifications: [...prev.certifications, newCertification.trim()]
      }))
      setNewCertification("")
    }
  }

  const removeCertification = (certification: string) => {
    setFormData(prev => ({
      ...prev,
      certifications: prev.certifications.filter(c => c !== certification)
    }))
  }

  const addAvailability = () => {
    const exists = formData.availability.some(
      avail => avail.dayOfWeek === newAvailability.dayOfWeek && 
               avail.startTime === newAvailability.startTime
    )
    
    if (!exists) {
      setFormData(prev => ({
        ...prev,
        availability: [...prev.availability, newAvailability]
      }))
      setNewAvailability({
        dayOfWeek: 1,
        startTime: "09:00",
        endTime: "10:00"
      })
    }
  }

  const removeAvailability = (index: number) => {
    setFormData(prev => ({
      ...prev,
      availability: prev.availability.filter((_, i) => i !== index)
    }))
  }

  const toggleAgeGroup = (ageGroup: string) => {
    setFormData(prev => ({
      ...prev,
      preferredAgeGroups: prev.preferredAgeGroups.includes(ageGroup)
        ? prev.preferredAgeGroups.filter(ag => ag !== ageGroup)
        : [...prev.preferredAgeGroups, ageGroup]
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (formData.password !== formData.confirmPassword) {
      return
    }

    await onSubmit(formData)
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      className="max-w-6xl mx-auto"
    >
      <Card className="border-0 shadow-2xl bg-white/95 backdrop-blur-sm">
        <CardHeader className="text-center space-y-4 pb-8">
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="mx-auto w-16 h-16 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl flex items-center justify-center"
          >
            <UserCheck className="h-8 w-8 text-white" />
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            <CardTitle className="text-2xl font-bold text-gray-900 flex items-center justify-center gap-2">
              <Award className="h-6 w-6 text-purple-600" />
              Teacher Registration
            </CardTitle>
            <CardDescription className="text-gray-600 mt-2">
              Create your professional teacher profile with detailed information
            </CardDescription>
          </motion.div>
        </CardHeader>

        <CardContent className="space-y-8">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Basic Information */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="space-y-6"
            >
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <User className="h-5 w-5 text-blue-600" />
                Basic Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm font-medium text-gray-700">
                    Full Name *
                  </Label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className="h-5 w-5 text-gray-400" />
                    </div>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      required
                      placeholder="Enter your full name"
                      className="pl-10 h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500 transition-colors"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                    Email Address *
                  </Label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-gray-400" />
                    </div>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      required
                      placeholder="your@email.com"
                      className="pl-10 h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500 transition-colors"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                    Password *
                  </Label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                      required
                      placeholder="Create a strong password"
                      className="pl-10 pr-10 h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500 transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                      ) : (
                        <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                      )}
                    </button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">
                    Confirm Password *
                  </Label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                      required
                      placeholder="Confirm your password"
                      className="pl-10 pr-10 h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500 transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                      ) : (
                        <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Professional Information */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.5 }}
              className="space-y-6"
            >
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Award className="h-5 w-5 text-purple-600" />
                Professional Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="experience" className="text-sm font-medium text-gray-700">
                    Years of Experience *
                  </Label>
                  <Select value={formData.experience} onValueChange={(value) => setFormData(prev => ({ ...prev, experience: value }))}>
                    <SelectTrigger className="h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500 transition-colors">
                      <SelectValue placeholder="Select experience level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0-1">Less than 1 year</SelectItem>
                      <SelectItem value="1-3">1-3 years</SelectItem>
                      <SelectItem value="3-5">3-5 years</SelectItem>
                      <SelectItem value="5-10">5-10 years</SelectItem>
                      <SelectItem value="10+">10+ years</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="hourlyRate" className="text-sm font-medium text-gray-700">
                    Hourly Rate (USD) *
                  </Label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <DollarSign className="h-5 w-5 text-gray-400" />
                    </div>
                    <Input
                      id="hourlyRate"
                      type="number"
                      min="5"
                      max="200"
                      value={formData.hourlyRate}
                      onChange={(e) => setFormData(prev => ({ ...prev, hourlyRate: e.target.value }))}
                      required
                      placeholder="25"
                      className="pl-10 h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500 transition-colors"
                    />
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="bio" className="text-sm font-medium text-gray-700">
                  Professional Bio *
                </Label>
                <Textarea
                  id="bio"
                  value={formData.bio}
                  onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                  required
                  placeholder="Tell us about your teaching experience, methodology, and what makes you a great teacher..."
                  className="min-h-[120px] border-gray-200 focus:border-blue-500 focus:ring-blue-500 transition-colors"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="education" className="text-sm font-medium text-gray-700">
                  Education & Qualifications *
                </Label>
                <Textarea
                  id="education"
                  value={formData.education}
                  onChange={(e) => setFormData(prev => ({ ...prev, education: e.target.value }))}
                  required
                  placeholder="List your degrees, certifications, and relevant qualifications..."
                  className="min-h-[100px] border-gray-200 focus:border-blue-500 focus:ring-blue-500 transition-colors"
                />
              </div>
            </motion.div>

            {/* Languages & Specializations */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.5 }}
              className="space-y-6"
            >
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Globe className="h-5 w-5 text-green-600" />
                Languages & Specializations
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <Label className="text-sm font-medium text-gray-700">Languages You Teach *</Label>
                  <div className="flex gap-2">
                    <Select value={newLanguage} onValueChange={setNewLanguage}>
                      <SelectTrigger className="flex-1 h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500 transition-colors">
                        <SelectValue placeholder="Select language" />
                      </SelectTrigger>
                      <SelectContent>
                        {LANGUAGE_OPTIONS.map(lang => (
                          <SelectItem key={lang} value={lang}>{lang}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button type="button" onClick={addLanguage} size="sm" className="h-12 px-4">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.languages.map(language => (
                      <Badge key={language} variant="secondary" className="flex items-center gap-1 bg-blue-100 text-blue-800">
                        <Globe className="h-3 w-3" />
                        {language}
                        <X 
                          className="h-3 w-3 cursor-pointer hover:text-blue-600" 
                          onClick={() => removeLanguage(language)}
                        />
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <Label className="text-sm font-medium text-gray-700">Specializations *</Label>
                  <div className="flex gap-2">
                    <Select value={newSpecialization} onValueChange={setNewSpecialization}>
                      <SelectTrigger className="flex-1 h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500 transition-colors">
                        <SelectValue placeholder="Select specialization" />
                      </SelectTrigger>
                      <SelectContent>
                        {SPECIALIZATION_OPTIONS.map(spec => (
                          <SelectItem key={spec} value={spec}>{spec}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button type="button" onClick={addSpecialization} size="sm" className="h-12 px-4">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.specializations.map(specialization => (
                      <Badge key={specialization} variant="secondary" className="flex items-center gap-1 bg-purple-100 text-purple-800">
                        <Star className="h-3 w-3" />
                        {specialization}
                        <X 
                          className="h-3 w-3 cursor-pointer hover:text-purple-600" 
                          onClick={() => removeSpecialization(specialization)}
                        />
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Teaching Style & Preferences */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.5 }}
              className="space-y-6"
            >
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Target className="h-5 w-5 text-orange-600" />
                Teaching Style & Preferences
              </h3>
              <div className="space-y-2">
                <Label htmlFor="teachingStyle" className="text-sm font-medium text-gray-700">
                  Teaching Methodology *
                </Label>
                <Textarea
                  id="teachingStyle"
                  value={formData.teachingStyle}
                  onChange={(e) => setFormData(prev => ({ ...prev, teachingStyle: e.target.value }))}
                  required
                  placeholder="Describe your teaching approach, methods, and philosophy..."
                  className="min-h-[100px] border-gray-200 focus:border-blue-500 focus:ring-blue-500 transition-colors"
                />
              </div>
              <div className="space-y-3">
                <Label className="text-sm font-medium text-gray-700">Preferred Student Age Groups *</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {AGE_GROUP_OPTIONS.map(ageGroup => (
                    <div key={ageGroup} className="flex items-center space-x-2">
                      <Checkbox
                        id={ageGroup}
                        checked={formData.preferredAgeGroups.includes(ageGroup)}
                        onCheckedChange={() => toggleAgeGroup(ageGroup)}
                        className="border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <Label htmlFor={ageGroup} className="text-sm text-gray-700">{ageGroup}</Label>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Availability */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.5 }}
              className="space-y-6"
            >
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Calendar className="h-5 w-5 text-indigo-600" />
                Availability
              </h3>
              <div className="space-y-3">
                <Label className="text-sm font-medium text-gray-700">Set Your Available Time Slots</Label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <Select 
                    value={newAvailability.dayOfWeek.toString()} 
                    onValueChange={(value) => setNewAvailability(prev => ({ ...prev, dayOfWeek: parseInt(value) }))}
                  >
                    <SelectTrigger className="h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500 transition-colors">
                      <SelectValue placeholder="Day" />
                    </SelectTrigger>
                    <SelectContent>
                      {DAYS_OF_WEEK.map(day => (
                        <SelectItem key={day.value} value={day.value.toString()}>{day.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input
                    type="time"
                    value={newAvailability.startTime}
                    onChange={(e) => setNewAvailability(prev => ({ ...prev, startTime: e.target.value }))}
                    className="h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500 transition-colors"
                  />
                  <Input
                    type="time"
                    value={newAvailability.endTime}
                    onChange={(e) => setNewAvailability(prev => ({ ...prev, endTime: e.target.value }))}
                    className="h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500 transition-colors"
                  />
                </div>
                <Button type="button" onClick={addAvailability} size="sm" className="h-10">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Time Slot
                </Button>
                
                <div className="space-y-2">
                  {formData.availability.map((slot, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Clock className="h-4 w-4 text-gray-500" />
                        <span className="text-sm font-medium">
                          {DAYS_OF_WEEK.find(d => d.value === slot.dayOfWeek)?.label}: {slot.startTime} - {slot.endTime}
                        </span>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeAvailability(index)}
                        className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Additional Information */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9, duration: 0.5 }}
              className="space-y-6"
            >
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-pink-600" />
                Additional Information
              </h3>
              <div className="space-y-3">
                <Label className="text-sm font-medium text-gray-700">Certifications</Label>
                <div className="flex gap-2">
                  <Input
                    value={newCertification}
                    onChange={(e) => setNewCertification(e.target.value)}
                    placeholder="Add certification (e.g., TESOL, CELTA)"
                    className="flex-1 h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500 transition-colors"
                  />
                  <Button type="button" onClick={addCertification} size="sm" className="h-12 px-4">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.certifications.map(certification => (
                    <Badge key={certification} variant="secondary" className="flex items-center gap-1 bg-green-100 text-green-800">
                      <Award className="h-3 w-3" />
                      {certification}
                      <X 
                        className="h-3 w-3 cursor-pointer hover:text-green-600" 
                        onClick={() => removeCertification(certification)}
                      />
                    </Badge>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Error Alert */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Alert variant="destructive" className="border-red-200 bg-red-50">
                  <AlertDescription className="text-red-700">
                    {error}
                  </AlertDescription>
                </Alert>
              </motion.div>
            )}

            {/* Action Buttons */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1, duration: 0.5 }}
              className="flex gap-4 pt-4"
            >
              <Button 
                type="button" 
                variant="outline" 
                onClick={onBack} 
                disabled={loading}
                className="flex-1 h-12 border-gray-200 hover:border-gray-300 text-gray-700 hover:text-gray-900 font-medium transition-colors"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <Button 
                type="submit" 
                className="flex-1 h-12 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 group"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating Teacher Profile...
                  </>
                ) : (
                  <>
                    Create Teacher Profile
                    <Sparkles className="ml-2 h-4 w-4 group-hover:rotate-12 transition-transform" />
                  </>
                )}
              </Button>
            </motion.div>
          </form>

          {/* Benefits */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.1, duration: 0.5 }}
            className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-6 space-y-4"
          >
            <h4 className="font-semibold text-gray-900 flex items-center gap-2">
              <Star className="h-5 w-5 text-purple-600" />
              Benefits of becoming a teacher:
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <ul className="text-sm text-gray-600 space-y-2">
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
                  Set your own hourly rates
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
                  Flexible teaching schedule
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
                  Teach from anywhere
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
                  Access to global students
                </li>
              </ul>
              <ul className="text-sm text-gray-600 space-y-2">
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-pink-600 rounded-full"></div>
                  Professional development
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-pink-600 rounded-full"></div>
                  Build your teaching brand
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-pink-600 rounded-full"></div>
                  Community support
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-pink-600 rounded-full"></div>
                  Performance analytics
                </li>
              </ul>
            </div>
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  )
}