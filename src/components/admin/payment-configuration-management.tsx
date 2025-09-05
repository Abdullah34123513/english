"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  Plus, 
  Edit, 
  Trash2, 
  Building, 
  CreditCard, 
  Settings, 
  AlertCircle,
  CheckCircle,
  Star,
  Clock,
  Save,
  X,
  GripVertical,
  RefreshCw
} from "lucide-react"

interface PaymentConfiguration {
  id: string
  bankName: string
  accountNumber: string
  iban?: string
  accountHolder: string
  branch?: string
  logo?: string
  rating?: number
  features?: string
  processingTime?: string
  isActive: boolean
  displayOrder: number
  createdAt: string
  updatedAt: string
}

interface PaymentConfigurationManagementProps {
  onUpdate: () => void
}

export function PaymentConfigurationManagement({ onUpdate }: PaymentConfigurationManagementProps) {
  const [configurations, setConfigurations] = useState<PaymentConfiguration[]>([])
  const [loading, setLoading] = useState(true)
  const [editingConfig, setEditingConfig] = useState<PaymentConfiguration | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    bankName: "",
    accountNumber: "",
    iban: "",
    accountHolder: "",
    branch: "",
    logo: "",
    rating: 4.5,
    features: "",
    processingTime: "",
    isActive: true,
    displayOrder: 0
  })

  useEffect(() => {
    fetchConfigurations()
  }, [])

  const fetchConfigurations = async () => {
    try {
      const response = await fetch("/api/payment-configurations")
      if (response.ok) {
        const data = await response.json()
        setConfigurations(data)
      }
    } catch (error) {
      console.error("Error fetching payment configurations:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const url = editingConfig 
        ? `/api/payment-configurations/${editingConfig.id}`
        : "/api/payment-configurations"
      
      const method = editingConfig ? "PUT" : "POST"
      
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        await fetchConfigurations()
        setIsDialogOpen(false)
        setEditingConfig(null)
        resetForm()
        onUpdate()
      } else {
        const errorData = await response.json()
        alert(errorData.error || "Failed to save configuration")
      }
    } catch (error) {
      console.error("Error saving configuration:", error)
      alert("An error occurred. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEdit = (config: PaymentConfiguration) => {
    setEditingConfig(config)
    setFormData({
      bankName: config.bankName,
      accountNumber: config.accountNumber,
      iban: config.iban || "",
      accountHolder: config.accountHolder,
      branch: config.branch || "",
      logo: config.logo || "",
      rating: config.rating || 4.5,
      features: config.features || "",
      processingTime: config.processingTime || "",
      isActive: config.isActive,
      displayOrder: config.displayOrder
    })
    setIsDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this payment configuration?")) {
      return
    }

    try {
      const response = await fetch(`/api/payment-configurations/${id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        await fetchConfigurations()
        onUpdate()
      } else {
        alert("Failed to delete configuration")
      }
    } catch (error) {
      console.error("Error deleting configuration:", error)
      alert("An error occurred. Please try again.")
    }
  }

  const resetForm = () => {
    setFormData({
      bankName: "",
      accountNumber: "",
      iban: "",
      accountHolder: "",
      branch: "",
      logo: "",
      rating: 4.5,
      features: "",
      processingTime: "",
      isActive: true,
      displayOrder: 0
    })
  }

  const handleAddNew = () => {
    setEditingConfig(null)
    resetForm()
    setIsDialogOpen(true)
  }

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${i < Math.floor(rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
      />
    ))
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-semibold text-gray-900">Payment Configuration</h3>
          <p className="text-gray-600">Manage bank details and payment options for students</p>
        </div>
        <Button onClick={handleAddNew} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="h-4 w-4 mr-2" />
          Add Bank
        </Button>
      </div>

      {/* Configurations List */}
      <div className="space-y-4">
        {configurations.length === 0 ? (
          <Card className="border-0 bg-white shadow-sm">
            <CardContent className="p-8 text-center">
              <Building className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <h4 className="text-lg font-semibold text-gray-900 mb-2">No payment configurations</h4>
              <p className="text-gray-600 mb-4">
                Add your first bank configuration to enable student payments.
              </p>
              <Button onClick={handleAddNew}>
                <Plus className="h-4 w-4 mr-2" />
                Add First Bank
              </Button>
            </CardContent>
          </Card>
        ) : (
          configurations.map((config) => (
            <Card key={config.id} className="border-0 bg-white shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="bg-blue-100 p-2 rounded-lg">
                        <Building className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">{config.bankName}</h4>
                        <p className="text-sm text-gray-600">{config.accountHolder}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        {config.isActive ? (
                          <Badge className="bg-green-100 text-green-800">Active</Badge>
                        ) : (
                          <Badge variant="secondary">Inactive</Badge>
                        )}
                        {config.rating && (
                          <div className="flex items-center space-x-1">
                            {renderStars(config.rating)}
                            <span className="text-sm text-gray-600">{config.rating}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                      <div>
                        <Label className="text-xs text-gray-600">Account Number</Label>
                        <p className="font-mono text-sm">{config.accountNumber}</p>
                      </div>
                      {config.iban && (
                        <div>
                          <Label className="text-xs text-gray-600">IBAN</Label>
                          <p className="font-mono text-sm">{config.iban}</p>
                        </div>
                      )}
                      {config.branch && (
                        <div>
                          <Label className="text-xs text-gray-600">Branch</Label>
                          <p className="text-sm">{config.branch}</p>
                        </div>
                      )}
                      {config.processingTime && (
                        <div>
                          <Label className="text-xs text-gray-600">Processing Time</Label>
                          <p className="text-sm flex items-center">
                            <Clock className="h-3 w-3 mr-1" />
                            {config.processingTime}
                          </p>
                        </div>
                      )}
                    </div>

                    {config.features && (
                      <div className="mb-3">
                        <Label className="text-xs text-gray-600">Features</Label>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {JSON.parse(config.features).map((feature: string, i: number) => (
                            <Badge key={i} variant="outline" className="text-xs">
                              {feature}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center space-x-2 ml-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(config)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(config.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingConfig ? "Edit Payment Configuration" : "Add Payment Configuration"}
            </DialogTitle>
            <DialogDescription>
              Configure bank details for student payments
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="bankName">Bank Name *</Label>
                <Input
                  id="bankName"
                  value={formData.bankName}
                  onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="accountHolder">Account Holder *</Label>
                <Input
                  id="accountHolder"
                  value={formData.accountHolder}
                  onChange={(e) => setFormData({ ...formData, accountHolder: e.target.value })}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="accountNumber">Account Number *</Label>
                <Input
                  id="accountNumber"
                  value={formData.accountNumber}
                  onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="iban">IBAN</Label>
                <Input
                  id="iban"
                  value={formData.iban}
                  onChange={(e) => setFormData({ ...formData, iban: e.target.value })}
                />
              </div>
              
              <div>
                <Label htmlFor="branch">Branch</Label>
                <Input
                  id="branch"
                  value={formData.branch}
                  onChange={(e) => setFormData({ ...formData, branch: e.target.value })}
                />
              </div>
              
              <div>
                <Label htmlFor="logo">Logo (Emoji)</Label>
                <Input
                  id="logo"
                  value={formData.logo}
                  onChange={(e) => setFormData({ ...formData, logo: e.target.value })}
                  placeholder="🏦"
                />
              </div>
              
              <div>
                <Label htmlFor="rating">Rating (1-5)</Label>
                <Input
                  id="rating"
                  type="number"
                  min="1"
                  max="5"
                  step="0.1"
                  value={formData.rating}
                  onChange={(e) => setFormData({ ...formData, rating: parseFloat(e.target.value) })}
                />
              </div>
              
              <div>
                <Label htmlFor="processingTime">Processing Time</Label>
                <Input
                  id="processingTime"
                  value={formData.processingTime}
                  onChange={(e) => setFormData({ ...formData, processingTime: e.target.value })}
                  placeholder="5-10 minutes"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="features">Features (JSON Array)</Label>
              <Textarea
                id="features"
                value={formData.features}
                onChange={(e) => setFormData({ ...formData, features: e.target.value })}
                placeholder='["24/7 Processing", "Instant Confirmation", "Mobile App"]'
                rows={3}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Switch
                  id="isActive"
                  checked={formData.isActive}
                  onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                />
                <Label htmlFor="isActive">Active</Label>
              </div>
              
              <div>
                <Label htmlFor="displayOrder">Display Order</Label>
                <Input
                  id="displayOrder"
                  type="number"
                  min="0"
                  value={formData.displayOrder}
                  onChange={(e) => setFormData({ ...formData, displayOrder: parseInt(e.target.value) })}
                  className="w-20"
                />
              </div>
            </div>
            
            <div className="flex justify-end space-x-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isSubmitting ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                {editingConfig ? "Update" : "Create"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}