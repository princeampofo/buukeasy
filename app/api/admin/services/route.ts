import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // Mock services data - replace with database query
    const services = [
      {
        id: 1,
        name: 'Hair Cut & Style',
        description: 'Professional haircut with styling consultation',
        duration: 60,
        price: 75,
        category: 'Hair Services',
        bookings: 24,
        requiresDeposit: true,
        depositAmount: 20,
        maxAdvanceBooking: 30,
        minAdvanceBooking: 1,
        bufferTime: 15,
        instructions: 'Please arrive 10 minutes early for consultation',
        imageUrl: '',
        createdAt: new Date().toISOString()
      },
      {
        id: 2,
        name: 'Manicure & Pedicure',
        description: 'Relaxing manicure and pedicure session',
        duration: 90,
        price: 50,
        category: 'Nail Services',
        bookings: 15,
        requiresDeposit: false,
        depositAmount: 0,
        maxAdvanceBooking: 14,
        minAdvanceBooking: 1,
        bufferTime: 10,
        instructions: 'Please bring your own nail polish if preferred',
        imageUrl: '',
        createdAt: new Date().toISOString()
      },
      {
        id: 3,
        name: 'Full Body Massage',
        description: 'Relaxing full body massage therapy',
        duration: 120,
        price: 100,
        category: 'Massage Therapy',
        bookings: 30,
        requiresDeposit: true,
        depositAmount: 30,
        maxAdvanceBooking: 60,
        minAdvanceBooking: 1,
        bufferTime: 20,
        instructions: 'Arrive in comfortable clothing',
        imageUrl: '',
        createdAt: new Date().toISOString()
      }
      // Add more services
    ]

    console.log('Fetched services:', services)
    return NextResponse.json({ services })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch services' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    
    const serviceData = {
      name: formData.get('name') as string,
      description: formData.get('description') as string,
      category: formData.get('category') as string,
      duration: parseInt(formData.get('duration') as string),
      price: parseFloat(formData.get('price') as string),
      requiresDeposit: formData.get('requiresDeposit') === 'true',
      depositAmount: parseFloat(formData.get('depositAmount') as string) || 0,
      maxAdvanceBooking: parseInt(formData.get('maxAdvanceBooking') as string),
      minAdvanceBooking: parseInt(formData.get('minAdvanceBooking') as string),
      bufferTime: parseInt(formData.get('bufferTime') as string),
      instructions: formData.get('instructions') as string
    }

    // Handle image upload
    const image = formData.get('image') as File
    let imageUrl = null
    
    if (image && image.size > 0) {
      // TODO: Upload image to storage service (AWS S3, Cloudinary, etc.)
      // imageUrl = await uploadImage(image)
      console.log('Image upload would happen here:', image.name)
    }

    // TODO: Save to database
    const newService = {
      id: Date.now(), // Generate proper ID
      ...serviceData,
      imageUrl,
      createdAt: new Date().toISOString()
    }

    console.log('Created new service:', newService)
    return NextResponse.json(newService, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create service' },
      { status: 500 }
    )
  }
}
