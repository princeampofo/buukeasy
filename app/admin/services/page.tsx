'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useAuthContext } from '@/contexts/AuthContext'
import { 
  Plus, 
  Search, 
  Trash2, 
  Clock, 
  DollarSign,
  Users,
  MoreVertical
} from 'lucide-react'

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"

interface Service {
  id: string
  name: string
  description: string | null
  duration: number
  price: number
  category: string
  bufferTime: number
  requireDeposit: boolean
  minAdvanceHours: number
  maxAdvanceDays: number
  specialInstructions: string | null
  imageUrl: string | null
  isActive: boolean
  createdAt: string
  updatedAt: string
}

const categories = [
  'All',
  'HAIR_SERVICES',
  'NAIL_CARE',
  'SKIN_CARE',
  'BARBERING',
  'BEAUTY_TREATMENT',
  'MASSAGE',
  'OTHER'
]

const formatCategory = (category: string) => {
  if (category === 'All') return category
  return category
    .split('_')
    .map(word => word.charAt(0) + word.slice(1).toLowerCase())
    .join(' ')
}

export default function ServicesPage() {
  const { user } = useAuthContext()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [services, setServices] = useState<Service[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [serviceToDelete, setServiceToDelete] = useState<string | null>(null)

  useEffect(() => {
    if (user?.businessSlug) {
      fetchServices()
    }
  }, [user])

  const filteredServices = services.filter(service => {
    const matchesSearch = service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (service.description?.toLowerCase() || '').includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === 'All' || service.category === selectedCategory
    
    return matchesSearch && matchesCategory
  })

  const fetchServices = async () => {
    if (!user?.businessSlug) return

    try {
      setIsLoading(true)
      setError(null)
      const response = await fetch('/api/admin/services')
      if (!response.ok) throw new Error('Failed to fetch services')
      
      const data = await response.json()
      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch services')
      }
      
      setServices(data.data)
    } catch (error) {
      console.error('Error fetching services:', error)
      setError(error instanceof Error ? error.message : 'Failed to fetch services')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteService = async (id: string) => {
    try {
      const response = await fetch(`/api/admin/services/${id}`, {
        method: 'DELETE'
      })
      
      if (response.ok) {
        setServices(prev => prev.filter(service => service.id !== id))
        setDeleteDialogOpen(false)
      } else {
        throw new Error('Failed to delete service')
      }
    } catch (error) {
      console.error('Error deleting service:', error)
      alert('Failed to delete service')
    }
  }

  if (isLoading) {
    return (
      <div className="container px-6 py-6">
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="w-full h-[200px] animate-pulse bg-gray-100" />
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container px-6 py-6">
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-800">Error loading services</CardTitle>
            <CardDescription className="text-red-600">{error}</CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  return (
    <div className="container px-6 py-6">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Services</h2>
            <p className="text-muted-foreground">
              Manage your business services and pricing
            </p>
          </div>
          <Button asChild>
            <Link href="/admin/services/new">
              <Plus className="mr-2 h-4 w-4" />
              Add Service
            </Link>
          </Button>
        </div>

        <Separator />

        {/* Filters */}
        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search services..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map(category => (
                <SelectItem key={category} value={category}>
                  {formatCategory(category)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Services Grid */}
        {filteredServices.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredServices.map((service) => (
              <Card key={service.id}>
                <CardHeader className="relative">
                  <div className="absolute right-6 top-6">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={`/admin/services/${service.id}/edit`}>
                            Edit Service
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          className="text-red-600"
                          onClick={() => {
                            setServiceToDelete(service.id)
                            setDeleteDialogOpen(true)
                          }}
                        >
                          Delete Service
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <CardTitle>{service.name}</CardTitle>
                  <CardDescription>{service.description || 'No description available'}</CardDescription>
                  <p className="text-xs text-muted-foreground">{formatCategory(service.category)}</p>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center text-muted-foreground">
                        <Clock className="mr-1 h-4 w-4" />
                        {service.duration} min
                      </div>
                      <div className="flex items-center text-muted-foreground">
                        <DollarSign className="mr-1 h-4 w-4" />
                        {service.price === 0 ? 'Free' : `${service.price}`}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="p-12">
            <div className="flex flex-col items-center justify-center text-center">
              <Users className="h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">No services found</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                {searchTerm || selectedCategory !== 'All' ? 
                  'Try adjusting your search or filter criteria.' :
                  'Get started by creating your first service.'
                }
              </p>
              {!searchTerm && selectedCategory === 'All' && (
                <Button asChild className="mt-6">
                  <Link href="/admin/services/new">
                    <Plus className="mr-2 h-4 w-4" />
                    Add your first service
                  </Link>
                </Button>
              )}
            </div>
          </Card>
        )}

        {/* Service Statistics */}
        {filteredServices.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Service Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Services</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{services.length}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Average Price</CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      ${Math.round(services.filter(s => s.price > 0).reduce((acc, s) => acc + s.price, 0) / services.filter(s => s.price > 0).length)}
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Average Duration</CardTitle>
                    <Clock className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {Math.round(services.reduce((acc, s) => acc + s.duration, 0) / services.length)} min
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Delete Confirmation Dialog */}
        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Service</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete this service? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
                Cancel
              </Button>
              <Button 
                variant="destructive" 
                onClick={() => serviceToDelete && handleDeleteService(serviceToDelete)}
              >
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}