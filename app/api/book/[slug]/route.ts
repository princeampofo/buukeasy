// app/api/book/[slug]/route.ts
import { NextRequest, NextResponse } from 'next/server'

interface Business {
  id: string
  slug: string
  name: string
  rating: number
  reviews: number
  address: string
  phone: string
  email: string
  description: string
  services: Service[]
}

interface Service {
  id: number
  name: string
  duration: number
  price: number
  homeServicePrice: number
  description: string
  category: string
  availableLocations: ('in-store' | 'home')[]
}

// Mock database - in production, this would be replaced with actual database queries
const businesses: Business[] = [
  {
    id: '1',
    slug: 'elite-wellness-spa',
    name: "Elite Wellness Spa",
    rating: 4.9,
    reviews: 127,
    address: "123 Main St, City, State 12345",
    phone: "(555) 123-4567",
    email: "info@elitewellnessspa.com",
    description: "Premium wellness and beauty services in a relaxing environment",
    services: [
      {
        id: 1,
        name: "Deep Tissue Massage",
        duration: 60,
        price: 120,
        homeServicePrice: 150,
        description: "Therapeutic massage targeting deep muscle tension and knots",
        category: "Massage Therapy",
        availableLocations: ['in-store', 'home']
      },
      {
        id: 2,
        name: "Swedish Massage",
        duration: 60,
        price: 100,
        homeServicePrice: 130,
        description: "Relaxing full-body massage with gentle pressure",
        category: "Massage Therapy",
        availableLocations: ['in-store', 'home']
      },
      {
        id: 3,
        name: "Facial Treatment",
        duration: 45,
        price: 85,
        homeServicePrice: 110,
        description: "Customized facial treatment for all skin types",
        category: "Skincare",
        availableLocations: ['in-store', 'home']
      },
      {
        id: 4,
        name: "Hot Stone Massage",
        duration: 90,
        price: 150,
        homeServicePrice: 180,
        description: "Relaxing massage using heated volcanic stones",
        category: "Massage Therapy",
        availableLocations: ['in-store', 'home']
      },
      {
        id: 5,
        name: "Couples Massage",
        duration: 60,
        price: 220,
        homeServicePrice: 250,
        description: "Side-by-side massage experience for two",
        category: "Massage Therapy",
        availableLocations: ['in-store', 'home']
      },
      {
        id: 6,
        name: "Aromatherapy Massage",
        duration: 75,
        price: 135,
        homeServicePrice: 165,
        description: "Relaxing massage with essential oils for mind and body wellness",
        category: "Massage Therapy",
        availableLocations: ['in-store', 'home']
      },
      {
        id: 7,
        name: "Anti-Aging Facial",
        duration: 60,
        price: 95,
        homeServicePrice: 125,
        description: "Advanced facial treatment focusing on fine lines and aging",
        category: "Skincare",
        availableLocations: ['in-store']
      },
      {
        id: 8,
        name: "Manicure & Pedicure",
        duration: 90,
        price: 65,
        homeServicePrice: 85,
        description: "Complete nail care and grooming service",
        category: "Nail Care",
        availableLocations: ['in-store', 'home']
      }
    ]
  },
  {
    id: '2',
    slug: 'urban-beauty-lounge',
    name: "Urban Beauty Lounge",
    rating: 4.7,
    reviews: 89,
    address: "456 Oak Avenue, Downtown, State 12345",
    phone: "(555) 987-6543",
    email: "hello@urbanbeautylounge.com",
    description: "Modern beauty services in the heart of the city",
    services: [
      {
        id: 9,
        name: "Hair Cut & Style",
        duration: 45,
        price: 75,
        homeServicePrice: 95,
        description: "Professional haircut and styling",
        category: "Hair Services",
        availableLocations: ['in-store']
      },
      {
        id: 10,
        name: "Hair Color",
        duration: 120,
        price: 150,
        homeServicePrice: 180,
        description: "Full hair coloring service with premium products",
        category: "Hair Services",
        availableLocations: ['in-store']
      },
      {
        id: 11,
        name: "Eyebrow Threading",
        duration: 20,
        price: 25,
        homeServicePrice: 35,
        description: "Precise eyebrow shaping using threading technique",
        category: "Skincare",
        availableLocations: ['in-store', 'home']
      },
      {
        id: 12,
        name: "Makeup Application",
        duration: 60,
        price: 80,
        homeServicePrice: 100,
        description: "Professional makeup for special occasions",
        category: "Makeup",
        availableLocations: ['in-store', 'home']
      }
    ]
  },
  {
    id: '3',
    slug: 'zen-wellness-center',
    name: "Zen Wellness Center",
    rating: 4.8,
    reviews: 156,
    address: "789 Pine Street, Wellness District, State 12345",
    phone: "(555) 456-7890",
    email: "info@zenwellnesscenter.com",
    description: "Holistic wellness center offering therapeutic and relaxation services",
    services: [
      {
        id: 13,
        name: "Acupuncture Session",
        duration: 60,
        price: 90,
        homeServicePrice: 120,
        description: "Traditional acupuncture for pain relief and wellness",
        category: "Alternative Medicine",
        availableLocations: ['in-store', 'home']
      },
      {
        id: 14,
        name: "Cupping Therapy",
        duration: 45,
        price: 70,
        homeServicePrice: 90,
        description: "Ancient cupping technique for muscle recovery",
        category: "Alternative Medicine",
        availableLocations: ['in-store', 'home']
      },
      {
        id: 15,
        name: "Reiki Healing",
        duration: 60,
        price: 85,
        homeServicePrice: 105,
        description: "Energy healing for relaxation and balance",
        category: "Alternative Medicine",
        availableLocations: ['in-store', 'home']
      },
      {
        id: 16,
        name: "Reflexology",
        duration: 50,
        price: 75,
        homeServicePrice: 95,
        description: "Foot massage targeting pressure points",
        category: "Massage Therapy",
        availableLocations: ['in-store', 'home']
      }
    ]
  }
]

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const business = businesses[0]
    
    if (!business) {
      return NextResponse.json(
        { error: 'Business not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(business)
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}