// app/api/book/[slug]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(
  request: NextRequest 
) {
  try {
    const { pathname } = new URL(request.url)
    const slug = pathname.split('/').pop()

    // Fetch entrepreneur profile with services and user data
    const entrepreneurProfile = await prisma.entrepreneurProfile.findUnique({
      where: {
        slug: slug,
        isActive: true,
      },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            phone: true,
            email: true,
          }
        },
        services: {
          where: {
            isActive: true,
          },
          select: {
            id: true,
            name: true,
            category: true,
            description: true,
            duration: true,
            offersHomeService: true,
            offersInStoreService: true,
            homeServicePrice: true,
            inStoreServicePrice: true,
            homeServiceDeposit: true,
            inStoreServiceDeposit: true,
            imageUrl: true,
          }
        },
        portfolioImages: {
          take: 1,
          select: {
            imageUrl: true,
          }
        }
      }
    })

    if (!entrepreneurProfile) {
      return NextResponse.json(
        { error: 'Business not found' },
        { status: 404 }
      )
    }

    // Transform the data to match the frontend interface
    const businessData = {
      id: entrepreneurProfile.id,
      slug: entrepreneurProfile.slug,
      name: entrepreneurProfile.businessName,
      rating: entrepreneurProfile.averageRating,
      reviews: entrepreneurProfile.totalReviews,
      address: [
        entrepreneurProfile.address,
        entrepreneurProfile.city,
        entrepreneurProfile.state,
        entrepreneurProfile.zipCode
      ].filter(Boolean).join(', '),
      phone: entrepreneurProfile?.user.phone || '',
      email: entrepreneurProfile.user.email,
      description: entrepreneurProfile.description || '',
      ownerName: `${entrepreneurProfile.user.firstName} ${entrepreneurProfile.user.lastName}`,
      profileImage: entrepreneurProfile.portfolioImages[0]?.imageUrl || null,
      services: entrepreneurProfile.services.map(service => ({
        id: service.id,
        name: service.name,
        duration: service.duration,
        price: service.inStoreServicePrice || 0,
        homeServicePrice: service.homeServicePrice || 0,
        inStoreServiceDeposit: service.inStoreServiceDeposit || 0,
        homeServiceDeposit: service.homeServiceDeposit || 0,
        description: service.description || '',
        category: service.category,
        imageUrl: service.imageUrl,
        availableLocations: [
          ...(service.offersInStoreService ? ['in-store' as const] : []),
          ...(service.offersHomeService ? ['home' as const] : [])
        ]
      }))
    }
  

    return NextResponse.json(businessData)
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}