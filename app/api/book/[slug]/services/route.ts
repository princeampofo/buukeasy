// app/api/service/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'

interface Service {
  id: number
  name: string
  duration: number
  price: number
  homeServicePrice: number
  description: string
  category: string
  availableLocations: ('in-store' | 'home')[]
  businessId: string
  businessName: string
  requirements?: string[]
  cancellationPolicy?: string
  preparationInstructions?: string
}

// Mock service database - in production, this would be a real database query
const services: Service[] = [
  // Elite Wellness Spa services
  {
    id: 1,
    name: "Deep Tissue Massage",
    duration: 60,
    price: 120,
    homeServicePrice: 150,
    description: "Therapeutic massage targeting deep muscle tension and knots. Our skilled therapists use firm pressure and slow strokes to reach deeper layers of muscle and fascia.",
    category: "Massage Therapy",
    availableLocations: ['in-store', 'home'],
    businessId: '1',
    businessName: "Elite Wellness Spa",
    requirements: ["Please arrive 10 minutes early", "Wear comfortable clothing"],
    cancellationPolicy: "24-hour cancellation notice required",
    preparationInstructions: "Avoid heavy meals 2 hours before treatment. Stay hydrated."
  },
  {
    id: 2,
    name: "Swedish Massage",
    duration: 60,
    price: 100,
    homeServicePrice: 130,
    description: "Relaxing full-body massage with gentle pressure using long strokes, kneading, and circular movements to help you relax and energize.",
    category: "Massage Therapy",
    availableLocations: ['in-store', 'home'],
    businessId: '1',
    businessName: "Elite Wellness Spa",
    requirements: ["Please arrive 10 minutes early"],
    cancellationPolicy: "24-hour cancellation notice required",
    preparationInstructions: "Avoid heavy meals 2 hours before treatment."
  },
  {
    id: 3,
    name: "Facial Treatment",
    duration: 45,
    price: 85,
    homeServicePrice: 110,
    description: "Customized facial treatment for all skin types. Includes cleansing, exfoliation, extraction, mask, and moisturizing.",
    category: "Skincare",
    availableLocations: ['in-store', 'home'],
    businessId: '1',
    businessName: "Elite Wellness Spa",
    requirements: ["Remove makeup before treatment", "Inform us of any skin allergies"],
    cancellationPolicy: "24-hour cancellation notice required",
    preparationInstructions: "Avoid sun exposure 24 hours before treatment. Remove contact lenses."
  },
  {
    id: 4,
    name: "Hot Stone Massage",
    duration: 90,
    price: 150,
    homeServicePrice: 180,
    description: "Relaxing massage using heated volcanic stones placed on specific points of the body to warm and loosen tight muscles.",
    category: "Massage Therapy",
    availableLocations: ['in-store', 'home'],
    businessId: '1',
    businessName: "Elite Wellness Spa",
    requirements: ["Please arrive 15 minutes early", "Inform us of any heart conditions"],
    cancellationPolicy: "24-hour cancellation notice required",
    preparationInstructions: "Stay hydrated. Avoid alcohol before treatment."
  },
  {
    id: 5,
    name: "Couples Massage",
    duration: 60,
    price: 220,
    homeServicePrice: 250,
    description: "Side-by-side massage experience for two people in the same room. Perfect for couples, friends, or family members.",
    category: "Massage Therapy",
    availableLocations: ['in-store', 'home'],
    businessId: '1',
    businessName: "Elite Wellness Spa",
    requirements: ["Both participants must arrive together", "Please arrive 15 minutes early"],
    cancellationPolicy: "48-hour cancellation notice required",
    preparationInstructions: "Discuss preferences with your partner beforehand."
  },
  // Urban Beauty Lounge services
  {
    id: 9,
    name: "Hair Cut & Style",
    duration: 45,
    price: 75,
    homeServicePrice: 95,
    description: "Professional haircut and styling service tailored to your face shape and lifestyle.",
    category: "Hair Services",
    availableLocations: ['in-store'],
    businessId: '2',
    businessName: "Urban Beauty Lounge",
    requirements: ["Come with clean, dry hair", "Bring reference photos if desired"],
    cancellationPolicy: "24-hour cancellation notice required",
    preparationInstructions: "Wash hair the night before your appointment."
  },
  {
    id: 10,
    name: "Hair Color",
    duration: 120,
    price: 150,
    homeServicePrice: 180,
    description: "Full hair coloring service using premium products. Includes consultation, color application, and styling.",
    category: "Hair Services",
    availableLocations: ['in-store'],
    businessId: '2',
    businessName: "Urban Beauty Lounge",
    requirements: ["Patch test required 48 hours before", "Do not wash hair 24 hours before"],
    cancellationPolicy: "48-hour cancellation notice required",
    preparationInstructions: "Avoid washing hair 24-48 hours before appointment. Complete patch test."
  }
]

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const serviceId = parseInt(params.id)
    
    if (isNaN(serviceId)) {
      return NextResponse.json(
        { error: 'Invalid service ID' },
        { status: 400 }
      )
    }

    const service = services.find(s => s.id === serviceId)
    
    if (!service) {
      return NextResponse.json(
        { error: 'Service not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(service)
  } catch (error) {
    console.error('Service fetch error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}