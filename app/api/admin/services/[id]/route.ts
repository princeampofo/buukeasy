import { NextResponse } from 'next/server'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const serviceId = params.id
    
    // TODO: Fetch from database
    const service = {
      id: parseInt(serviceId),
      name: 'Hair Cut & Style',
      description: 'Professional haircut with styling consultation',
      category: 'Hair Services',
      duration: 60,
      price: 75,
      isActive: true,
      requiresDeposit: false,
      depositAmount: 0,
      maxAdvanceBooking: 30,
      minAdvanceBooking: 1,
      bufferTime: 15,
      instructions: 'Please arrive 5 minutes early.',
      imageUrl: ''
    }

    console.log('Fetched service:', service)
    return NextResponse.json(service)
  } catch (error) {
    return NextResponse.json(
      { error: 'Service not found' },
      { status: 404 }
    )
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const serviceId = await params.id
    const formData = await request.formData()
    
    const serviceData = {
      name: formData.get('name') as string,
      description: formData.get('description') as string,
      category: formData.get('category') as string,
      duration: parseInt(formData.get('duration') as string),
      price: parseFloat(formData.get('price') as string),
      isActive: formData.get('isActive') === 'true',
      requiresDeposit: formData.get('requiresDeposit') === 'true',
      depositAmount: parseFloat(formData.get('depositAmount') as string) || 0,
      maxAdvanceBooking: parseInt(formData.get('maxAdvanceBooking') as string),
      minAdvanceBooking: parseInt(formData.get('minAdvanceBooking') as string),
      bufferTime: parseInt(formData.get('bufferTime') as string),
      instructions: formData.get('instructions') as string
    }

    // Handle image upload if provided
    const image = formData.get('image') as File
    let imageUrl = formData.get('existingImageUrl') as string
    
    if (image && image.size > 0) {
      // TODO: Upload new image and delete old one
      // imageUrl = await uploadImage(image)
    }

    // TODO: Update in database
    const updatedService = {
      id: parseInt(serviceId),
      ...serviceData,
      imageUrl,
      updatedAt: new Date().toISOString()
    }

    console.log('Updated service:', updatedService)
    return NextResponse.json(updatedService)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update service' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  context: { params: { id: string } }
) {
  try {
    // await the params getter
    const { id: serviceId } = await context.params;
    console.log('Deleting service with ID:', serviceId);
    
    // now you can safely use serviceId
    // await deleteService(serviceId);

    return NextResponse.json({ message: 'Service deleted successfully' });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to delete service' },
      { status: 500 }
    );
  }
}